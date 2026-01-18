"use client"

import { ShieldCheck } from "lucide-react"

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">
            {/* Visual Side */}
            <div className="hidden lg:block relative overflow-hidden">
                <img
                    src="/auth-bg.png"
                    alt="Premium Counseling Environment"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />

                <div className="absolute inset-0 flex flex-col justify-between p-16 text-white">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-2xl">
                            <ShieldCheck className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-2xl font-bold tracking-tighter">UCMS</span>
                    </div>

                    <div className="space-y-6 max-w-lg">
                        <h2 className="text-6xl font-bold leading-[1.1] tracking-tight">
                            Your Mental Well-being, Our Priority.
                        </h2>
                        <p className="text-xl text-white/80 leading-relaxed font-medium">
                            Join thousands of students accessing professional university counseling services with ease and confidentiality.
                        </p>
                    </div>

                    <div className="flex items-center space-x-4 text-xs font-black uppercase tracking-[0.3em] text-white/50">
                        <span>Confidential</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span>Professional</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span>Secure</span>
                    </div>
                </div>
            </div>

            {/* Form Side */}
            <div className="flex items-center justify-center p-8 md:p-16 overflow-y-auto bg-background">
                <div className="w-full max-w-xl">
                    {children}
                </div>
            </div>
        </div>
    )
}
