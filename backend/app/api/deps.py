from datetime import datetime, timedelta, timezone
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List, Optional
from backend.app.core.config import settings
from backend.app.services.analytics_service import AnalyticsService
from backend.app.services.elexon_service import ElexonService
from backend.app.services.forecast_service import ForecastService
from backend.app.services.processing_service import ProcessingService

class DataStore:
    def __init__(self, data_path: Optional[Path] = None) -> None:
        self.data_path = data_path or (settings.PROCESSED_DATA_DIR / "january_2026_normalized.json")
        self.processor = ProcessingService()
        self.elexon = ElexonService()
        self.metadata: Dict[str, Any] = {}
        self.actuals: List[Dict[str, Any]] = []
        self.forecasts: List[Dict[str, Any]] = []
        self._load()

    def _load(self) -> None:
        if self.data_path.exists():
            payload = self.processor.load_json(self.data_path)
            self.metadata = payload.get("metadata", {})
            self.actuals = payload.get("actuals", [])
            self.forecasts = payload.get("forecasts", [])

    def fetch_live_data_for_date(self, delivery_date: str) -> None:
        if delivery_date.startswith("2026-01") and len(self.actuals) > 0:
            return
        try:
            raw_fuelhh = self.elexon.fetch_fuelhh_range(delivery_date, delivery_date)
            if raw_fuelhh:
                live_actuals = self.processor.filter_wind_actuals(raw_fuelhh)
                if live_actuals:
                    self.actuals = [
                        a for a in self.actuals
                        if not (a.get("settlementDate") == delivery_date or a.get("startTime", "").startswith(delivery_date))
                    ]
                    self.actuals.extend(live_actuals)

            d_obj = datetime.strptime(delivery_date, "%Y-%m-%d").date()
            pub_start = datetime(d_obj.year, d_obj.month, d_obj.day, 0, 0, 0, tzinfo=timezone.utc) - timedelta(days=2)
            pub_end = datetime(d_obj.year, d_obj.month, d_obj.day, 23, 59, 59, tzinfo=timezone.utc)
            raw_fc = self.elexon.fetch_windfor_chunk(pub_start, pub_end)
            if raw_fc:
                live_forecasts = self.processor.filter_and_normalize_forecasts(raw_fc, jan_only=False)
                if live_forecasts:
                    self.forecasts = [
                        f for f in self.forecasts
                        if not f.get("startTime", "").startswith(delivery_date)
                    ]
                    self.forecasts.extend(live_forecasts)
        except Exception:
            pass

    def get_actuals_for_date(self, delivery_date: str) -> List[Dict[str, Any]]:
        self.fetch_live_data_for_date(delivery_date)
        return [
            a for a in self.actuals
            if a.get("settlementDate") == delivery_date or a.get("startTime", "").startswith(delivery_date)
        ]

    def get_forecasts_for_date(self, delivery_date: str) -> List[Dict[str, Any]]:
        self.fetch_live_data_for_date(delivery_date)
        return [
            f for f in self.forecasts
            if f.get("startTime", "").startswith(delivery_date)
        ]

@lru_cache(maxsize=1)
def get_data_store() -> DataStore:
    return DataStore()

def get_forecast_service() -> ForecastService:
    return ForecastService()

def get_analytics_service() -> AnalyticsService:
    return AnalyticsService()