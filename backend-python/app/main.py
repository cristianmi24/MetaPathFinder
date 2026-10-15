import secrets
from contextlib import asynccontextmanager
from sqlalchemy import select, text
from passlib.context import CryptContext

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base, async_session_factory
from app.middleware.error_handler import ErrorHandlerMiddleware
from app.models import User
from app.routers.auth import router as auth_router
from app.routers.auth import get_current_user

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # No hay migraciones de Alembic en uso todavía (el esquema se crea via create_all,
        # que no altera tablas ya existentes) — se agregan columnas nuevas de forma idempotente
        # para que también se apliquen en bases de datos ya desplegadas.
        await conn.execute(text(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN NOT NULL DEFAULT FALSE"
        ))
        await conn.execute(text(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ"
        ))
        await conn.execute(text(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS terms_version VARCHAR(20)"
        ))
        await conn.execute(text(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS guardian_declaration BOOLEAN NOT NULL DEFAULT FALSE"
        ))
        # El rol "profesor" se unificó con "administrador"
        await conn.execute(text("UPDATE users SET role = 'admin' WHERE role = 'teacher'"))

    async with async_session_factory() as session:
        await _seed_admin(session)

    yield
    await engine.dispose()



DEV_ADMIN_EMAIL = "admin@gmail.com"
DEV_ADMIN_PASSWORD = "admin"


async def _seed_admin(session) -> None:
    """Crea la cuenta de administrador inicial.

    - Producción: solo si ADMIN_EMAIL y ADMIN_PASSWORD están definidos (nunca con valores por defecto).
      Si existe la cuenta de desarrollo con la contraseña "admin", se bloquea cambiándole la contraseña.
    - Desarrollo: admin@gmail.com / admin para pruebas locales.
    """
    if settings.is_production:
        legacy = (await session.execute(select(User).where(User.email == DEV_ADMIN_EMAIL))).scalar_one_or_none()
        if legacy and legacy.password_hash and pwd_context.verify(DEV_ADMIN_PASSWORD, legacy.password_hash):
            legacy.password_hash = pwd_context.hash(secrets.token_urlsafe(32))
            await session.commit()
            print(f"[Seed] SEGURIDAD: se bloqueó la contraseña por defecto de {DEV_ADMIN_EMAIL}. "
                  "Usa ADMIN_EMAIL/ADMIN_PASSWORD para definir el administrador.")

        if not (settings.admin_email and settings.admin_password):
            print("[Seed] ADMIN_EMAIL/ADMIN_PASSWORD no definidos: no se crea administrador inicial.")
            return
        if len(settings.admin_password) < 12:
            print("[Seed] ADMIN_PASSWORD debe tener al menos 12 caracteres: no se crea administrador inicial.")
            return
        admin = (await session.execute(select(User).where(User.email == settings.admin_email))).scalar_one_or_none()
        if not admin:
            session.add(User(
                name="Administrador", last_name="", email=settings.admin_email, role="admin",
                password_hash=pwd_context.hash(settings.admin_password),
            ))
            await session.commit()
            print(f"[Seed] Administrador creado: {settings.admin_email}")
        elif admin.role != "admin" or not pwd_context.verify(settings.admin_password, admin.password_hash or ""):
            admin.role = "admin"
            admin.password_hash = pwd_context.hash(settings.admin_password)
            await session.commit()
            print(f"[Seed] Administrador actualizado desde variables de entorno: {settings.admin_email}")
        return

    admin = (await session.execute(select(User).where(User.email == DEV_ADMIN_EMAIL))).scalar_one_or_none()
    if not admin:
        session.add(User(
            name="Cristian", last_name="", email=DEV_ADMIN_EMAIL, role="admin",
            password_hash=pwd_context.hash(DEV_ADMIN_PASSWORD),
        ))
        await session.commit()
        print(f"[Seed] Admin de desarrollo creado: {DEV_ADMIN_EMAIL}")

app = FastAPI(
    title="MetaPathFinder API",
    description="Backend para el sistema de tracking metacognitivo MetaPathFinder",
    version="1.0.0",
    lifespan=lifespan,
    # La documentación interactiva expone el mapa del API: solo en desarrollo.
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None if settings.is_production else "/redoc",
    openapi_url=None if settings.is_production else "/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=None if settings.is_production else r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.add_middleware(ErrorHandlerMiddleware)


@app.get("/api/health")
async def health_check(user=Depends(get_current_user)):
    return {"status": "ok", "service": "MetaPathFinder API"}


@app.get("/api/health/live")
async def health_live():
    """Sonda ligera para balanceadores y Railway (sin autenticación ni base de datos)."""
    return {"status": "ok"}


from app.routers import users, sessions, phase_a, phase_b, phase_c, analytics, experiments, monitor, tutor, tracking, tutor_admin

app.include_router(auth_router)
app.include_router(users.router)
app.include_router(sessions.router)
app.include_router(phase_a.router)
app.include_router(phase_b.router)
app.include_router(phase_c.router)
app.include_router(monitor.router)
app.include_router(analytics.router)
app.include_router(experiments.router)
app.include_router(tutor.router)
app.include_router(tracking.router)
app.include_router(tutor_admin.router)
