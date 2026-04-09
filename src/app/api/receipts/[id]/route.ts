export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Look up by payment ID or stripe payment ID
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { id },
          { stripePaymentId: id },
        ],
      },
      include: {
        merchant: {
          select: {
            businessName: true,
          },
        },
      },
    })

    if (!payment) {
      return NextResponse.json({ error: "Zahlung nicht gefunden" }, { status: 404 })
    }

    return NextResponse.json({
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      description: payment.description,
      merchantName: payment.merchant.businessName,
      createdAt: payment.createdAt,
      paidAt: payment.paidAt,
    })
  } catch (error) {
    console.error("Receipt fetch error:", error)
    return NextResponse.json(
      { error: "Fehler beim Laden der Quittung" },
      { status: 500 }
    )
  }
}
