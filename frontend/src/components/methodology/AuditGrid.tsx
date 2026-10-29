import { BookOpen, CheckCircle2, Database, ExternalLink, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataQualityData } from "@/types"

interface AuditGridProps {
  data: DataQualityData | null
  loading: boolean
}

export function AuditGrid({ data, loading }: AuditGridProps) {
  const isHealthy = (data?.coveragePercentage ?? 0) >= 95

  return (
    <div className="space-y-6">
      <Card className="border-border shadow-xs">
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                <ShieldCheck className="h-3.5 w-3.5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-foreground font-poppins">
                  Data Quality & Audit
                </CardTitle>
                <p className="text-xs text-muted-foreground -mt-0.5">
                  Verification of settlement actuals and forecast records for {data?.deliveryDate || "--"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${isHealthy
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                }`}>
                <span className={`w-2 h-2 rounded-full ${isHealthy ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}></span>
                {isHealthy ? "Data Verified" : "Partial Coverage"}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-xl border border-border bg-card py-3 px-4 shadow-2xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                Expected Intervals
              </span>
              <div className="text-xl font-bold text-foreground mt-0.5">
                {loading ? "--" : `${data?.expectedPeriods ?? 48}`}
              </div>
              <span className="text-[11px] text-muted-foreground -mt-0.5 block">
                48 half-hour settlement periods
              </span>
            </div>

            <div className="rounded-xl border border-border bg-card py-3 px-4 shadow-2xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                Actuals Retrieved
              </span>
              <div className="text-xl font-bold text-blue-500 mt-0.5">
                {loading ? "--" : `${data?.actualRecordsRetrieved ?? "--"}`}
              </div>
              <span className="text-[11px] text-muted-foreground -mt-0.5 block">
                FUELHH wind generation records
              </span>
            </div>

            <div className="rounded-xl border border-border bg-card py-3 px-4 shadow-2xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                Matched Periods
              </span>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {loading ? "--" : `${data?.matchedPeriods ?? "--"}`}
              </div>
              <span className="text-[11px] text-muted-foreground -mt-0.5 block">
                Valid forecast + actual pairs
              </span>
            </div>

            <div className="rounded-xl border border-border bg-card py-3 px-4 shadow-2xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                Dataset Coverage
              </span>
              <div className="text-xl font-bold text-primary mt-0.5">
                {loading ? "--" : `${data?.coveragePercentage ?? 0}%`}
              </div>
              <span className="text-[11px] text-muted-foreground -mt-0.5 block">
                Target verification rate
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/15">
              <div>
                <span className="text-xs font-semibold text-foreground block">Missing Actuals</span>
                <span className="text-[11px] text-muted-foreground">Settlement periods without FUELHH</span>
              </div>
              <span className="font-mono text-sm font-bold text-foreground px-2 py-0.5 rounded bg-card border border-border">
                {loading ? "--" : data?.missingActualPeriods ?? 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/15">
              <div>
                <span className="text-xs font-semibold text-foreground block">Missing Forecasts</span>
                <span className="text-[11px] text-muted-foreground">Periods without pre-cutoff vintage</span>
              </div>
              <span className="font-mono text-sm font-bold text-foreground px-2 py-0.5 rounded bg-card border border-border">
                {loading ? "--" : data?.missingForecastPeriods ?? 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/15">
              <div>
                <span className="text-xs font-semibold text-foreground block">Cutoff Gate</span>
                <span className="text-[11px] text-muted-foreground">Europe/London timezone</span>
              </div>
              <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 rounded bg-card border border-border">
                D-1 at 10:00
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border shadow-xs flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                <BookOpen className="h-3.5 w-3.5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-foreground font-poppins">
                  Methodology & Cutoff Enforcement
                </CardTitle>
                <p className="text-xs text-muted-foreground -mt-0.5">
                  UK wholesale day-ahead trading governance standards
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 space-y-3.5 text-xs text-muted-foreground leading-relaxed">
            <div className="p-3 rounded-lg border border-border bg-muted/10 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                <span>Zero Look-Ahead Bias Guarantee</span>
              </div>
              <p>
                Forecasts for delivery date <strong className="text-foreground">D</strong> are strictly restricted to publications released on or before <strong className="text-primary">D-1 at 10:00 UK local time (Europe/London)</strong>. Later revisions are excluded to reflect true decision-time visibility.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-border bg-muted/10 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                <span>Hourly Cadence Alignment</span>
              </div>
              <p>
                National Grid ESO WINDFOR publications arrive at hourly intervals. In alignment with BSC code, each half-hour settlement period inherits the active hourly vintage.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-border bg-muted/10 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                <span>Strict Gap Preservation</span>
              </div>
              <p>
                Missing actual or forecast periods are tracked explicitly as gaps rather than imputed as 0 MW, avoiding synthetic bias in MAE, RMSE, and MBE calculations.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs flex flex-col">
          <CardHeader className="pb-3 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                <Database className="h-3.5 w-3.5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-foreground font-poppins">
                  Mathematical Formulations & APIs
                </CardTitle>
                <p className="text-xs text-muted-foreground -mt-0.5">
                  Verified statistical formulas and Elexon data endpoints
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 space-y-3.5 text-xs text-muted-foreground leading-relaxed">
            <div className="space-y-1">
              <span className="font-semibold text-foreground block">Mean Absolute Error (MAE):</span>
              <div className="bg-muted/30 border border-border px-3 py-1.5 rounded-lg font-mono text-[11px] text-foreground">
                MAE = (1/n) &Sigma; |Forecast - Actual|
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-foreground block">Root Mean Squared Error (RMSE):</span>
              <div className="bg-muted/30 border border-border px-3 py-1.5 rounded-lg font-mono text-[11px] text-foreground">
                RMSE = &radic;((1/n) &Sigma; (Forecast - Actual)&sup2;)
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-foreground block">Mean Bias Error (MBE):</span>
              <div className="bg-muted/30 border border-border px-3 py-1.5 rounded-lg font-mono text-[11px] text-foreground">
                MBE = (1/n) &Sigma; (Forecast - Actual)
              </div>
            </div>

            <div className="pt-2 border-t border-border flex flex-col sm:flex-row gap-3 text-[11px]">
              <a
                href="https://data.elexon.co.uk/bmrs/api/v1/datasets/FUELHH"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1 font-medium"
              >
                Elexon BMRS FUELHH API <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href="https://data.elexon.co.uk/bmrs/api/v1/datasets/WINDFOR"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1 font-medium"
              >
                Elexon BMRS WINDFOR API <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}