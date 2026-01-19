from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class MusicSourceBase(BaseModel):
    track_id: str
    platform_id: str
    url: str


class MusicSourceCreate(MusicSourceBase):
    pass


class MusicSourceUpdate(BaseModel):
    track_id: Optional[str] = None
    platform_id: Optional[str] = None
    url: Optional[str] = None


class MusicSourceRead(MusicSourceBase):
    id: str
    created_at: datetime

    class Config:
        orm_mode = True
