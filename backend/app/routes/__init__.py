from .articles import router as articles_router
from .auth import router as auth_router
from .music import router as music_router

__all__ = [
    "articles_router",
    "auth_router",
    "music_router",
]

