import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from ..database import Base


class Track(Base):
    __tablename__ = "tracks"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    playlist_id = Column(String, ForeignKey("playlists.id"), nullable=False)
    title = Column(String, nullable=False)
    artist = Column(String, nullable=False)
    duration = Column(String, nullable=True)
    order = Column(Integer, nullable=False, default=0)
    audio_file_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    playlist = relationship("Playlist", back_populates="tracks")
    sources = relationship(
        "MusicSource", back_populates="track", cascade="all, delete-orphan"
    )
