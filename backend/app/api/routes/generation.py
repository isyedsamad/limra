from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from backend.app.api.deps import DataStore, get_data_store, get_forecast_service, get_analytics_service
from backend.app.schemas.generation import GenerationRecord, GenerationResponse
from backend.app.services.analytics_service import AnalyticsService
from backend.app.services.forecast_service import ForecastService

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

@router.get("/generation", response_model=GenerationResponse)
def get_generation(delivery_date: str = Query("2026-01-01"), cutoff: str = Query("10:00"),
    store: DataStore = Depends(get_data_store),
    forecast_service: ForecastService = Depends(get_forecast_service),
    analytics_service: AnalyticsService = Depends(get_analytics_service),
) -> GenerationResponse:
    validate_params(delivery_date, cutoff)

    actuals = store.get_actuals_for_date(delivery_date)
    forecasts = store.get_forecasts_for_date(delivery_date)
    expected_periods = analytics_service.generate_day_periods(delivery_date)
    selected_forecasts = forecast_service.select_forecasts(
        forecasts,
        delivery_date,
        cutoff_time=cutoff,
        match_mode="hourly",
    )

    matched = analytics_service.match_periods(actuals, selected_forecasts, expected_periods)
    summary = analytics_service.compute_metrics(matched, expected_count=48)

    records = []
    for idx, p in enumerate(matched):
        records.append(GenerationRecord(
            index=idx,
            settlementPeriod=p.settlementPeriod,
            startTime=p.startTime,
            forecastGeneration=p.forecastGeneration,
            actualGeneration=p.actualGeneration,
            signedError=p.signedError,
            absoluteError=p.absoluteError,
            forecastPublishedAt=p.publishTime,
            status=p.status.value,
        ))

    return GenerationResponse(
        deliveryDate=delivery_date,
        cutoffTime=cutoff,
        records=records,
        summary=summary,
    )