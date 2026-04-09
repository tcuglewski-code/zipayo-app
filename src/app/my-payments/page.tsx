"use client"

import { useState } from "react"
import {
  Loader2,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  Receipt,
  Shield,
  ArrowRight,
  RefreshCw,
} from "lucide-react"

interface PaymentRecord {
  id: string
  amount: number
  currency: string
  status: string
  description: string | null
  merchantName: string
  createdAt: string
  paidAt: string | null
  refundedAt: string | null
}

export default function MyPaymentsPage() {
  const [email, setEmail] = useState("")
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [error, setError] = useState("")
  const [authToken, setAuthToken] = useState("")
  const [authEmail, setAuthEmail] = useState("")

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/my-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Fehler beim Anmelden")
        return
      }

      if (data.token) {
        // Fetch payments with token
        setAuthToken(data.token)
        setAuthEmail(data.email)
        await fetchPayments(data.email, data.token)
      } else {
        setError("Keine Zahlungen für diese E-Mail gefunden.")
      }
    } catch {
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.")
    } finally {
      setLoading(false)
    }
  }

  async function fetchPayments(em: string, tok: string) {
    try {
      const res = await fetch(`/api/my-payments?email=${encodeURIComponent(em)}&token=${tok}`)
      if (res.ok) {
        const data = await res.json()
        setPayments(data.payments)
        setAuthenticated(true)
      } else {
        setError("Zugang abgelaufen. Bitte erneut anmelden.")
      }
    } catch {
      setError("Fehler beim Laden der Zahlungen")
    }
  }

  function formatAmount(cents: number, currency: string): string {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(cents / 100)
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  function getStatusBadge(status: string) {
    const configs: Record<string, { icon: typeof CheckCircle; color: string; bg: string; label: string }> = {
      succeeded: { icon: CheckCircle, color: "text-emerald-700", bg: "bg-emerald-100", label: "Bezahlt" },
      pending: { icon: Clock, color: "text-yellow-700", bg: "bg-yellow-100", label: "Ausstehend" },
      failed: { icon: XCircle, color: "text-red-700", bg: "bg-red-100", label: "Fehlgeschlagen" },
      refunded: { icon: RefreshCw, color: "text-blue-700", bg: "bg-blue-100", label: "Erstattet" },
    }
    const config = configs[status] || configs.pending
    const Icon = config.icon
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    )
  }

  const totalPaid = payments
    .filter((p) => p.status === "succeeded")
    .reduce((sum, p) => sum + p.amount, 0)

  // Login view
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border max-w-sm w-full p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Meine Zahlungen</h1>
            <p className="text-gray-500 text-sm mt-1">
              Geben Sie Ihre E-Mail ein, um Ihre Zahlungshistorie einzusehen.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-Mail Adresse
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ihre@email.de"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-medium text-sm px-4 py-2.5 rounded-lg transition-colors"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Zahlungen anzeigen
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-2 text-xs text-gray-400 justify-center">
            <Shield className="w-3.5 h-3.5" />
            <span>Ihre Daten sind verschlüsselt und sicher.</span>
          </div>
        </div>
      </div>
    )
  }

  // Payments list view
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Meine Zahlungen</h1>
              <p className="text-sm text-gray-500 mt-0.5">{authEmail}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Gesamt bezahlt</p>
              <p className="text-lg font-bold text-emerald-600">
                {formatAmount(totalPaid, "eur")}
              </p>
            </div>
          </div>
        </div>

        {/* Payments */}
        {payments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border p-8 text-center">
            <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Keine Zahlungen gefunden.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {payment.merchantName}
                      </p>
                      {getStatusBadge(payment.status)}
                    </div>
                    {payment.description && (
                      <p className="text-xs text-gray-500 truncate">{payment.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(payment.paidAt || payment.createdAt)}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className={`font-semibold ${
                      payment.status === "refunded" ? "text-gray-400 line-through" : "text-gray-900"
                    }`}>
                      {formatAmount(payment.amount, payment.currency)}
                    </p>
                    <a
                      href={`/receipts/${payment.id}`}
                      className="text-xs text-emerald-600 hover:text-emerald-700"
                    >
                      Quittung
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer actions */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Datenschutz</h2>
          <p className="text-xs text-gray-500 mb-4">
            Gemäß DSGVO Art. 17 haben Sie das Recht auf Löschung Ihrer personenbezogenen Daten.
          </p>
          <a
            href={`mailto:datenschutz@zipayo.com?subject=DSGVO Datenlöschung&body=Bitte löschen Sie alle meine Daten für: ${authEmail}`}
            className="inline-flex items-center gap-2 text-xs text-red-600 hover:text-red-700 font-medium"
          >
            <Shield className="w-3.5 h-3.5" />
            Datenlöschung beantragen
          </a>
        </div>

        <div className="mt-4 text-center text-xs text-gray-400">
          Powered by Zipayo
        </div>
      </div>
    </div>
  )
}
