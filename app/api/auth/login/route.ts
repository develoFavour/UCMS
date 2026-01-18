import { query } from "@/lib/db/postgres"
import { verifyPassword } from "@/lib/auth/hash"
import { generateTokens } from "@/lib/auth/jwt"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    // Get user
    const result = await query("SELECT * FROM users WHERE email = $1", [email])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const user = result.rows[0]

    // Verify password
    if (!verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    // Set refresh token as HTTP-only cookie
    const response = NextResponse.json({
      accessToken,
      userId: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
    })

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60, // 15 minutes
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
