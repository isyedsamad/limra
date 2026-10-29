import { useEffect, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { PageControls } from "@/components/common/PageControls"
import { StatsCards } from "@/components/dashboard/StatsCards"
import { GenerationChart } from "@/components/dashboard/GenerationChart"
import { ErrorRampChart } from "@/components/dashboard/ErrorRampChart"
import { Highlights } from "@/components/dashboard/Highlights"
import { GenerationTable } from "@/components/analysis/GenerationTable"
import { VintageModal } from "@/components/analysis/VintageModal"
import { AuditGrid } from "@/components/methodology/AuditGrid"
import { getDataQuality, getGeneration, getOverview } from "@/services/api"
import { DataQualityData, GenerationRecord, OverviewData } from "@/types"

export default function App() {
  const [deliveryDate, setDeliveryDate] = useState<string>("2026-01-15")
  const [cutoffTime] = useState<string>("10:00")
  const [activeTab, setActiveTab] = useState<string>("overview")
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null)
  const [generationRecords, setGenerationRecords] = useState<GenerationRecord[]>([])
  const [dataQuality, setDataQuality] = useState<DataQualityData | null>(null)
  const [inspectPeriod, setInspectPeriod] = useState<number | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [ov, gen, dq] = await Promise.all([
        getOverview(deliveryDate, cutoffTime),
        getGeneration(deliveryDate, cutoffTime),
        getDataQuality(deliveryDate, cutoffTime),
      ])
      setOverviewData(ov)
      setGenerationRecords(gen.records)
      setDataQuality(dq)
    } catch (err: any) {
      setError(err?.message || "Failed to load energy data from API")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [deliveryDate, cutoffTime])

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-primary/20">
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full py-6 px-10 space-y-6">
        <PageControls
          deliveryDate={deliveryDate}
          onDateChange={setDeliveryDate}
          onRefresh={loadData}
          loading={loading}
        />

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 flex items-start gap-3 text-destructive text-xs shadow-xs">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Backend Communication Error</span>
              <p className="mt-0.5 text-muted-foreground">{error}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Ensure the FastAPI backend is running at <code className="font-mono">http://127.0.0.1:8000</code>.
              </p>
            </div>
          </div>
        )}

        {activeTab === "overview" && (
          <div className="space-y-6">
            <StatsCards data={overviewData} loading={loading} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GenerationChart records={generationRecords} loading={loading} />
              <ErrorRampChart records={generationRecords} loading={loading} />
            </div>

            <Highlights
              peakAbsoluteError={overviewData?.peakAbsoluteError ?? null}
              peakOverestimation={overviewData?.peakOverestimation ?? null}
              peakUnderestimation={overviewData?.peakUnderestimation ?? null}
              loading={loading}
            />
          </div>
        )}

        {activeTab === "analysis" && (
          <div className="space-y-6">
            <GenerationTable
              records={generationRecords}
              loading={loading}
              onInspectPeriod={(period) => setInspectPeriod(period)}
            />
          </div>
        )}

        {activeTab === "methodology" && (
          <div className="space-y-6">
            <AuditGrid data={dataQuality} loading={loading} />
          </div>
        )}
      </main>

      <VintageModal
        isOpen={inspectPeriod !== null}
        deliveryDate={deliveryDate}
        settlementPeriod={inspectPeriod}
        cutoffTime={cutoffTime}
        onClose={() => setInspectPeriod(null)}
      />
    </div>
  )
}