# -----------------------------------------------------------------------------
# Copyright (c) 2025 Salvatore D'Angelo, Code4Projects
# Licensed under the MIT License. See LICENSE.md for details.
# -----------------------------------------------------------------------------
"""Routes for dashboard pages."""

from flask import Blueprint

from runanalyze.controllers.dashboard_controller import DashboardController

dashboard_bp = Blueprint("dashboard", __name__)


# Dashboard pages
@dashboard_bp.route("/")
@dashboard_bp.route("/overview")
def overview():
    """Overview dashboard page."""
    return DashboardController.overview()


@dashboard_bp.route("/training")
def training():
    """Training dashboard page."""
    return DashboardController.training()


@dashboard_bp.route("/health")
def health():
    """Health dashboard page."""
    return DashboardController.health()


# API endpoints for data
@dashboard_bp.route("/api/hrv")
def get_hrv_data():
    """Get HRV data API endpoint."""
    return DashboardController.get_hrv_data()


@dashboard_bp.route("/api/resting-hr")
def get_resting_hr_data():
    """Get resting heart rate data API endpoint."""
    return DashboardController.get_resting_hr_data()


@dashboard_bp.route("/api/vo2max")
def get_vo2max_data():
    """Get VO2max data API endpoint."""
    return DashboardController.get_vo2max_data()


@dashboard_bp.route("/api/training")
def get_training_data():
    """Get training data API endpoint."""
    return DashboardController.get_training_data()


@dashboard_bp.route("/api/latest-metrics")
def get_latest_metrics():
    """Get latest metrics API endpoint."""
    return DashboardController.get_latest_metrics()


# Made with Bob
