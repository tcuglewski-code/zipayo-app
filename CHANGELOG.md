# Changelog

Alle wichtigen Änderungen an Zipayo werden hier dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.1.0/),
und dieses Projekt folgt [Semantic Versioning](https://semver.org/lang/de/).

## [1.0.0] - 2026-04-01

### Hinzugefügt
- **Final Polish** — Performance-Optimierungen, vollständige Dokumentation
- **CHANGELOG.md** — Versionshistorie dokumentiert
- **Lighthouse-Optimierungen** — Image Optimization, Font Display, Bundle Size

### Geändert
- README.md mit vollständiger API-Dokumentation und Projektstruktur
- .env.example mit allen benötigten Variablen dokumentiert

## [0.9.0] - 2026-03-30

### Hinzugefügt
- **SEO-Optimierung (ZP011)** — Schema.org SoftwareApplication, Meta-Tags, OpenGraph
- **Staging-Dokumentation (ZP016)** — Test-Stripe-Keys, Webhook-Setup, E2E-Tests
- **Security Hardening (ZP012)** — OWASP Top 10, Security Headers, Rate Limiting, CSP

### Sicherheit
- HSTS mit 1-Jahr-Preload
- Content-Security-Policy für Stripe-Integration
- X-Frame-Options DENY gegen Clickjacking
- Rate Limiting auf API-Endpoints

## [0.8.0] - 2026-03-29

### Hinzugefügt
- **Legal Pages (ZP009)** — /datenschutz, /agb, /impressum (DSGVO-konform)
- **Email Templates (ZP010)** — Welcome, Payment-Confirmed, Daily-Digest (Resend)
- **Admin Panel** — Commission Tracking, Merchant-Übersicht
- **REST API v1** — Payment Requests erstellen, Status abfragen, Webhooks

## [0.7.0] - 2026-03-28

### Hinzugefügt
- **Apple Pay / Google Pay** — Wallet-Zahlungen via Stripe Payment Request API
- **Email Receipts** — Automatische Zahlungsbestätigungen an Kunden
- **PDF Export** — Transaktionsliste als PDF (pdf-lib)
- **Refunds** — Erstattungen über Dashboard initiieren

### Geändert
- Payment UX verbessert mit Lade-Animationen und Fehler-Handling

## [0.6.0] - 2026-03-27

### Hinzugefügt
- **Stripe Connect** — Merchant-Onboarding mit Express Accounts
- **Webhooks** — Echtzeit-Zahlungsbenachrichtigungen
- **Analytics Dashboard** — Umsatz, Transaktionen, Conversion-Rate
- **Team Management** — Teammitglieder einladen und verwalten

## [0.5.0] - 2026-03-26

### Hinzugefügt
- **Rebranding** — SwiftTap → Zipayo
- Landing Page mit neuem Branding
- Logo und Farbschema aktualisiert

## [0.1.0] - 2026-03-25

### Hinzugefügt
- **MVP Release** — Grundlegende Zahlungsplattform
- QR-Code Zahlungen generieren und bezahlen
- Merchant Dashboard mit Transaktionsliste
- Stripe Payment Intents Integration
- NextAuth.js Authentifizierung
- Prisma + Neon PostgreSQL
- Vercel Deployment

---

## Versionsschema

- **MAJOR** — Inkompatible API-Änderungen
- **MINOR** — Neue Features (rückwärtskompatibel)
- **PATCH** — Bugfixes (rückwärtskompatibel)

## Links

- [Live-App](https://swifttap-app.vercel.app)
- [GitHub Repository](https://github.com/tcuglewski-code/swifttap-app)
- [Staging Setup](docs/STAGING-SETUP.md)
