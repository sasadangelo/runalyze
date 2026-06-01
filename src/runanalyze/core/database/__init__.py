# -----------------------------------------------------------------------------
# Copyright (c) 2025 Salvatore D'Angelo, Code4Projects
# Licensed under the MIT License. See LICENSE.md for details.
# -----------------------------------------------------------------------------
"""Core module."""

from .database import DatabaseSessionManager, db_manager

__all__ = [
    "DatabaseSessionManager",
    "db_manager",
]
