from typing import List
from pydantic import BaseModel

class VintageItem(BaseModel):
    publishTime: str
    forecastGeneration: float
    isEligible: bool
    cutoffUsed: str

class VintagesResponse(BaseModel):
    deliveryDate: str
    settlementPeriod: int
    startTime: str
    cutoffTime: str
    vintages: List[VintageItem]