from pydantic import BaseModel

class HealthResponse(BaseModel):
    status: str
    datasetLoaded: bool
    actualsCount: int
    forecastsCount: int
    startDate: str
    endDate: str