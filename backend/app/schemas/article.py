from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ArticleBase(BaseModel):
    title: str
    description: Optional[str] = None
    tag: Optional[str] = None
    playlist_id: Optional[str] = None
    is_published: bool = False
    bg_color: Optional[str] = None
    text_color: Optional[str] = None
    photo_accent_color: Optional[str] = None


class ArticleCreate(ArticleBase):
    slug: Optional[str] = None


class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    tag: Optional[str] = None
    slug: Optional[str] = None
    playlist_id: Optional[str] = None
    is_published: Optional[bool] = None
    bg_color: Optional[str] = None
    text_color: Optional[str] = None
    photo_accent_color: Optional[str] = None


class ArticleRead(ArticleBase):
    id: str
    slug: Optional[str] = None
    cover_image_path: Optional[str] = None
    content_markdown_path: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
