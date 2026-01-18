"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Users,
  Calendar,
  ShieldCheck,
  TrendingUp,
  Activity,
  Plus,
  ArrowRight,
  UserPlus,
  FileText,
  Settings,
  MoreVertical,
  Briefcase,
  GraduationCap,
  Clock
} from "lucide-react"
import { statsService } from "@/services/stats.service"
import { useAuthStore } from "@/store/auth.store"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total_students: 0,
    total_counselors: 0,
    completed_appointments: 0,
    pending_requests: 0
  })
  const [loading, setLoading] = useState(true)

  const { user } = useAuthStore()

  useEffect(() => {
    async function fetchData() {
      try {
        const statsData = await statsService.getStats()
        setStats(statsData)
      } catch (err) {
        console.error("Admin stats fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="space-y-12">
      {/* Command Center Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 md:mb-16 gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">
            Command <span className="text-primary italic">Center</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-lg">
            Welcome back, {user?.full_name || 'Administrator'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/invitations"
            className="flex items-center space-x-2 bg-primary text-white px-6 py-4 rounded-3xl font-black shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-1 active:scale-95 text-xs uppercase tracking-widest"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Staff</span>
          </Link>
        </div>
      </div>

      {/* High-Impact Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: "Total Students", value: stats.total_students, icon: GraduationCap, color: "bg-blue-500", trend: "+12%" },
          { label: "Active Counselors", value: stats.total_counselors, icon: Briefcase, color: "bg-purple-500", trend: "Stable" },
          { label: "Sessions Held", value: stats.completed_appointments, icon: Calendar, color: "bg-green-500", trend: "+8%" },
          { label: "Pending Issues", value: stats.pending_requests, icon: Activity, color: "bg-orange-500", trend: "Alert" },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border/60 p-6 rounded-[2.5rem] shadow-sm relative overflow-hidden group hover:border-primary/20 transition-all">
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex items-center justify-between mb-6">
                <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-[10px] font-black bg-muted px-2 py-1 rounded-lg uppercase tracking-widest text-muted-foreground">{stat.trend}</div>
              </div>
              <div>
                <div className="text-4xl font-bold tracking-tight text-foreground">{loading ? "..." : stat.value}</div>
                <div className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground mt-2">{stat.label}</div>
              </div>
            </div>
            <div className={`${stat.color} absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-10 -translate-y-1/2 translate-x-1/2`}></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Controls - Left 2/3 */}
        <div className="lg:col-span-2 space-y-10">
          {/* System Actions Area */}
          <div className="bg-muted/10 p-10 rounded-[3rem] border border-border/50">
            <h3 className="text-2xl font-bold mb-8">Management Suite</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: "Student Directory", desc: "Manage all student profiles and metadata", icon: Users, link: "/admin/students" },
                { title: "Counselor Approval", desc: "Verify and onboard new specialist staff", icon: ShieldCheck, link: "/admin/counselors" },
                { title: "System Configuration", desc: "Global app settings and security policies", icon: Settings, link: "/admin/settings" },
                { title: "Reports & Logs", desc: "Download system audit logs and analytics", icon: FileText, link: "/admin/reports" },
              ].map((task, i) => (
                <Link key={i} href={task.link} className="bg-card border border-border p-6 rounded-[2rem] flex items-start space-x-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group">
                  <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <task.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-foreground text-lg mb-1">{task.title}</div>
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed">{task.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Platform Utilization Chart Placeholder */}
          <div className="bg-card border border-border/60 p-8 rounded-[3rem] shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold">Engagement Trends</h3>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">Last 30 Days</p>
              </div>
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div className="h-48 w-full bg-muted/20 rounded-2xl flex items-center justify-center border border-dashed border-border">
              <p className="text-muted-foreground text-sm font-bold flex items-center">
                <Activity className="w-4 h-4 mr-2 animate-pulse text-primary" /> Data Visualization Coming Soon
              </p>
            </div>
          </div>
        </div>

        {/* Activity Sidebar - Right 1/3 */}
        <div className="space-y-10 font-sans">
          <div className="bg-card border border-border/60 p-8 rounded-[3rem] shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">System Alerts</h3>
              <span className="w-2 h-2 bg-error rounded-full animate-ping"></span>
            </div>

            <div className="space-y-6">
              {[
                { user: "Dr. Smith", action: "Updated availability", time: "10m ago", icon: Clock },
                { user: "John Doe", action: "Signed up as Student", time: "1h ago", icon: UserPlus },
                { user: "System", action: "Database backup successful", time: "3h ago", icon: Activity },
              ].map((act, i) => (
                <div key={i} className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <act.icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-foreground group">
                      <span className="text-primary hover:underline cursor-pointer">{act.user}</span>
                      <span className="text-muted-foreground font-medium"> {act.action}</span>
                    </div>
                    <div className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mt-1">{act.time}</div>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full py-4 text-xs font-black uppercase tracking-widest bg-muted rounded-2xl hover:bg-muted-foreground/10 transition-all text-muted-foreground">
              View All Activity
            </button>
          </div>

          <div className="bg-foreground text-white p-8 rounded-[3rem] space-y-6 relative overflow-hidden group shadow-2xl">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Internal Memo</h3>
              <p className="text-xs text-white/60 leading-relaxed italic">
                "Phase 4 deployment is nearly complete. Focus on counselor onboarding for the next sprint."
              </p>
              <div className="flex items-center mt-6 space-x-3">
                <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20"></div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-accent">Chief Administrator</div>
                  <div className="text-[8px] font-medium text-white/40">Jan 18, 2026</div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-[40px] group-hover:scale-150 transition-transform duration-700"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
