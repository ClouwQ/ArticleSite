from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.music_source import MusicSource
from ..models.platform import Platform
from ..models.playlist import Playlist
from ..models.track import Track
from ..schemas.music_source import MusicSourceRead
from ..schemas.platform import PlatformRead
from ..schemas.playlist import PlaylistRead
from ..schemas.track import TrackRead


router = APIRouter(prefix="/api", tags=["music"])


@router.get("/playlists", response_model=List[PlaylistRead])
async def list_playlists(db: Session = Depends(get_db)):
    return db.query(Playlist).order_by(Playlist.created_at.desc()).all()


@router.get("/playlists/{playlist_id}", response_model=PlaylistRead)
async def get_playlist(playlist_id: str, db: Session = Depends(get_db)):
    playlist = db.query(Playlist).filter(Playlist.id == playlist_id).first()
    if not playlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Playlist not found"
        )
    return playlist


@router.get("/playlists/{playlist_id}/tracks", response_model=List[TrackRead])
async def get_playlist_tracks(playlist_id: str, db: Session = Depends(get_db)):
    playlist = db.query(Playlist).filter(Playlist.id == playlist_id).first()
    if not playlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Playlist not found"
        )
    return playlist.tracks


@router.get("/tracks/{track_id}/sources", response_model=List[MusicSourceRead])
async def get_track_sources(track_id: str, db: Session = Depends(get_db)):
    track = db.query(Track).filter(Track.id == track_id).first()
    if not track:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Track not found"
        )
    return track.sources


@router.get("/platforms", response_model=List[PlatformRead])
async def list_platforms(db: Session = Depends(get_db)):
    return db.query(Platform).order_by(Platform.name.asc()).all()
