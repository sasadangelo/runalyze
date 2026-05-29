import sys
from datetime import date, datetime

from dotenv import load_dotenv

from runanalyze.services import DatabaseInitializer, GarminSyncService


def bootstrap_application() -> None:
    """Fase di avvio dell'applicazione per configurare l'ambiente e il DB."""
    load_dotenv()

    # Inizializzazione dello schema del database locale
    initializer: DatabaseInitializer = DatabaseInitializer()
    initializer.initialize_tables()


def main() -> None:
    try:
        bootstrap_application()

        # Avvio della sincronizzazione con Garmin Connect
        sync_service = GarminSyncService()

        # Imposta il range temporale desiderato (es. dal 1 Febbraio 2026 ad oggi)
        start_date: date = datetime(year=2026, month=2, day=1).date()
        sync_service.synchronize(start_date=start_date)

    except Exception:
        sys.exit(1)


if __name__ == "__main__":
    main()
