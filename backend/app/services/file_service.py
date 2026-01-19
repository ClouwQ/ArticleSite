import os
import time
from pathlib import Path
from typing import Tuple

from fastapi import UploadFile

BASE_DIR = Path(__file__).resolve().parents[2]
UPLOADS_DIR = BASE_DIR / "uploads"
COVERS_DIR = UPLOADS_DIR / "covers"
CONTENT_DIR = UPLOADS_DIR / "content"
AUDIO_DIR = UPLOADS_DIR / "audio"


def ensure_upload_dirs() -> None:
    COVERS_DIR.mkdir(parents=True, exist_ok=True)
    CONTENT_DIR.mkdir(parents=True, exist_ok=True)
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)


def save_cover_image(article_id: str, file: UploadFile) -> str:
    ensure_upload_dirs()
    ext = os.path.splitext(file.filename or "")[1].lower()
    timestamp = int(time.time())
    filename = f"{article_id}_{timestamp}{ext}"
    dest = COVERS_DIR / filename
    with dest.open("wb") as buffer:
        buffer.write(file.file.read())
    # Return relative path to be served under /uploads
    return f"/uploads/covers/{filename}"


def save_markdown_content(article_id: str, file: UploadFile) -> str:
    ensure_upload_dirs()
    timestamp = int(time.time())
    filename = f"{article_id}_{timestamp}.md"
    dest = CONTENT_DIR / filename
    with dest.open("wb") as buffer:
        buffer.write(file.file.read())
    return f"/uploads/content/{filename}"


def save_audio_file(track_id: str, file: UploadFile) -> str:
    """Save uploaded audio (e.g. MP3) for a track and return relative URL path."""

    ensure_upload_dirs()
    ext = os.path.splitext(file.filename or "")[1].lower() or ".mp3"
    timestamp = int(time.time())
    filename = f"{track_id}_{timestamp}{ext}"
    dest = AUDIO_DIR / filename
    with dest.open("wb") as buffer:
        buffer.write(file.file.read())
    return f"/uploads/audio/{filename}"


def read_markdown_content(relative_path: str) -> str:
    # relative_path stored like "/uploads/content/xyz.md"
    # strip leading slash and join with BASE_DIR
    rel = relative_path.lstrip("/")
    path = BASE_DIR / rel
    if not path.exists():
        return ""
    return path.read_text(encoding="utf-8")
