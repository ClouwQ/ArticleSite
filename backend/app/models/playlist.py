import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, String, Text
from sqlalchemy.orm import relationship

from ..database import Base


class Playlist(Base):
    __tablename__ = "playlists"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    external_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    tracks = relationship(
        "Track",
        back_populates="playlist",
        cascade="all, delete-orphan",
        order_by="Track.order",
    )
    articles = relationship("Article", back_populates="playlist")
