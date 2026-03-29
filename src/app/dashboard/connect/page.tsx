"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, AlertCircle, Loader2, CreditCard, ExternalLink } from "lucide-react"

interface MerchantData {
  id: string
  businessName: string
  stripeOnboarded: boolean
  stripeAccountId: string | null
}

export default function ConnectPage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const status = searchParams.get("status")
  const error = searchParams.get("error")

  const [merchant, setMerchant] = useState<MerchantData | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [businessName, setBusinessName] = useState("")
  const [businessType, setBusinessType] = useState("company")

  useEffect(() => {
    fetchMerchant()
  }, [])

  async function fetchMerchant() {
    try {
      const res = await fetch("/api/merchant")
      if (res.ok) {
        const data = await res.json()
        setMerchant(data.merchant)
        setBusinessName(data.merchant?.businessName || "")
      }
    } catch (e) {
      console.error("Error fetching merchant:", e)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateAccount() {
    if (!businessName.trim()) return
    
    setCreating(true)
    try {
      const res = await fetch("/api/stripe/connect/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName, businessType }),
      })
      
      if (res.ok) {
        const data = await res.json()
        setMerchant({
          id: data.merchantId,
          businessName,
          stripeOnboarded: false,
          stripeAccountId: data.stripeAccountId,
        })
      } else {
        const err = await res.json()
        alert(err.error || "Fehler beim Erstellen")
      }
    } catch (e) {
      console.error("Error creating account:", e)
      alert("Verbindungsfehler")
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Stripe Connect</h1>
      <p className="text-gray-600 mb-8">
        Verbinde dein Stripe-Konto um Zahlungen zu empfangen.
      </p>

      {/* Status messages */}
      {status === "success" && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800">Stripe Konto erfolgreich verbunden!</span>
        </div>
      )}

      {status === "pending" && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <span className="text-yellow-800">Onboarding nicht abgeschlossen. Bitte vervollständige die Einrichtung.</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">Ein Fehler ist aufgetreten. Bitte versuche es erneut.</span>
        </div>
      )}

      {/* Main content */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        {!merchant?.stripeAccountId ? (
          // No Stripe account yet - show creation form
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Stripe Konto erstellen</h2>
                <p className="text-sm text-gray-600">Richte Stripe Connect ein um Zahlungen zu empfangen</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="businessName">Geschäftsname</Label>
                <Input
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Mein Restaurant"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="businessType">Unternehmensform</Label>
                <select
                  id="businessType"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="company">Unternehmen (GmbH, UG, etc.)</option>
                  <option value="individual">Einzelunternehmer</option>
                </select>
              </div>
            </div>

            <Button
              onClick={handleCreateAccount}
              disabled={creating || !businessName.trim()}
              className="w-full"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Wird erstellt...
                </>
              ) : (
                "Stripe Konto erstellen"
              )}
            </Button>
          </div>
        ) : !merchant.stripeOnboarded ? (
          // Has Stripe account but not onboarded
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Onboarding ausstehend</h2>
                <p className="text-sm text-gray-600">Vervollständige dein Stripe-Profil um Zahlungen zu empfangen</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Geschäftsname:</strong> {merchant.businessName}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Stripe Account ID:</strong> {merchant.stripeAccountId}
              </p>
            </div>

            <a href="/api/stripe/connect/link" className="block">
              <Button className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                Stripe Onboarding fortsetzen
              </Button>
            </a>
          </div>
        ) : (
          // Fully onboarded
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Stripe verbunden</h2>
                <p className="text-sm text-gray-600">Dein Konto ist einsatzbereit</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Geschäftsname:</strong> {merchant.businessName}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Status:</strong>{" "}
                <span className="text-green-600 font-medium">Aktiv</span>
              </p>
            </div>

            <a
              href="https://dashboard.stripe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button variant="outline" className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                Stripe Dashboard öffnen
              </Button>
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
