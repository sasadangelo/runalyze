# -----------------------------------------------------------------------------
# Copyright (c) 2025 Salvatore D'Angelo, Code4Projects
# Licensed under the MIT License. See LICENSE.md for details.
# -----------------------------------------------------------------------------
from datetime import datetime

import requests

from runanalyze.core.log import LoggerManager


class WeatherService:
    """Service for fetching weather data from Open-Meteo API."""

    def __init__(self) -> None:
        self.logger = LoggerManager.get_logger(name=self.__class__.__name__)
        self.archive_url = "https://archive-api.open-meteo.com/v1/archive"

    def get_weather_data(self, latitude: float, longitude: float, timestamp: datetime) -> dict | None:
        """
        Fetch historical weather data for a specific location and time.

        Args:
            latitude: Latitude of the location
            longitude: Longitude of the location
            timestamp: Time of the activity

        Returns:
            Dictionary with weather data or None if fetch fails
        """
        try:
            # Format date for API (YYYY-MM-DD)
            date_str = timestamp.strftime("%Y-%m-%d")
            hour = timestamp.hour

            # Open-Meteo Archive API parameters
            params: dict[str, str | float] = {
                "latitude": latitude,
                "longitude": longitude,
                "start_date": date_str,
                "end_date": date_str,
                "hourly": "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m",
                "temperature_unit": "celsius",
                "wind_speed_unit": "ms",
            }

            self.logger.debug(f"Fetching historical weather for {date_str} at lat={latitude}, lon={longitude}")
            response = requests.get(self.archive_url, params=params, timeout=10)
            response.raise_for_status()

            data = response.json()

            # Extract hourly data for the specific hour
            hourly = data.get("hourly", {})
            times = hourly.get("time", [])

            # Find the closest hour
            if not times or hour >= len(times):
                hour = 12  # Default to noon if hour not available

            weather_data = {
                "temperature": hourly.get("temperature_2m", [])[hour]
                if hour < len(hourly.get("temperature_2m", []))
                else None,
                "feels_like": hourly.get("apparent_temperature", [])[hour]
                if hour < len(hourly.get("apparent_temperature", []))
                else None,
                "humidity": hourly.get("relative_humidity_2m", [])[hour]
                if hour < len(hourly.get("relative_humidity_2m", []))
                else None,
                "wind_speed": hourly.get("wind_speed_10m", [])[hour]
                if hour < len(hourly.get("wind_speed_10m", []))
                else None,
            }

            self.logger.debug(f"Weather data fetched: {weather_data}")
            return weather_data

        except requests.exceptions.RequestException as e:
            self.logger.error(f"Failed to fetch weather data: {e}")
            return None
        except (KeyError, ValueError, IndexError) as e:
            self.logger.error(f"Failed to parse weather data: {e}")
            return None


# Made with Bob
