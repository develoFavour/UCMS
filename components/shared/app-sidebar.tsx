"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    User,
    Calendar,
    MessageSquare,
    Search,
    Bell,
    Settings,
    ShieldCheck,
    ChevronRight,
    LogOut,
    Users2,
    FileText
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { authService } from "@/services/auth.service"
import { useAuthStore } from "@/store/auth.store"

interface AppSidebarProps {
    userRole: "student" | "counselor" | "admin"
    userName?: string
}

export function AppSidebar({ userRole }: AppSidebarProps) {
    const { user } = useAuthStore()
    const name = user?.full_name || "User"
    const pathname = usePathname()

    const navigation = {
        student: [
            { label: "Dashboard", href: "/student", icon: LayoutDashboard },
            { label: "Book Appointment", href: "/student/book", icon: Calendar },
            { label: "Find Counselor", href: "/student/explore", icon: Search },
            { label: "My History", href: "/student/history", icon: FileText },
            { label: "Messages", href: "/student/messages", icon: MessageSquare },
        ],
        counselor: [
            { label: "Dashboard", href: "/counselor", icon: LayoutDashboard },
            { label: "Appointment Requests", href: "/counselor/requests", icon: Bell },
            { label: "My Schedule", href: "/counselor/schedule", icon: Calendar },
            { label: "Student Directory", href: "/counselor/students", icon: Users2 },
            { label: "Confidential Notes", href: "/counselor/notes", icon: FileText },
        ],
        admin: [
            { label: "Analytics Dashboard", href: "/admin", icon: LayoutDashboard },
            { label: "Manage Counselors", href: "/admin/counselors", icon: User },
            { label: "Manage Students", href: "/admin/students", icon: Users2 },
            { label: "System Audit", href: "/admin/analytics", icon: ShieldCheck },
            { label: "Global Settings", href: "/admin/settings", icon: Settings },
        ],
    }

    const links = navigation[userRole] || navigation.student

    return (
        <Sidebar variant="inset" collapsible="icon" className="border-r border-border/50">
            <SidebarHeader className="h-16 flex items-center px-4 border-b border-border/50">
                <Link href="/" className="flex items-center gap-3 transition-all hover:opacity-80">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                        <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight group-data-[collapsible=icon]:hidden">
                        UCMS
                    </span>
                </Link>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 group-data-[collapsible=icon]:hidden">
                        Main Navigation
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="px-2 space-y-1">
                            {links.map((link) => {
                                const isActive = pathname === link.href
                                return (
                                    <SidebarMenuItem key={link.href}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            tooltip={link.label}
                                            className={cn(
                                                "h-11 px-3 rounded-xl transition-all font-bold",
                                                isActive
                                                    ? "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary hover:text-white"
                                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                            )}
                                        >
                                            <Link href={link.href}>
                                                <link.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-muted-foreground")} />
                                                <span className="group-data-[collapsible=icon]:hidden ml-2">{link.label}</span>
                                                {isActive && <ChevronRight className="ml-auto w-4 h-4 group-data-[collapsible=icon]:hidden" />}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup className="mt-auto">
                    <SidebarGroupLabel className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 group-data-[collapsible=icon]:hidden">
                        System
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="px-2">
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    tooltip="Settings"
                                    className="h-11 px-3 rounded-xl font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                                >
                                    <Settings className="w-5 h-5" />
                                    <span className="group-data-[collapsible=icon]:hidden ml-2">Settings</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4 border-t border-border/50">
                <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center border border-border group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8 transition-all">
                        <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
                        <span className="text-sm font-bold truncate text-foreground">{name}</span>
                        <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">{userRole}</span>
                    </div>
                    <button
                        onClick={() => authService.logout()}
                        className="ml-auto p-2 text-muted-foreground hover:text-error hover:bg-error/5 rounded-lg transition-all group-data-[collapsible=icon]:hidden"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
