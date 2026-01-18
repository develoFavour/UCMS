import { query } from "@/lib/db/postgres"
import { getAuthenticatedUser } from "@/lib/auth/resolve"
import { type NextRequest, NextResponse } from "next/server"

/**
 * GET /api/appointments
 * Fetch appointments based on user role (student, counselor, or admin)
 */
export async function GET(req: NextRequest) {
    try {
        const decoded = getAuthenticatedUser(req)

        if (!decoded) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        let sql = ""
        let params: any[] = []

        if (decoded.role === "student") {
            sql = `
        SELECT a.*, c_user.full_name as counselor_name, co.profile_picture_url
        FROM appointments a
        JOIN counselors co ON a.counselor_id = co.id
        JOIN users c_user ON co.user_id = c_user.id
        JOIN students s ON a.student_id = s.id
        WHERE s.user_id = $1
        ORDER BY scheduled_date DESC, start_time DESC
      `
            params = [decoded.userId]
        } else if (decoded.role === "counselor") {
            sql = `
        SELECT a.*, s_user.full_name as student_name, s.matric_number
        FROM appointments a
        JOIN students s ON a.student_id = s.id
        JOIN users s_user ON s.user_id = s_user.id
        JOIN counselors co ON a.counselor_id = co.id
        WHERE co.user_id = $1
        ORDER BY scheduled_date ASC, start_time ASC
      `
            params = [decoded.userId]
        } else {
            // Admin view all
            sql = `SELECT * FROM appointments ORDER BY created_at DESC`
        }

        const result = await query(sql, params)
        return NextResponse.json(result.rows)

    } catch (error) {
        console.error("Fetch Appointments Error:", error)
        return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 })
    }
}

/**
 * POST /api/appointments
 * Students request a new appointment
 */
export async function POST(req: NextRequest) {
    try {
        const decoded = getAuthenticatedUser(req)

        if (!decoded || decoded.role !== "student") {
            return NextResponse.json({ error: "Only students can request appointments" }, { status: 403 })
        }

        const { counselor_id, type, scheduled_date, start_time, duration_minutes = 60 } = await req.json()

        // 1. Get Student ID from User ID
        const studentResult = await query("SELECT id FROM students WHERE user_id = $1", [decoded.userId])
        if (studentResult.rows.length === 0) {
            return NextResponse.json({ error: "Student profile not found" }, { status: 404 })
        }
        const studentId = studentResult.rows[0].id

        // 2. Insert Appointment
        const result = await query(
            `INSERT INTO appointments (student_id, counselor_id, type, scheduled_date, start_time, end_time, duration_minutes, status)
       VALUES ($1, $2, $3, $4, $5, ($5::time + ($6 || ' minutes')::interval), $6, 'pending')
       RETURNING *`,
            [studentId, counselor_id, type, scheduled_date, start_time, duration_minutes]
        )

        return NextResponse.json(result.rows[0], { status: 201 })

    } catch (error) {
        console.error("Create Appointment Error:", error)
        return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 })
    }
}
