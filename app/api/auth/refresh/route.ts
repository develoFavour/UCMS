import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { verifyToken, generateTokens } from "@/lib/auth/jwt"

/**
 * POST /api/auth/refresh
 * Uses the refreshToken cookie to issue a new accessToken
 */
export async function POST() {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get("refreshToken")?.value

    if (!refreshToken) {
        return NextResponse.json({ error: "No refresh token provided" }, { status: 401 })
    }

    const payload = verifyToken(refreshToken)
    if (!payload) {
        // If refresh token is invalid/expired, we should clear everything
        const response = NextResponse.json({ error: "Invalid refresh token" }, { status: 401 })
        response.cookies.delete("accessToken")
        response.cookies.delete("refreshToken")
        return response
    }

    // Generate new tokens
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens({
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
    })

    const response = NextResponse.json({ success: true })

    // Set new cookies
    response.cookies.set("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 15, // 15 minutes
    })

    response.cookies.set("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
}
