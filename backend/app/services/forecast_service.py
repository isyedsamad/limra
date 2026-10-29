from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
from backend.app.core.constants import LONDON_TZ, UTC_TZ
from backend.app.utils.datetime_utils import parse_iso_datetime, to_iso_string

class ForecastService:
    def compute_cutoff_timestamp(self, delivery_date_str: str, cutoff_time_str: str = "10:00") -> datetime:
        delivery_dt = datetime.strptime(delivery_date_str, "%Y-%m-%d").date()
        decision_date = delivery_dt - timedelta(days=1)
        hour, minute = map(int, cutoff_time_str.split(":"))
        local_cutoff = datetime(
            decision_date.year,
            decision_date.month,
            decision_date.day,
            hour,
            minute,
            0,
            tzinfo=LONDON_TZ,
        )
        return local_cutoff.astimezone(UTC_TZ)

    def select_forecasts(self, forecast_records: List[Dict[str, Any]], delivery_date: str, cutoff_time: str = "10:00", match_mode: str = "hourly") -> Dict[str, Dict[str, Any]]:
        cutoff_utc = self.compute_cutoff_timestamp(delivery_date, cutoff_time)
        candidates_by_start: Dict[str, List[Dict[str, Any]]] = {}

        for rec in forecast_records:
            raw_start = rec.get("startTime")
            raw_publish = rec.get("publishTime")
            if not raw_start or not raw_publish:
                continue

            dt_start = parse_iso_datetime(raw_start)
            local_start_date = dt_start.astimezone(LONDON_TZ).strftime("%Y-%m-%d")
            if local_start_date != delivery_date:
                continue

            dt_publish = parse_iso_datetime(raw_publish)
            if dt_publish > cutoff_utc:
                continue

            iso_start = to_iso_string(dt_start)
            candidates_by_start.setdefault(iso_start, []).append({
                "forecastGeneration": float(rec.get("forecastGeneration", rec.get("generation", 0.0))),
                "publishTime": to_iso_string(dt_publish),
                "_dt_publish": dt_publish,
            })

        selected: Dict[str, Dict[str, Any]] = {}
        for iso_start, records in candidates_by_start.items():
            records.sort(key=lambda r: r["_dt_publish"])
            best = records[-1]
            selected[iso_start] = {
                "forecastGeneration": best["forecastGeneration"],
                "publishTime": best["publishTime"],
            }

        if match_mode == "hourly":
            expanded: Dict[str, Dict[str, Any]] = {}
            for iso_start, val in selected.items():
                expanded[iso_start] = val
                dt = parse_iso_datetime(iso_start)
                if dt.minute == 0:
                    dt_half = dt + timedelta(minutes=30)
                    iso_half = to_iso_string(dt_half)
                    if iso_half not in selected:
                        expanded[iso_half] = val
            return expanded

        return selected

    def get_vintages_for_period(self, forecast_records: List[Dict[str, Any]], period_start: str) -> List[Dict[str, Any]]:
        target_iso = to_iso_string(parse_iso_datetime(period_start))
        vintages = []

        for rec in forecast_records:
            raw_start = rec.get("startTime")
            if not raw_start:
                continue
            if to_iso_string(parse_iso_datetime(raw_start)) == target_iso:
                vintages.append({
                    "startTime": target_iso,
                    "publishTime": to_iso_string(parse_iso_datetime(rec["publishTime"])),
                    "forecastGeneration": float(rec.get("forecastGeneration", rec.get("generation", 0.0))),
                })

        vintages.sort(key=lambda v: v["publishTime"])
        return vintages