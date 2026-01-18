import { query } from "@/lib/db/postgres"
import { getAuthenticatedUser } from "@/lib/auth/resolve"
import { type NextRequest, NextResponse } from "next/server"

/**
 * GET /api/auth/me
 * Returns the current user's full profile including role-specific data.
 */
export async function GET(req: NextRequest) {
    try {
        const decoded = getAuthenticatedUser(req)

        if (!decoded) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Base user data
        const userResult = await query(
            "SELECT id, email, role, full_name, created_at FROM users WHERE id = $1",
            [decoded.userId]
        )
        const user = userResult.rows[0]

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        let roleData = {}

        if (user.role === "student") {
            const studentResult = await query(
                "SELECT matric_number, department, year_of_study FROM students WHERE user_id = $1",
                [user.id]
            )
            roleData = studentResult.rows[0] || {}
        } else if (user.role === "counselor") {
            const counselorResult = await query(
                "SELECT id, bio, specializations, profile_picture_url, is_approved FROM counselors WHERE user_id = $1",
                [user.id]
            )
            roleData = counselorResult.rows[0] || {}
        }

        return NextResponse.json({
            ...user,
            details: roleData
        })

    } catch (error) {
        console.error("Auth Me API Error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
