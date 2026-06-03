# -----------------------------------------------------------------------------
# Copyright (c) 2025 Salvatore D'Angelo, Code4Projects
# Licensed under the MIT License. See LICENSE.md for details.
# -----------------------------------------------------------------------------
from sqlalchemy import BigInteger, Column, Float, String
from sqlalchemy.orm import relationship

from .base import Base


class ActivityDAO(Base):
    __tablename__ = "activities"

    id = Column(BigInteger, primary_key=True)  # ID di Garmin Connect
    name = Column(String(length=120), nullable=False)
    activity_type = Column(String(length=50), nullable=True)  # Tipo di attività (running, walking, cycling, etc.)
    start_time = Column(String(length=50), nullable=False)
    duration_secs = Column(Float, nullable=False)
    distance_meters = Column(Float, nullable=False)
    avg_hr = Column(Float, nullable=True)
    max_hr = Column(Float, nullable=True)
    calories = Column(Float, nullable=False)
    avg_speed_m_s = Column(Float, nullable=False)

    # Metriche di allenamento
    tss = Column(Float, nullable=True)  # Training Stress Score (arrotondato a intero)
    vo2max = Column(Float, nullable=True)  # VO2max (arrotondato a 1 decimale)

    # Relazione con i dettagli secondo per secondo
    samples = relationship(
        "ActivitySampleDAO", back_populates="activity", cascade="all, delete-orphan", passive_deletes=True
    )
