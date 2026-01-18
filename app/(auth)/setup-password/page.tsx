"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { authService } from "@/services/auth.service"
import {
    User,
    Mail,
    Lock,
    ArrowRight,
    Loader2,
    ShieldCheck,
    AlertCircle
} from "lucide-react"
import { toast } from "sonner"

export default function SetupPasswordPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get("token")

    const [invitation, setInvitation] = useState<{ email: string; role: string } | null>(null)
    const [formData, setFormData] = useState({
        fullName: "",
        password: "",
        confirmPassword: "",
    })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [verifying, setVerifying] = useState(true)

    useEffect(() => {
        async function verifyToken() {
            if (!token) {
                setError("Missing invitation token.")
                setVerifying(false)
                return
            }

            try {
                const res = await fetch(`/api/admin/invite?token=${token}`)
                const data = await res.json()

                if (!res.ok) {
                    throw new Error(data.error || "Invalid invitation")
                }

                setInvitation(data)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setVerifying(false)
            }
        }

        verifyToken()
    }, [token])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                email: invitation!.email,
                password: formData.password,
                full_name: formData.fullName,
                token: token || undefined
            })

            toast.success("Account setup successful! Welcome to the team.")
            router.push(`/${data.role}`)
        } catch (err: any) {
            setError(err.message || "An error occurred. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    if (verifying) {
        return (
            <div className="flex flex-col items-center justify-center space-y-4 py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-muted-foreground font-bold animate-pulse">Verifying invitation...</p>
            </div>
        )
    }

    if (error && !invitation) {
        return (
            <div className="space-y-6 text-center py-10">
                <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="w-10 h-10 text-error" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">Invitation Link Invalid</h2>
                    <p className="text-muted-foreground">
                        This invitation may have expired or has already been used. Please contact your administrator.
                    </p>
                </div>
                <Link
                    href="/login"
                    className="inline-block px-8 py-3 bg-primary text-white rounded-2xl font-bold hover:shadow-lg transition-all"
                >
                    Back to Login
                </Link>
            </div>
        )
    }

    return (
        <div className="w-full space-y-10">
            <div className="space-y-2">
                <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">
                        Staff Invitation
                    </span>
                </div>
                <h1 className="text-4xl font-bold text-foreground tracking-tight">
                    Complete Your Setup
                </h1>
                <p className="text-muted-foreground text-lg">
                    You've been invited as a <span className="text-foreground font-bold uppercase">{invitation?.role}</span>. Set your password to begin.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                    <div className="p-4 bg-error/5 border border-error/20 rounded-2xl text-error text-sm font-bold">
                        {error}
                    </div>
                )}

                <div className="space-y-6">
                    {/* Email (Read Only) */}
                    <div className="space-y-2 opacity-60">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Assigned Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="email"
                                value={invitation?.email || ""}
                                readOnly
                                className="w-full pl-11 pr-4 py-3.5 bg-muted/50 border-none rounded-2xl text-sm font-bold cursor-not-allowed outline-none"
                            />
                        </div>
                    </div>

                    {/* Full Name */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Your Full Name</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                name="fullName"
                                type="text"
                                required
                                value={formData.fullName}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3.5 bg-muted border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none font-bold"
                                placeholder="John Doe"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">New Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3.5 bg-muted border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none font-bold"
                                    placeholder="••••••••"
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
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3.5 bg-muted border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none font-bold"
                                    placeholder="••••••••"
                                />
                            </div>
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
                            <span>Activate Account</span>
                            <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </button>
            </form>
        </div>
    )
}
