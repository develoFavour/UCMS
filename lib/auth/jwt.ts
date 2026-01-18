import crypto from "crypto"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

interface TokenPayload {
  userId: number
  email: string
  role: string
  iat?: number
  exp?: number
}

export function generateTokens(payload: TokenPayload) {
  const accessToken = createJWT(payload, "15m")
  const refreshToken = createJWT(payload, "7d")
  return { accessToken, refreshToken }
}

function createJWT(payload: TokenPayload, expiresIn: string): string {
  const header = { alg: "HS256", typ: "JWT" }
  const now = Math.floor(Date.now() / 1000)
  const exp = now + parseExpiry(expiresIn)

  const tokenPayload = {
    ...payload,
    iat: now,
    exp,
  }

  const encoded = base64url(JSON.stringify(header)) + "." + base64url(JSON.stringify(tokenPayload))

  const signature = crypto.createHmac("sha256", JWT_SECRET).update(encoded).digest()

  return encoded + "." + base64url(signature)
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const [header, payload, signature] = token.split(".")
    const encoded = `${header}.${payload}`

    const expectedSignature = crypto.createHmac("sha256", JWT_SECRET).update(encoded).digest()

    const actualSignature = Buffer.from(signature.replace(/-/g, "+").replace(/_/g, "/"), "base64")

    if (!actualSignature.equals(expectedSignature)) {
      return null
    }

    const decoded = JSON.parse(Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString())

    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return decoded
  } catch (error) {
    return null
  }
}

function base64url(buffer: string | Buffer): string {
  return Buffer.from(buffer).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

function parseExpiry(expiresIn: string): number {
  const matches = expiresIn.match(/^(\d+)([smhd])$/)
  if (!matches) throw new Error("Invalid expiry format")

  const value = Number.parseInt(matches[1])
  const unit = matches[2]

  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 60 * 60 * 24,
  }

  return value * (multipliers[unit] || 1)
}
