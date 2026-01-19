import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship

from ..database import Base


class MusicSource(Base):
    __tablename__ = "music_sources"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    track_id = Column(String, ForeignKey("tracks.id"), nullable=False)
    platform_id = Column(String, ForeignKey("platforms.id"), nullable=False)
    url = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    track = relationship("Track", back_populates="sources")
    platform = relationship("Platform", back_populates="sources")
