from typing import List, Optional
from pydantic import BaseModel
from backend.app.schemas.metrics import MetricSummary

class GenerationRecord(BaseModel):
    index: int
    settlementPeriod: int
    startTime: str
    forecastGeneration: Optional[float] = None
    actualGeneration: Optional[float] = None
    signedError: Optional[float] = None
    absoluteError: Optional[float] = None
    forecastPublishedAt: Optional[str] = None
    status: str

class GenerationResponse(BaseModel):
    deliveryDate: str
    cutoffTime: str
    records: List[GenerationRecord]
    summary: MetricSummary