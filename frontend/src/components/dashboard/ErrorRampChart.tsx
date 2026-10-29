import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { BarChart3, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GenerationRecord } from "@/types"

interface ErrorRampChartProps {
  records: GenerationRecord[]
  loading: boolean
}

export function ErrorRampChart({ records, loading }: ErrorRampChartProps) {
  const chartData = records.map((r) => {
    const timeLabel = r.startTime ? r.startTime.substring(11, 16) : `P${r.settlementPeriod}`
    const isMorningRamp = r.settlementPeriod >= 14 && r.settlementPeriod <= 18
    const isEveningPeak = r.settlementPeriod >= 33 && r.settlementPeriod <= 38

    return {
      period: r.settlementPeriod,
      time: timeLabel,
      signedError: r.signedError != null ? Math.round(r.signedError) : 0,
      isMorningRamp,
      isEveningPeak,
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
                Forecast Error & Ramp Volatility
              </CardTitle>
              <p className="text-xs text-muted-foreground -mt-0.5">
                Signed deviation (Forecast - Actual)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] font-medium">
              <span className="w-2 h-2 rounded-xs bg-amber-500"></span>
              Higher
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[11px] font-medium">
              <span className="w-2 h-2 rounded-xs bg-blue-500"></span>
              Lower
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
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} interval={5} />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${(val / 1000).toFixed(1)}k`}
                />
                <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={1.5} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null
                    const d = payload[0].payload
                    const isOver = d.signedError > 0
                    return (
                      <div className="rounded-lg border border-border bg-card p-3 shadow-md text-xs space-y-1.5 min-w-[220px]">
                        <div className="font-semibold text-foreground flex items-center justify-between gap-4">
                          <span>Period {d.period} ({d.time} UTC)</span>
                          {d.isMorningRamp && (
                            <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded">
                              Morning Ramp
                            </span>
                          )}
                          {d.isEveningPeak && (
                            <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded">
                              Evening Peak
                            </span>
                          )}
                        </div>
                        <div className="pt-1 border-t border-border flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">Signed Error:</span>
                          <span className={`font-mono font-bold ${isOver ? "text-amber-500" : "text-blue-500"}`}>
                            {isOver ? "+" : ""}{d.signedError.toLocaleString()} MW
                          </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {isOver
                            ? "Over-forecast: Shortfall risk during peak demand"
                            : "Under-forecast: Surplus wind generation"}
                        </div>
                      </div>
                    )
                  }}
                />
                <Bar dataKey="signedError" maxBarSize={12} radius={[2, 2, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.signedError >= 0 ? "#f59e0b" : "#3b82f6"}
                      opacity={entry.isMorningRamp || entry.isEveningPeak ? 1 : 0.75}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
