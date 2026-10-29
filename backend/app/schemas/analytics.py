from typing import Optional
from pydantic import BaseModel

class AnalyticsResponse(BaseModel):
    deliveryDate: str
    cutoffTime: str
    mae: Optional[float] = None
    rmse: Optional[float] = None
    mbe: Optional[float] = None
    coveragePercentage: float
    validObservations: int
    expectedObservations: int