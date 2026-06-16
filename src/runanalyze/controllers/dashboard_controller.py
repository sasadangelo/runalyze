# -----------------------------------------------------------------------------
# Copyright (c) 2025 Salvatore D'Angelo, Code4Projects
# Licensed under the MIT License. See LICENSE.md for details.
# -----------------------------------------------------------------------------
"""Controller for dashboard pages."""

from flask import jsonify, render_template, request

from runanalyze.services.activity_service import ActivityService
from runanalyze.services.daily_metrics_service import DailyMetricsService


class DashboardController:
    """Controller for handling dashboard-related requests."""

    @staticmethod
    def overview() -> str:
        """Render the overview dashboard page."""
        return render_template(template_name_or_list="overview.html")

    @staticmethod
    def training() -> str:
        """Render the training dashboard page."""
        return render_template(template_name_or_list="training.html")

    @staticmethod
    def health() -> str:
        """Render the health dashboard page."""
        return render_template(template_name_or_list="health.html")

    @staticmethod
    def workouts() -> str:
        """Render the workouts list page."""
        activities = ActivityService.get_all_activities()
        return render_template(template_name_or_list="workouts.html", activities=activities)

    @staticmethod
    def get_hrv_data():
        """API endpoint to get HRV data."""
        start_date: str | None = request.args.get("start_date")
        end_date: str | None = request.args.get("end_date")
        data = DailyMetricsService.get_hrv_data(start_date, end_date)
        return jsonify(data)

    @staticmethod
    def get_resting_hr_data():
        """API endpoint to get resting heart rate data."""
        start_date: str | None = request.args.get("start_date")
        end_date: str | None = request.args.get("end_date")
        data = DailyMetricsService.get_resting_hr_data(start_date, end_date)
        return jsonify(data)

    @staticmethod
    def get_vo2max_data():
        """API endpoint to get VO2max data."""
        start_date: str | None = request.args.get("start_date")
        end_date: str | None = request.args.get("end_date")
        data = DailyMetricsService.get_vo2max_data(start_date, end_date)
        return jsonify(data)

    @staticmethod
    def get_training_data():
        """API endpoint to get training data (TSS, distance, duration)."""
        start_date: str | None = request.args.get("start_date")
        end_date: str | None = request.args.get("end_date")
        activity_type = request.args.get("activity_type")
        data = DailyMetricsService.get_training_data(start_date, end_date, activity_type)
        return jsonify(data)

    @staticmethod
    def get_latest_metrics():
        """API endpoint to get latest metrics for overview."""
        data = DailyMetricsService.get_latest_metrics()
        return jsonify(data)
