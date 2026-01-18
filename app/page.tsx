"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
    const role = typeof window !== "undefined" ? localStorage.getItem("userRole") : null

    if (token && role) {
      // Redirect to appropriate dashboard
      router.push(`/${role}`)
    } else {
      router.push("/login")
    }
  }, [router])

  return null
}
