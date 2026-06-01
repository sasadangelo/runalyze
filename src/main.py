import sys
from datetime import date, datetime

from dotenv import load_dotenv

from runanalyze.core.config import config
from runanalyze.core.log import LoggerManager, setup_logging
from runanalyze.services import DatabaseInitializer, GarminSyncService


def bootstrap_application() -> None:
    """Fase di avvio dell'applicazione per configurare l'ambiente e il DB."""
    load_dotenv()

    # Inizializzazione del sistema di logging
    setup_logging(
        level=config.log.level,
        console=config.log.console,
        file=config.log.file,
        rotation=config.log.rotation,
        retention=config.log.retention,
        compression=config.log.compression,
    )

    logger = LoggerManager.get_logger(name=__name__)
    logger.info("Application starting...")
    logger.info(f"Log level: {config.log.level}")
    logger.info(f"Database path: {config.database.sqlite.path}")

    # Inizializzazione dello schema del database locale
    initializer: DatabaseInitializer = DatabaseInitializer()
    initializer.initialize_tables()
    logger.info("Database initialized successfully")


def main() -> None:
    logger = None
    try:
        bootstrap_application()
        logger = LoggerManager.get_logger(__name__)

        # Avvio della sincronizzazione con Garmin Connect
        logger.info("Starting Garmin synchronization service...")
        sync_service: GarminSyncService = GarminSyncService()

        # Imposta il range temporale desiderato (es. dal 1 Febbraio 2026 ad oggi)
        start_date: date = datetime(year=2026, month=2, day=1).date()
        logger.info(f"Synchronizing activities from {start_date.isoformat()}")
        sync_service.synchronize(start_date=start_date)

        logger.info("Application completed successfully")

    except Exception as e:
        if logger:
            logger.error(f"Application failed with error: {e}", exc_info=True)
        else:
            print(f"Application failed with error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
