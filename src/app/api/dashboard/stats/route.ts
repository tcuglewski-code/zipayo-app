export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const merchant = await prisma.merchant.findUnique({
      where: { userId: session.user.id },
    })

    if (!merchant) {
      return NextResponse.json({ error: "Merchant nicht gefunden" }, { status: 404 })
    }

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const [todayAgg, weekAgg, monthAgg, monthCount, recentPayments] = await Promise.all([
      prisma.payment.aggregate({
        where: {
          merchantId: merchant.id,
          status: "succeeded",
          createdAt: { gte: todayStart },
        },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: {
          merchantId: merchant.id,
          status: "succeeded",
          createdAt: { gte: weekStart },
        },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: {
          merchantId: merchant.id,
          status: "succeeded",
          createdAt: { gte: monthStart },
        },
        _sum: { amount: true },
      }),
      prisma.payment.count({
        where: {
          merchantId: merchant.id,
          createdAt: { gte: monthStart },
        },
      }),
      prisma.payment.findMany({
        where: { merchantId: merchant.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          amount: true,
          currency: true,
          status: true,
          customerEmail: true,
          createdAt: true,
        },
      }),
    ])

    return NextResponse.json({
      stats: {
        today: (todayAgg._sum.amount || 0) / 100,
        week: (weekAgg._sum.amount || 0) / 100,
        month: (monthAgg._sum.amount || 0) / 100,
        transactions: monthCount,
      },
      recentTransactions: recentPayments.map((p) => ({
        id: p.id,
        amount: p.amount / 100,
        status: p.status,
        customerEmail: p.customerEmail,
        createdAt: p.createdAt,
      })),
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json(
      { error: "Fehler beim Laden der Dashboard-Daten" },
      { status: 500 }
    )
  }
}
