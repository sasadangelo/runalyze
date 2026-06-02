# -----------------------------------------------------------------------------
# Copyright (c) 2025 Salvatore D'Angelo, Code4Projects
# Licensed under the MIT License. See LICENSE.md for details.
# -----------------------------------------------------------------------------
from sqlalchemy import Column, Float, String

from .base import Base


class DailyMetricsDAO(Base):
    """
    Modello per le metriche giornaliere non legate a specifiche attività.
    Include HRV, FC Rest e VO2max.
    """

    __tablename__ = "daily_metrics"

    date = Column(String(length=10), primary_key=True)  # YYYY-MM-DD
    hrv = Column(Float, nullable=True)  # Heart Rate Variability (ms)
    resting_hr = Column(Float, nullable=True)  # Frequenza cardiaca a riposo (bpm)
    vo2max = Column(Float, nullable=True)  # VO2max (ml/kg/min) arrotondato a 1 decimale


# Made with Bob
