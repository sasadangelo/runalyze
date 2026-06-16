# -----------------------------------------------------------------------------
# Copyright (c) 2025 Salvatore D'Angelo, Code4Projects
# Licensed under the MIT License. See LICENSE.md for details.
# -----------------------------------------------------------------------------
from sqlalchemy import BigInteger, Column, Float, ForeignKey, Integer
from sqlalchemy.orm import relationship

from .base import Base


class ActivityWeatherDAO(Base):
    """Model for storing weather data associated with activities."""

    __tablename__ = "activity_weather"

    id = Column(Integer, primary_key=True, autoincrement=True)
    activity_id = Column(
        BigInteger,
        ForeignKey("activities.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )

    # Weather metrics
    temperature = Column(Float, nullable=True)  # Temperature in Celsius
    feels_like = Column(Float, nullable=True)  # Feels like temp in Celsius
    humidity = Column(Float, nullable=True)  # Humidity percentage
    wind_speed = Column(Float, nullable=True)  # Wind speed in m/s

    # Relationship back to activity
    activity = relationship("ActivityDAO", back_populates="weather")


# Made with Bob
