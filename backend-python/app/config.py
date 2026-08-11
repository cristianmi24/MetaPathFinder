from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://localhost:5432/metapathfinder"
    database_url_sync: str = "postgresql://localhost:5432/metapathfinder"
    secret_key: str = "dev-secret-key"
    environment: str = "development"
    cors_origins: str = "http://localhost:5173,http://localhost:4173,http://127.0.0.1:5173,http://127.0.0.1:4173,http://localhost:3000"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
