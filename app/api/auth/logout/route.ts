import { cookies } from "next/headers"
import { NextResponse } from "next/server"

/**
 * POST /api/auth/logout
 * Clears authentication cookies
 */
export async function POST() {
    const response = NextResponse.json({ success: true, message: "Logged out successfully" })

    response.cookies.delete("accessToken")
    response.cookies.delete("refreshToken")

    return response
}
