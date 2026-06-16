#!/usr/bin/env python3
"""Full training report from February 1st."""

import sys
from datetime import datetime, timedelta
from pathlib import Path

from sqlalchemy.orm import joinedload

sys.path.insert(0, str(Path(__file__).parent.parent))


from runanalyze.core.database import db_manager
from runanalyze.models.activity import ActivityDAO
from runanalyze.models.activity_sample import ActivitySampleDAO  # noqa: F401
from runanalyze.models.activity_weather import ActivityWeatherDAO  # noqa: F401

print("=== Running Activities from February 1st, 2026 ===\n")

with db_manager.get_session() as session:
    activities: list[ActivityDAO] = (
        session.query(ActivityDAO)
        .options(joinedload(ActivityDAO.weather))
        .filter(
            ActivityDAO.activity_type == "running",
            ActivityDAO.start_time >= "2026-02-01",
        )
        .order_by(ActivityDAO.start_time)
        .all()
    )

    print(f"Total running activities: {len(activities)}\n")
    print(
        f"{'Date':<12} {'Name':<25} {'Type':<10} {'Time':>8} {'Distance':>8} "
        f"{'Pace':>7} {'HR Avg':>6} {'HR Max':>6} {'TSS':>5} {'Temp':>6} "
        f"{'Feels':>6} {'Humid':>6} {'Wind':>6}"
    )
    print("-" * 150)

    for act in activities:
        date = str(act.start_time)[:10]
        name = str(act.name)[:24]
        activity_type = (str(act.activity_type) if act.activity_type is not None else "N/A")[:9]

        # Format duration as HH:MM:SS
        duration = int(float(act.duration_secs))  # type: ignore
        hours = duration // 3600
        minutes = (duration % 3600) // 60
        seconds = duration % 60
        time_str = f"{hours:02d}:{minutes:02d}:{seconds:02d}"

        dist = float(act.distance_meters) / 1000  # type: ignore

        # Calculate average pace (min/km)
        if dist > 0:
            pace_secs_per_km = float(act.duration_secs) / dist  # type: ignore
            pace_mins = int(pace_secs_per_km // 60)
            pace_secs = int(pace_secs_per_km % 60)
            pace_str = f"{pace_mins}:{pace_secs:02d}"
        else:
            pace_str = "N/A"

        avg_hr = int(float(act.avg_hr)) if act.avg_hr else 0  # type: ignore
        max_hr = int(float(act.max_hr)) if act.max_hr else 0  # type: ignore
        tss = float(act.tss) if act.tss else 0  # type: ignore

        # Weather data
        temp_str = "N/A"
        feels_str = "N/A"
        humid_str = "N/A"
        wind_str = "N/A"

        if act.weather:
            if act.weather.temperature is not None:
                temp_str = f"{act.weather.temperature:.1f}°C"
            if act.weather.feels_like is not None:
                feels_str = f"{act.weather.feels_like:.1f}°C"
            if act.weather.humidity is not None:
                humid_str = f"{act.weather.humidity:.0f}%"
            if act.weather.wind_speed is not None:
                wind_str = f"{act.weather.wind_speed:.1f}m/s"

        print(
            f"{date:<12} {name:<25} {activity_type:<10} {time_str:>8} "
            f"{dist:7.2f}km {pace_str:>7} {avg_hr:6d} {max_hr:6d} {tss:5.0f} "
            f"{temp_str:>6} {feels_str:>6} {humid_str:>6} {wind_str:>6}"
        )

    # Calculate weekly TSS
    print("\n" + "=" * 65)
    print("=== Weekly TSS Summary ===\n")

    weekly_tss: dict[str, float] = {}
    weekly_count: dict[str, int] = {}

    for act in activities:
        date_obj = datetime.strptime(str(act.start_time)[:10], "%Y-%m-%d")
        # ISO week starts on Monday
        week_start = date_obj - timedelta(days=date_obj.weekday())
        week_key = week_start.strftime("%Y-%m-%d")

        tss = float(act.tss) if act.tss else 0  # type: ignore
        weekly_tss[week_key] = weekly_tss.get(week_key, 0) + tss
        weekly_count[week_key] = weekly_count.get(week_key, 0) + 1

    print(f"{'Week Start':<12} {'Runs':>5} {'Total TSS':>10} {'Avg TSS':>8}")
    print("-" * 40)

    total_tss = 0.0
    for week in sorted(weekly_tss.keys()):
        tss = weekly_tss[week]
        count = weekly_count[week]
        avg = tss / count if count > 0 else 0
        total_tss += tss
        print(f"{week:<12} {count:5d} {tss:10.0f} {avg:8.1f}")

    print("-" * 40)
    print(f"{'TOTAL':<12} {len(activities):5d} {total_tss:10.0f}")

    # Monthly summary
    print("\n" + "=" * 65)
    print("=== Monthly TSS Summary ===\n")

    monthly_tss: dict[str, float] = {}
    monthly_count: dict[str, int] = {}

    for act in activities:
        month = str(act.start_time)[:7]  # YYYY-MM
        tss = float(act.tss) if act.tss else 0  # type: ignore
        monthly_tss[month] = monthly_tss.get(month, 0) + tss
        monthly_count[month] = monthly_count.get(month, 0) + 1

    print(f"{'Month':<10} {'Runs':>5} {'Total TSS':>10} {'Avg/Week':>10}")
    print("-" * 40)

    for month in sorted(monthly_tss.keys()):
        tss = monthly_tss[month]
        count = monthly_count[month]
        # Approximate weeks in month
        weeks = 4.33
        avg_per_week = tss / weeks
        print(f"{month:<10} {count:5d} {tss:10.0f} {avg_per_week:10.1f}")
