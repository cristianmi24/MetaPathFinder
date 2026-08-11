from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.database import get_db
from app.models import Experiment, ExperimentGroup, StudentAssignment
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/experiments", tags=["experiments"], dependencies=[Depends(get_current_user)])


@router.get("/")
async def list_experiments(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Experiment).order_by(Experiment.created_at.desc()))
    experiments = result.scalars().all()
    return [
        {"id": str(e.id), "name": e.name, "description": e.description,
         "type": e.type, "is_active": e.is_active, "created_at": e.created_at.isoformat()}
        for e in experiments
    ]


@router.get("/{experiment_id}")
async def get_experiment(experiment_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Experiment).where(Experiment.id == experiment_id))
    experiment = result.scalar_one_or_none()
    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")

    groups_result = await db.execute(
        select(ExperimentGroup).where(ExperimentGroup.experiment_id == experiment_id)
    )
    groups = groups_result.scalars().all()

    return {
        "id": str(experiment.id), "name": experiment.name,
        "description": experiment.description, "type": experiment.type,
        "is_active": experiment.is_active, "created_at": experiment.created_at.isoformat(),
        "groups": [{"id": str(g.id), "name": g.name, "description": g.description} for g in groups],
    }


@router.post("/{experiment_id}/assign")
async def assign_to_experiment(experiment_id: UUID, payload: dict, db: AsyncSession = Depends(get_db)):
    group_name = payload.get("group_name", "control")

    result = await db.execute(
        select(ExperimentGroup).where(
            ExperimentGroup.experiment_id == experiment_id,
            ExperimentGroup.name == group_name,
        )
    )
    group = result.scalar_one_or_none()
    if not group:
        raise HTTPException(status_code=404, detail=f"Group '{group_name}' not found")

    existing = await db.execute(
        select(StudentAssignment).where(
            StudentAssignment.user_id == payload["user_id"],
            StudentAssignment.experiment_id == experiment_id,
        )
    )
    if existing.scalar_one_or_none():
        return {"status": "already_assigned"}

    assignment = StudentAssignment(
        user_id=payload["user_id"],
        experiment_id=experiment_id,
        group_id=group.id,
    )
    db.add(assignment)
    await db.commit()
    return {"status": "assigned", "group": group_name}
