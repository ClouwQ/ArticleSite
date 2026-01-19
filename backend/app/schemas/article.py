from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ArticleBase(BaseModel):
    title: str
    description: Optional[str] = None
    playlist_id: Optional[str] = None
    is_published: bool = False


class ArticleCreate(ArticleBase):
    pass


class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    playlist_id: Optional[str] = None
    is_published: Optional[bool] = None


class ArticleRead(ArticleBase):
    id: str
    cover_image_path: Optional[str] = None
    content_markdown_path: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
