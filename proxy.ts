import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "./lib/auth/jwt"

const protectedRoutes = ["/student", "/counselor", "/admin"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if route is protected
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route))

  if (!isProtected) {
    return NextResponse.next()
  }

  const token = request.cookies.get("accessToken")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const payload = verifyToken(token)

  if (!payload) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Add user info to request headers for use in server components
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-user-id", String(payload.userId))
  requestHeaders.set("x-user-role", payload.role)
  requestHeaders.set("x-user-email", payload.email)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
