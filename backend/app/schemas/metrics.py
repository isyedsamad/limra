from enum import Enum
from typing import Optional
from pydantic import BaseModel

class PeriodStatus(str, Enum):
    MATCHED = "MATCHED"
    MISSING_FORECAST = "MISSING_FORECAST"
    MISSING_ACTUAL = "MISSING_ACTUAL"
    MISSING_BOTH = "MISSING_BOTH"

class MatchedPeriod(BaseModel):
    startTime: str
    settlementDate: str
    settlementPeriod: int
    actualGeneration: Optional[float] = None
    forecastGeneration: Optional[float] = None
    publishTime: Optional[str] = None
    status: PeriodStatus
    signedError: Optional[float] = None
    absoluteError: Optional[float] = None

class PeriodHighlight(BaseModel):
    startTime: str
    settlementPeriod: int
    value: float

class MetricSummary(BaseModel):
    mae: Optional[float] = None
    rmse: Optional[float] = None
    mbe: Optional[float] = None
    coveragePercentage: float
    matchedObservations: int
    expectedObservations: int
    missingForecastObservations: int
    missingActualObservations: int
    peakAbsoluteError: Optional[PeriodHighlight] = None
    peakOverestimation: Optional[PeriodHighlight] = None
    peakUnderestimation: Optional[PeriodHighlight] = None