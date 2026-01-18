import { getTokensFromCode } from "@/lib/google/calendar"
import { query } from "@/lib/db/postgres"
import { type NextRequest, NextResponse } from "next/server"

/**
 * GET /api/auth/google/callback
 * Handles the redirect from Google OAuth2 consent screen.
 */
export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    if (error) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/counselor/profile?error=google_denied`)
    }

    if (!code || !state) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/counselor/profile?error=invalid_request`)
    }

    try {
        const { counselorId } = JSON.parse(state)

        // 1. Exchange code for tokens
        const tokens = await getTokensFromCode(code)

        // 2. Save refresh token to counselor record
        // We only get refresh_token on the first authorization!
        if (tokens.refresh_token) {
            await query(
                "UPDATE counselors SET google_refresh_token = $1 WHERE id = $2",
                [tokens.refresh_token, counselorId]
            )
        }

        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/counselor/profile?success=calendar_linked`)
    } catch (err) {
        console.error("Google Callback Error:", err)
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/counselor/profile?error=server_error`)
    }
}
