"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"

interface SidebarProps {
  items: { label: string; href: string; icon?: React.ReactNode }[]
}

export function Sidebar({ items }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border p-6 h-screen sticky top-0">
      {items.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-4 py-3 rounded-lg transition-colors ${
              isActive ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {item.label}
          </Link>
        )
      })}
    </aside>
  )
}
