"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { CheckCircle, XCircle, Clock, Loader2, Receipt } from "lucide-react"

interface ReceiptData {
  id: string
  amount: number
  currency: string
  status: string
  description: string | null
  merchantName: string
  createdAt: string
  paidAt: string | null
}

export default function ReceiptPage() {
  const params = useParams()
  const id = params.id as string
  const [receipt, setReceipt] = useState<ReceiptData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchReceipt() {
      try {
        const res = await fetch(`/api/receipts/${id}`)
        if (res.ok) {
          setReceipt(await res.json())
        } else {
          const data = await res.json()
          setError(data.error || "Quittung nicht gefunden")
        }
      } catch {
        setError("Fehler beim Laden der Quittung")
      } finally {
        setLoading(false)
      }
    }
    fetchReceipt()
  }, [id])

  function formatAmount(cents: number, currency: string): string {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(cents / 100)
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (error || !receipt) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border p-8 text-center max-w-sm w-full">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Nicht gefunden</h1>
          <p className="text-gray-500">{error || "Diese Quittung existiert nicht."}</p>
        </div>
      </div>
    )
  }

  const statusConfig = {
    succeeded: { icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", label: "Bezahlt" },
    pending: { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50", label: "Ausstehend" },
    failed: { icon: XCircle, color: "text-red-600", bg: "bg-red-50", label: "Fehlgeschlagen" },
    refunded: { icon: XCircle, color: "text-blue-600", bg: "bg-blue-50", label: "Erstattet" },
  }
  const status = statusConfig[receipt.status as keyof typeof statusConfig] || statusConfig.pending
  const StatusIcon = status.icon

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className={`${status.bg} px-6 py-8 text-center`}>
          <StatusIcon className={`w-16 h-16 ${status.color} mx-auto mb-3`} />
          <p className={`text-sm font-medium ${status.color} mb-1`}>{status.label}</p>
          <p className="text-3xl font-bold text-gray-900">
            {formatAmount(receipt.amount, receipt.currency)}
          </p>
        </div>

        {/* Details */}
        <div className="px-6 py-6 space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-sm text-gray-500">Händler</span>
            <span className="text-sm font-medium text-gray-900">{receipt.merchantName}</span>
          </div>

          {receipt.description && (
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-sm text-gray-500">Beschreibung</span>
              <span className="text-sm font-medium text-gray-900">{receipt.description}</span>
            </div>
          )}

          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-sm text-gray-500">Datum</span>
            <span className="text-sm font-medium text-gray-900">
              {formatDate(receipt.paidAt || receipt.createdAt)}
            </span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-sm text-gray-500">Referenz</span>
            <span className="text-xs font-mono text-gray-500">{receipt.id.slice(0, 12)}...</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
            <Receipt className="w-3.5 h-3.5" />
            <span>Powered by Zipayo</span>
          </div>
        </div>
      </div>
    </div>
  )
}
