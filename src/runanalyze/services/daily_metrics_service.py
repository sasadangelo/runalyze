# -----------------------------------------------------------------------------
# Copyright (c) 2025 Salvatore D'Angelo, Code4Projects
# Licensed under the MIT License. See LICENSE.md for details.
# -----------------------------------------------------------------------------
"""Service layer for daily metrics business logic."""

from datetime import datetime
from typing import Any, cast

from sqlalchemy import desc

from runanalyze.core.database import db_manager
from runanalyze.models.activity import ActivityDAO
from runanalyze.models.daily_metrics import DailyMetricsDAO


class DailyMetricsService:
    """Service for handling daily metrics operations."""

    @staticmethod
    def _as_float(value: Any) -> float:
        """Convert ORM-backed numeric values to Python float for static typing."""
        return cast(float, value)

    @staticmethod
    def _as_optional_float(value: Any) -> float | None:
        """Convert optional ORM-backed numeric values to Python float or None."""
        if value is None:
            return None
        return cast(float, value)

    @staticmethod
    def get_hrv_data(start_date: str | None = None, end_date: str | None = None) -> list[dict]:
        """
        Retrieve HRV data within date range.

        Args:
            start_date: Start date in YYYY-MM-DD format (optional)
            end_date: End date in YYYY-MM-DD format (optional)

        Returns:
            List of dictionaries with date and HRV values
        """
        with db_manager.get_session() as session:
            query = session.query(DailyMetricsDAO).filter(DailyMetricsDAO.hrv.isnot(None))

            if start_date:
                query = query.filter(DailyMetricsDAO.date >= start_date)
            if end_date:
                query = query.filter(DailyMetricsDAO.date <= end_date)

            metrics = query.order_by(DailyMetricsDAO.date).all()

            return [
                {"date": metric.date, "hrv": DailyMetricsService._as_optional_float(metric.hrv)} for metric in metrics
            ]

    @staticmethod
    def get_resting_hr_data(start_date: str | None = None, end_date: str | None = None) -> list[dict]:
        """
        Retrieve resting heart rate data within date range.

        Args:
            start_date: Start date in YYYY-MM-DD format (optional)
            end_date: End date in YYYY-MM-DD format (optional)

        Returns:
            List of dictionaries with date and resting HR values
        """
        with db_manager.get_session() as session:
            query = session.query(DailyMetricsDAO).filter(DailyMetricsDAO.resting_hr.isnot(None))

            if start_date:
                query = query.filter(DailyMetricsDAO.date >= start_date)
            if end_date:
                query = query.filter(DailyMetricsDAO.date <= end_date)

            metrics = query.order_by(DailyMetricsDAO.date).all()

            return [
                {
                    "date": metric.date,
                    "resting_hr": DailyMetricsService._as_optional_float(metric.resting_hr),
                }
                for metric in metrics
            ]

    @staticmethod
    def get_vo2max_data(start_date: str | None = None, end_date: str | None = None) -> list[dict]:
        """
        Retrieve VO2max data from daily metrics within date range.

        Args:
            start_date: Start date in YYYY-MM-DD format (optional)
            end_date: End date in YYYY-MM-DD format (optional)

        Returns:
            List of dictionaries with date and VO2max values
        """
        with db_manager.get_session() as session:
            query = session.query(DailyMetricsDAO).filter(DailyMetricsDAO.vo2max.isnot(None))

            if start_date:
                query = query.filter(DailyMetricsDAO.date >= start_date)
            if end_date:
                query = query.filter(DailyMetricsDAO.date <= end_date)

            metrics = query.order_by(DailyMetricsDAO.date).all()

            return [
                {"date": metric.date, "vo2max": DailyMetricsService._as_optional_float(metric.vo2max)}
                for metric in metrics
            ]

    @staticmethod
    def get_training_data(start_date: str | None = None, end_date: str | None = None) -> list[dict]:
        """
        Retrieve training data (TSS, distance, duration) from activities within date range.

        Args:
            start_date: Start date in YYYY-MM-DD format (optional)
            end_date: End date in YYYY-MM-DD format (optional)

        Returns:
            List of dictionaries with date and training metrics
        """
        with db_manager.get_session() as session:
            query = session.query(ActivityDAO)

            if start_date:
                query = query.filter(ActivityDAO.start_time >= start_date)
            if end_date:
                # Add one day to include activities on end_date
                end_datetime = datetime.strptime(end_date, "%Y-%m-%d")
                end_date_inclusive = end_datetime.strftime("%Y-%m-%d") + "T23:59:59"
                query = query.filter(ActivityDAO.start_time <= end_date_inclusive)

            activities = query.order_by(ActivityDAO.start_time).all()

            training_data = []
            for activity in activities:
                # Extract date from start_time (format: YYYY-MM-DDTHH:MM:SS)
                date = activity.start_time.split("T")[0]

                distance_meters = DailyMetricsService._as_float(activity.distance_meters)
                duration_secs = DailyMetricsService._as_float(activity.duration_secs)

                training_data.append(
                    {
                        "date": date,
                        "tss": DailyMetricsService._as_optional_float(activity.tss),
                        "distance_km": round(distance_meters / 1000, 2),
                        "duration_hours": round(duration_secs / 3600, 2),
                        "vo2max": DailyMetricsService._as_optional_float(activity.vo2max),
                    }
                )

            return training_data

    @staticmethod
    def get_latest_metrics() -> dict:
        """
        Get the latest available metrics for overview dashboard.

        Returns:
            Dictionary with latest HRV, resting HR, and TSS values
        """
        with db_manager.get_session() as session:
            # Get latest HRV
            latest_hrv_metric = (
                session.query(DailyMetricsDAO)
                .filter(DailyMetricsDAO.hrv.isnot(None))
                .order_by(desc(DailyMetricsDAO.date))
                .first()
            )

            # Get latest resting HR
            latest_rhr_metric = (
                session.query(DailyMetricsDAO)
                .filter(DailyMetricsDAO.resting_hr.isnot(None))
                .order_by(desc(DailyMetricsDAO.date))
                .first()
            )

            # Get latest activity with TSS
            latest_tss_activity = (
                session.query(ActivityDAO)
                .filter(ActivityDAO.tss.isnot(None))
                .order_by(desc(ActivityDAO.start_time))
                .first()
            )

            return {
                "hrv": DailyMetricsService._as_optional_float(latest_hrv_metric.hrv) if latest_hrv_metric else None,
                "hrv_date": latest_hrv_metric.date if latest_hrv_metric else None,
                "resting_hr": DailyMetricsService._as_optional_float(latest_rhr_metric.resting_hr)
                if latest_rhr_metric
                else None,
                "resting_hr_date": latest_rhr_metric.date if latest_rhr_metric else None,
                "tss": DailyMetricsService._as_optional_float(latest_tss_activity.tss) if latest_tss_activity else None,
                "tss_date": latest_tss_activity.start_time.split("T")[0] if latest_tss_activity else None,
            }


# Made with Bob
