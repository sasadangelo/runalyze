# -----------------------------------------------------------------------------
# Copyright (c) 2025 Salvatore D'Angelo, Code4Projects
# Licensed under the MIT License. See LICENSE.md for details.
# -----------------------------------------------------------------------------
"""Controller layer for activity-related HTTP request handling."""

from flask import jsonify, render_template

from runanalyze.services.activity_service import ActivityService


class ActivityController:
    """Controller for handling activity-related HTTP requests."""

    @staticmethod
    def index():
        """
        Handle home page request.

        Returns:
            Rendered index.html template
        """
        return render_template("index.html")

    @staticmethod
    def list_activities():
        """
        Handle request to list all activities.

        Returns:
            Rendered activities.html template with activities data
        """
        activities_data = ActivityService.get_all_activities()
        return render_template("activities.html", activities=activities_data)

    @staticmethod
    def show_activity_detail(activity_id: int) -> str | tuple[str, int]:
        """
        Handle request to show activity details.

        Args:
            activity_id: The ID of the activity to display

        Returns:
            Rendered activity_detail.html template or 404 error
        """
        activity_data = ActivityService.get_activity_by_id(activity_id)

        if not activity_data:
            return "Attività non trovata", 404

        samples_data = ActivityService.get_activity_samples(activity_id)

        return render_template("activity_detail.html", activity=activity_data, samples=samples_data)

    @staticmethod
    def get_activity_samples_api(activity_id: int):
        """
        Handle API request to get activity samples.

        Args:
            activity_id: The ID of the activity

        Returns:
            JSON response with samples data
        """
        samples_data = ActivityService.get_activity_samples(activity_id)
        return jsonify(samples_data)


# Made with Bob
