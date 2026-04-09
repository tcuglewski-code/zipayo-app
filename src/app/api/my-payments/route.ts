export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

// POST: Request magic link (sends token via response for now)
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email erforderlich" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if any payments exist for this email
    const paymentCount = await prisma.payment.count({
      where: { customerEmail: normalizedEmail },
    })

    if (paymentCount === 0) {
      // Don't reveal whether email exists - always show success
      return NextResponse.json({ success: true })
    }

    // Generate a simple token (in production, store in DB with expiry)
    const token = crypto
      .createHmac("sha256", process.env.NEXTAUTH_SECRET || "zipayo-secret")
      .update(`${normalizedEmail}:${Math.floor(Date.now() / (1000 * 60 * 30))}`)
      .digest("hex")
      .slice(0, 32)

    // In production: send email with magic link
    // For now, return the token directly
    return NextResponse.json({
      success: true,
      // Token is returned for MVP; in production this would be sent via email
      token,
      email: normalizedEmail,
    })
  } catch (error) {
    console.error("Magic link error:", error)
    return NextResponse.json(
      { error: "Fehler beim Senden des Links" },
      { status: 500 }
    )
  }
}

// GET: Fetch payments for verified email
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get("email")
    const token = searchParams.get("token")

    if (!email || !token) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 })
    }

    // Verify token
    const expectedToken = crypto
      .createHmac("sha256", process.env.NEXTAUTH_SECRET || "zipayo-secret")
      .update(`${email}:${Math.floor(Date.now() / (1000 * 60 * 30))}`)
      .digest("hex")
      .slice(0, 32)

    if (token !== expectedToken) {
      return NextResponse.json({ error: "Ungültiger oder abgelaufener Link" }, { status: 401 })
    }

    const payments = await prisma.payment.findMany({
      where: { customerEmail: email },
      orderBy: { createdAt: "desc" },
      include: {
        merchant: {
          select: { businessName: true },
        },
      },
    })

    return NextResponse.json({
      payments: payments.map((p) => ({
        id: p.id,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        description: p.description,
        merchantName: p.merchant.businessName,
        createdAt: p.createdAt,
        paidAt: p.paidAt,
        refundedAt: p.refundedAt,
      })),
    })
  } catch (error) {
    console.error("My payments fetch error:", error)
    return NextResponse.json(
      { error: "Fehler beim Laden der Zahlungen" },
      { status: 500 }
    )
  }
}
