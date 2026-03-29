# SwiftTap 💳

**Bezahlen so einfach wie ein Tipp**

SwiftTap ist eine moderne Zahlungsplattform für Händler. Akzeptieren Sie bargeldlose Zahlungen via QR-Code in Sekunden.

![SwiftTap](https://img.shields.io/badge/SwiftTap-Payment%20Platform-00C9B1?style=for-the-badge)

## Features

- 🔲 **QR-Code Zahlungen** - Generieren Sie QR-Codes für schnelle Zahlungen
- 📱 **Tap to Pay** - Nutzen Sie Ihr Smartphone als Zahlungsterminal (coming soon)
- 💳 **Stripe Integration** - Sichere Zahlungsabwicklung
- 📊 **Dashboard** - Echtzeit-Übersicht über Umsätze und Transaktionen
- 🔐 **Sicher** - PCI-konform powered by Stripe
- 🔌 **REST API** - Integration für POS-Systeme

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Sprache:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Auth:** NextAuth.js
- **Database:** PostgreSQL (Neon) + Prisma
- **Payments:** Stripe

## Getting Started

### 1. Installation

```bash
npm install
```

### 2. Environment Setup

Kopiere `.env.example` zu `.env` und fülle die Werte aus:

```bash
cp .env.example .env
```

### 3. Database Setup

```bash
npx prisma generate
node scripts/init-db.mjs
```

### 4. Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## REST API für POS-Integration

SwiftTap bietet eine öffentliche REST API zur Integration in POS-Systeme, Kassensysteme und andere Anwendungen.

### Authentifizierung

Erstellen Sie im Dashboard unter "API-Keys" einen API-Key und senden Sie ihn im Header:

```
X-SwiftTap-Key: st_live_xxxxxxxxxxxxx
```

### Endpoints

#### Zahlung erstellen

```bash
POST /api/v1/payment-request
Content-Type: application/json
X-SwiftTap-Key: st_live_xxxxxxxxxxxxx

{
  "amount": 1500,           // Betrag in Cents (15.00€)
  "description": "Rechnung #123",
  "customerEmail": "kunde@example.com",
  "expiresInMinutes": 30    // Optional: Ablaufzeit
}
```

**Response:**
```json
{
  "paymentId": "clxxx...",
  "qrUrl": "https://api.qrserver.com/v1/create-qr-code/?...",
  "payUrl": "https://swifttap-app.vercel.app/pay/clxxx...",
  "amount": 1500,
  "expiresAt": "2026-03-29T16:00:00.000Z"
}
```

#### Zahlungsstatus abfragen

```bash
GET /api/v1/payment-status/{paymentId}
X-SwiftTap-Key: st_live_xxxxxxxxxxxxx
```

**Response:**
```json
{
  "paymentId": "clxxx...",
  "status": "succeeded",    // pending | succeeded | failed | refunded | cancelled
  "amount": 1500,
  "currency": "eur",
  "paidAt": "2026-03-29T15:35:00.000Z",
  "refundedAt": null
}
```

#### Zahlung abbrechen

```bash
POST /api/v1/payment-request/{paymentId}/cancel
X-SwiftTap-Key: st_live_xxxxxxxxxxxxx
```

**Response:**
```json
{
  "paymentId": "clxxx...",
  "status": "cancelled",
  "message": "Payment cancelled successfully"
}
```

### Beispiel: POS-Integration

```javascript
// Zahlung erstellen
const response = await fetch('https://swifttap-app.vercel.app/api/v1/payment-request', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-SwiftTap-Key': process.env.SWIFTTAP_API_KEY
  },
  body: JSON.stringify({
    amount: 2500,  // 25.00€
    description: 'Bestellung #456'
  })
});

const { paymentId, qrUrl, payUrl } = await response.json();

// QR-Code anzeigen...

// Status pollen (alle 3 Sekunden)
const checkStatus = async () => {
  const res = await fetch(`https://swifttap-app.vercel.app/api/v1/payment-status/${paymentId}`, {
    headers: { 'X-SwiftTap-Key': process.env.SWIFTTAP_API_KEY }
  });
  const { status } = await res.json();
  
  if (status === 'succeeded') {
    console.log('Zahlung erfolgreich!');
  } else if (status === 'pending') {
    setTimeout(checkStatus, 3000);
  }
};
```

## Stripe Test Mode

Das Projekt ist für Stripe Test Mode konfiguriert. Verwende Test-Kartennummern:

- **Erfolg:** 4242 4242 4242 4242
- **3D Secure:** 4000 0025 0000 3155
- **Abgelehnt:** 4000 0000 0000 9995

Ablaufdatum: beliebiges zukünftiges Datum, CVC: beliebige 3 Ziffern

## Admin Panel

Das Admin Panel (`/admin`) ist nur für Benutzer mit `role="admin"` oder `email=admin@swifttap.de` zugänglich.

Features:
- Dashboard mit Gesamt-Statistiken
- Merchant Management (aktivieren/deaktivieren)
- Commission Tracking (Platform-Fees)

## Deployment

Das Projekt ist für Vercel optimiert:

```bash
vercel --prod
```

## Preise

| Plan | Preis | Umsatzlimit |
|------|-------|-------------|
| Starter | €0/Monat | bis 1.000€/Monat |
| Pro | €29/Monat | Unbegrenzt |
| Business | €79/Monat | Unbegrenzt + Features |

Zusätzlich: 1,4% + 0,25€ pro Transaktion

## Entwickelt von

**FELDWERK** - Digitale Betriebssysteme für KMU im Außendienst

---

© 2026 SwiftTap by FELDWERK. Alle Rechte vorbehalten.
