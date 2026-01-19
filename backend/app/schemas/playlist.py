from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class PlaylistBase(BaseModel):
    title: str
    description: Optional[str] = None
    external_url: Optional[str] = None


class PlaylistCreate(PlaylistBase):
    pass


class PlaylistUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    external_url: Optional[str] = None


class PlaylistRead(PlaylistBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
