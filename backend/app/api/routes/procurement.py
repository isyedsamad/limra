from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from backend.app.api.deps import DataStore, get_data_store, get_forecast_service, get_analytics_service
from backend.app.schemas.procurement import ProcurementPeriodItem, ProcurementResponse
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

@router.get("/procurement", response_model=ProcurementResponse)
def get_procurement(
    delivery_date: str = Query("2026-01-15"),
    cutoff: str = Query("10:00"),
    demand_mw: float = Query(28000.0, ge=5000.0, le=60000.0),
    store: DataStore = Depends(get_data_store),
    forecast_service: ForecastService = Depends(get_forecast_service),
    analytics_service: AnalyticsService = Depends(get_analytics_service),
) -> ProcurementResponse:
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
    mae_buffer = summary.mae or 0.0

    valid_forecasts = [p.forecastGeneration for p in matched if p.forecastGeneration is not None]
    avg_wind = round(sum(valid_forecasts) / len(valid_forecasts), 2) if valid_forecasts else None

    period_items = []
    peak_thermal_mw = 0.0
    peak_thermal_period = 1

    for p in matched:
        wf = p.forecastGeneration or 0.0
        thermal_nominal = max(0.0, round(demand_mw - wf, 2))
        thermal_hedged = max(0.0, round(demand_mw - max(0.0, wf - mae_buffer), 2))

        imbalance_exposure = None
        exposure_type = "Balanced"
        if p.signedError is not None:
            imbalance_exposure = round(p.signedError, 2)
            if p.signedError > 0:
                exposure_type = "Shortfall Risk (SBP)"
            elif p.signedError < 0:
                exposure_type = "Surplus Spill (SSP)"

        if thermal_nominal > peak_thermal_mw:
            peak_thermal_mw = thermal_nominal
            peak_thermal_period = p.settlementPeriod

        period_items.append(ProcurementPeriodItem(
            settlementPeriod=p.settlementPeriod,
            startTime=p.startTime,
            consumerDemandMW=demand_mw,
            windForecastMW=p.forecastGeneration,
            thermalRequiredMW=thermal_nominal,
            hedgedThermalRequiredMW=thermal_hedged,
            imbalanceExposureMW=imbalance_exposure,
            exposureType=exposure_type,
        ))

    avg_thermal = round(sum(item.thermalRequiredMW for item in period_items) / len(period_items), 2) if period_items else 0.0
    avg_hedged = round(sum(item.hedgedThermalRequiredMW for item in period_items) / len(period_items), 2) if period_items else 0.0

    mbe = summary.mbe or 0.0
    if mbe > 500:
        guidance = f"Overestimation bias (+{round(mbe, 1)} MW MBE). Wind forecast is optimistic. Procure +{round(mae_buffer, 0)} MW thermal safety margin during peak periods to hedge against System Buy Price cash-out charges."
    elif mbe < -500:
        guidance = f"Underestimation trend ({round(mbe, 1)} MW MBE). Wind outturn consistently exceeds forecast. Curtail excess thermal baseload to prevent surplus energy spill at discounted System Sell Prices."
    else:
        guidance = f"Balanced forecast fidelity (MBE {round(mbe, 1)} MW). Follow standard day-ahead procurement curve with normal operating reserve."

    return ProcurementResponse(
        deliveryDate=delivery_date,
        cutoffTime=cutoff,
        targetDemandMW=demand_mw,
        maeBufferAppliedMW=round(mae_buffer, 2),
        avgWindForecastMW=avg_wind,
        avgThermalRequiredMW=avg_thermal,
        avgHedgedThermalRequiredMW=avg_hedged,
        peakThermalPeriod=peak_thermal_period,
        peakThermalMW=peak_thermal_mw,
        marketGuidance=guidance,
        periods=period_items,
    )
