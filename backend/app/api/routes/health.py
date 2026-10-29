from fastapi import APIRouter, Depends
from backend.app.api.deps import DataStore, get_data_store
from backend.app.schemas.health import HealthResponse

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
def get_health(store: DataStore = Depends(get_data_store)) -> HealthResponse:
    loaded = len(store.actuals) > 0 and len(store.forecasts) > 0
    start_date = "2026-01-01"
    end_date = "2026-01-31"
    status = "healthy" if loaded else "degraded"

    return HealthResponse(
        status=status,
        datasetLoaded=loaded,
        actualsCount=len(store.actuals),
        forecastsCount=len(store.forecasts),
        startDate=start_date,
        endDate=end_date,
    )