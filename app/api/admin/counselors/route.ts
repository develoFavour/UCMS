import { query } from "@/lib/db/postgres"
import { getAuthenticatedUser } from "@/lib/auth/resolve"
import { type NextRequest, NextResponse } from "next/server"

/**
 * GET /api/admin/counselors
 * Lists all counselors with extra admin data
 */
export async function GET(req: NextRequest) {
    try {
        const decoded = getAuthenticatedUser(req)

        if (!decoded || decoded.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        const stats = await query(`
            SELECT 
                c.id,
                u.full_name as name,
                u.email,
                'counselor' as role,
                CASE 
                    WHEN c.is_approved = true THEN 'active'
                    ELSE 'pending'
                END as status,
                (SELECT COUNT(*) FROM appointments WHERE counselor_id = c.id) as total_students,
                COALESCE((SELECT AVG(rating) FROM appointment_reviews WHERE counselor_id = c.id), 5.0) as rating,
                c.specializations
            FROM counselors c
            JOIN users u ON c.user_id = u.id
            ORDER BY u.full_name ASC
        `)

        return NextResponse.json(stats.rows)

    } catch (error) {
        console.error("Admin Counselors API Error:", error)
        return NextResponse.json({ error: "Failed to fetch counselors" }, { status: 500 })
    }
}
