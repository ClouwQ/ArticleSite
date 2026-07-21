import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from ..database import Base


class Article(Base):
    __tablename__ = "articles"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    slug = Column(String, unique=True, index=True, nullable=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    tag = Column(String, nullable=True)
    cover_image_path = Column(String, nullable=True)
    content_markdown_path = Column(String, nullable=True)
    playlist_id = Column(String, ForeignKey("playlists.id"), nullable=True)
    is_published = Column(Boolean, default=False, nullable=False)
    # Per-article reading-view theme. NULL means "use the frontend default".
    bg_color = Column(String, nullable=True)
    text_color = Column(String, nullable=True)
    photo_accent_color = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    playlist = relationship("Playlist", back_populates="articles")
