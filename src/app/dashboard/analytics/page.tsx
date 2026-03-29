"use client"

import { useEffect, useState } from "react"
import { Loader2, TrendingUp, CreditCard, Calculator } from "lucide-react"

interface AnalyticsData {
  period: string
  totalRevenue: number
  transactionCount: number
  avgTransaction: number
  revenueByDay: { date: string; revenue: number; count: number }[]
  allTime: {
    totalRevenue: number
    transactionCount: number
  }
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("week")

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  async function fetchAnalytics() {
    setLoading(true)
    try {
      const res = await fetch(`/api/analytics?period=${period}`)
      if (res.ok) {
        const analytics = await res.json()
        setData(analytics)
      }
    } catch (e) {
      console.error("Error fetching analytics:", e)
    } finally {
      setLoading(false)
    }
  }

  function formatAmount(cents: number): string {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(cents / 100)
  }

  function formatShortDate(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })
  }

  // Simple SVG bar chart
  function BarChart({ data }: { data: { date: string; revenue: number }[] }) {
    if (data.length === 0) {
      return <div className="text-center py-8 text-gray-500">Keine Daten</div>
    }

    const maxValue = Math.max(...data.map(d => d.revenue), 1)
    const barWidth = Math.max(20, Math.min(60, 600 / data.length - 4))
    const chartWidth = data.length * (barWidth + 4)
    const chartHeight = 200

    return (
      <div className="overflow-x-auto">
        <svg width={Math.max(chartWidth, 300)} height={chartHeight + 40} className="mx-auto">
          {/* Bars */}
          {data.map((item, index) => {
            const barHeight = (item.revenue / maxValue) * chartHeight
            const x = index * (barWidth + 4)
            const y = chartHeight - barHeight

            return (
              <g key={item.date}>
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={item.revenue > 0 ? "#10b981" : "#e5e7eb"}
                  rx={4}
                  className="transition-all hover:opacity-80"
                />
                {/* Value label */}
                {item.revenue > 0 && (
                  <text
                    x={x + barWidth / 2}
                    y={y - 5}
                    textAnchor="middle"
                    className="text-xs fill-gray-600"
                  >
                    {formatAmount(item.revenue)}
                  </text>
                )}
                {/* Date label */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 20}
                  textAnchor="middle"
                  className="text-xs fill-gray-500"
                >
                  {formatShortDate(item.date)}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics</h1>
          <p className="text-gray-600">Umsatzübersicht und Statistiken.</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="day">Heute</option>
          <option value="week">Letzte 7 Tage</option>
          <option value="month">Dieser Monat</option>
        </select>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Umsatz ({data?.period})</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatAmount(data?.totalRevenue || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Transaktionen</p>
              <p className="text-2xl font-bold text-gray-900">
                {data?.transactionCount || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calculator className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ø Transaktion</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatAmount(data?.avgTransaction || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Umsatz nach Tag</h2>
        <BarChart data={data?.revenueByDay || []} />
      </div>

      {/* All-time stats */}
      <div className="bg-gray-50 rounded-xl border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Gesamt (alle Zeiten)</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600">Gesamtumsatz</p>
            <p className="text-xl font-bold text-gray-900">
              {formatAmount(data?.allTime.totalRevenue || 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Transaktionen gesamt</p>
            <p className="text-xl font-bold text-gray-900">
              {data?.allTime.transactionCount || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
