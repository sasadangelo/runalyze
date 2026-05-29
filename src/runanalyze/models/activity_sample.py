from sqlalchemy import BigInteger, Column, Float, ForeignKey, Integer
from sqlalchemy.orm import relationship

from .base import Base


class ActivitySampleDAO(Base):
    __tablename__ = "activity_samples"

    activity_id = Column(BigInteger, ForeignKey("activities.id", ondelete="CASCADE"), primary_key=True)
    timestamp_secs = Column(Integer, primary_key=True)  # Tempo progressivo in secondi
    heart_rate = Column(Integer, nullable=True)
    speed_m_s = Column(Float, nullable=True)

    # Relazione inversa
    activity = relationship("ActivityDAO", back_populates="samples")
