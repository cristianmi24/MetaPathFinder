from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from pydantic import BaseModel, Field

from app.database import get_db
from app.models import User
import asyncio
from datetime import datetime, timezone

from app.schemas import UserResponse, AdminUserCreate
from app.routers.auth import (
    get_current_user, require_staff, require_admin, ensure_self_or_staff, pwd_context, CURRENT_TERMS_VERSION,
)

router = APIRouter(prefix="/api/users", tags=["users"], dependencies=[Depends(get_current_user)])


class UserUpdate(BaseModel):
    name: str | None = Field(None, max_length=100)
    last_name: str | None = Field(None, max_length=100)
    email: str | None = Field(None, max_length=255)


@router.get("/", response_model=list[UserResponse])
async def list_users(db: AsyncSession = Depends(get_db), _: User = Depends(require_staff)):
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    return result.scalars().all()


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(payload: AdminUserCreate, db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)):
    """Alta de usuarios desde el panel (único camino para crear administradores)."""
    dup = await db.execute(select(User).where(User.email == payload.email))
    if dup.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="El correo electrónico ya se encuentra registrado")
    user = User(
        name=payload.name,
        last_name=payload.last_name,
        email=payload.email,
        role=payload.role,
        password_hash=await asyncio.to_thread(pwd_context.hash, payload.password),
        terms_accepted=True,
        terms_accepted_at=datetime.now(timezone.utc),
        terms_version=CURRENT_TERMS_VERSION,
        guardian_declaration=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    ensure_self_or_staff(current_user, user_id)
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/by-email/{email}", response_model=UserResponse)
async def get_user_by_email(email: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin" and email != current_user.email:
        raise HTTPException(status_code=403, detail="No tienes permiso para acceder a estos datos")
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: UUID,
    payload: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ("admin",):
        raise HTTPException(status_code=403, detail="Only administrators can update users")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if payload.email is not None and payload.email != user.email:
        dup = await db.execute(select(User).where(User.email == payload.email))
        if dup.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Email already in use")
    if payload.name is not None:
        user.name = payload.name
    if payload.last_name is not None:
        user.last_name = payload.last_name
    if payload.email is not None:
        user.email = payload.email
    await db.commit()
    await db.refresh(user)
    return user


@router.delete("/{user_id}")
async def delete_user(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ("admin",):
        raise HTTPException(status_code=403, detail="Only administrators can delete users")
    if str(current_user.id) == str(user_id):
        raise HTTPException(status_code=400, detail="No puedes eliminar tu propia cuenta")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await db.delete(user)
    await db.commit()
    return {"status": "deleted"}
