"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AdminStats {
  totalRevenue: number
  activeMerchants: number
  transactionsToday: number
  transactionsTotal: number
  topMerchants: Array<{
    id: string
    businessName: string
    email: string
    revenue: number
  }>
  merchants: Array<{
    id: string
    businessName: string
    email: string
    stripeStatus: string
    revenue: number
    createdAt: string
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(res => res.json())
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-center py-8">Lade Dashboard...</div>
  }

  if (!stats) {
    return <div className="text-center py-8 text-red-500">Fehler beim Laden</div>
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-[#1A2744]">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-xl border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Gesamt-Umsatz</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1A2744]">
              €{(stats.totalRevenue / 100).toLocaleString("de-DE", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Aktive Merchants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#00C9B1]">
              {stats.activeMerchants}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Transaktionen Heute</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1A2744]">
              {stats.transactionsToday}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Transaktionen Gesamt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1A2744]">
              {stats.transactionsTotal}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top 5 Merchants */}
      <Card className="rounded-xl border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-[#1A2744]">Top 5 Merchants nach Umsatz</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.topMerchants.map((m, i) => (
              <div key={m.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#00C9B1] text-white flex items-center justify-center font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-[#1A2744]">{m.businessName}</div>
                    <div className="text-sm text-gray-500">{m.email}</div>
                  </div>
                </div>
                <div className="text-lg font-bold text-[#00C9B1]">
                  €{(m.revenue / 100).toLocaleString("de-DE", { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
            {stats.topMerchants.length === 0 && (
              <div className="text-center text-gray-500 py-4">Keine Merchants gefunden</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* All Merchants Table */}
      <Card className="rounded-xl border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-[#1A2744]">Alle Merchants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 text-gray-500 font-medium">Name</th>
                  <th className="text-left p-4 text-gray-500 font-medium">Email</th>
                  <th className="text-left p-4 text-gray-500 font-medium">Stripe-Status</th>
                  <th className="text-right p-4 text-gray-500 font-medium">Umsatz</th>
                  <th className="text-left p-4 text-gray-500 font-medium">Erstellt</th>
                </tr>
              </thead>
              <tbody>
                {stats.merchants.map(m => (
                  <tr key={m.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium text-[#1A2744]">{m.businessName}</td>
                    <td className="p-4 text-gray-600">{m.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        m.stripeStatus === "onboarded" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {m.stripeStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right font-medium">
                      €{(m.revenue / 100).toLocaleString("de-DE", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-gray-600">
                      {new Date(m.createdAt).toLocaleDateString("de-DE")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
