import { query } from "@/lib/db/postgres"
import { NextResponse } from "next/server"

/**
 * GET /api/counselors
 * Fetch list of approved counselors for student discovery
 */
export async function GET() {
    try {
        const result = await query(`
      SELECT 
        c.id, 
        c.user_id, 
        c.profile_picture_url, 
        c.bio, 
        c.specializations,
        u.full_name as name,
        u.email,
        COALESCE((SELECT AVG(rating) FROM appointment_reviews WHERE counselor_id = c.id), 4.8) as rating,
        COALESCE((SELECT COUNT(*) FROM appointment_reviews WHERE counselor_id = c.id), 12) as review_count
      FROM counselors c
      JOIN users u ON c.user_id = u.id
      WHERE c.is_approved = true AND u.deleted_at IS NULL
    `)

        return NextResponse.json(result.rows)
    } catch (error: any) {
        console.error("Fetch Counselors Error:", error)
        return NextResponse.json({ error: "Failed to fetch counselors" }, { status: 500 })
    }
}
