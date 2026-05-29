"""
Configuration module using Pydantic Settings.
Reads database configuration from config.yaml file.
"""

from pathlib import Path

import yaml
from pydantic import Field
from pydantic_settings import BaseSettings


class SQLiteSettings(BaseSettings):
    """SQLite database configuration."""

    path: str = Field(default="data/garmin.db", description="Path to SQLite database file")
    echo: bool = Field(default=False, description="Enable SQL query logging")
    pool_pre_ping: bool = Field(default=True, description="Enable connection health checks")

    @property
    def database_url(self) -> str:
        """Generate SQLite database URL."""
        return f"sqlite:///{self.path}"

    @property
    def absolute_path(self) -> Path:
        """Get absolute path to database file."""
        return Path(self.path).resolve()


class DatabaseSettings(BaseSettings):
    """Database configuration container."""

    sqlite: SQLiteSettings = Field(default_factory=SQLiteSettings)


class Settings(BaseSettings):
    """Main application settings."""

    database: DatabaseSettings = Field(default_factory=DatabaseSettings)
    garmin_email: str = Field(default=..., description="Garmin Connect email (from env)")
    garmin_password: str = Field(default=..., description="Garmin Connect password (from env)")

    class Config:
        """Pydantic configuration."""

        case_sensitive: bool = False
        env_file: str = ".env"
        env_file_encoding: str = "utf-8"
        env_nested_delimiter: str = "__"


def load_config_from_yaml(config_path: str | None = None) -> Settings:
    """
    Load configuration from YAML file.

    Args:
        config_path: Path to config.yaml file. If None, uses default path.

    Returns:
        Settings object with loaded configuration.
    """
    config_file: Path = (
        Path(__file__).parent.parent.parent.parent / "config.yaml" if config_path is None else Path(config_path)
    )

    if not config_file.exists():
        raise FileNotFoundError(f"Configuration file not found: {config_file}")

    with open(file=config_file, encoding="utf-8") as f:
        config_data = yaml.safe_load(f)

    # Create Settings object from YAML data
    return Settings(**config_data)


# Global config instance
config: Settings = load_config_from_yaml()
