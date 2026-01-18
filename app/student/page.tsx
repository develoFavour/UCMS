"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Calendar,
  MessageSquare,
  Clock,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  MoreVertical,
  Plus,
  User,
  Search,
  Video,
  MapPin
} from "lucide-react"
import { appointmentService } from "@/services/appointment.service"
import { statsService } from "@/services/stats.service"
import { useAuthStore } from "@/store/auth.store"

export default function StudentDashboard() {
  const { user } = useAuthStore()
  const [appointments, setAppointments] = useState([])
  const [stats, setStats] = useState({ upcoming: 0, completed: 0, messages: 0, focus_hours: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [aptData, statsData] = await Promise.all([
          appointmentService.getAppointments(),
          statsService.getStats()
        ])
        setAppointments(aptData)
        setStats(statsData)
      } catch (err) {
        console.error("Dashboard fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const upcomingApts = appointments.filter((a: any) => ["pending", "approved"].includes(a.status))

  return (
    <div className="space-y-10">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">
            Hello, <span className="text-primary">{user?.full_name || 'Student'}!</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-lg max-w-lg">
            Your well-being is our priority. Ready for your next session?
          </p>
        </div>
        <Link
          href="/student/search"
          className="flex items-center justify-center space-x-2 bg-primary text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-1 active:scale-95 text-sm md:text-base w-full md:w-auto"
        >
          <Plus className="w-5 h-5" />
          <span>New Appointment</span>
        </Link>
      </div>

      {/* Stats Grid - Modern Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-10">
        {[
          { label: "Upcoming", value: stats.upcoming, color: "bg-primary/10 text-primary", icon: Calendar },
          { label: "Completed", value: stats.completed, color: "bg-secondary/10 text-secondary", icon: CheckCircle2 },
          { label: "Messages", value: stats.messages, color: "bg-accent/10 text-accent", icon: MessageSquare },
          { label: "Focus Hours", value: `${stats.focus_hours}h`, color: "bg-error/10 text-error", icon: Clock },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border/50 p-5 rounded-3xl flex items-center space-x-4 shadow-sm group hover:border-primary/20 transition-all">
            <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {loading ? "..." : stat.value}
              </div>
              <div className="text-xs uppercase tracking-widest font-bold text-muted-foreground">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Left 2/3 */}
        <div className="lg:col-span-2 space-y-8">
          {/* Upcoming Appointments List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-bold flex items-center space-x-2">
                <span>Upcoming Sessions</span>
                {upcomingApts.length > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full uppercase tracking-tighter">Live</span>
                )}
              </h2>
              <Link href="/student/appointments" className="text-sm font-bold text-primary flex items-center space-x-1 group">
                <span>View Full Schedule</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map(i => (
                  <div key={i} className="h-48 bg-muted/30 rounded-3xl animate-pulse" />
                ))}
              </div>
            ) : upcomingApts.length === 0 ? (
              <div className="bg-muted/10 border-2 border-dashed border-border p-12 rounded-3xl text-center space-y-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <Calendar className="w-8 h-8 text-muted" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-foreground">No sessions scheduled</p>
                  <p className="text-sm text-muted-foreground">Find a counselor and book your first appointment today.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingApts.map((apt: any) => (
                  <div key={apt.id} className="bg-card border border-border/60 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                          {apt.profile_picture_url ? (
                            <img src={apt.profile_picture_url} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <User className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground line-clamp-1">{apt.counselor_name}</h3>
                          <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${apt.status === 'approved' ? 'bg-success' : 'bg-warning'}`} />
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{apt.status}</p>
                          </div>
                        </div>
                      </div>
                      <button className="p-2 hover:bg-muted rounded-full transition-colors">
                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>

                    <div className="space-y-3 mb-5">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">
                          {new Date(apt.scheduled_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium text-foreground">{apt.start_time.slice(0, 5)} ({apt.duration_minutes}m)</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {apt.status === 'approved' ? (
                        <button
                          onClick={() => apt.meet_link && window.open(apt.meet_link, '_blank')}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${apt.type === 'virtual'
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'bg-foreground text-white shadow-lg'
                            }`}
                        >
                          {apt.type === 'virtual' ? (
                            <span className="flex items-center justify-center gap-2"><Video className="w-3.5 h-3.5" /> Join Meeting</span>
                          ) : (
                            <span className="flex items-center justify-center gap-2"><MapPin className="w-3.5 h-3.5" /> Campus Location</span>
                          )}
                        </button>
                      ) : (
                        <button className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-muted text-muted-foreground cursor-not-allowed">
                          Awaiting Approval
                        </button>
                      )}
                      <button className="px-3 py-2.5 rounded-xl border border-border hover:bg-muted transition-all">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Discover Section */}
          <div className="bg-foreground text-white p-8 rounded-[2.5rem] relative overflow-hidden group">
            <div className="relative z-10 max-w-md">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
                <TrendingUp className="w-3 h-3 text-secondary" />
                <span>Personal Growth</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">Need someone to talk to right now?</h3>
              <p className="text-white/70 text-sm md:text-base mb-6 leading-relaxed">
                Connect with on-call counselors available for immediate peer support and emergency guidance.
              </p>
              <Link href="/student/search" className="inline-flex items-center space-x-2 bg-secondary text-white px-6 py-3 rounded-2xl font-bold hover:scale-105 transition-transform active:scale-95">
                <span>Browse Experts</span>
                <Search className="w-4 h-4" />
              </Link>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/30 transition-all duration-700"></div>
            <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-secondary/10 rounded-full blur-[40px] translate-y-1/2"></div>
          </div>
        </div>

        {/* Sidebar Area - Right 1/3 */}
        <div className="space-y-8">
          <div className="bg-card border border-border/60 p-6 rounded-[2rem] shadow-sm space-y-6">
            <h3 className="font-bold text-lg">Quick Access</h3>
            <div className="space-y-3">
              {[
                { label: "My Profile", icon: User, href: "/student/profile", desc: "Manage your details" },
                { label: "Resources", icon: CheckCircle2, href: "#", desc: "Helpful guides & docs" },
                { label: "Support", icon: MessageSquare, href: "#", desc: "Get help from staff" },
              ].map((action, i) => (
                <Link key={i} href={action.href} className="flex items-center p-3 hover:bg-muted rounded-2xl transition-all group border border-transparent hover:border-border">
                  <div className="w-10 h-10 rounded-xl bg-muted group-hover:bg-white flex items-center justify-center mr-3 transition-colors">
                    <action.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-foreground">{action.label}</div>
                    <div className="text-[10px] text-muted-foreground font-medium">{action.desc}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/10 p-6 rounded-[2rem] space-y-4">
            <div className="w-12 h-12 bg-card rounded-2xl flex items-center justify-center shadow-sm border border-primary/10">
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-foreground italic">"Small steps everyday lead to big results."</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Remember to take regular breaks during your study sessions. A 5-minute walk can boost your productivity by 20%.
              </p>
            </div>
            <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">Read More Tips</button>
          </div>
        </div>
      </div>

      {/* Floating Mobile Nav */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] bg-foreground/95 backdrop-blur-lg border border-white/10 h-16 rounded-2xl shadow-2xl flex items-center justify-around px-4 z-[100]">
        {[
          { icon: Search, href: "/student/search" },
          { icon: MessageSquare, href: "/student/messages" },
          { icon: User, href: "/student/profile" },
        ].map((item, i) => (
          <Link key={i} href={item.href} className="p-2 rounded-xl text-white/50 hover:text-white transition-all">
            <item.icon className="w-5 h-5" />
          </Link>
        ))}
        <button className="bg-secondary text-white p-2.5 rounded-xl shadow-lg shadow-secondary/20">
          <Calendar className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
