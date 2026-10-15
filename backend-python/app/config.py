from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://localhost:5432/metapathfinder"
    database_url_sync: str = "postgresql://localhost:5432/metapathfinder"
    secret_key: str = "dev-secret-key"
    environment: str = "development"
    cors_origins: str = "http://localhost:5173,http://localhost:4173,http://127.0.0.1:5173,http://127.0.0.1:4173,http://localhost:3000"
    # Cuenta de administrador inicial. En producción solo se crea si se definen ambas variables.
    admin_email: str = ""
    admin_password: str = ""

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()

_WEAK_SECRETS = {"", "dev-secret-key", "cambia-esta-clave-en-produccion", "secret", "changeme"}
if settings.is_production and (settings.secret_key in _WEAK_SECRETS or len(settings.secret_key) < 32):
    raise RuntimeError(
        "SECRET_KEY inseguro: en producción define una clave aleatoria de al menos 32 caracteres "
        "(python -c \"import secrets;print(secrets.token_urlsafe(48))\")."
    )
