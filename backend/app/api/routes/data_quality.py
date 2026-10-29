from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from backend.app.api.deps import DataStore, get_data_store, get_forecast_service, get_analytics_service
from backend.app.schemas.data_quality import DataQualityResponse
from backend.app.services.analytics_service import AnalyticsService
from backend.app.services.forecast_service import ForecastService
from backend.app.utils.datetime_utils import to_iso_string

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

@router.get("/data-quality", response_model=DataQualityResponse)
def get_data_quality(delivery_date: str = Query("2026-01-01"), cutoff: str = Query("10:00"),
    store: DataStore = Depends(get_data_store),
    forecast_service: ForecastService = Depends(get_forecast_service),
    analytics_service: AnalyticsService = Depends(get_analytics_service),
) -> DataQualityResponse:
    validate_params(delivery_date, cutoff)

    actuals = store.get_actuals_for_date(delivery_date)
    raw_forecasts = store.get_forecasts_for_date(delivery_date)
    expected_periods = analytics_service.generate_day_periods(delivery_date)
    selected_forecasts = forecast_service.select_forecasts(
        raw_forecasts,
        delivery_date,
        cutoff_time=cutoff,
        match_mode="hourly",
    )

    matched = analytics_service.match_periods(actuals, selected_forecasts, expected_periods)
    summary = analytics_service.compute_metrics(matched, expected_count=48)
    last_refresh = store.metadata.get("generatedAt") or to_iso_string(datetime.now(timezone.utc))
    return DataQualityResponse(
        deliveryDate=delivery_date,
        cutoffTime=cutoff,
        expectedPeriods=48,
        actualRecordsRetrieved=len(actuals),
        forecastRecordsRetrieved=len(raw_forecasts),
        matchedPeriods=summary.matchedObservations,
        missingActualPeriods=summary.missingActualObservations,
        missingForecastPeriods=summary.missingForecastObservations,
        duplicateRecordsHandled=0,
        coveragePercentage=summary.coveragePercentage,
        lastDataRefresh=last_refresh,
    )