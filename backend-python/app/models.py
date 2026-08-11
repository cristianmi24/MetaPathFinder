import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Integer, Boolean, Text, DateTime, ForeignKey,
    DECIMAL, UniqueConstraint, Index
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    role = Column(String(20), nullable=False, default="student")
    password_hash = Column(String(255))
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=utcnow, onupdate=utcnow)

    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    experiment_assignments = relationship("StudentAssignment", back_populates="user", cascade="all, delete-orphan")


class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    type = Column(String(50), nullable=False, default="A/B")
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)

    groups = relationship("ExperimentGroup", back_populates="experiment", cascade="all, delete-orphan")
    assignments = relationship("StudentAssignment", back_populates="experiment", cascade="all, delete-orphan")
    sessions = relationship("Session", back_populates="experiment")


class ExperimentGroup(Base):
    __tablename__ = "experiment_groups"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    experiment_id = Column(UUID(as_uuid=True), ForeignKey("experiments.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)

    experiment = relationship("Experiment", back_populates="groups")
    assignments = relationship("StudentAssignment", back_populates="group", cascade="all, delete-orphan")


class StudentAssignment(Base):
    __tablename__ = "student_assignments"
    __table_args__ = (UniqueConstraint("user_id", "experiment_id", name="uq_user_experiment"),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    experiment_id = Column(UUID(as_uuid=True), ForeignKey("experiments.id", ondelete="CASCADE"), nullable=False)
    group_id = Column(UUID(as_uuid=True), ForeignKey("experiment_groups.id", ondelete="CASCADE"), nullable=False)
    assigned_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)

    user = relationship("User", back_populates="experiment_assignments")
    experiment = relationship("Experiment", back_populates="assignments")
    group = relationship("ExperimentGroup", back_populates="assignments")


class Session(Base):
    __tablename__ = "sessions"

    id = Column(String(50), primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    experiment_id = Column(UUID(as_uuid=True), ForeignKey("experiments.id"))
    status = Column(String(20), nullable=False, default="in_progress", index=True)
    current_level = Column(Integer, default=1)
    current_challenge_id = Column(String(20))
    assigned_strategy_id = Column(String(10))
    strategy_assigned_randomly = Column(Boolean, default=False)
    experiment_group = Column(String(20))
    started_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)
    completed_at = Column(DateTime(timezone=True))
    total_time_seconds = Column(Integer)
    total_clicks = Column(Integer, default=0)
    total_navigations = Column(Integer, default=0)
    final_score = Column(DECIMAL(5, 2))

    user = relationship("User", back_populates="sessions")
    experiment = relationship("Experiment", back_populates="sessions")
    challenge_results = relationship("ChallengeResult", back_populates="session", cascade="all, delete-orphan")
    calibration_results = relationship("CalibrationResult", back_populates="session", cascade="all, delete-orphan")
    cognitive_events = relationship("CognitiveEvent", back_populates="session", cascade="all, delete-orphan")


class ChallengeResult(Base):
    __tablename__ = "challenge_results"
    __table_args__ = (Index("idx_challenge_result_session", "session_id"),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(String(50), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False)
    challenge_id = Column(String(20), nullable=False)
    score = Column(DECIMAL(5, 2), nullable=False)
    max_score = Column(DECIMAL(5, 2), default=100)
    time_spent_seconds = Column(Integer, nullable=False, default=0)
    clicks = Column(Integer, default=0)
    mouse_distance = Column(Integer, default=0)
    attempts = Column(Integer, default=1)
    hints_used = Column(Integer, default=0)
    passed = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)

    session = relationship("Session", back_populates="challenge_results")


class CalibrationResult(Base):
    __tablename__ = "calibration_results"
    __table_args__ = (Index("idx_calibration_session", "session_id"),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(String(50), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False)
    challenge_id = Column(String(20), nullable=False)
    jol_average = Column(DECIMAL(5, 2), nullable=False)
    performance_score = Column(DECIMAL(5, 2), nullable=False)
    gap = Column(DECIMAL(5, 2), nullable=False)
    cluster = Column(String(10), nullable=False)
    calibration_index = Column(DECIMAL(5, 2))
    reflection_text = Column(Text)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)

    session = relationship("Session", back_populates="calibration_results")


class CognitiveEvent(Base):
    __tablename__ = "cognitive_events"
    __table_args__ = (
        Index("idx_cognitive_events_session", "session_id"),
        Index("idx_cognitive_events_type", "event_type"),
        Index("idx_cognitive_events_timestamp", "timestamp"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(String(50), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False)
    event_type = Column(String(50), nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    metadata_ = Column("metadata", JSONB, default=dict)

    session = relationship("Session", back_populates="cognitive_events")
