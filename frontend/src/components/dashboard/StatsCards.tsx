import { Activity, CheckCircle2, Wind, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OverviewData } from "@/types"

interface StatsCardsProps {
  data: OverviewData | null
  loading: boolean
}

export function StatsCards({ data, loading }: StatsCardsProps) {
  const coverage = data?.coveragePercentage != null ? `${data.coveragePercentage}%` : "--"
  const avgActual = data?.averageActualMW != null ? `${data.averageActualMW.toLocaleString()} MW` : "--"
  const avgForecast = data?.averageForecastMW != null ? `${data.averageForecastMW.toLocaleString()} MW` : "--"
  const mae = data?.mae != null ? `${data.mae.toLocaleString()} MW` : "--"

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <Card className="px-1 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent border-emerald-200 dark:border-emerald-800 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-0 z-10">
          <CardTitle className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
            Data Coverage
          </CardTitle>
          <div className="h-7 w-7 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
        </CardHeader>
        <CardContent className="z-10 ml-1 -mt-1.5">
          <div className="text-2xl font-bold text-foreground tracking-tight">
            {loading ? "--" : coverage}
          </div>
          <p className="text-[11px] font-medium text-muted-foreground -mt-0.5">48 settlement periods</p>
        </CardContent>
      </Card>

      <Card className="px-1 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent border-blue-200 dark:border-blue-800 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-0 z-10">
          <CardTitle className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
            Actual Wind Generation
          </CardTitle>
          <div className="h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
            <Wind className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent className="z-10 ml-1 -mt-1.5">
          <div className="text-2xl font-bold text-blue-700 tracking-tight">
            {loading ? "--" : avgActual}
          </div>
          <p className="text-[11px] font-medium text-muted-foreground -mt-0.5">Observed outturn power</p>
        </CardContent>
      </Card>

      <Card className="px-1 bg-gradient-to-br from-violet-500/10 via-transparent to-transparent border-violet-200 dark:border-violet-800 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 bg-violet-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-0 z-10">
          <CardTitle className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
            Day-Ahead Forecast
          </CardTitle>
          <div className="h-7 w-7 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center">
            <Zap className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
          </div>
        </CardHeader>
        <CardContent className="z-10 ml-1 -mt-1.5">
          <div className="text-2xl font-bold text-foreground tracking-tight">
            {loading ? "--" : avgForecast}
          </div>
          <p className="text-[11px] font-medium text-muted-foreground -mt-0.5">Pre-cutoff forecast at 10:00</p>
        </CardContent>
      </Card>

      <Card className="px-1 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent border-amber-200 dark:border-amber-800 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-0 z-10">
          <CardTitle className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
            Forecast Error (MAE)
          </CardTitle>
          <div className="h-7 w-7 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
            <Activity className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
          </div>
        </CardHeader>
        <CardContent className="z-10 ml-1 -mt-1.5">
          <div className="text-2xl font-bold text-amber-700 tracking-tight">
            {loading ? "--" : mae}
          </div>
          <p className="text-[11px] font-medium text-muted-foreground -mt-0.5">Mean absolute deviation</p>
        </CardContent>
      </Card>
    </div>
  )
}