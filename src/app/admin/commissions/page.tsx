"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface CommissionData {
  period: string
  totalFees: number
  totalTransactions: number
  feesByMerchant: Array<{
    merchantId: string
    businessName: string
    fees: number
    count: number
  }>
  feesByDay: Array<{
    date: string
    fees: number
    count: number
  }>
}

export default function AdminCommissions() {
  const [data, setData] = useState<CommissionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("month")

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/commissions?period=${period}`)
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [period])

  if (loading) {
    return <div className="text-center py-8">Lade Commissions...</div>
  }

  if (!data) {
    return <div className="text-center py-8 text-red-500">Fehler beim Laden</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#1A2744]">Commission Tracking</h1>
        <div className="flex gap-2">
          {["day", "week", "month", "all"].map(p => (
            <Button
              key={p}
              variant={period === p ? "default" : "outline"}
              onClick={() => setPeriod(p)}
              className={period === p ? "bg-[#1A2744]" : ""}
            >
              {p === "day" ? "Heute" : p === "week" ? "Woche" : p === "month" ? "Monat" : "Gesamt"}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-xl border-0 shadow-lg bg-gradient-to-br from-[#1A2744] to-[#2d3f5e]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-300">Platform-Fees Gesamt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-[#00C9B1]">
              €{(data.totalFees / 100).toLocaleString("de-DE", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Transaktionen mit Fee</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1A2744]">
              {data.totalTransactions}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Durchschnittliche Fee</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1A2744]">
              €{data.totalTransactions > 0 
                ? ((data.totalFees / data.totalTransactions) / 100).toFixed(2)
                : "0.00"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fees by Merchant */}
      <Card className="rounded-xl border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-[#1A2744]">Fees nach Merchant</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.feesByMerchant.map(m => (
              <div key={m.merchantId} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-semibold text-[#1A2744]">{m.businessName}</div>
                  <div className="text-sm text-gray-500">{m.count} Transaktionen</div>
                </div>
                <div className="text-xl font-bold text-[#00C9B1]">
                  €{(m.fees / 100).toLocaleString("de-DE", { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
            {data.feesByMerchant.length === 0 && (
              <div className="text-center text-gray-500 py-4">Keine Daten für diesen Zeitraum</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Fees by Day */}
      <Card className="rounded-xl border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-[#1A2744]">Fees nach Tag</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.feesByDay.slice(0, 14).map(d => (
              <div key={d.date} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-24 font-medium text-gray-700">
                    {new Date(d.date).toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" })}
                  </div>
                  <div className="text-sm text-gray-500">{d.count} Transaktionen</div>
                </div>
                <div className="font-bold text-[#00C9B1]">
                  €{(d.fees / 100).toFixed(2)}
                </div>
              </div>
            ))}
            {data.feesByDay.length === 0 && (
              <div className="text-center text-gray-500 py-4">Keine Daten für diesen Zeitraum</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
