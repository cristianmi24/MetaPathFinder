from datetime import datetime
from typing import Any, Dict, List, Literal, Optional
from uuid import UUID
from pydantic import BaseModel, Field


class UserCreate(BaseModel):
    name: str = Field(..., max_length=100)
    last_name: str = Field(..., max_length=100)
    email: str = Field(..., max_length=255)
    # bcrypt solo usa los primeros 72 bytes: se limita para no truncar en silencio.
    password: str = Field(..., min_length=8, max_length=72)
    role: str = "student"
    terms_accepted: bool = False
    guardian_declaration: bool = False
    terms_version: Optional[str] = Field(default=None, max_length=20)


class UserResponse(BaseModel):
    id: UUID
    name: str
    last_name: str
    email: str
    role: str
    created_at: datetime
    model_config = {"from_attributes": True}


class LoginRequest(BaseModel):
    email: str = Field(..., max_length=255)
    password: str = Field(..., max_length=128)
    # Portal desde el que se inicia sesión: "student" o "admin". Si se omite, no se restringe por rol.
    portal: Optional[Literal["student", "admin"]] = None


class AdminUserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field("", max_length=100)
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=8, max_length=72)
    role: Literal["student", "admin"] = "student"


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class CognitiveEventCreate(BaseModel):
    event_type: str
    timestamp: datetime
    metadata: Dict[str, Any] = {}


class ChallengeResultCreate(BaseModel):
    challenge_id: str
    score: float
    max_score: float = 100
    time_spent_seconds: int = 0
    clicks: int = 0
    mouse_distance: int = 0
    attempts: int = 1
    hints_used: int = 0
    passed: bool = False


class JolInput(BaseModel):
    tipo: str  # "escala" | "tiempo" | "capacidad"
    valor: float | str
    tiempo_maximo: Optional[float] = None


class PhaseAComplete(BaseModel):
    session_id: str
    user_id: UUID
    current_level: int
    current_challenge_id: str
    assigned_strategy_id: Optional[str] = None
    strategy_assigned_randomly: bool = False
    experiment_group: Optional[str] = None


class PhaseBComplete(BaseModel):
    session_id: str
    challenge_result: ChallengeResultCreate
    cognitive_events: List[CognitiveEventCreate] = []


class PhaseCComplete(BaseModel):
    session_id: str
    jols: List[JolInput]
    actual_scores: List[float]
    reflection_text: Optional[str] = None
    cognitive_events: List[CognitiveEventCreate] = []


class SessionComplete(BaseModel):
    session_id: str
    user_id: str
    total_time_seconds: int
    total_clicks: int
    total_navigations: int
    final_score: float
    completed_at: datetime
