export interface PeriodHighlight {
  startTime: string
  settlementPeriod: number
  value: number
}

export interface MetricSummary {
  mae: number | null
  rmse: number | null
  mbe: number | null
  coveragePercentage: number
  matchedObservations: number
  expectedObservations: number
  missingForecastObservations: number
  missingActualObservations: number
  peakAbsoluteError: PeriodHighlight | null
  peakOverestimation: PeriodHighlight | null
  peakUnderestimation: PeriodHighlight | null
}

export interface OverviewData {
  deliveryDate: string
  cutoffTime: string
  averageForecastMW: number | null
  averageActualMW: number | null
  mae: number | null
  rmse: number | null
  mbe: number | null
  coveragePercentage: number
  peakAbsoluteError: PeriodHighlight | null
  peakOverestimation: PeriodHighlight | null
  peakUnderestimation: PeriodHighlight | null
}

export interface GenerationRecord {
  index: number
  settlementPeriod: number
  startTime: string
  forecastGeneration: number | null
  actualGeneration: number | null
  signedError: number | null
  absoluteError: number | null
  forecastPublishedAt: string | null
  status: "MATCHED" | "MISSING_FORECAST" | "MISSING_ACTUAL" | "MISSING_BOTH"
}

export interface GenerationResponse {
  deliveryDate: string
  cutoffTime: string
  records: GenerationRecord[]
  summary: MetricSummary
}

export interface VintageItem {
  publishTime: string
  forecastGeneration: number
  isEligible: boolean
  cutoffUsed: string
}

export interface VintagesResponse {
  deliveryDate: string
  settlementPeriod: number
  startTime: string
  cutoffTime: string
  vintages: VintageItem[]
}

export interface DataQualityData {
  deliveryDate: string
  cutoffTime: string
  expectedPeriods: number
  actualRecordsRetrieved: number
  forecastRecordsRetrieved: number
  matchedPeriods: number
  missingActualPeriods: number
  missingForecastPeriods: number
  duplicateRecordsHandled: number
  coveragePercentage: number
  lastDataRefresh: string
}

export interface HealthData {
  status: string
  datasetLoaded: boolean
  actualsCount: number
  forecastsCount: number
  startDate: string
  endDate: string
}

export interface ProcurementPeriodItem {
  settlementPeriod: number
  startTime: string
  consumerDemandMW: number
  windForecastMW: number | null
  thermalRequiredMW: number
  hedgedThermalRequiredMW: number
  imbalanceExposureMW: number | null
  exposureType: string
}

export interface ProcurementResponse {
  deliveryDate: string
  cutoffTime: string
  targetDemandMW: number
  maeBufferAppliedMW: number
  avgWindForecastMW: number | null
  avgThermalRequiredMW: number
  avgHedgedThermalRequiredMW: number
  peakThermalPeriod: number
  peakThermalMW: number
  marketGuidance: string
  periods: ProcurementPeriodItem[]
}