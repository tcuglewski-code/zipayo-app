"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface MerchantDetail {
  merchant: {
    id: string
    businessName: string
    businessType: string | null
    email: string
    name: string | null
    stripeOnboarded: boolean
    stripeAccountId: string | null
    active: boolean
    platformFeePercent: number
    totalRevenue: number
    totalFees: number
    createdAt: string
  }
  transactions: Array<{
    id: string
    amount: number
    status: string
    description: string | null
    customerEmail: string | null
    platformFee: number | null
    createdAt: string
  }>
  team: Array<{
    id: string
    email: string
    role: string
    accepted: boolean
  }>
  qrCodes: Array<{
    id: string
    name: string
    amount: number | null
    uses: number
    isActive: boolean
  }>
}

export default function MerchantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [data, setData] = useState<MerchantDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/merchants/${params.id}`)
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return <div className="text-center py-8">Lade Details...</div>
  }

  if (!data) {
    return <div className="text-center py-8 text-red-500">Merchant nicht gefunden</div>
  }

  const { merchant, transactions, team, qrCodes } = data

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Button variant="ghost" onClick={() => router.back()} className="mb-2">
            ← Zurück
          </Button>
          <h1 className="text-3xl font-bold text-[#1A2744]">{merchant.businessName}</h1>
          <p className="text-gray-500">{merchant.email}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            merchant.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
            {merchant.active ? "Aktiv" : "Deaktiviert"}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            merchant.stripeOnboarded ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
          }`}>
            Stripe: {merchant.stripeOnboarded ? "Onboarded" : "Pending"}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-xl border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Umsatz</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1A2744]">
              €{(merchant.totalRevenue / 100).toLocaleString("de-DE", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Platform-Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#00C9B1]">
              €{(merchant.totalFees / 100).toLocaleString("de-DE", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Fee-Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1A2744]">
              {merchant.platformFeePercent}%
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Transaktionen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1A2744]">
              {transactions.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card className="rounded-xl border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-[#1A2744]">Transaktionen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-gray-500 font-medium">ID</th>
                  <th className="text-right p-3 text-gray-500 font-medium">Betrag</th>
                  <th className="text-right p-3 text-gray-500 font-medium">Fee</th>
                  <th className="text-left p-3 text-gray-500 font-medium">Status</th>
                  <th className="text-left p-3 text-gray-500 font-medium">Beschreibung</th>
                  <th className="text-left p-3 text-gray-500 font-medium">Datum</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 20).map(t => (
                  <tr key={t.id} className="border-b">
                    <td className="p-3 font-mono text-sm">{t.id.slice(0, 8)}...</td>
                    <td className="p-3 text-right">€{(t.amount / 100).toFixed(2)}</td>
                    <td className="p-3 text-right text-[#00C9B1]">
                      {t.platformFee ? `€${(t.platformFee / 100).toFixed(2)}` : "-"}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        t.status === "succeeded" ? "bg-green-100 text-green-800" :
                        t.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600">{t.description || "-"}</td>
                    <td className="p-3 text-gray-600">
                      {new Date(t.createdAt).toLocaleString("de-DE")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Team & QR Codes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-xl border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#1A2744]">Team ({team.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {team.map(m => (
                <div key={m.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{m.email}</div>
                    <div className="text-sm text-gray-500">{m.role}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    m.accepted ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {m.accepted ? "Aktiv" : "Eingeladen"}
                  </span>
                </div>
              ))}
              {team.length === 0 && <div className="text-gray-500">Keine Team-Mitglieder</div>}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#1A2744]">QR-Codes ({qrCodes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {qrCodes.map(q => (
                <div key={q.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{q.name}</div>
                    <div className="text-sm text-gray-500">
                      {q.amount ? `€${(q.amount / 100).toFixed(2)}` : "Variabler Betrag"} • {q.uses} Nutzungen
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    q.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                  }`}>
                    {q.isActive ? "Aktiv" : "Inaktiv"}
                  </span>
                </div>
              ))}
              {qrCodes.length === 0 && <div className="text-gray-500">Keine QR-Codes</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
