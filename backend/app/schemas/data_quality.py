from pydantic import BaseModel

class DataQualityResponse(BaseModel):
    deliveryDate: str
    cutoffTime: str
    expectedPeriods: int
    actualRecordsRetrieved: int
    forecastRecordsRetrieved: int
    matchedPeriods: int
    missingActualPeriods: int
    missingForecastPeriods: int
    duplicateRecordsHandled: int
    coveragePercentage: float
    lastDataRefresh: str