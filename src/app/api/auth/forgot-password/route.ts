import { NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { resend, isResendConfigured } from "@/lib/resend"
import { generatePasswordResetHtml, generatePasswordResetSubject } from "@/lib/email-templates"
import { checkRateLimit, getClientIP, RATE_LIMITS } from "@/lib/rate-limit"

// Generic response to prevent email enumeration
const GENERIC_RESPONSE = {
  message: "Falls die E-Mail-Adresse existiert, wurde eine Nachricht gesendet.",
}

export async function POST(req: Request) {
  try {
    // Rate limit by IP
    const ip = getClientIP(req.headers)
    const rateLimitResult = checkRateLimit(`forgot-password:${ip}`, RATE_LIMITS.auth)

    if (!rateLimitResult.success) {
      return NextResponse.json(GENERIC_RESPONSE)
    }

    const { email } = await req.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json(GENERIC_RESPONSE)
    }

    const normalizedEmail = email.toLowerCase().trim()
    const user = await prisma.swiftTapUser.findUnique({
      where: { email: normalizedEmail },
    })

    if (user && isResendConfigured()) {
      // Delete any existing tokens for this email
      await prisma.passwordResetToken.deleteMany({
        where: { email: user.email },
      })

      const token = crypto.randomBytes(32).toString("hex")
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      await prisma.passwordResetToken.create({
        data: {
          email: user.email,
          token,
          expiresAt,
        },
      })

      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || "https://swifttap-app.vercel.app"
      const resetUrl = `${baseUrl}/reset-password?token=${token}`

      await resend!.emails.send({
        from: "Zipayo <noreply@zipayo.app>",
        to: user.email,
        subject: generatePasswordResetSubject(),
        html: generatePasswordResetHtml({
          email: user.email,
          resetUrl,
          expiresIn: "1 Stunde",
        }),
      })
    }

    return NextResponse.json(GENERIC_RESPONSE)
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json(GENERIC_RESPONSE)
  }
}
