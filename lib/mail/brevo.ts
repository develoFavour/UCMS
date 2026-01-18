/**
 * Brevo (formerly Sendinblue) Transactional Email Service
 */

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"
const API_KEY = process.env.BREVO_API_KEY

interface SendEmailParams {
    to: { email: string; name?: string }[]
    subject: string
    htmlContent: string
    sender?: { email: string; name: string }
}

export async function sendEmail({ to, subject, htmlContent, sender }: SendEmailParams) {
    if (!API_KEY) {
        console.warn("[MAIL] Brevo API Key not found. Email will not be sent.")
        return { success: false, error: "API Key missing" }
    }

    try {
        const response = await fetch(BREVO_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-key": API_KEY,
            },
            body: JSON.stringify({
                sender: sender || { email: "no-reply@university.edu", name: "UCMS Counseling" },
                to,
                subject,
                htmlContent,
            }),
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || "Failed to send email")
        }

        return { success: true }
    } catch (error) {
        console.error("[MAIL] Error sending email:", error)
        return { success: false, error }
    }
}

/**
 * Pre-defined Templates
 */

export async function sendInvitationEmail(email: string, role: string, inviteLink: string) {
    return sendEmail({
        to: [{ email }],
        subject: `Invitation to join UCMS as ${role}`,
        htmlContent: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #0066ff;">Welcome to UCMS</h2>
        <p>You have been invited to join the University Counseling Management System as a <strong>${role}</strong>.</p>
        <p>Please click the button below to complete your registration:</p>
        <div style="margin: 30px 0;">
          <a href="${inviteLink}" style="background-color: #000; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Complete Registration</a>
        </div>
        <p style="font-size: 12px; color: #666;">If the button doesn't work, copy and paste this link: ${inviteLink}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999;">University Counseling Management System</p>
      </div>
    `,
    })
}

export async function sendAppointmentConfirmation(studentEmail: string, studentName: string, counselorName: string, date: string, time: string, isVirtual: boolean, meetLink?: string) {
    return sendEmail({
        to: [{ email: studentEmail, name: studentName }],
        subject: "Appointment Confirmation - UCMS",
        htmlContent: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #22c55e;">Appointment Confirmed!</h2>
        <p>Hi ${studentName}, your counseling session with <strong>${counselorName}</strong> has been secured.</p>
        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Date:</strong> ${date}</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> ${time}</p>
          <p style="margin: 5px 0;"><strong>Type:</strong> ${isVirtual ? "Virtual (Online)" : "Physical (Office)"}</p>
          ${meetLink ? `<p style="margin: 5px 0;"><strong>Meeting Link:</strong> <a href="${meetLink}">${meetLink}</a></p>` : ""}
        </div>
        <p>Please ensure you are available on time. If you need to cancel, do so at least 2 hours in advance.</p>
      </div>
    `,
    })
}
