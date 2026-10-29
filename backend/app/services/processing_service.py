import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
from backend.app.core.config import settings
from backend.app.core.constants import FUEL_TYPE_WIND
from backend.app.utils.datetime_utils import parse_iso_datetime, to_iso_string, settlement_period_from_datetime, settlement_date_from_datetime

class ProcessingService:
    def filter_wind_actuals(self, fuelhh_records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        normalized: List[Dict[str, Any]] = []
        seen_starts = set()

        for rec in fuelhh_records:
            if rec.get("fuelType") != FUEL_TYPE_WIND:
                continue
            raw_start = rec.get("startTime")
            if not raw_start:
                continue
            dt_start = parse_iso_datetime(raw_start)
            iso_start = to_iso_string(dt_start)
            
            if iso_start in seen_starts:
                continue
            seen_starts.add(iso_start)

            settlement_date = rec.get("settlementDate") or settlement_date_from_datetime(dt_start)
            settlement_period = rec.get("settlementPeriod") or settlement_period_from_datetime(dt_start)

            normalized.append({
                "startTime": iso_start,
                "settlementDate": settlement_date,
                "settlementPeriod": int(settlement_period),
                "actualGeneration": float(rec.get("generation", 0.0)),
            })

        normalized.sort(key=lambda item: item["startTime"])
        return normalized

    def filter_and_normalize_forecasts(self, windfor_records: List[Dict[str, Any]], jan_only: bool = False) -> List[Dict[str, Any]]:
        normalized: List[Dict[str, Any]] = []
        seen_pairs = set()

        jan_start = datetime(2026, 1, 1, 0, 0, 0, tzinfo=timezone.utc)
        jan_end = datetime(2026, 1, 31, 23, 30, 0, tzinfo=timezone.utc)

        for rec in windfor_records:
            raw_start = rec.get("startTime")
            raw_publish = rec.get("publishTime")
            if not raw_start or not raw_publish:
                continue

            dt_start = parse_iso_datetime(raw_start)
            if jan_only and (dt_start < jan_start or dt_start > jan_end):
                continue

            dt_publish = parse_iso_datetime(raw_publish)
            iso_start = to_iso_string(dt_start)
            iso_publish = to_iso_string(dt_publish)

            pair_key = (iso_start, iso_publish)
            if pair_key in seen_pairs:
                continue
            seen_pairs.add(pair_key)

            normalized.append({
                "startTime": iso_start,
                "publishTime": iso_publish,
                "forecastGeneration": float(rec.get("generation", 0.0)),
            })

        normalized.sort(key=lambda item: (item["startTime"], item["publishTime"]))
        return normalized

    def build_normalized_dataset(self, actuals: List[Dict[str, Any]], forecasts: List[Dict[str, Any]]) -> Dict[str, Any]:
        return {
            "metadata": {
                "targetYear": 2026,
                "targetMonth": 1,
                "totalSettlementPeriods": 1488,
                "actualPeriodsCount": len(actuals),
                "totalForecastRecords": len(forecasts),
                "generatedAt": to_iso_string(datetime.now(timezone.utc)),
            },
            "actuals": actuals,
            "forecasts": forecasts,
        }

    def save_json(self, data: Any, filepath: Path) -> None:
        filepath.parent.mkdir(parents=True, exist_ok=True)
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, separators=(",", ":"))

    def load_json(self, filepath: Path) -> Any:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)