from typing import List, Optional
from pydantic import BaseModel

class ProcurementPeriodItem(BaseModel):
    settlementPeriod: int
    startTime: str
    consumerDemandMW: float
    windForecastMW: Optional[float]
    thermalRequiredMW: float
    hedgedThermalRequiredMW: float
    imbalanceExposureMW: Optional[float]
    exposureType: str

class ProcurementResponse(BaseModel):
    deliveryDate: str
    cutoffTime: str
    targetDemandMW: float
    maeBufferAppliedMW: float
    avgWindForecastMW: Optional[float]
    avgThermalRequiredMW: float
    avgHedgedThermalRequiredMW: float
    peakThermalPeriod: int
    peakThermalMW: float
    marketGuidance: str
    periods: List[ProcurementPeriodItem]
