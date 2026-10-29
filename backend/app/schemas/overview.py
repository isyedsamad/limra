from typing import Optional
from pydantic import BaseModel
from backend.app.schemas.metrics import PeriodHighlight

class OverviewResponse(BaseModel):
    deliveryDate: str
    cutoffTime: str
    averageForecastMW: Optional[float] = None
    averageActualMW: Optional[float] = None
    mae: Optional[float] = None
    rmse: Optional[float] = None
    mbe: Optional[float] = None
    coveragePercentage: float
    peakAbsoluteError: Optional[PeriodHighlight] = None
    peakOverestimation: Optional[PeriodHighlight] = None
    peakUnderestimation: Optional[PeriodHighlight] = None