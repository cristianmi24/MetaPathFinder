import asyncio
import time
from collections import defaultdict, deque
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
_DUMMY_HASH = pwd_context.hash("dummy-password-for-timing")

_registration_lock = asyncio.Lock()

SECRET_KEY = settings.secret_key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 horas
# Versión vigente de los Términos y la Política de Privacidad (debe coincidir con frontend/src/data/legalConfig.ts)
CURRENT_TERMS_VERSION = "1.0"


STAFF_ROLES = ("admin",)

# Limite de intentos de login (por IP y por correo).
# En memoria y por proceso: frena fuerza bruta desde un mismo origen. Con varios
# workers el limite efectivo se multiplica por el numero de workers.
LOGIN_WINDOW_SECONDS = 15 * 60
LOGIN_MAX_PER_EMAIL = 8
LOGIN_MAX_PER_IP = 30
_login_failures: dict[str, deque] = defaultdict(deque)


def _client_ip(request: Request) -> str:
    # Express (mismo contenedor) reenvia la IP real en X-Forwarded-For.
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        return forwarded.split(",")[0].strip()[:64]
    return request.client.host if request.client else "unknown"


def _recent_failures(key: str) -> int:
    q = _login_failures[key]
    limit = time.monotonic() - LOGIN_WINDOW_SECONDS
    while q and q[0] < limit:
        q.popleft()
    return len(q)


def _register_failure(*keys: str) -> None:
    now = time.monotonic()
    for k in keys:
        _login_failures[k].append(now)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc), "typ": "access"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None or payload.get("typ") != "access":
            raise HTTPException(status_code=401, detail="Invalid token")
        UUID(str(user_id))
    except (JWTError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def require_staff(current_user: User = Depends(get_current_user)) -> User:
    """Solo administradores."""
    if current_user.role not in STAFF_ROLES:
        raise HTTPException(status_code=403, detail="No tienes permiso para esta acción")
    return current_user


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Solo administradores."""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="No tienes permiso para esta acción")
    return current_user


def ensure_self_or_staff(current_user: User, user_id) -> None:
    """Un estudiante solo accede a sus propios datos; el personal, a todos."""
    if current_user.role in STAFF_ROLES:
        return
    if str(current_user.id) != str(user_id):
        raise HTTPException(status_code=403, detail="No tienes permiso para acceder a estos datos")


@router.post("/register", response_model=UserResponse)
async def register(
    payload: UserCreate,
    db: AsyncSession = Depends(get_db),
):
    # El registro publico solo crea estudiantes. Los administradores
    # los crea otro administrador desde el panel (POST /api/users/).
    if payload.role != "student":
        raise HTTPException(status_code=403, detail="El registro público solo permite cuentas de estudiante")
    if not payload.terms_accepted:
        raise HTTPException(status_code=400, detail="Debes aceptar los Términos y Condiciones y la Política de Tratamiento de Datos Personales")
    if not payload.guardian_declaration:
        raise HTTPException(status_code=400, detail="Debes declarar que eres mayor de edad o que cuentas con la autorización de tu representante legal")
    password_hash = await asyncio.to_thread(pwd_context.hash, payload.password)
    async with _registration_lock:
        result = await db.execute(select(User).where(User.email == payload.email))
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="El correo electrónico ya se encuentra registrado")
        user = User(
            name=payload.name,
            last_name=payload.last_name,
            email=payload.email,
            role="student",
            password_hash=password_hash,
            terms_accepted=True,
            terms_accepted_at=datetime.now(timezone.utc),
            terms_version=payload.terms_version or CURRENT_TERMS_VERSION,
            guardian_declaration=True,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    return user

@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, request: Request, db: AsyncSession = Depends(get_db)):
    email_key = f"email:{payload.email.strip().lower()}"
    ip_key = f"ip:{_client_ip(request)}"
    if _recent_failures(email_key) >= LOGIN_MAX_PER_EMAIL or _recent_failures(ip_key) >= LOGIN_MAX_PER_IP:
        raise HTTPException(
            status_code=429,
            detail="Demasiados intentos fallidos. Espera unos minutos antes de volver a intentarlo.",
        )

    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    # Siempre se verifica un hash (aunque el usuario no exista) para no revelar por tiempo qué correos existen.
    stored_hash = user.password_hash if user and user.password_hash else _DUMMY_HASH
    password_ok = await asyncio.to_thread(pwd_context.verify, payload.password, stored_hash)
    if not user or not user.password_hash or not password_ok:
        _register_failure(email_key, ip_key)
        raise HTTPException(status_code=401, detail="Correo electrónico o contraseña incorrectos")

    # Cada portal acepta solo sus roles: el de estudiantes no abre el panel y viceversa.
    if payload.portal == "admin" and user.role not in STAFF_ROLES:
        raise HTTPException(
            status_code=403,
            detail="Esta cuenta no tiene acceso al panel de administración. Ingresa desde el acceso de estudiantes.",
        )
    if payload.portal == "student" and user.role != "student":
        raise HTTPException(
            status_code=403,
            detail="Esta cuenta es de administrador. Ingresa desde el acceso de administración.",
        )

    _login_failures.pop(email_key, None)
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(access_token=token, user=user)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
