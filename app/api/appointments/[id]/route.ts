import { query } from "@/lib/db/postgres"
import { verifyToken } from "@/lib/auth/jwt"
import { type NextRequest, NextResponse } from "next/server"
import { refreshAccessToken, createGoogleMeetEvent } from "@/lib/google/calendar"
import { sendAppointmentConfirmation } from "@/lib/mail/brevo"

/**
 * PATCH /api/appointments/[id]
 * Counselors approve/reject appointments
 */
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authHeader = req.headers.get("authorization")
        const token = authHeader?.split(" ")[1]
        const decoded = token ? verifyToken(token) : null

        if (!decoded || decoded.role !== "counselor") {
            return NextResponse.json({ error: "Unauthorized. Counselor access required." }, { status: 403 })
        }

        const { status, cancellation_reason } = await req.json()
        const appointmentId = params.id

        // 1. Verify this appointment belongs to the counselor
        const checkResult = await query(
            `SELECT a.*, s_user.email as student_email, s_user.full_name as student_name, 
              c_user.full_name as counselor_name, co.google_refresh_token
       FROM appointments a
       JOIN students s ON a.student_id = s.id
       JOIN users s_user ON s.user_id = s_user.id
       JOIN counselors co ON a.counselor_id = co.id
       JOIN users c_user ON co.user_id = c_user.id
       WHERE a.id = $1 AND co.user_id = $2`,
            [appointmentId, decoded.userId]
        )

        if (checkResult.rows.length === 0) {
            return NextResponse.json({ error: "Appointment not found or unauthorized access" }, { status: 404 })
        }

        const appointment = checkResult.rows[0]
        let meetLink = appointment.meet_link

        // 2. Handle Approval Logic - Google Calendar Integration
        if (status === "approved" && appointment.status !== "approved") {
            if (appointment.type === "virtual" && appointment.google_refresh_token) {
                try {
                    // A. Refresh Google Token
                    const { access_token } = await refreshAccessToken(appointment.google_refresh_token)

                    // B. Create Meet Event
                    const startDateTime = new Date(`${appointment.scheduled_date}T${appointment.start_time}`).toISOString()
                    const endDateTime = new Date(new Date(startDateTime).getTime() + appointment.duration_minutes * 60000).toISOString()

                    const event = await createGoogleMeetEvent(access_token, {
                        summary: `Counseling Session: ${appointment.student_name}`,
                        description: `Scheduled counseling session between ${appointment.counselor_name} and ${appointment.student_name}.`,
                        startTime: startDateTime,
                        endTime: endDateTime,
                        studentEmail: appointment.student_email
                    })

                    meetLink = event.hangoutLink
                    console.log("[GOOGLE] Created Meet Link:", meetLink)
                } catch (err) {
                    console.error("[GOOGLE] Integration Failed:", err)
                    // We continue anyway, but without the auto-meet link
                }
            }

            // C. Send confirmation email
            sendAppointmentConfirmation(
                appointment.student_email,
                appointment.student_name,
                appointment.counselor_name,
                appointment.scheduled_date.toLocaleDateString(),
                appointment.start_time,
                appointment.type === "virtual",
                meetLink
            ).catch(err => console.error("[MAIL] Failed to notify student:", err))
        }

        // 3. Update Database
        const updateResult = await query(
            `UPDATE appointments 
       SET status = $1, meet_link = $2, cancellation_reason = $3, 
           approved_at = CASE WHEN $1 = 'approved' THEN NOW() ELSE approved_at END,
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
            [status, meetLink, cancellation_reason || null, appointmentId]
        )

        return NextResponse.json(updateResult.rows[0])

    } catch (error) {
        console.error("Update Appointment Error:", error)
        return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 })
    }
}
