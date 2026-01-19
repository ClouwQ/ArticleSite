import os
from datetime import timedelta


class Settings:
    """Simple settings loader using environment variables.

    Avoids depending on pydantic's BaseSettings so it works with both
    Pydantic v1 and v2 environments.
    """

    def __init__(self) -> None:
        self.database_url: str = os.getenv("DATABASE_URL", "sqlite:///./ssotb.db")
        self.secret_key: str = os.getenv("SECRET_KEY", "change-me-in-production")
        self.jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
        self.jwt_expiration_hours: int = int(
            os.getenv("JWT_EXPIRATION_HOURS", "24")
        )
        self.admin_username: str = os.getenv("ADMIN_USERNAME", "admin")
        self.admin_password: str = os.getenv("ADMIN_PASSWORD", "admin123")

    @property
    def access_token_expire(self) -> timedelta:
        return timedelta(hours=self.jwt_expiration_hours)


settings = Settings()
