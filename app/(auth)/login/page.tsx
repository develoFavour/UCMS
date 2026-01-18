"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { authService } from "@/services/auth.service"
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const data = await authService.login({ email, password })

      toast.success("Login successful")
      router.push(`/${data.role}`)
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-10">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground text-lg">Enter your credentials to access your dashboard.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-error/5 border border-error/20 rounded-2xl text-error text-sm font-bold animate-in fade-in slide-in-from-top-1">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-muted border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              placeholder="name@university.edu"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between ml-1">
            <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Password</label>
            <Link href="#" className="text-xs font-bold text-primary hover:underline">Forgot password?</Link>
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-muted border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-foreground text-white rounded-2xl font-bold flex items-center justify-center space-x-2 hover:shadow-xl hover:shadow-black/10 transition-all active:scale-[0.98] disabled:opacity-70"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-muted-foreground font-medium">
        New to UCMS?{" "}
        <Link href="/register" className="text-primary font-bold hover:underline">Create an account</Link>
      </p>
    </div>
  )
}
