"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { authService } from "@/services/auth.service"
import {
  ShieldCheck,
  User,
  Mail,
  Hash,
  GraduationCap,
  Calendar,
  Lock,
  ArrowRight,
  Loader2
} from "lucide-react"
import { toast } from "sonner"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    matricNumber: "",
    department: "",
    yearOfStudy: "1",
  })

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)

    try {
      const data = await authService.register({
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        matric_number: formData.matricNumber,
        department: formData.department,
        year_of_study: Number.parseInt(formData.yearOfStudy)
      })

      toast.success("Registration successful")
      router.push(`/${data.role}`)
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full space-y-10">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground tracking-tight">
          Student Registration
        </h1>
        <p className="text-muted-foreground text-lg">
          Join the community and take focus of your well-being.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="p-4 bg-error/5 border border-error/20 rounded-2xl text-error text-sm font-bold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Full Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                name="fullName"
                type="text"
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3.5 bg-muted border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none font-bold"
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">University Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                name="email"
                type="email"
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3.5 bg-muted border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none font-bold"
                placeholder="name@university.edu"
                required
              />
            </div>
          </div>

          {/* Matric Number */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Matric Number</label>
            <div className="relative group">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                name="matricNumber"
                type="text"
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3.5 bg-muted border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none font-bold"
                placeholder="CSC/19/1234"
                required
              />
            </div>
          </div>

          {/* Department */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Department</label>
            <div className="relative group">
              <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                name="department"
                type="text"
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3.5 bg-muted border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none font-bold"
                placeholder="Computer Science"
              />
            </div>
          </div>

          {/* Year of Study */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Year of Study</label>
            <div className="relative group">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <select
                name="yearOfStudy"
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3.5 bg-muted border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none font-bold"
              >
                {[1, 2, 3, 4, 5].map((year) => (
                  <option key={year} value={year}>Year {year}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Empty div for grid alignment */}
          <div className="hidden md:block"></div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                name="password"
                type="password"
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3.5 bg-muted border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none font-bold"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Confirm Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                name="confirmPassword"
                type="password"
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3.5 bg-muted border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none font-bold"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center space-x-2 hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-70 mt-4"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-muted-foreground font-medium pb-8">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-bold hover:underline">Sign in</Link>
      </p>
    </div>
  )
}
