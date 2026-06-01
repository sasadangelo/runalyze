# -----------------------------------------------------------------------------
# Copyright (c) 2025 Salvatore D'Angelo, Code4Projects
# Licensed under the MIT License. See LICENSE.md for details.
# -----------------------------------------------------------------------------
"""Routes for activity-related endpoints."""

from flask import Blueprint

from runanalyze.controllers.activity_controller import ActivityController

# Create blueprint for activity routes
activity_bp = Blueprint("activities", __name__)


@activity_bp.route("/")
def index():
    """Home page - Overview"""
    return ActivityController.index()


@activity_bp.route("/activities")
def activities_list():
    """Lista di tutte le attività"""
    return ActivityController.list_activities()


@activity_bp.route("/activities/<int:activity_id>")
def activity_detail(activity_id):
    """Dettagli di una singola attività"""
    return ActivityController.show_activity_detail(activity_id)


@activity_bp.route("/api/activities/<int:activity_id>/samples")
def activity_samples_api(activity_id):
    """API endpoint per ottenere i samples di un'attività (per i grafici)"""
    return ActivityController.get_activity_samples_api(activity_id)


# Made with Bob
