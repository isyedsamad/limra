from datetime import datetime, timedelta
from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, Query
from backend.app.api.deps import DataStore, get_data_store, get_forecast_service, get_analytics_service
from backend.app.core.constants import LONDON_TZ, UTC_TZ
from backend.app.schemas.forecast import VintageItem, VintagesResponse
from backend.app.services.analytics_service import AnalyticsService
from backend.app.services.forecast_service import ForecastService
from backend.app.utils.datetime_utils import parse_iso_datetime, to_iso_string

router = APIRouter()

def validate_params(delivery_date: str, cutoff: str) -> None:
    try:
        datetime.strptime(delivery_date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid delivery_date format, expected YYYY-MM-DD")
    try:
        parts = cutoff.split(":")
        if len(parts) != 2:
            raise ValueError()
        h, m = int(parts[0]), int(parts[1])
        if not (0 <= h <= 23 and 0 <= m <= 59):
            raise ValueError()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid cutoff format, expected HH:MM")

@router.get("/forecasts")
def get_forecasts(delivery_date: str = Query("2026-01-01"), cutoff: str = Query("10:00"),
    store: DataStore = Depends(get_data_store),
    forecast_service: ForecastService = Depends(get_forecast_service),
) -> Dict[str, Any]:
    validate_params(delivery_date, cutoff)
    selected = forecast_service.select_forecasts(
        store.get_forecasts_for_date(delivery_date),
        delivery_date,
        cutoff_time=cutoff,
        match_mode="hourly",
    )
    return {
        "deliveryDate": delivery_date,
        "cutoffTime": cutoff,
        "forecastCount": len(selected),
        "forecasts": selected,
    }

@router.get("/forecasts/vintages", response_model=VintagesResponse)
def get_vintages(delivery_date: str = Query("2026-01-01"), delivery_period: int = Query(1, ge=1, le=48), cutoff: str = Query("10:00"),
    store: DataStore = Depends(get_data_store),
    forecast_service: ForecastService = Depends(get_forecast_service),
) -> VintagesResponse:
    validate_params(delivery_date, cutoff)

    date_obj = datetime.strptime(delivery_date, "%Y-%m-%d").date()
    local_start = datetime(date_obj.year, date_obj.month, date_obj.day, 0, 0, 0, tzinfo=LONDON_TZ)
    target_dt = local_start + timedelta(minutes=30 * (delivery_period - 1))
    target_utc = target_dt.astimezone(UTC_TZ)
    target_iso = to_iso_string(target_utc)

    hourly_dt = target_utc.replace(minute=0, second=0, microsecond=0)
    hourly_iso = to_iso_string(hourly_dt)

    forecast_pool = store.get_forecasts_for_date(delivery_date)
    raw_vintages = forecast_service.get_vintages_for_period(forecast_pool, target_iso)
    if not raw_vintages and target_iso != hourly_iso:
        raw_vintages = forecast_service.get_vintages_for_period(forecast_pool, hourly_iso)

    cutoff_utc = forecast_service.compute_cutoff_timestamp(delivery_date, cutoff)

    vintage_items = []
    for v in raw_vintages:
        dt_pub = parse_iso_datetime(v["publishTime"])
        is_eligible = dt_pub <= cutoff_utc
        vintage_items.append(VintageItem(
            publishTime=v["publishTime"],
            forecastGeneration=v["forecastGeneration"],
            isEligible=is_eligible,
            cutoffUsed=cutoff,
        ))

    return VintagesResponse(
        deliveryDate=delivery_date,
        settlementPeriod=delivery_period,
        startTime=target_iso,
        cutoffTime=cutoff,
        vintages=vintage_items,
    )