"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Merchant {
  id: string
  businessName: string
  businessType: string | null
  email: string
  name: string | null
  stripeStatus: string
  active: boolean
  platformFeePercent: number
  revenue: number
  teamCount: number
  qrCount: number
  createdAt: string
}

export default function AdminMerchants() {
  const router = useRouter()
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")

  const fetchMerchants = async () => {
    const params = filter !== "all" ? `?status=${filter}` : ""
    const res = await fetch(`/api/admin/merchants${params}`)
    const data = await res.json()
    setMerchants(data.merchants || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchMerchants()
  }, [filter])

  const toggleActive = async (id: string, currentActive: boolean) => {
    await fetch(`/api/admin/merchants/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !currentActive })
    })
    fetchMerchants()
  }

  if (loading) {
    return <div className="text-center py-8">Lade Merchants...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#1A2744]">Merchant Management</h1>
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className={filter === "all" ? "bg-[#1A2744]" : ""}
          >
            Alle
          </Button>
          <Button
            variant={filter === "onboarded" ? "default" : "outline"}
            onClick={() => setFilter("onboarded")}
            className={filter === "onboarded" ? "bg-[#00C9B1]" : ""}
          >
            Onboarded
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            onClick={() => setFilter("pending")}
            className={filter === "pending" ? "bg-yellow-500" : ""}
          >
            Pending
          </Button>
        </div>
      </div>

      <Card className="rounded-xl border-0 shadow-lg">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 text-gray-500 font-medium">Name</th>
                  <th className="text-left p-4 text-gray-500 font-medium">Branche</th>
                  <th className="text-left p-4 text-gray-500 font-medium">Stripe</th>
                  <th className="text-right p-4 text-gray-500 font-medium">Umsatz</th>
                  <th className="text-center p-4 text-gray-500 font-medium">Team</th>
                  <th className="text-center p-4 text-gray-500 font-medium">QR</th>
                  <th className="text-left p-4 text-gray-500 font-medium">Erstellt</th>
                  <th className="text-center p-4 text-gray-500 font-medium">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {merchants.map(m => (
                  <tr key={m.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-medium text-[#1A2744]">{m.businessName}</div>
                      <div className="text-sm text-gray-500">{m.email}</div>
                    </td>
                    <td className="p-4 text-gray-600">{m.businessType || "-"}</td>
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
                    <td className="p-4 text-center">{m.teamCount}</td>
                    <td className="p-4 text-center">{m.qrCount}</td>
                    <td className="p-4 text-gray-600">
                      {new Date(m.createdAt).toLocaleDateString("de-DE")}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 justify-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/admin/merchants/${m.id}`)}
                        >
                          Details
                        </Button>
                        <Button
                          size="sm"
                          variant={m.active ? "destructive" : "default"}
                          onClick={() => toggleActive(m.id, m.active)}
                          className={!m.active ? "bg-[#00C9B1]" : ""}
                        >
                          {m.active ? "Deaktivieren" : "Aktivieren"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {merchants.length === 0 && (
              <div className="text-center text-gray-500 py-8">Keine Merchants gefunden</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
