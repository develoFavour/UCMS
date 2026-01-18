import { query } from "@/lib/db/postgres"
import { getAuthenticatedUser } from "@/lib/auth/resolve"
import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { sendInvitationEmail } from "@/lib/mail/brevo"

/**
 * POST /api/admin/invite
 * Allows admins to create invitations for counselors or new admins.
 */
export async function POST(req: NextRequest) {
    try {
        // 1. Verify Requesting User is Admin
        const decoded = getAuthenticatedUser(req)

        if (!decoded || decoded.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 })
        }

        const { email, role, expires_in_days = 7 } = await req.json()

        if (!email || !role) {
            return NextResponse.json({ error: "Email and role are required." }, { status: 400 })
        }

        if (!["counselor", "admin"].includes(role)) {
            return NextResponse.json({ error: "Invalid role specified." }, { status: 400 })
        }

        // 2. Generate Secure Token
        const inviteToken = crypto.randomBytes(32).toString("hex")
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + expires_in_days)

        // 3. Save Invitation to Database
        await query(
            `INSERT INTO admin_invitations (email, role, token, expires_at) 
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE 
       SET role = EXCLUDED.role, token = EXCLUDED.token, expires_at = EXCLUDED.expires_at, used = false`,
            [email, role, inviteToken, expiresAt]
        )

        // 4. Send Email & Return Link
        const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/setup-password?token=${inviteToken}`

        // We send email asynchronously to not block the response
        sendInvitationEmail(email, role, inviteLink).catch(err => {
            console.error("[INVITE] Failed to send email notify:", err)
        })

        return NextResponse.json({
            success: true,
            inviteLink,
            expiresAt: expiresAt.toISOString()
        })

    } catch (error) {
        console.error("Invite Error:", error)
        return NextResponse.json({ error: "Failed to generate invitation." }, { status: 500 })
    }
}

/**
 * GET /api/admin/invite?token=...
 * Verifies an invitation token and returns associated metadata.
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const token = searchParams.get("token")

        if (!token) {
            return NextResponse.json({ error: "Token is required" }, { status: 400 })
        }

        const result = await query(
            "SELECT email, role, expires_at FROM admin_invitations WHERE token = $1 AND used = false AND expires_at > NOW()",
            [token]
        )

        if (result.rows.length === 0) {
            return NextResponse.json({ error: "Invitation not found or expired" }, { status: 404 })
        }

        return NextResponse.json(result.rows[0])

    } catch (error) {
        console.error("Verify Token Error:", error)
        return NextResponse.json({ error: "Failed to verify token" }, { status: 500 })
    }
}

