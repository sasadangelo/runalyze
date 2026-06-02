# Importante: Importare i DAO qui per registrarli nel Metadata di Base
from runanalyze.core.database import db_manager
from runanalyze.models.activity import ActivityDAO  # noqa: F401
from runanalyze.models.activity_sample import ActivitySampleDAO  # noqa: F401
from runanalyze.models.base import Base
from runanalyze.models.daily_metrics import DailyMetricsDAO  # noqa: F401


class DatabaseInitializer:
    def __init__(self) -> None:
        self._engine = db_manager.engine

    def initialize_tables(self) -> None:
        """Crea le tabelle nel database SQLite se non esistono ancora."""
        try:
            # Crea le tabelle solo se non sono già presenti nel DB locale
            Base.metadata.create_all(bind=self._engine)
        except Exception as e:
            raise e
