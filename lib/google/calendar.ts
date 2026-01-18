/**
 * Google OAuth2 & Calendar Integration Utility
 */

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI

/**
 * Generates the Google Auth URL for counselors to link their calendar.
 * Scopes: Calendar (to create events) & Calendar.Events (to get Meet links)
 */
export function getGoogleAuthUrl(counselorId: number) {
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth"
    const options = {
        redirect_uri: REDIRECT_URI!,
        client_id: CLIENT_ID!,
        access_type: "offline",
        response_type: "code",
        prompt: "consent",
        scope: [
            "https://www.googleapis.com/auth/calendar",
            "https://www.googleapis.com/auth/calendar.events",
        ].join(" "),
        state: JSON.stringify({ counselorId }),
    }

    const qs = new URLSearchParams(options)
    return `${rootUrl}?${qs.toString()}`
}

/**
 * Exchanges auth code for access/refresh tokens
 */
export async function getTokensFromCode(code: string) {
    const url = "https://oauth2.googleapis.com/token"
    const values = {
        code,
        client_id: CLIENT_ID!,
        client_secret: CLIENT_SECRET!,
        redirect_uri: REDIRECT_URI!,
        grant_type: "authorization_code",
    }

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(values).toString(),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error_description || "Failed to fetch tokens")
    }

    return response.json()
}

/**
 * Refreshes an expired access token
 */
export async function refreshAccessToken(refreshToken: string) {
    const url = "https://oauth2.googleapis.com/token"
    const values = {
        client_id: CLIENT_ID!,
        client_secret: CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
    }

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(values).toString(),
    })

    if (!response.ok) {
        throw new Error("Failed to refresh access token")
    }

    return response.json()
}

/**
 * Creates a Google Calendar event with a Meet link
 */
export async function createGoogleMeetEvent(
    accessToken: string,
    details: {
        summary: string
        description: string
        startTime: string
        endTime: string
        studentEmail: string
    }
) {
    const url = "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1"

    const event = {
        summary: details.summary,
        description: details.description,
        start: { dateTime: details.startTime, timeZone: "Africa/Lagos" }, // Default to local
        end: { dateTime: details.endTime, timeZone: "Africa/Lagos" },
        attendees: [{ email: details.studentEmail }],
        conferenceData: {
            createRequest: {
                requestId: `ucms-${Date.now()}`,
                conferenceSolutionKey: { type: "hangoutsMeet" },
            },
        },
    }

    const response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || "Failed to create calendar event")
    }

    return response.json()
}
