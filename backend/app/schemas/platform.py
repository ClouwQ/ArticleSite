from typing import Optional

from pydantic import BaseModel


class PlatformBase(BaseModel):
    name: str
    icon_url: Optional[str] = None
    base_url: Optional[str] = None


class PlatformCreate(PlatformBase):
    pass


class PlatformUpdate(BaseModel):
    name: Optional[str] = None
    icon_url: Optional[str] = None
    base_url: Optional[str] = None


class PlatformRead(PlatformBase):
    id: str

    class Config:
        orm_mode = True
