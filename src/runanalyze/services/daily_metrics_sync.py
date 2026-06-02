import os
from datetime import date, datetime, timedelta

from garminconnect import Garmin
from sqlalchemy import exists

from runanalyze.core.database import db_manager
from runanalyze.core.log import LoggerManager
from runanalyze.models.daily_metrics import DailyMetricsDAO


class DailyMetricsSyncService:
    """
    Servizio per sincronizzare le metriche giornaliere da Garmin Connect al database.
    Include HRV (Heart Rate Variability) e FC Rest (Frequenza Cardiaca a Riposo).
    """

    def __init__(self) -> None:
        self.logger = LoggerManager.get_logger(name=self.__class__.__name__)
        self.email = os.getenv("GARMIN_EMAIL")
        self.password = os.getenv("GARMIN_PASSWORD")
        self.token_dir = os.path.expanduser(os.getenv("GARMINTOKENS") or "~/.garminconnect")
        self.logger.debug(f"Token directory: {self.token_dir}")

    def _login(self) -> Garmin:
        """Gestisce l'autenticazione con Garmin Connect."""
        try:
            self.logger.info("Attempting to login to Garmin Connect...")
            client: Garmin = Garmin(email=self.email, password=self.password)
            client.login(tokenstore=self.token_dir)
            self.logger.info("Successfully logged in to Garmin Connect")
            return client
        except Exception as e:
            self.logger.error(f"Failed to login to Garmin Connect: {e}")
            raise e

    def synchronize(self, start_date: date) -> None:
        """Scarica le metriche giornaliere (HRV, FC Rest e VO2max) e le salva nel DB."""
        client: Garmin = self._login()
        end_date = datetime.now().date()

        self.logger.info(f"Fetching daily metrics from {start_date.isoformat()} to {end_date.isoformat()}")

        current_date = start_date
        processed_count = 0
        skipped_count = 0
        error_count = 0

        while current_date <= end_date:
            date_str = current_date.isoformat()

            with db_manager.get_session() as session:
                # Verifica se i dati per questa data esistono già
                already_exists = session.query(exists().where(DailyMetricsDAO.date == date_str)).scalar()

                if already_exists:
                    self.logger.debug(f"Daily metrics for {date_str} already exist, skipping")
                    skipped_count += 1
                    current_date += timedelta(days=1)
                    continue

                hrv_value = None
                resting_hr_value = None
                vo2max_value = None

                # Scarica HRV
                try:
                    self.logger.debug(f"Fetching HRV data for {date_str}")
                    hrv_data = client.get_hrv_data(date_str)
                    if hrv_data and "hrvSummary" in hrv_data and "lastNightAvg" in hrv_data["hrvSummary"]:
                        hrv_value = float(hrv_data["hrvSummary"]["lastNightAvg"])
                        self.logger.debug(f"HRV for {date_str}: {hrv_value}")
                except Exception as e:
                    self.logger.warning(f"Error fetching HRV data for {date_str}: {e}")

                # Scarica FC Rest
                try:
                    self.logger.debug(f"Fetching Resting HR data for {date_str}")
                    rhr_data = client.get_rhr_day(date_str)
                    if rhr_data and "allMetrics" in rhr_data:
                        metrics_map = rhr_data["allMetrics"].get("metricsMap", {})
                        rhr_list = metrics_map.get("WELLNESS_RESTING_HEART_RATE", [])
                        for entry in rhr_list:
                            if entry.get("calendarDate") == date_str:
                                resting_hr_value = float(entry["value"])
                                self.logger.debug(f"Resting HR for {date_str}: {resting_hr_value}")
                                break
                except Exception as e:
                    self.logger.warning(f"Error fetching Resting HR data for {date_str}: {e}")

                # Scarica VO2max
                try:
                    self.logger.debug(f"Fetching VO2max data for {date_str}")
                    vo2max_data = client.get_max_metrics(date_str)
                    if vo2max_data and len(vo2max_data) > 0:
                        first_entry = vo2max_data[0]  # type: ignore[index]
                        if "generic" in first_entry and first_entry["generic"] is not None:
                            vo2max_raw = first_entry["generic"].get("vo2MaxPreciseValue")
                            if vo2max_raw is not None:
                                vo2max_value = round(float(vo2max_raw), 1)
                                self.logger.debug(f"VO2max for {date_str}: {vo2max_value}")
                except Exception as e:
                    self.logger.warning(f"Error fetching VO2max data for {date_str}: {e}")

                # Salva nel database solo se abbiamo almeno un valore
                if hrv_value is not None or resting_hr_value is not None or vo2max_value is not None:
                    daily_metric = DailyMetricsDAO(
                        date=date_str, hrv=hrv_value, resting_hr=resting_hr_value, vo2max=vo2max_value
                    )
                    session.add(daily_metric)
                    self.logger.info(
                        f"Added daily metrics for {date_str} "
                        f"(HRV: {hrv_value}, Resting HR: {resting_hr_value}, VO2max: {vo2max_value})"
                    )
                    processed_count += 1
                else:
                    self.logger.debug(f"No metrics available for {date_str}")
                    error_count += 1

            current_date += timedelta(days=1)

        self.logger.info(
            f"Daily metrics synchronization completed: {processed_count} processed, "
            f"{skipped_count} skipped, {error_count} no data"
        )
