# -----------------------------------------------------------------------------
# Copyright (c) 2025 Salvatore D'Angelo, Code4Projects
# Licensed under the MIT License. See LICENSE.md for details.
# -----------------------------------------------------------------------------
"""Service layer for activity-related business logic."""

from typing import Any, cast

from sqlalchemy import desc

from runanalyze.core.database import db_manager
from runanalyze.models.activity import ActivityDAO
from runanalyze.models.activity_sample import ActivitySampleDAO


class ActivityService:
    """Service for handling activity-related operations."""

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
    def _round_float(value: Any, digits: int = 0) -> float | None:
        """
        Round a numeric value after narrowing ORM column typing to Python float.

        Args:
            value: Numeric value or None
            digits: Number of decimal digits

        Returns:
            Rounded float or None if value is None
        """
        numeric_value = ActivityService._as_optional_float(value)
        if numeric_value is None:
            return None
        return round(numeric_value, digits)

    @staticmethod
    def get_all_activities() -> list[dict]:
        """
        Retrieve all activities with formatted data.

        Returns:
            List of activity dictionaries with formatted fields
        """
        with db_manager.get_session() as session:
            activities = session.query(ActivityDAO).order_by(desc(ActivityDAO.start_time)).all()

            activities_data = []
            for activity in activities:
                activities_data.append(ActivityService._format_activity_summary(activity))

            return activities_data

    @staticmethod
    def get_activity_by_id(activity_id: int) -> dict | None:
        """
        Retrieve a single activity by ID with detailed information.

        Args:
            activity_id: The ID of the activity

        Returns:
            Activity dictionary with detailed fields or None if not found
        """
        with db_manager.get_session() as session:
            activity = session.query(ActivityDAO).filter(ActivityDAO.id == activity_id).first()

            if not activity:
                return None

            return ActivityService._format_activity_detail(activity)

    @staticmethod
    def get_activity_samples(activity_id: int) -> list[dict]:
        """
        Retrieve all samples for a specific activity.

        Args:
            activity_id: The ID of the activity

        Returns:
            List of sample dictionaries with formatted fields
        """
        with db_manager.get_session() as session:
            samples = (
                session.query(ActivitySampleDAO)
                .filter(ActivitySampleDAO.activity_id == activity_id)
                .order_by(ActivitySampleDAO.timestamp_secs)
                .all()
            )

            samples_data = []
            for sample in samples:
                samples_data.append(ActivityService._format_sample(sample))

            return samples_data

    @staticmethod
    def _calculate_pace(speed_m_s: float) -> str:
        """
        Calculate pace in min/km format from speed in m/s.

        Args:
            speed_m_s: Speed in meters per second

        Returns:
            Pace string in format "MM:SS" or "N/A" if speed is 0
        """
        if speed_m_s > 0:
            pace_min_per_km = 1000 / (speed_m_s * 60)
            pace_minutes = int(pace_min_per_km)
            pace_seconds = int((pace_min_per_km - pace_minutes) * 60)
            return f"{pace_minutes}:{pace_seconds:02d}"
        return "N/A"

    @staticmethod
    def _calculate_instant_pace(speed_m_s: float | None) -> float | None:
        """
        Calculate instantaneous pace in min/km from speed in m/s.

        Args:
            speed_m_s: Speed in meters per second

        Returns:
            Pace in minutes per kilometer or None if speed is invalid
        """
        if speed_m_s and speed_m_s > 0:
            return 1000 / (speed_m_s * 60)
        return None

    @staticmethod
    def _format_duration(duration_secs: float) -> str:
        """
        Format duration in seconds to readable string.

        Args:
            duration_secs: Duration in seconds

        Returns:
            Duration string in format "HH:MM:SS" or "MM:SS"
        """
        duration_hours = int(duration_secs // 3600)
        duration_minutes = int((duration_secs % 3600) // 60)
        duration_seconds = int(duration_secs % 60)

        if duration_hours > 0:
            return f"{duration_hours}:{duration_minutes:02d}:{duration_seconds:02d}"
        return f"{duration_minutes}:{duration_seconds:02d}"

    @staticmethod
    def _format_activity_summary(activity: ActivityDAO) -> dict:
        """
        Format activity data for list view.

        Args:
            activity: ActivityDAO instance

        Returns:
            Dictionary with formatted activity summary
        """
        distance_km = ActivityService._round_float(activity.distance_meters / 1000, 2)
        avg_hr = ActivityService._round_float(activity.avg_hr, 0)
        calories = ActivityService._round_float(activity.calories, 0)

        return {
            "id": activity.id,
            "name": activity.name,
            "start_time": activity.start_time,
            "distance_km": distance_km if distance_km is not None else 0.0,
            "duration": ActivityService._format_duration(ActivityService._as_float(activity.duration_secs)),
            "pace": ActivityService._calculate_pace(ActivityService._as_float(activity.avg_speed_m_s)),
            "avg_hr": avg_hr if avg_hr is not None else "N/A",
            "calories": calories if calories is not None else 0.0,
        }

    @staticmethod
    def _format_activity_detail(activity: ActivityDAO) -> dict:
        """
        Format activity data for detail view.

        Args:
            activity: ActivityDAO instance

        Returns:
            Dictionary with formatted activity details
        """
        distance_km = ActivityService._round_float(activity.distance_meters / 1000, 2)
        avg_hr = ActivityService._round_float(activity.avg_hr, 0)
        max_hr = ActivityService._round_float(activity.max_hr, 0)
        calories = ActivityService._round_float(activity.calories, 0)

        # Format weather data if available
        weather_data = None
        if activity.weather:
            weather_data = {
                "temperature": ActivityService._round_float(activity.weather.temperature, 1),
                "feels_like": ActivityService._round_float(activity.weather.feels_like, 1),
                "humidity": ActivityService._round_float(activity.weather.humidity, 0),
                "wind_speed": ActivityService._round_float(activity.weather.wind_speed, 1),
            }

        return {
            "id": activity.id,
            "name": activity.name,
            "start_time": activity.start_time,
            "distance_km": distance_km if distance_km is not None else 0.0,
            "distance_meters": ActivityService._as_float(activity.distance_meters),
            "duration": ActivityService._format_duration(ActivityService._as_float(activity.duration_secs)),
            "duration_secs": ActivityService._as_float(activity.duration_secs),
            "pace": ActivityService._calculate_pace(ActivityService._as_float(activity.avg_speed_m_s)),
            "avg_hr": avg_hr,
            "max_hr": max_hr,
            "calories": calories if calories is not None else 0.0,
            "avg_speed_m_s": ActivityService._as_float(activity.avg_speed_m_s),
            "weather": weather_data,
        }

    @staticmethod
    def _format_sample(sample: ActivitySampleDAO) -> dict:
        """
        Format sample data.

        Args:
            sample: ActivitySampleDAO instance

        Returns:
            Dictionary with formatted sample data
        """
        return {
            "timestamp": sample.timestamp_secs,
            "heart_rate": sample.heart_rate,
            "speed_m_s": sample.speed_m_s,
            "pace_min_per_km": ActivityService._calculate_instant_pace(
                ActivityService._as_optional_float(sample.speed_m_s)
            ),
        }

    @staticmethod
    def calculate_aerobic_decoupling(activity_id: int) -> dict[str, float | None]:
        """
        Calculate aerobic decoupling metrics for an activity.

        Args:
            activity_id: The ID of the activity

        Returns:
            Dictionary with 'aerobic_decoupling' and 'aerobic_decoupling_pure' values
            Returns None for both if calculation is not possible
        """
        with db_manager.get_session() as session:
            # Get activity
            activity = session.query(ActivityDAO).filter(ActivityDAO.id == activity_id).first()
            if not activity:
                return {"aerobic_decoupling": None, "aerobic_decoupling_pure": None}

            # Get all samples ordered by timestamp
            samples = (
                session.query(ActivitySampleDAO)
                .filter(ActivitySampleDAO.activity_id == activity_id)
                .order_by(ActivitySampleDAO.timestamp_secs)
                .all()
            )

            if not samples:
                return {"aerobic_decoupling": None, "aerobic_decoupling_pure": None}

            # Filter valid samples (exclude walking/pauses)
            # Pace > 8:30 min/km = 8.5 min/km = speed < 1000/(8.5*60) = 1.96 m/s
            min_running_speed = 1.96  # m/s (equivalent to 8:30 min/km)

            valid_samples = []
            for sample in samples:
                # Convert ORM values to Python types
                hr = cast(int, sample.heart_rate) if sample.heart_rate is not None else 0
                speed = ActivityService._as_optional_float(sample.speed_m_s)

                # Skip if HR is missing or zero
                if hr == 0:
                    continue
                # Skip if speed is missing, zero, or too slow (walking)
                if speed is None or speed == 0 or speed < min_running_speed:
                    continue
                valid_samples.append(sample)

            # Check if we have enough valid data
            if len(valid_samples) < len(samples) * 0.5:
                # Less than 50% valid samples, too much data discarded
                return {"aerobic_decoupling": None, "aerobic_decoupling_pure": None}

            if not valid_samples:
                return {"aerobic_decoupling": None, "aerobic_decoupling_pure": None}

            # Calculate warm-up period to exclude: max(5 minutes, 8% of duration)
            duration_secs = ActivityService._as_float(activity.duration_secs)
            warmup_secs = max(300, duration_secs * 0.08)  # 300 seconds = 5 minutes

            # Filter samples after warm-up for standard decoupling
            samples_after_warmup = [s for s in valid_samples if s.timestamp_secs >= warmup_secs]

            # Check if remaining duration is at least 15 minutes
            if not samples_after_warmup or (samples_after_warmup[-1].timestamp_secs - warmup_secs) < 900:
                # Less than 15 minutes of valid data after warm-up
                return {"aerobic_decoupling": None, "aerobic_decoupling_pure": None}

            # Calculate standard aerobic decoupling (with warm-up excluded)
            aerobic_decoupling = ActivityService._calculate_decoupling_with_pace(samples_after_warmup)

            # Calculate pure aerobic decoupling (HR only, also with warm-up excluded)
            aerobic_decoupling_pure = ActivityService._calculate_decoupling_hr_only(samples_after_warmup)

            return {
                "aerobic_decoupling": aerobic_decoupling,
                "aerobic_decoupling_pure": aerobic_decoupling_pure,
            }

    @staticmethod
    def _calculate_decoupling_with_pace(samples: list[ActivitySampleDAO]) -> float | None:
        """
        Calculate aerobic decoupling using HR/Pace ratio.

        Args:
            samples: List of valid activity samples

        Returns:
            Decoupling percentage or None if calculation fails
        """
        if len(samples) < 2:
            return None

        # Split samples into two halves
        mid_point = len(samples) // 2
        first_half = samples[:mid_point]
        second_half = samples[mid_point:]

        # Calculate average HR and pace for each half
        first_hr_avg = float(sum(cast(int, s.heart_rate) for s in first_half)) / len(first_half)
        first_pace_avg = sum(
            ActivityService._calculate_instant_pace(ActivityService._as_optional_float(s.speed_m_s)) or 0
            for s in first_half
        ) / len(first_half)

        second_hr_avg = float(sum(cast(int, s.heart_rate) for s in second_half)) / len(second_half)
        second_pace_avg = sum(
            ActivityService._calculate_instant_pace(ActivityService._as_optional_float(s.speed_m_s)) or 0
            for s in second_half
        ) / len(second_half)

        # Avoid division by zero
        if first_pace_avg == 0 or second_pace_avg == 0:
            return None

        # Calculate efficiency ratio (HR / Pace) for each half
        first_efficiency = first_hr_avg / first_pace_avg
        second_efficiency = second_hr_avg / second_pace_avg

        # Avoid division by zero
        if first_efficiency == 0:
            return None

        # Calculate decoupling percentage
        decoupling = ((second_efficiency - first_efficiency) / first_efficiency) * 100

        return round(float(decoupling), 2)

    @staticmethod
    def _calculate_decoupling_hr_only(samples: list[ActivitySampleDAO]) -> float | None:
        """
        Calculate pure aerobic decoupling using only HR drift.

        Args:
            samples: List of valid activity samples

        Returns:
            HR drift percentage or None if calculation fails
        """
        if len(samples) < 2:
            return None

        # Split samples into two halves
        mid_point = len(samples) // 2
        first_half = samples[:mid_point]
        second_half = samples[mid_point:]

        # Calculate average HR for each half
        first_hr_avg = float(sum(cast(int, s.heart_rate) for s in first_half)) / len(first_half)
        second_hr_avg = float(sum(cast(int, s.heart_rate) for s in second_half)) / len(second_half)

        # Avoid division by zero
        if first_hr_avg == 0:
            return None

        # Calculate HR drift percentage
        hr_drift = ((second_hr_avg - first_hr_avg) / first_hr_avg) * 100

        return round(float(hr_drift), 2)


# Made with Bob
