import crypto from "crypto"

export function hashPassword(password: string): string {
  // Using SHA-256 for hashing (in production, use bcrypt)
  // For MVP: simple secure hash, can upgrade to bcrypt later
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha256").toString("hex")
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, hash: string): boolean {
  const [salt, key] = hash.split(":")
  const hashOfPassword = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha256").toString("hex")
  return key === hashOfPassword
}
