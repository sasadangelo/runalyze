import os
from datetime import date, datetime

from garminconnect import Garmin
from sqlalchemy import exists

from runanalyze.core.database import db_manager
from runanalyze.core.log import LoggerManager
from runanalyze.models.activity import ActivityDAO
from runanalyze.models.activity_sample import ActivitySampleDAO


class GarminSyncService:
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
        """Scarica le attività e i dettagli temporali salvandoli nel DB."""
        client: Garmin = self._login()
        end_date = datetime.now().date()

        self.logger.info(f"Fetching activities from {start_date.isoformat()} to {end_date.isoformat()}")
        activities = client.get_activities_by_date(startdate=start_date.isoformat(), enddate=end_date.isoformat())

        total_activities = len(activities)
        self.logger.info(f"Found {total_activities} activities to process")

        processed_count = 0
        skipped_count = 0
        error_count = 0

        for idx, act in enumerate(activities, 1):
            activity_id = act["activityId"]
            activity_name = act.get("activityName", "Attività senza nome")
            start_time = act.get("startTimeLocal")

            self.logger.info(f"Processing activity {idx}/{total_activities}: {activity_name} (ID: {activity_id})")

            # Apriamo una sessione per verificare l'esistenza dell'attività
            with db_manager.get_session() as session:
                already_exists = session.query(exists().where(ActivityDAO.id == activity_id)).scalar()
                if already_exists:
                    self.logger.debug(f"Activity {activity_id} already exists in database, skipping")
                    skipped_count += 1
                    continue

                # Creazione record principale tramite DAO
                # Arrotonda TSS a intero e VO2max a 1 cifra decimale
                tss_value = act.get("activityTrainingLoad")
                tss = round(tss_value) if tss_value is not None else None

                vo2max_value = act.get("vO2MaxValue")
                vo2max = round(vo2max_value, 1) if vo2max_value is not None else None

                new_activity = ActivityDAO(
                    id=activity_id,
                    name=activity_name,
                    activity_type=act.get("activityType", {}).get("typeKey"),  # Tipo di attività
                    start_time=start_time,
                    duration_secs=act.get("duration", 0.0),
                    distance_meters=act.get("distance", 0.0),
                    avg_hr=act.get("averageHR"),
                    max_hr=act.get("maxHR"),
                    calories=act.get("calories", 0.0),
                    avg_speed_m_s=act.get("averageSpeed", 0.0),
                    tss=tss,  # Training Stress Score (arrotondato a intero)
                    vo2max=vo2max,  # VO2max (arrotondato a 1 decimale)
                )
                session.add(new_activity)
                self.logger.debug(f"Added activity {activity_id} to session")

                # Scaricamento metriche di dettaglio secondo per secondo
                try:
                    self.logger.debug(f"Fetching detailed metrics for activity {activity_id}")
                    details = client.get_activity_details(activity_id)

                    descriptors = details.get("metricDescriptors", [])
                    self.logger.debug(f"Found {len(descriptors)} metric descriptors")

                    # Find indices for timestamp, HR, and speed in the metrics array
                    hr_index = None
                    speed_index = None
                    duration_index = None

                    for d in descriptors:
                        key = d.get("key")
                        idx = d.get("metricsIndex")
                        if key == "directHeartRate":
                            hr_index = idx
                        elif key == "directSpeed":
                            speed_index = idx
                        elif key == "sumDuration":
                            duration_index = idx

                    self.logger.debug(f"Indices - HR: {hr_index}, Speed: {speed_index}, Duration: {duration_index}")

                    metrics_entries = details.get("activityDetailMetrics", [])
                    self.logger.debug(f"Found {len(metrics_entries)} metrics entries")

                    samples_count = 0
                    seen_timestamps = set()  # Track timestamps to avoid duplicates

                    for entry in metrics_entries:
                        metrics_values = entry.get("metrics", [])

                        if not metrics_values:
                            continue

                        # Extract timestamp - use duration (seconds from start)
                        ts = None
                        if duration_index is not None and duration_index < len(metrics_values):
                            ts = int(metrics_values[duration_index])

                        # Skip entries without a valid timestamp since it's part of the primary key
                        if ts is None:
                            continue

                        # Skip duplicate timestamps to avoid UNIQUE constraint violations
                        if ts in seen_timestamps:
                            self.logger.debug(f"Skipping duplicate timestamp {ts} for activity {activity_id}")
                            continue

                        # Extract heart rate if the index is valid
                        hr = None
                        if hr_index is not None and hr_index < len(metrics_values):
                            hr_value = metrics_values[hr_index]
                            if hr_value is not None and hr_value > 0:
                                hr = int(hr_value)

                        # Extract speed in m/s if the index is valid
                        speed_m_s = None
                        if speed_index is not None and speed_index < len(metrics_values):
                            speed_value = metrics_values[speed_index]
                            if speed_value is not None and speed_value > 0:
                                speed_m_s = float(speed_value)

                        # Save the record if we have at least one of the two useful data points
                        if hr is not None or speed_m_s is not None:
                            sample = ActivitySampleDAO(
                                activity_id=activity_id, timestamp_secs=ts, heart_rate=hr, speed_m_s=speed_m_s
                            )
                            session.add(sample)
                            seen_timestamps.add(ts)  # Mark this timestamp as seen
                            samples_count += 1

                    self.logger.info(f"Added {samples_count} samples for activity {activity_id}")
                    processed_count += 1

                except Exception as e:
                    self.logger.error(f"Error fetching details for activity {activity_id}: {e}")
                    error_count += 1

            # Il commit della sessione avviene automaticamente all'uscita dal blocco "with" di db_manager

        self.logger.info(
            f"Synchronization completed: {processed_count} processed, {skipped_count} skipped, {error_count} errors"
        )
