import os

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

# Each uvicorn worker gets its own pool, so keep per-worker size modest —
# total connections across all workers must stay under the DB's max_connections.
DB_POOL_SIZE = int(os.environ.get("DB_POOL_SIZE", "8"))
DB_MAX_OVERFLOW = int(os.environ.get("DB_MAX_OVERFLOW", "12"))

engine = create_async_engine(
    settings.database_url, echo=False, pool_size=DB_POOL_SIZE, max_overflow=DB_MAX_OVERFLOW,
    pool_pre_ping=True, pool_recycle=3600,
)
async_session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with async_session_factory() as session:
        try:
            yield session
        finally:
            await session.close()
