import { BarChart3, Loader2 } from "lucide-react"
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GenerationRecord } from "@/types"

interface GenerationChartProps {
  records: GenerationRecord[]
  loading: boolean
}

export function GenerationChart({ records, loading }: GenerationChartProps) {
  const chartData = records.map((r) => {
    const timeLabel = r.startTime ? r.startTime.substring(11, 16) : `P${r.settlementPeriod}`
    return {
      period: r.settlementPeriod,
      time: timeLabel,
      actual: r.actualGeneration,
      forecast: r.forecastGeneration,
      signedError: r.signedError,
      absoluteError: r.absoluteError,
      status: r.status,
      publishedAt: r.forecastPublishedAt ? r.forecastPublishedAt.substring(11, 16) : null,
    }
  })

  return (
    <Card className="border-border shadow-xs flex flex-col justify-between">
      <CardHeader className="pb-3 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
              <BarChart3 className="h-3.5 w-3.5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-foreground font-poppins">
                Wind Generation: Forecast vs Actual
              </CardTitle>
              <p className="text-xs text-muted-foreground -mt-0.5">
                Settlement periods 1 to 48 (UTC)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[11px] font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Actual
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] font-medium">
              <span className="w-2.5 h-0.5 bg-amber-500"></span>
              Forecast
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-5">
        {loading ? (
          <div className="h-72 w-full flex flex-col items-center justify-center text-sm text-muted-foreground gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <span>Loading generation chart...</span>
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="time"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  interval={5}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null
                    const d = payload[0].payload
                    return (
                      <div className="rounded-lg border border-border bg-card p-3 shadow-md text-xs space-y-1.5 min-w-[210px]">
                        <div className="font-semibold text-foreground flex items-center justify-between gap-4">
                          <span>Period {d.period} ({d.time} UTC)</span>
                          <span className="text-[10px] text-muted-foreground font-mono">{d.status}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-1 text-muted-foreground border-t border-border">
                          <div>
                            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1.5"></span>
                            Actual: <strong className="text-foreground">{d.actual != null ? `${d.actual.toLocaleString()} MW` : "--"}</strong>
                          </div>
                          <div>
                            <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1.5"></span>
                            Forecast: <strong className="text-foreground">{d.forecast != null ? `${d.forecast.toLocaleString()} MW` : "--"}</strong>
                          </div>
                          <div>
                            Signed Error: <strong className={d.signedError > 0 ? "text-amber-500" : "text-blue-500"}>
                              {d.signedError != null ? `${d.signedError > 0 ? "+" : ""}${d.signedError.toLocaleString()} MW` : "--"}
                            </strong>
                          </div>
                          <div>
                            Abs Error: <strong className="text-foreground">{d.absoluteError != null ? `${d.absoluteError.toLocaleString()} MW` : "--"}</strong>
                          </div>
                        </div>
                        {d.publishedAt && (
                          <div className="text-[10px] text-muted-foreground pt-1 border-t border-border/60">
                            Forecast published: {d.publishedAt} UTC
                          </div>
                        )}
                      </div>
                    )
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#actualGradient)"
                  connectNulls={true}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                  connectNulls={true}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}