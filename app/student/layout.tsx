"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/shared/app-sidebar"
import { Bell, Search, User } from "lucide-react"
import { useAuthStore } from "@/store/auth.store"

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user } = useAuthStore()

    return (
        <SidebarProvider>
            <AppSidebar userRole="student" />
            <SidebarInset className="bg-background">
                {/* Dashboard Header */}
                <header className="h-16 border-b border-border/50 flex items-center justify-between px-6 sticky top-0 bg-background/80 backdrop-blur-xl z-20">
                    <div className="flex items-center gap-4">
                        <SidebarTrigger className="hover:bg-muted transition-colors" />
                        <div className="h-4 w-px bg-border/50 hidden md:block" />
                        <div className="hidden md:flex items-center px-4 py-1.5 bg-muted/50 rounded-2xl border border-border/50">
                            <Search className="w-4 h-4 text-muted-foreground mr-2" />
                            <input
                                type="text"
                                placeholder="Find a counselor..."
                                className="bg-transparent border-none text-xs outline-none w-56 font-bold"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="p-2 text-muted-foreground hover:bg-muted rounded-xl transition-all relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-background" />
                        </button>
                        <div className="h-8 w-px bg-border/50 mx-2" />
                        <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-muted rounded-xl transition-all">
                            <div className="flex flex-col items-end hidden sm:flex">
                                <span className="text-xs font-bold text-foreground">{user?.full_name || 'Student'}</span>
                                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Enrollment Status</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                <User className="w-4 h-4 text-primary" />
                            </div>
                        </button>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
