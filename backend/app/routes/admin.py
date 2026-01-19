from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..middleware.auth import get_current_user
from ..models.article import Article
from ..models.music_source import MusicSource
from ..models.platform import Platform
from ..models.playlist import Playlist
from ..models.track import Track
from ..models.user import User
from ..schemas.article import ArticleCreate, ArticleRead, ArticleUpdate
from ..schemas.music_source import (
    MusicSourceCreate,
    MusicSourceRead,
    MusicSourceUpdate,
)
from ..schemas.platform import PlatformCreate, PlatformRead, PlatformUpdate
from ..schemas.playlist import PlaylistCreate, PlaylistRead, PlaylistUpdate
from ..schemas.track import TrackCreate, TrackRead, TrackUpdate
from ..services.file_service import save_cover_image, save_markdown_content, save_audio_file


router = APIRouter(
    prefix="/api/admin", tags=["admin"], dependencies=[Depends(get_current_user)]
)


# Articles


@router.get("/articles", response_model=List[ArticleRead])
async def admin_list_articles(db: Session = Depends(get_db)):
    return db.query(Article).order_by(Article.created_at.desc()).all()


@router.post("/articles", response_model=ArticleRead, status_code=status.HTTP_201_CREATED)
async def admin_create_article(data: ArticleCreate, db: Session = Depends(get_db)):
    article = Article(**data.dict())
    db.add(article)
    db.commit()
    db.refresh(article)
    return article


@router.get("/articles/{article_id}", response_model=ArticleRead)
async def admin_get_article(article_id: str, db: Session = Depends(get_db)):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")
    return article


@router.put("/articles/{article_id}", response_model=ArticleRead)
async def admin_update_article(
    article_id: str, data: ArticleUpdate, db: Session = Depends(get_db)
):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")

    for key, value in data.dict(exclude_unset=True).items():
        setattr(article, key, value)

    db.commit()
    db.refresh(article)
    return article


@router.delete("/articles/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_article(article_id: str, db: Session = Depends(get_db)):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")
    db.delete(article)
    db.commit()
    return None


