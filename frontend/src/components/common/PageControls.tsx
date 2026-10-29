import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Download, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PageControlsProps {
  deliveryDate: string
  onDateChange: (date: string) => void
  onRefresh: () => void
  loading: boolean
}

export function PageControls({
  deliveryDate,
  onDateChange,
  onRefresh,
  loading,
}: PageControlsProps) {
  const handlePrevDay = () => {
    const d = new Date(`${deliveryDate}T00:00:00Z`)
    if (!isNaN(d.getTime())) {
      d.setUTCDate(d.getUTCDate() - 1)
      onDateChange(d.toISOString().slice(0, 10))
    }
  }

  const handleNextDay = () => {
    const d = new Date(`${deliveryDate}T00:00:00Z`)
    if (!isNaN(d.getTime())) {
      d.setUTCDate(d.getUTCDate() + 1)
      onDateChange(d.toISOString().slice(0, 10))
    }
  }

  const handleExport = () => {
    window.print()
  }

  const dateObj = new Date(`${deliveryDate}T00:00:00Z`)
  const formattedDate = !isNaN(dateObj.getTime())
    ? dateObj.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    })
    : deliveryDate

  return (
    <section className="bg-card rounded-lg border-none transition-all">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground font-poppins">
              {formattedDate}
            </h2>
            {loading && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading data...
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-muted-foreground mt-0">
            Day-ahead wind forecasts vs actual generation
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center border border-border rounded-lg bg-background px-1 h-9 shadow-xs">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevDay}
              disabled={loading}
              className="h-7 w-7 p-0 rounded-md text-muted-foreground hover:text-foreground disabled:opacity-40"
              aria-label="Previous Day"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1.5 px-2">
              <CalendarIcon className="h-3.5 w-3.5 text-primary shrink-0" />
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => {
                  if (e.target.value) {
                    onDateChange(e.target.value)
                  }
                }}
                disabled={loading}
                className="bg-transparent text-xs font-semibold text-foreground outline-none cursor-pointer [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextDay}
              disabled={loading}
              className="h-7 w-7 p-0 rounded-md text-muted-foreground hover:text-foreground disabled:opacity-40"
              aria-label="Next Day"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="h-9 text-xs font-medium gap-1.5 border-border hover:bg-muted"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span>{loading ? "Refreshing..." : "Refresh"}</span>
          </Button>

          <Button
            size="sm"
            onClick={handleExport}
            className="h-9 text-xs font-medium gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export PDF</span>
          </Button>
        </div>
      </div>
    </section>
  )
}