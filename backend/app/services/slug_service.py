"""Slug generation with Cyrillic transliteration and uniqueness checks."""

import re

from sqlalchemy.orm import Session

_TRANSLIT = {
    "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "e",
    "ж": "zh", "з": "z", "и": "i", "й": "y", "к": "k", "л": "l", "м": "m",
    "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t", "у": "u",
    "ф": "f", "х": "h", "ц": "ts", "ч": "ch", "ш": "sh", "щ": "sch",
    "ъ": "", "ы": "y", "ь": "", "э": "e", "ю": "yu", "я": "ya",
}


def slugify(text: str) -> str:
    text = (text or "").strip().lower()
    out = []
    for ch in text:
        if ch in _TRANSLIT:
            out.append(_TRANSLIT[ch])
        elif ch.isascii() and ch.isalnum():
            out.append(ch)
        elif ch in " -_/":
            out.append("-")
        # anything else is dropped
    slug = re.sub(r"-+", "-", "".join(out)).strip("-")
    return slug or "article"


def generate_unique_slug(db: Session, base_text: str, exclude_id: str | None = None) -> str:
    """Return a slug derived from base_text that is unique across articles."""

    # Imported here to avoid a circular import at module load time.
    from ..models.article import Article

    base = slugify(base_text)
    slug = base
    counter = 2
    while True:
        query = db.query(Article).filter(Article.slug == slug)
        if exclude_id:
            query = query.filter(Article.id != exclude_id)
        if not query.first():
            return slug
        slug = f"{base}-{counter}"
        counter += 1
