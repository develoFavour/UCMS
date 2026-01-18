"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, Bell, User, Calendar, MessageSquare, Search, LayoutDashboard } from "lucide-react"

interface NavbarProps {
  userRole?: string
  userName?: string
}

export function Navbar({ userRole = "student", userName = "User" }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigationLinks = {
    student: [
      { label: "Dashboard", href: "/student", icon: LayoutDashboard },
      { label: "Find Counselor", href: "/student/search", icon: Search },
      { label: "Appointments", href: "/student/appointments", icon: Calendar },
      { label: "Messages", href: "/student/messages", icon: MessageSquare },
    ],
    counselor: [
      { label: "Dashboard", href: "/counselor", icon: LayoutDashboard },
      { label: "Requests", href: "/counselor/requests", icon: Bell },
      { label: "Schedule", href: "/counselor/schedule", icon: Calendar },
      { label: "Students", href: "/counselor/students", icon: User },
    ],
    admin: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Counselors", href: "/admin/counselors", icon: User },
      { label: "Students", href: "/admin/students", icon: User },
      { label: "Analytics", href: "/admin/analytics", icon: Bell },
    ],
  }

  const links = navigationLinks[userRole as keyof typeof navigationLinks] || navigationLinks.student

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center transition-transform group-hover:scale-105 group-active:scale-95 shadow-lg shadow-primary/20">
              <span className="text-white font-bold text-xl tracking-tight">UC</span>
            </div>
            <span className="font-bold text-xl text-foreground tracking-tight hidden sm:inline">
              UniCounseling
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Menu & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
            </button>
            
            <div className="flex items-center space-x-3 pl-2 sm:pl-4 border-l border-border">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold text-foreground leading-none">{userName}</span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mt-1">
                  {userRole}
                </span>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner overflow-hidden">
                <User className="w-5 h-5 text-primary" />
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      <div 
        className={`md:hidden absolute w-full bg-white border-b border-border transition-all duration-300 ease-in-out overflow-hidden ${
          mobileMenuOpen ? "max-h-96 opacity-100 py-4" : "max-h-0 opacity-0 py-0"
        }`}
      >
        <div className="px-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 text-base font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
              >
                <Icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
