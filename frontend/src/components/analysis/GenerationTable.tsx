import { useState, useMemo } from "react"
import { ArrowUpDown, Eye, Loader2, Search, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { GenerationRecord } from "@/types"

interface GenerationTableProps {
  records: GenerationRecord[]
  loading: boolean
  onInspectPeriod: (period: number) => void
}

type SortField = "period" | "actual" | "forecast" | "signedError" | "absError"
type SortOrder = "asc" | "desc"
type FilterType = "all" | "over" | "under"

export function GenerationTable({ records, loading, onInspectPeriod }: GenerationTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<FilterType>("all")
  const [sortField, setSortField] = useState<SortField>("period")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("desc")
    }
  }

  const { overCount, underCount } = useMemo(() => {
    let over = 0
    let under = 0

    for (const r of records) {
      if (r.signedError != null) {
        if (r.signedError > 0) over += 1
        if (r.signedError < 0) under += 1
      }
    }

    return {
      overCount: over,
      underCount: under,
    }
  }, [records])

  const filtered = records.filter((r) => {
    if (filterType === "over" && (r.signedError == null || r.signedError <= 0)) return false
    if (filterType === "under" && (r.signedError == null || r.signedError >= 0)) return false

    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    const periodMatch = `p${r.settlementPeriod}`.includes(term) || r.settlementPeriod.toString().includes(term)
    const timeMatch = r.startTime.toLowerCase().includes(term)
    return periodMatch || timeMatch
  })

  const sorted = [...filtered].sort((a, b) => {
    let valA = 0
    let valB = 0
    if (sortField === "period") {
      valA = a.settlementPeriod
      valB = b.settlementPeriod
    } else if (sortField === "actual") {
      valA = a.actualGeneration ?? -999999
      valB = b.actualGeneration ?? -999999
    } else if (sortField === "forecast") {
      valA = a.forecastGeneration ?? -999999
      valB = b.forecastGeneration ?? -999999
    } else if (sortField === "signedError") {
      valA = a.signedError ?? -999999
      valB = b.signedError ?? -999999
    } else if (sortField === "absError") {
      valA = a.absoluteError ?? -999999
      valB = b.absoluteError ?? -999999
    }
    return sortOrder === "asc" ? valA - valB : valB - valA
  })

  const formatInterval = (startTime: string) => {
    if (!startTime) return "--"
    const startHourMin = startTime.substring(11, 16)
    const [h, m] = startHourMin.split(":").map(Number)
    let endH = h
    let endM = m + 30
    if (endM >= 60) {
      endM -= 60
      endH = (endH + 1) % 24
    }
    const endStr = `${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}`
    return `${startHourMin} - ${endStr}`
  }

  return (
    <div className="space-y-0">
      <Card className="border-border shadow-xs">
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                <SlidersHorizontal className="h-3.5 w-3.5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-foreground font-poppins">
                  48 Settlement Periods
                </CardTitle>
                <p className="text-xs font-medium text-muted-foreground -mt-0.5">
                  Actual wind generation vs day-ahead forecast by half-hour
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-1 bg-muted/40 p-0.5 rounded-lg border border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilterType("all")}
                  className={`h-7 text-xs px-2.5 rounded-md ${filterType === "all"
                    ? "bg-card text-foreground font-semibold shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  All ({records.length})
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilterType("over")}
                  className={`h-7 text-xs px-2.5 rounded-md ${filterType === "over"
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/20"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  Over-forecast ({overCount})
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilterType("under")}
                  className={`h-7 text-xs px-2.5 rounded-md ${filterType === "under"
                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold border border-blue-500/20"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  Under-forecast ({underCount})
                </Button>
              </div>

              <div className="relative w-full sm:w-56">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Filter period or time..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-8 text-xs rounded-lg bg-card"
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10 border-b border-border shadow-2xs">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-20">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("period")}
                      className="h-7 p-0 text-xs font-semibold hover:bg-transparent"
                    >
                      Period
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-xs font-semibold">Time (UTC)</TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("actual")}
                      className="h-7 p-0 text-xs font-semibold hover:bg-transparent ml-auto"
                    >
                      Actual (MW)
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("forecast")}
                      className="h-7 p-0 text-xs font-semibold hover:bg-transparent ml-auto"
                    >
                      Forecast (MW)
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("signedError")}
                      className="h-7 p-0 text-xs font-semibold hover:bg-transparent ml-auto"
                    >
                      Signed Error
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("absError")}
                      className="h-7 p-0 text-xs font-semibold hover:bg-transparent ml-auto"
                    >
                      Abs Error
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-center text-xs font-semibold">Status</TableHead>
                  <TableHead className="text-center text-xs font-semibold">Vintages</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-16 text-xs text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 className="h-7 w-7 animate-spin text-primary" />
                        <span>Loading delivery period analytics...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : sorted.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-xs text-muted-foreground">
                      No settlement periods match the current search or filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  sorted.map((r) => {
                    const isOver = r.signedError != null && r.signedError > 0
                    const isUnder = r.signedError != null && r.signedError < 0

                    return (
                      <TableRow key={r.settlementPeriod} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="text-xs font-bold">
                          P{r.settlementPeriod}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatInterval(r.startTime)}
                        </TableCell>
                        <TableCell className="text-xs text-right font-semibold">
                          {r.actualGeneration != null ? `${r.actualGeneration.toLocaleString()} MW` : "--"}
                        </TableCell>
                        <TableCell className="text-xs text-right font-semibold">
                          {r.forecastGeneration != null ? `${r.forecastGeneration.toLocaleString()} MW` : "--"}
                        </TableCell>
                        <TableCell className="text-xs text-right font-bold">
                          {r.signedError == null ? (
                            "--"
                          ) : isOver ? (
                            <span className="text-amber-700">
                              +{r.signedError.toLocaleString()} MW
                            </span>
                          ) : isUnder ? (
                            <span className="text-blue-700">
                              {r.signedError.toLocaleString()} MW
                            </span>
                          ) : (
                            "0 MW"
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-right font-semibold text-foreground">
                          {r.absoluteError != null ? `${r.absoluteError.toLocaleString()} MW` : "--"}
                        </TableCell>
                        <TableCell className="text-center">
                          {r.status === "MATCHED" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              MATCHED
                            </span>
                          ) : r.status === "MISSING_FORECAST" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              NO FORECAST
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-destructive/10 text-destructive border border-destructive/20">
                              {r.status}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onInspectPeriod(r.settlementPeriod)}
                            className="h-6 px-2 text-[11px] text-primary hover:text-primary-foreground hover:bg-primary border-primary/30 rounded-md gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            Audit
                          </Button>
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