import { query } from "@/lib/db/postgres"
import { getAuthenticatedUser } from "@/lib/auth/resolve"
import { type NextRequest, NextResponse } from "next/server"

/**
 * PUT /api/counselor/profile
 * Updates counselor biography and specializations.
 */
export async function PUT(req: NextRequest) {
    try {
        const decoded = getAuthenticatedUser(req)

        if (!decoded || decoded.role !== "counselor") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        const { bio, specializations } = await req.json()

        if (!bio || !Array.isArray(specializations)) {
            return NextResponse.json({ error: "Bio and specializations are required" }, { status: 400 })
        }

        // Update counselors table
        await query(
            "UPDATE counselors SET bio = $1, specializations = $2 WHERE user_id = $3",
            [bio, specializations, decoded.userId]
        )

        return NextResponse.json({ success: true, message: "Profile updated successfully" })

    } catch (error) {
        console.error("Update Counselor Profile Error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
