import uuid

from sqlalchemy import Column, String
from sqlalchemy.orm import relationship

from ..database import Base


class Platform(Base):
    __tablename__ = "platforms"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, unique=True, nullable=False)
    icon_url = Column(String, nullable=True)
    base_url = Column(String, nullable=True)

    sources = relationship("MusicSource", back_populates="platform")
