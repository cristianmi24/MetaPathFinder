from contextlib import asynccontextmanager
from sqlalchemy import select
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

    async with async_session_factory() as session:
        result = await session.execute(select(User).where(User.email == "admin@gmail.com"))
        admin = result.scalar_one_or_none()
        if not admin:
            admin = User(
                name="Cristian",
                last_name="",
                email="admin@gmail.com",
                role="admin",
                password_hash=pwd_context.hash("admin"),
            )
            session.add(admin)
            await session.commit()
            print("[Seed] Admin creado: admin@gmail.com / admin")
        else:
            # Ensure admin has the expected test credentials/name for local testing
            updated = False
            if admin.name != "Cristian":
                admin.name = "Cristian"
                updated = True
            if admin.last_name != "":
                admin.last_name = ""
                updated = True
            # Force test password to 'admin' for convenience in local dev
            admin.password_hash = pwd_context.hash("admin")
            updated = True
            if updated:
                session.add(admin)
                await session.commit()
                print("[Seed] Admin actualizado: admin@gmail.com / admin")

    yield
    await engine.dispose()


app = FastAPI(
    title="MetaPathFinder API",
    description="Backend para el sistema de tracking metacognitivo MetaPathFinder",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(ErrorHandlerMiddleware)


@app.get("/api/health")
async def health_check(user=Depends(get_current_user)):
    return {"status": "ok", "service": "MetaPathFinder API"}


from app.routers import users, sessions, phase_a, phase_b, phase_c, analytics, experiments

app.include_router(auth_router)
app.include_router(users.router)
app.include_router(sessions.router)
app.include_router(phase_a.router)
app.include_router(phase_b.router)
app.include_router(phase_c.router)
app.include_router(analytics.router)
app.include_router(experiments.router)
