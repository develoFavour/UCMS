import { type NextRequest } from "next/server"
import { verifyToken } from "./jwt"

/**
 * Extracts the token from the Authorization header or HTTP-only cookies
 * and verifies it.
 */
export function getAuthenticatedUser(req: NextRequest) {
    // 1. Try Authorization Header
    const authHeader = req.headers.get("authorization")
    let token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null

    // 2. Try Cookies if header is missing
    if (!token) {
        token = req.cookies.get("accessToken")?.value || null
    }

    if (!token) return null

    return verifyToken(token)
}