@router.post("/tracks/{track_id}/audio", response_model=TrackRead)
async def admin_upload_track_audio(
    track_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    track = db.query(Track).filter(Track.id == track_id).first()
    if not track:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Track not found")

    if file.content_type not in ("audio/mpeg", "audio/mp3", "audio/x-mpeg"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only MP3 audio is allowed.",
        )

    path = save_audio_file(track_id, file)
    track.audio_file_path = path
    db.commit()
    db.refresh(track)
    return track


@router.post("/articles/{article_id}/cover", response_model=ArticleRead)
async def upload_article_cover(
    article_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")

    if file.content_type not in ("image/jpeg", "image/png", "image/webp"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only JPG, PNG, WebP allowed.",
        )

    path = save_cover_image(article_id, file)
    article.cover_image_path = path
    db.commit()
    db.refresh(article)
    return article


@router.post("/articles/{article_id}/content", response_model=ArticleRead)
async def upload_article_content(
    article_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")

    if not file.filename or not file.filename.lower().endswith(".md"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only .md allowed.",
        )

    path = save_markdown_content(article_id, file)
    article.content_markdown_path = path
    db.commit()
    db.refresh(article)
    return article


# Playlists


@router.get("/playlists", response_model=List[PlaylistRead])
async def admin_list_playlists(db: Session = Depends(get_db)):
    return db.query(Playlist).order_by(Playlist.created_at.desc()).all()


@router.post(
    "/playlists", response_model=PlaylistRead, status_code=status.HTTP_201_CREATED
)
async def admin_create_playlist(data: PlaylistCreate, db: Session = Depends(get_db)):
    playlist = Playlist(**data.dict())
    db.add(playlist)
    db.commit()
    db.refresh(playlist)
    return playlist


@router.put("/playlists/{playlist_id}", response_model=PlaylistRead)
async def admin_update_playlist(
    playlist_id: str, data: PlaylistUpdate, db: Session = Depends(get_db)
):
    playlist = db.query(Playlist).filter(Playlist.id == playlist_id).first()
    if not playlist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Playlist not found")

    for key, value in data.dict(exclude_unset=True).items():
        setattr(playlist, key, value)

    db.commit()
    db.refresh(playlist)
    return playlist


@router.delete("/playlists/{playlist_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_playlist(playlist_id: str, db: Session = Depends(get_db)):
    playlist = db.query(Playlist).filter(Playlist.id == playlist_id).first()
    if not playlist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Playlist not found")
    db.delete(playlist)
    db.commit()
    return None


# Tracks


@router.post(
    "/playlists/{playlist_id}/tracks",
    response_model=TrackRead,
    status_code=status.HTTP_201_CREATED,
)
async def admin_add_track_to_playlist(
    playlist_id: str, data: TrackCreate, db: Session = Depends(get_db)
):
    playlist = db.query(Playlist).filter(Playlist.id == playlist_id).first()
    if not playlist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Playlist not found")

    payload = data.dict()
    payload["playlist_id"] = playlist_id

    track = Track(**payload)
    db.add(track)
    db.commit()
    db.refresh(track)
    return track


@router.put("/tracks/{track_id}", response_model=TrackRead)
async def admin_update_track(
    track_id: str, data: TrackUpdate, db: Session = Depends(get_db)
):
    track = db.query(Track).filter(Track.id == track_id).first()
    if not track:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Track not found")

    for key, value in data.dict(exclude_unset=True).items():
        setattr(track, key, value)

    db.commit()
    db.refresh(track)
    return track


@router.delete("/tracks/{track_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_track(track_id: str, db: Session = Depends(get_db)):
    track = db.query(Track).filter(Track.id == track_id).first()
    if not track:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Track not found")
    db.delete(track)
    db.commit()
    return None


@router.put("/playlists/{playlist_id}/tracks/reorder")
async def admin_reorder_tracks(
    playlist_id: str, track_ids: List[str], db: Session = Depends(get_db)
):
    playlist = db.query(Playlist).filter(Playlist.id == playlist_id).first()
    if not playlist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Playlist not found")

    tracks = {t.id: t for t in playlist.tracks}
    for order, track_id in enumerate(track_ids):
        track = tracks.get(track_id)
        if track:
            track.order = order

    db.commit()
    return {"detail": "Reordered"}


# Music sources


@router.post(
    "/tracks/{track_id}/sources",
    response_model=MusicSourceRead,
    status_code=status.HTTP_201_CREATED,
)
async def admin_add_source_to_track(
    track_id: str, data: MusicSourceCreate, db: Session = Depends(get_db)
):
    track = db.query(Track).filter(Track.id == track_id).first()
    if not track:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Track not found")

    payload = data.dict()
    payload["track_id"] = track_id

    source = MusicSource(**payload)
    db.add(source)
    db.commit()
    db.refresh(source)
    return source


@router.put("/sources/{source_id}", response_model=MusicSourceRead)
async def admin_update_source(
    source_id: str, data: MusicSourceUpdate, db: Session = Depends(get_db)
):
    source = db.query(MusicSource).filter(MusicSource.id == source_id).first()
    if not source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source not found")

    for key, value in data.dict(exclude_unset=True).items():
        setattr(source, key, value)

    db.commit()
    db.refresh(source)
    return source


@router.delete("/sources/{source_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_source(source_id: str, db: Session = Depends(get_db)):
    source = db.query(MusicSource).filter(MusicSource.id == source_id).first()
    if not source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source not found")
    db.delete(source)
    db.commit()
    return None


# Platforms


@router.post(
    "/platforms", response_model=PlatformRead, status_code=status.HTTP_201_CREATED
)
async def admin_create_platform(data: PlatformCreate, db: Session = Depends(get_db)):
    existing = db.query(Platform).filter(Platform.name == data.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Platform with this name already exists",
        )

    platform = Platform(**data.dict())
    db.add(platform)
    db.commit()
    db.refresh(platform)
    return platform


@router.put("/platforms/{platform_id}", response_model=PlatformRead)
async def admin_update_platform(
    platform_id: str, data: PlatformUpdate, db: Session = Depends(get_db)
):
    platform = db.query(Platform).filter(Platform.id == platform_id).first()
    if not platform:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Platform not found")

    for key, value in data.dict(exclude_unset=True).items():
        setattr(platform, key, value)

    db.commit()
    db.refresh(platform)
    return platform


@router.delete("/platforms/{platform_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_platform(platform_id: str, db: Session = Depends(get_db)):
    platform = db.query(Platform).filter(Platform.id == platform_id).first()
    if not platform:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Platform not found")
    db.delete(platform)
    db.commit()
    return None
