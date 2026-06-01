# -----------------------------------------------------------------------------
# Copyright (c) 2025 Salvatore D'Angelo, Code4Projects
# Licensed under the MIT License. See LICENSE.md for details.
# -----------------------------------------------------------------------------
from collections.abc import Generator
from contextlib import contextmanager

from sqlalchemy import create_engine, event
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, sessionmaker

# Importiamo l'istanza di configurazione globale creata con Pydantic
from runanalyze.core.config import config


class DatabaseSessionManager:
    def __init__(self):
        # Recuperiamo l'oggetto SQLiteSettings tipizzato da Pydantic
        sqlite_settings = config.database.sqlite

        # 1. Garantiamo che la directory di destinazione (es. 'data/') esista
        db_file_path = sqlite_settings.absolute_path
        db_file_path.parent.mkdir(parents=True, exist_ok=True)

        self.database_url = sqlite_settings.database_url

        # 2. Configurazione dell'Engine specifico per SQLite
        # Nota: Usiamo pool_pre_ping solo se specificato e rimuoviamo i parametri complessi di pool di Postgres
        self.engine = create_engine(
            self.database_url,
            echo=sqlite_settings.echo,
            pool_pre_ping=sqlite_settings.pool_pre_ping,
            # 'check_same_thread=False' è fondamentale per permettere l'uso del DB in contesti multithread/async
            # (gestito poi in sicurezza dai contesti isolati delle sessioni di SQLAlchemy)
            connect_args={"check_same_thread": False} if self.database_url.startswith("sqlite") else {},
        )

        # 3. Forziamo SQLite a rispettare i vincoli di Foreign Key (ON DELETE CASCADE, ecc.)
        @event.listens_for(self.engine, "connect")
        def set_sqlite_pragma(dbapi_connection, connection_record):
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.close()

        self.SessionFactory = sessionmaker(bind=self.engine, autocommit=False, autoflush=False)

    @contextmanager
    def get_session(self) -> Generator[Session, None, None]:
        """Context manager per la gestione transazionale e logging delle performance."""
        session = self.SessionFactory()
        try:
            yield session
            session.commit()
        except SQLAlchemyError as e:
            session.rollback()
            raise e
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()


# Istanza globale del manager da importare nei service del modulo runanalyze
db_manager: DatabaseSessionManager = DatabaseSessionManager()
