import { useEffect, useState } from "react"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { History, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getVintages } from "@/services/api"
import { VintageItem } from "@/types"

interface VintageModalProps {
  isOpen: boolean
  deliveryDate: string
  settlementPeriod: number | null
  cutoffTime: string
  onClose: () => void
}

export function VintageModal({ isOpen, deliveryDate, settlementPeriod, cutoffTime, onClose }: VintageModalProps) {
  const [vintages, setVintages] = useState<VintageItem[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    if (!isOpen || settlementPeriod == null) return
    setLoading(true)
    getVintages(deliveryDate, settlementPeriod, cutoffTime)
      .then((res) => setVintages(res.vintages))
      .catch(() => setVintages([]))
      .finally(() => setLoading(false))
  }, [isOpen, deliveryDate, settlementPeriod, cutoffTime])

  if (!isOpen || settlementPeriod == null) return null
  const eligibleCount = vintages.filter((v) => v.isEligible).length
  const selectedVintage = vintages.filter((v) => v.isEligible).slice(-1)[0]

  const chartData = vintages.map((v) => ({
    time: v.publishTime.substring(5, 16).replace("T", " "),
    generation: Math.round(v.forecastGeneration),
    isEligible: v.isEligible,
  }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col border-border shadow-xl relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
              <History className="h-3.5 w-3.5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-foreground font-poppins">
                Publication Vintages & Cutoff Audit
              </CardTitle>
              <p className="text-xs text-muted-foreground -mt-0.5">
                Settlement Period {settlementPeriod} &bull; Delivery: {deliveryDate} &bull; D-1 Cutoff: {cutoffTime}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground rounded-md"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-card py-3 px-4 shadow-2xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                Total Published Vintages
              </span>
              <div className="text-xl font-bold text-foreground mt-0.5">
                {vintages.length}
              </div>
              <span className="text-[11px] text-muted-foreground -mt-0.5 block">
                {eligibleCount} released prior to D-1 {cutoffTime}
              </span>
            </div>

            <div className="rounded-xl border border-primary/30 bg-primary/5 py-3 px-4 shadow-2xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-primary block">
                Selected Forecast (Bias-Free)
              </span>
              <div className="text-xl font-bold text-foreground mt-0.5">
                {selectedVintage ? `${selectedVintage.forecastGeneration.toLocaleString()} MW` : "--"}
              </div>
              <span className="text-[11px] text-muted-foreground -mt-0.5 block">
                {selectedVintage ? `Published ${selectedVintage.publishTime.substring(0, 16).replace("T", " ")} UTC` : "No eligible vintage"}
              </span>
            </div>
          </div>

          {vintages.length > 1 && (
            <div className="rounded-xl border border-border p-3.5 bg-card shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">
                  Forecast Evolution Trajectory (Revision History)
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Chronological vintages
                </span>
              </div>
              <div className="h-36 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null
                        const d = payload[0].payload
                        return (
                          <div className="rounded-lg border border-border bg-card p-2 text-xs shadow-md space-y-1">
                            <div className="font-semibold text-foreground">{d.time} UTC</div>
                            <div className="text-primary font-mono font-bold">{d.generation.toLocaleString()} MW</div>
                            <div className="text-[10px] text-muted-foreground">
                              {d.isEligible ? "Eligible before cutoff" : "Post-cutoff (Excluded)"}
                            </div>
                          </div>
                        )
                      }}
                    />
                    <Line type="monotone" dataKey="generation" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3, fill: "hsl(var(--primary))" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-semibold">Publication Time (UTC)</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Forecast (MW)</TableHead>
                  <TableHead className="text-xs font-semibold text-center">Cutoff Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-10 text-xs text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <span>Loading publication vintages...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : vintages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-xs text-muted-foreground">
                      No publication vintages recorded for this period.
                    </TableCell>
                  </TableRow>
                ) : (
                  vintages.map((v, i) => {
                    const isChosen = selectedVintage && selectedVintage.publishTime === v.publishTime
                    return (
                      <TableRow key={i} className={isChosen ? "bg-primary/5 font-medium" : "hover:bg-muted/20"}>
                        <TableCell className="text-xs font-mono font-medium">
                          {v.publishTime.substring(0, 16).replace("T", " ")} UTC
                        </TableCell>
                        <TableCell className="text-xs font-mono text-right font-bold">
                          {v.forecastGeneration.toLocaleString()} MW
                        </TableCell>
                        <TableCell className="text-center">
                          {isChosen ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-primary-foreground">
                              Selected
                            </span>
                          ) : v.isEligible ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              Eligible
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground border border-border">
                              Post-Cutoff
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}