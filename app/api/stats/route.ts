import { query } from "@/lib/db/postgres"
import { getAuthenticatedUser } from "@/lib/auth/resolve"
import { type NextRequest, NextResponse } from "next/server"

/**
 * GET /api/stats
 * Unified stats endpoint for all roles
 */
export async function GET(req: NextRequest) {
  try {
    const decoded = getAuthenticatedUser(req)

    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (decoded.role === "student") {
      const studentResult = await query("SELECT id FROM students WHERE user_id = $1", [decoded.userId])
      const studentId = studentResult.rows[0]?.id

      const stats = await query(`
        SELECT 
          COUNT(*) FILTER (WHERE status IN ('pending', 'approved') AND scheduled_date >= CURRENT_DATE) as upcoming,
          COUNT(*) FILTER (WHERE status = 'completed') as completed,
          (SELECT COUNT(*) FROM messages m JOIN appointments a ON m.appointment_id = a.id WHERE a.student_id = $1) as messages,
          COALESCE(SUM(duration_minutes) FILTER (WHERE status = 'completed'), 0) / 60 as focus_hours
        FROM appointments 
        WHERE student_id = $1
      `, [studentId])

      return NextResponse.json(stats.rows[0])
    }

    if (decoded.role === "counselor") {
      const counselorResult = await query("SELECT id FROM counselors WHERE user_id = $1", [decoded.userId])
      const counselorId = counselorResult.rows[0]?.id

      const stats = await query(`
        SELECT 
          COUNT(*) FILTER (WHERE status = 'pending') as pending_requests,
          COUNT(*) FILTER (WHERE status = 'completed') as completed_sessions,
          (SELECT COUNT(DISTINCT student_id) FROM appointments WHERE counselor_id = $1) as total_students
        FROM appointments 
        WHERE counselor_id = $1
      `, [counselorId])

      return NextResponse.json(stats.rows[0])
    }

    if (decoded.role === "admin") {
      const stats = await query(`
        SELECT 
          (SELECT COUNT(*) FROM students) as total_students,
          (SELECT COUNT(*) FROM counselors WHERE is_approved = true) as total_counselors,
          (SELECT COUNT(*) FROM appointments WHERE status = 'completed') as completed_appointments,
          (SELECT COUNT(*) FROM appointments WHERE status = 'pending') as pending_requests
        FROM (SELECT 1) as dummy
      `)

      return NextResponse.json(stats.rows[0])
    }

    return NextResponse.json({ error: "Invalid role" }, { status: 400 })

  } catch (error) {
    console.error("Stats API Error:", error)
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 })
  }
}
