from functools import lru_cache
from typing import List

from pydantic import AnyHttpUrl, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_name: str = Field(default="ImobConvex")
    environment: str = Field(default="development")
    api_v1_str: str = Field(default="/api/v1")
    project_url: AnyHttpUrl | None = None

    secret_key: str = Field(default="change-me-change-me", min_length=16)
    jwt_algorithm: str = Field(default="HS256")
    access_token_expire_minutes: int = Field(default=30)
    refresh_token_expire_minutes: int = Field(default=60 * 24 * 30)

    database_url: str = Field(default="sqlite:///./imobconvex.db")

    cors_origins: List[str] = Field(default_factory=lambda: ["http://localhost:3000"])

    openai_api_key: str | None = None

    first_superuser_email: str = Field(default="admin@example.com")
    first_superuser_password: str = Field(default="ChangeMe123!", min_length=8)

    @staticmethod
    def _split_csv(value: List[str] | str) -> List[str]:
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value

    @property
    def sqlalchemy_database_uri(self) -> str:
        return self.database_url

    @property
    def cors_origin_list(self) -> List[str]:
        return self._split_csv(self.cors_origins)


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
