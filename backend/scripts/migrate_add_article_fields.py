"""Add slug/tag/colour columns to the articles table and backfill slugs.

Run from the backend directory:  python scripts/migrate_add_article_fields.py
"""

import os
import re
import sqlite3
import sys

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ssotb.db"))

# Allow importing the slugify helper from the app package.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.services.slug_service import slugify  # noqa: E402

NEW_COLUMNS = {
    "slug": "VARCHAR",
    "tag": "VARCHAR",
    "bg_color": "VARCHAR",
    "text_color": "VARCHAR",
    "photo_accent_color": "VARCHAR",
}


def migrate() -> None:
    if not os.path.isfile(DB_PATH):
        print(f"Database file {DB_PATH} does not exist. Nothing to migrate.")
        return

    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info(articles);")
        existing = {row[1] for row in cursor.fetchall()}

        for column, col_type in NEW_COLUMNS.items():
            if column not in existing:
                cursor.execute(f"ALTER TABLE articles ADD COLUMN {column} {col_type};")
                print(f"Column '{column}' added.")
            else:
                print(f"Column '{column}' already exists.")

        # Backfill slugs for rows that don't have one yet.
        cursor.execute("SELECT id, title, slug FROM articles;")
        rows = cursor.fetchall()
        used = {r[2] for r in rows if r[2]}
        for article_id, title, slug in rows:
            if slug:
                continue
            base = slugify(title or "article")
            candidate = base
            counter = 2
            while candidate in used:
                candidate = f"{base}-{counter}"
                counter += 1
            used.add(candidate)
            cursor.execute(
                "UPDATE articles SET slug = ? WHERE id = ?;", (candidate, article_id)
            )
            print(f"Backfilled slug '{candidate}' for article {article_id}.")

        conn.commit()
    print("Migration complete.")


if __name__ == "__main__":
    migrate()
