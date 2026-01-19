from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class TrackBase(BaseModel):
    playlist_id: str
    title: str
    artist: str
    duration: Optional[str] = None
    order: int = 0


class TrackCreate(TrackBase):
    pass


class TrackUpdate(BaseModel):
    title: Optional[str] = None
    artist: Optional[str] = None
    duration: Optional[str] = None
    order: Optional[int] = None
    playlist_id: Optional[str] = None
    audio_file_path: Optional[str] = None


class TrackRead(TrackBase):
    id: str
    audio_file_path: Optional[str] = None
    created_at: datetime

    class Config:
        orm_mode = True
