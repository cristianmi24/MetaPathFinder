from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from pydantic import BaseModel, Field

from app.database import get_db
from app.models import User
from app.schemas import UserResponse
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/users", tags=["users"], dependencies=[Depends(get_current_user)])


class UserUpdate(BaseModel):
    name: str | None = Field(None, max_length=100)
    last_name: str | None = Field(None, max_length=100)
    email: str | None = Field(None, max_length=255)


@router.get("/", response_model=list[UserResponse])
async def list_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    return result.scalars().all()


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/by-email/{email}", response_model=UserResponse)
async def get_user_by_email(email: str, db: AsyncSession = Depends(get_db)):
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
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await db.delete(user)
    await db.commit()
    return {"status": "deleted"}
