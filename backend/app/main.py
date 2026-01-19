from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from .config import settings
from .database import Base, SessionLocal, engine
from .models import article, music_source, platform, playlist, track, user
from .models.article import Article
from .models.platform import Platform
from .models.playlist import Playlist
from .models.track import Track
from .routes import articles as articles_routes
from .routes import auth as auth_routes
from .routes import music as music_routes
from .routes import admin as admin_routes
from .services.auth_service import ensure_admin_user
from .services.file_service import CONTENT_DIR, ensure_upload_dirs


Base.metadata.create_all(bind=engine)

app = FastAPI(title="SSOTB Backend")


origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Mount static uploads
BASE_DIR = Path(__file__).resolve().parents[1]
UPLOADS_DIR = BASE_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")


# Include routers
app.include_router(auth_routes.router)
app.include_router(articles_routes.router)
app.include_router(music_routes.router)
app.include_router(admin_routes.router)


@app.on_event("startup")
async def on_startup() -> None:
    Base.metadata.create_all(bind=engine)  # Теперь здесь
    ensure_upload_dirs()
    
    db: Session = SessionLocal()
    try:
        # Ensure default admin user exists
        ensure_admin_user(db)

        # Seed default platforms
        default_platforms = [
            ("Spotify", "https://open.spotify.com"),
            ("Apple Music", "https://music.apple.com"),
            ("YouTube Music", "https://music.youtube.com"),
            ("Yandex Music", "https://music.yandex.com"),
            ("SoundCloud", "https://soundcloud.com"),
        ]
        for name, base_url in default_platforms:
            if not db.query(Platform).filter(Platform.name == name).first():
                db.add(Platform(name=name, base_url=base_url))

        db.commit()

        # Seed sample playlist and tracks if empty
        if db.query(Playlist).count() == 0:
            sample_playlist = Playlist(
                title="SSOTB Sample Playlist",
                description="Sample reading soundtrack",
            )
            db.add(sample_playlist)
            db.commit()
            db.refresh(sample_playlist)

            track1 = Track(
                playlist_id=sample_playlist.id,
                title="Opening Theme",
                artist="SSOTB",
                duration="3:45",
                order=0,
            )
            track2 = Track(
                playlist_id=sample_playlist.id,
                title="Deep Focus",
                artist="SSOTB",
                duration="5:20",
                order=1,
            )
            db.add_all([track1, track2])
            db.commit()

        # Seed sample article if empty
        if db.query(Article).count() == 0:
            sample_article = Article(
                title="Welcome to SSOTB",
                description="Introduction to the SSOTB platform.",
                is_published=True,
            )
            db.add(sample_article)
            db.commit()
            db.refresh(sample_article)

            # Create a simple markdown file for the article
            CONTENT_DIR.mkdir(parents=True, exist_ok=True)
            md_filename = CONTENT_DIR / f"{sample_article.id}_welcome.md"
            if not md_filename.exists():
                md_filename.write_text(
                    """# Welcome to SSOTB

SSOTB is a minimalist reading and listening experience.

Use the admin panel to create articles and playlists, then explore them in the frontend.
""",
                    encoding="utf-8",
                )
            sample_article.content_markdown_path = f"/uploads/content/{md_filename.name}"
            db.commit()
    finally:
        db.close()


@app.get("/health")
async def health_check() -> dict:
    return {"status": "ok"}
