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
    # "confianza" | "capacidad" | "tiempo" | "esfuerzo": solo las dos primeras cuentan como confianza.
    kind: Optional[str] = None
    id: Optional[str] = None


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
    reflection_text: Optional[str] = Field(default=None, max_length=4000)
    cognitive_events: List[CognitiveEventCreate] = []
    # Observaciones crudas para el tutor (ver services/tutor/indicators.py). Opcional.
    tutor_observations: Optional[Dict[str, Any]] = None
    challenge: Optional[Dict[str, Any]] = None  # {id, titulo, criterios}
    estimated_minutes: Optional[float] = None
    actual_minutes: Optional[float] = None


class TutorPlanRequest(BaseModel):
    user_id: UUID
    level_name: str = "Básico"
    available: List[Dict[str, Any]] = []  # [{id, nivel, sub_nivel}]
    session_id: Optional[str] = None


class TutorOverride(BaseModel):
    user_id: UUID
    session_id: Optional[str] = None
    kind: Literal["strategy", "challenge", "advance"]
    chosen: Optional[str] = None
    suggested: Optional[str] = None
    reason: Optional[str] = Field(default=None, max_length=300)


class LearningStyleInput(BaseModel):
    user_id: UUID
    visual_verbal: float = Field(..., ge=-1, le=1)     # +1 visual · −1 verbal
    global_sequential: float = Field(..., ge=-1, le=1) # +1 global · −1 secuencial
    answers: Dict[str, Any] = {}


class ResourceRatingInput(BaseModel):
    user_id: UUID
    resource_id: str = Field(..., max_length=80)
    challenge_id: Optional[str] = Field(default=None, max_length=20)
    helpful: bool


class TrackingBatch(BaseModel):
    session_id: Optional[str] = None
    events: List[CognitiveEventCreate] = Field(default_factory=list, max_length=500)


class SessionComplete(BaseModel):
    session_id: str
    user_id: str
    total_time_seconds: int
    total_clicks: int
    total_navigations: int
    final_score: float
    completed_at: datetime
