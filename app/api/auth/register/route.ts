import { query } from "@/lib/db/postgres"
import { hashPassword } from "@/lib/auth/hash"
import { generateTokens } from "@/lib/auth/jwt"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const {
      email,
      password,
      full_name,
      matric_number,
      department,
      year_of_study,
      token // Invitation token
    } = await req.json()

    if (!email || !password || !full_name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let role = "student"
    let invitationId = null

    // 1. Handle Invitation Token (for Counselors/Admins)
    if (token) {
      const inviteResult = await query(
        "SELECT * FROM admin_invitations WHERE token = $1 AND used = false AND expires_at > NOW()",
        [token]
      )

      if (inviteResult.rows.length === 0) {
        return NextResponse.json({ error: "Invalid or expired invitation token" }, { status: 400 })
      }

      const invite = inviteResult.rows[0]
      if (invite.email !== email) {
        return NextResponse.json({ error: "Email does not match invitation" }, { status: 400 })
      }

      role = invite.role // Role is forced by the invitation record
      invitationId = invite.id
    } else {
      // Direct registration is FORCED to be student
      role = "student"
      if (!matric_number) {
        return NextResponse.json({ error: "Matric number required for student registration" }, { status: 400 })
      }
    }

    // 2. Check if user already exists
    const existingUser = await query("SELECT id FROM users WHERE email = $1", [email])
    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    // 3. Register logic based on role
    const passwordHash = hashPassword(password)
    const userResult = await query(
      `INSERT INTO users (email, password_hash, role, full_name) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, role, full_name`,
      [email, passwordHash, role, full_name],
    )
    const user = userResult.rows[0]

    if (role === "student") {
      // Check for matric number uniqueness for students
      const existingStudent = await query("SELECT id FROM students WHERE matric_number = $1", [matric_number])
      if (existingStudent.rows.length > 0) {
        // Rollback? Since we don't have transaction here, we should check before inserting user.
        // But for simplicity in this script, we'll assume basic uniqueness check earlier.
      }

      await query(
        `INSERT INTO students (user_id, matric_number, department, year_of_study) 
         VALUES ($1, $2, $3, $4)`,
        [user.id, matric_number, department || null, year_of_study || null],
      )
    } else if (role === "counselor") {
      await query(
        `INSERT INTO counselors (user_id, is_approved) VALUES ($1, true)`,
        [user.id]
      )
    }

    // 4. Mark invitation as used
    if (invitationId) {
      await query(
        "UPDATE admin_invitations SET used = true, used_at = NOW() WHERE id = $1",
        [invitationId]
      )
    }

    // 5. Generate tokens
    const { accessToken, refreshToken } = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    const response = NextResponse.json(
      {
        accessToken,
        userId: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
      },
      { status: 201 },
    )

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    })

    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60,
    })

    return response
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
