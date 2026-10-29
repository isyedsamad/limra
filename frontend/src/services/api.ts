import { DataQualityData, GenerationResponse, HealthData, OverviewData, ProcurementResponse, VintagesResponse } from "@/types"

const BASE_URL = "/api"
async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    const errorBody = await res.text()
    throw new Error(`API Error ${res.status}: ${errorBody || res.statusText}`)
  }
  return res.json()
}

export async function getHealth(): Promise<HealthData> {
  return fetchJson<HealthData>(`${BASE_URL}/health`)
}

export async function getOverview(deliveryDate: string, cutoff: string = "10:00"): Promise<OverviewData> {
  return fetchJson<OverviewData>(
    `${BASE_URL}/overview?delivery_date=${encodeURIComponent(deliveryDate)}&cutoff=${encodeURIComponent(cutoff)}`
  )
}

export async function getGeneration(deliveryDate: string, cutoff: string = "10:00"): Promise<GenerationResponse> {
  return fetchJson<GenerationResponse>(
    `${BASE_URL}/generation?delivery_date=${encodeURIComponent(deliveryDate)}&cutoff=${encodeURIComponent(cutoff)}`
  )
}

export async function getVintages(deliveryDate: string, deliveryPeriod: number, cutoff: string = "10:00"): Promise<VintagesResponse> {
  return fetchJson<VintagesResponse>(
    `${BASE_URL}/forecasts/vintages?delivery_date=${encodeURIComponent(deliveryDate)}&delivery_period=${deliveryPeriod}&cutoff=${encodeURIComponent(cutoff)}`
  )
}

export async function getDataQuality(deliveryDate: string, cutoff: string = "10:00"): Promise<DataQualityData> {
  return fetchJson<DataQualityData>(
    `${BASE_URL}/data-quality?delivery_date=${encodeURIComponent(deliveryDate)}&cutoff=${encodeURIComponent(cutoff)}`
  )
}

export async function getProcurement(deliveryDate: string, cutoff: string = "10:00", demandMW: number = 28000): Promise<ProcurementResponse> {
  return fetchJson<ProcurementResponse>(
    `${BASE_URL}/procurement?delivery_date=${encodeURIComponent(deliveryDate)}&cutoff=${encodeURIComponent(cutoff)}&demand_mw=${demandMW}`
  )
}