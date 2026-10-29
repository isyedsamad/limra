import { AlertTriangle, TrendingDown, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PeriodHighlight } from "@/types"

interface HighlightsProps {
  peakAbsoluteError: PeriodHighlight | null
  peakOverestimation: PeriodHighlight | null
  peakUnderestimation: PeriodHighlight | null
  loading: boolean
}

export function Highlights({ peakAbsoluteError, peakOverestimation, peakUnderestimation, loading }: HighlightsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <Card className="border-border shadow-2xs px-1 bg-card">
        <CardHeader className="flex flex-row items-center justify-between px-5 pt-3 pb-0">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Peak Absolute Error
          </CardTitle>
          <div className="h-7 w-7 rounded-full bg-red-100 dark:bg-red-950/60 flex items-center justify-center">
            <AlertTriangle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
          </div>
        </CardHeader>
        <CardContent className="px-5 py-0 pb-4 -mt-0.5">
          <div className="text-2xl font-bold text-foreground">
            {loading || !peakAbsoluteError ? "--" : `${peakAbsoluteError.value.toLocaleString()} MW`}
          </div>
          <p className="text-xs text-muted-foreground font-medium -mt-0.5">
            {peakAbsoluteError
              ? `Period ${peakAbsoluteError.settlementPeriod} (${peakAbsoluteError.startTime.substring(11, 16)} UTC)`
              : "No matched periods"}
          </p>
        </CardContent>
      </Card>

      <Card className="border-border shadow-2xs px-1 bg-card">
        <CardHeader className="flex flex-row items-center justify-between px-5 pt-3 pb-0">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Max Over-forecast
          </CardTitle>
          <div className="h-7 w-7 rounded-full bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center">
            <TrendingUp className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
          </div>
        </CardHeader>
        <CardContent className="px-5 py-0 pb-4 -mt-0.5">
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {loading || !peakOverestimation ? "--" : `+${peakOverestimation.value.toLocaleString()} MW`}
          </div>
          <p className="text-xs text-muted-foreground font-medium -mt-0.5">
            {peakOverestimation
              ? `Period ${peakOverestimation.settlementPeriod} (${peakOverestimation.startTime.substring(11, 16)} UTC) &bull; Shortfall`
              : "No over-forecast observed"}
          </p>
        </CardContent>
      </Card>

      <Card className="border-border shadow-2xs px-1 bg-card">
        <CardHeader className="flex flex-row items-center justify-between px-5 pt-3 pb-0">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Max Under-forecast
          </CardTitle>
          <div className="h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center">
            <TrendingDown className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent className="px-5 py-0 pb-4 -mt-0.5">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {loading || !peakUnderestimation ? "--" : `${peakUnderestimation.value.toLocaleString()} MW`}
          </div>
          <p className="text-xs text-muted-foreground font-medium -mt-0.5">
            {peakUnderestimation
              ? `Period ${peakUnderestimation.settlementPeriod} (${peakUnderestimation.startTime.substring(11, 16)} UTC) &bull; Surplus`
              : "No under-forecast observed"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}