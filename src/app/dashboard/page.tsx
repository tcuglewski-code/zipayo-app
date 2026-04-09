"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  TrendingUp,
  Euro,
  CreditCard,
  QrCode,
  Smartphone,
  ArrowUpRight,
  Loader2,
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

interface DashboardStats {
  today: number
  week: number
  month: number
  transactions: number
}

interface RecentTransaction {
  id: string
  amount: number
  status: string
  customerEmail: string | null
  createdAt: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [transactions, setTransactions] = useState<RecentTransaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/dashboard/stats")
        if (res.ok) {
          const data = await res.json()
          setStats(data.stats)
          setTransactions(data.recentTransactions)
        }
      } catch (e) {
        console.error("Dashboard fetch error:", e)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
          <p className="text-gray-600">Willkommen zurück! Hier ist Ihre Übersicht.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/qr">
            <Button variant="outline">
              <QrCode className="w-4 h-4 mr-2" />
              QR Code erstellen
            </Button>
          </Link>
          <Button variant="accent">
            <Smartphone className="w-4 h-4 mr-2" />
            Tap to Pay
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Heute
            </CardTitle>
            <Euro className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(stats?.today ?? 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Diese Woche
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(stats?.week ?? 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Dieser Monat
            </CardTitle>
            <Euro className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(stats?.month ?? 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Transaktionen
            </CardTitle>
            <CreditCard className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats?.transactions ?? 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Diesen Monat</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Letzte Transaktionen</CardTitle>
          <CardDescription>
            Die letzten 5 Zahlungen auf Ihrem Konto
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Noch keine Transaktionen vorhanden.</p>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.status === "succeeded"
                          ? "bg-green-100"
                          : "bg-red-100"
                      }`}
                    >
                      <CreditCard
                        className={`w-5 h-5 ${
                          transaction.status === "succeeded"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-primary">
                        {transaction.customerEmail || "Unbekannter Kunde"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(new Date(transaction.createdAt))}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        transaction.status === "succeeded"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.status === "succeeded" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {transaction.status === "succeeded"
                        ? "Erfolgreich"
                        : "Fehlgeschlagen"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {transactions.length > 0 && (
            <div className="mt-4 text-center">
              <Link href="/dashboard/transactions">
                <Button variant="outline" size="sm">
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Alle Transaktionen anzeigen
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-2 border-dashed hover:border-accent transition-colors cursor-pointer">
          <Link href="/dashboard/qr">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 bg-accent-50 rounded-full flex items-center justify-center mb-4">
                <QrCode className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-semibold text-lg text-primary">
                QR Code generieren
              </h3>
              <p className="text-gray-500 text-center mt-2">
                Erstellen Sie einen QR-Code für eine schnelle Zahlung
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="border-2 border-dashed hover:border-accent transition-colors cursor-pointer">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 bg-accent-50 rounded-full flex items-center justify-center mb-4">
              <Smartphone className="w-8 h-8 text-accent" />
            </div>
            <h3 className="font-semibold text-lg text-primary">Tap to Pay</h3>
            <p className="text-gray-500 text-center mt-2">
              Nutzen Sie Ihr Smartphone als Zahlungsterminal
            </p>
            <span className="mt-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              Bald verfügbar
            </span>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
