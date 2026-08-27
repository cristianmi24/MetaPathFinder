import asyncio
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.database import get_db
from app.models import User
from app.config import settings
from app.schemas import UserCreate, UserResponse, LoginRequest, TokenResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

_registration_lock = asyncio.Lock()

SECRET_KEY = settings.secret_key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 horas


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    # Allow CORS preflight (OPTIONS) to pass without auth
    if request.method == "OPTIONS":
        return None
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.post("/register", response_model=UserResponse)
async def register(
    payload: UserCreate,
    db: AsyncSession = Depends(get_db),
):
    if payload.role == "admin":
        raise HTTPException(status_code=403, detail="Cannot create admin accounts via registration")
    if payload.role not in ("student", "teacher"):
        raise HTTPException(status_code=400, detail="Invalid role. Must be student or teacher")
    if not payload.terms_accepted:
        raise HTTPException(status_code=400, detail="Debes aceptar los Términos y Condiciones y la Política de Tratamiento de Datos Personales")
    password_hash = await asyncio.to_thread(pwd_context.hash, payload.password)
    async with _registration_lock:
        result = await db.execute(select(User).where(User.email == payload.email))
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="El correo electrónico ya se encuentra registrado")
        user = User(
            name=payload.name,
            last_name=payload.last_name,
            email=payload.email,
            role=payload.role,
            password_hash=password_hash,
            terms_accepted=True,
            terms_accepted_at=datetime.now(timezone.utc),
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    return user

@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if not user or not user.password_hash:
        raise HTTPException(status_code=401, detail="Correo electrónico o contraseña incorrectos")

    password_ok = await asyncio.to_thread(pwd_context.verify, payload.password, user.password_hash)
    if not password_ok:
        raise HTTPException(status_code=401, detail="Correo electrónico o contraseña incorrectos")

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(access_token=token, user=user)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
