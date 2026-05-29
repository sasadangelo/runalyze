import os
from datetime import date, datetime

from garminconnect import Garmin
from sqlalchemy import exists

from runanalyze.core.database import db_manager
from runanalyze.models.activity import ActivityDAO
from runanalyze.models.activity_sample import ActivitySampleDAO


class GarminSyncService:
    def __init__(self) -> None:
        self.email = os.getenv("GARMIN_EMAIL")
        self.password = os.getenv("GARMIN_PASSWORD")
        self.token_dir = os.path.expanduser(os.getenv("GARMINTOKENS") or "~/.garminconnect")

    def _login(self) -> Garmin:
        """Gestisce l'autenticazione con Garmin Connect."""
        try:
            client = Garmin(email=self.email, password=self.password)
            client.login(tokenstore=self.token_dir)
            return client
        except Exception as e:
            raise e

    def synchronize(self, start_date: date) -> None:
        """Scarica le attività e i dettagli temporali salvandoli nel DB."""
        client = self._login()
        end_date = datetime.now().date()

        activities = client.get_activities_by_date(startdate=start_date.isoformat(), enddate=end_date.isoformat())

        for act in activities:
            activity_id = act["activityId"]
            activity_name = act.get("activityName", "Attività senza nome")
            start_time = act.get("startTimeLocal")

            # Apriamo una sessione per verificare l'esistenza dell'attività
            with db_manager.get_session() as session:
                already_exists = session.query(exists().where(ActivityDAO.id == activity_id)).scalar()
                if already_exists:
                    continue

                # Creazione record principale tramite DAO
                new_activity = ActivityDAO(
                    id=activity_id,
                    name=activity_name,
                    start_time=start_time,
                    duration_secs=act.get("duration", 0.0),
                    distance_meters=act.get("distance", 0.0),
                    avg_hr=act.get("averageHR"),
                    max_hr=act.get("maxHR"),
                    calories=act.get("calories", 0.0),
                    avg_speed_m_s=act.get("averageSpeed", 0.0),
                )
                session.add(new_activity)

                # Scaricamento metriche di dettaglio secondo per secondo
                try:
                    details = client.get_activity_details(activity_id)

                    descriptors = details.get("metricDescriptors", [])
                    hr_index = next(
                        (d.get("metricsIndex") for d in descriptors if d.get("key") == "directHeartRate"), None
                    )
                    speed_index = next(
                        (d.get("metricsIndex") for d in descriptors if d.get("key") == "directSpeed"), None
                    )

                    metrics_entries = details.get("activityDetailMetrics", [])

                    for entry in metrics_entries:
                        ts = entry.get("metricsIndex")
                        metrics_values = entry.get("metrics", [])

                        hr = (
                            metrics_values[hr_index]
                            if hr_index is not None and hr_index < len(metrics_values)
                            else None
                        )
                        speed_m_s = (
                            metrics_values[speed_index]
                            if speed_index is not None and speed_index < len(metrics_values)
                            else None
                        )

                        if hr is not None or speed_m_s is not None:
                            sample = ActivitySampleDAO(
                                activity_id=activity_id, timestamp_secs=ts, heart_rate=hr, speed_m_s=speed_m_s
                            )
                            session.add(sample)

                except Exception as e:
                    print(f"Error fetching details for activity {activity_id}: {e}")

            # Il commit della sessione avviene automaticamente all'uscita dal blocco "with" di db_manager
