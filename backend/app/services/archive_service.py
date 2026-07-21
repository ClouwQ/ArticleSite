"""Ingest a .zip archive (exported from Obsidian) containing one Markdown file
and its referenced images. Images are extracted and served under /uploads, and
image references inside the Markdown (both Obsidian ``![[file]]`` embeds and the
standard ``![alt](file)`` syntax) are rewritten to point at the served URLs."""

import io
import os
import re
import time
import zipfile
from urllib.parse import quote, unquote

from fastapi import UploadFile

from .file_service import CONTENT_DIR, ensure_upload_dirs

IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".gif"}

_OBSIDIAN_EMBED_RE = re.compile(r"!\[\[([^\]]+)\]\]")
_MARKDOWN_IMAGE_RE = re.compile(r"!\[([^\]]*)\]\(([^)]+)\)")


def _safe_basename(name: str) -> str:
    """Strip any directory components to prevent path traversal."""

    return os.path.basename(name.replace("\\", "/"))


def _rewrite_markdown(md: str, image_map: dict[str, str]) -> str:
    def repl_obsidian(match: re.Match) -> str:
        inner = match.group(1)
        # ![[name|alias]] / ![[name|100]] -> take the file part before '|'
        target = inner.split("|", 1)[0].strip()
        base = _safe_basename(unquote(target))
        url = image_map.get(base)
        return f"![]({url})" if url else match.group(0)

    def repl_markdown(match: re.Match) -> str:
        alt = match.group(1)
        src = match.group(2).strip()
        # Drop an optional "title" part: ![alt](path "title")
        src_path = src.split(" ", 1)[0]
        base = _safe_basename(unquote(src_path))
        url = image_map.get(base)
        return f"![{alt}]({url})" if url else match.group(0)

    md = _OBSIDIAN_EMBED_RE.sub(repl_obsidian, md)
    md = _MARKDOWN_IMAGE_RE.sub(repl_markdown, md)
    return md


def process_article_archive(article_id: str, file: UploadFile) -> str:
    """Extract the archive, persist images, rewrite the markdown and save it.

    Returns the relative URL of the saved markdown file.
    Raises ValueError when the archive is invalid or has no markdown file.
    """

    ensure_upload_dirs()
    images_dir = CONTENT_DIR / article_id
    images_dir.mkdir(parents=True, exist_ok=True)

    raw = file.file.read()
    try:
        archive = zipfile.ZipFile(io.BytesIO(raw))
    except zipfile.BadZipFile as exc:
        raise ValueError("Uploaded file is not a valid .zip archive") from exc

    with archive:
        entries = [n for n in archive.namelist() if not n.endswith("/")]
        # Ignore macOS resource-fork junk.
        entries = [n for n in entries if not _safe_basename(n).startswith("._") and "__MACOSX" not in n]

        md_candidates = [n for n in entries if n.lower().endswith(".md")]
        if not md_candidates:
            raise ValueError("Archive does not contain a .md file")

        md_name = max(md_candidates, key=lambda n: archive.getinfo(n).file_size)
        md_text = archive.read(md_name).decode("utf-8", errors="replace")

        image_map: dict[str, str] = {}
        for name in entries:
            ext = os.path.splitext(name)[1].lower()
            if ext not in IMAGE_EXTS:
                continue
            base = _safe_basename(name)
            (images_dir / base).write_bytes(archive.read(name))
            image_map[base] = f"/uploads/content/{article_id}/{quote(base)}"

    rewritten = _rewrite_markdown(md_text, image_map)

    timestamp = int(time.time())
    md_path = CONTENT_DIR / f"{article_id}_{timestamp}.md"
    md_path.write_text(rewritten, encoding="utf-8")
    return f"/uploads/content/{md_path.name}"
