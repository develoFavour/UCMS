"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Users,
  Calendar,
  Clock,
  Bell,
  CheckCircle2,
  ChevronRight,
  Plus,
  MessageSquare,
  MoreVertical,
  ArrowUpRight,
  UserCheck,
  Video,
  MapPin
} from "lucide-react"
import { authService } from "@/services/auth.service"
import { appointmentService } from "@/services/appointment.service"
import { statsService } from "@/services/stats.service"
import { useAuthStore } from "@/store/auth.store"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"

const SPECIALIZATIONS = [
  "Mental Health", "Academic Stress", "Career Guidance",
  "Relationship Issues", "Anxiety & Depression", "Time Management",
  "Grief Counseling", "Addiction Support", "Personal Development"
]

export default function CounselorDashboard() {
  const { user } = useAuthStore()
  const [appointments, setAppointments] = useState([])
  const [stats, setStats] = useState({ pending_requests: 0, completed_sessions: 0, total_students: 0 })
  const [loading, setLoading] = useState(true)

  // Setup State
  const [isSetupOpen, setIsSetupOpen] = useState(false)
  const [setupStep, setSetupStep] = useState(1)
  const [setupData, setSetupData] = useState({
    bio: "",
    specializations: [] as string[]
  })
  const [savingSetup, setSavingSetup] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const [aptData, statsData, meData] = await Promise.all([
          appointmentService.getAppointments(),
          statsService.getStats(),
          authService.getMe()
        ])
        setAppointments(aptData)
        setStats(statsData)

        // Check if setup is needed
        if (!meData.details?.bio || !meData.details?.specializations || meData.details.specializations.length === 0) {
          setIsSetupOpen(true)
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  async function handleSetupSubmit() {
    if (setupStep < 2) {
      setSetupStep(prev => prev + 1)
      return
    }

    if (!setupData.bio || setupData.specializations.length === 0) {
      toast.error("Please complete all sections")
      return
    }

    setSavingSetup(true)
    try {
      await authService.updateCounselorProfile(setupData)
      toast.success("Profile setup complete! Welcome aboard.")
      setIsSetupOpen(false)
    } catch (error) {
      toast.error("Failed to save profile. Please try again.")
    } finally {
      setSavingSetup(false)
    }
  }

  const toggleSpecialization = (spec: string) => {
    setSetupData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec]
    }))
  }

  const todayStr = new Date().toISOString().split('T')[0]
  const todayAppointments = appointments.filter((apt: any) => apt.scheduled_date.startsWith(todayStr))

  // Extract unique students for the directory quick access
  const uniqueStudents = Array.from(new Set(appointments.map((a: any) => a.student_name)))
    .slice(0, 4)
    .map(name => ({ name, initial: name[0] }))

  return (
    <div className="space-y-10">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 md:mb-14 gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">
            Welcome back, {user?.full_name || 'Counselor'}
          </h1>
          <p className="text-muted-foreground text-sm md:text-lg">
            Manage your sessions and connect with your students.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/counselor/schedule"
            className="flex items-center space-x-2 bg-muted text-foreground px-5 py-3 rounded-2xl font-bold hover:bg-muted-foreground/10 transition-all active:scale-95 text-sm"
          >
            <Calendar className="w-4 h-4" />
            <span>Manage Availability</span>
          </Link>
        </div>
      </div>

      {/* Dynamic Analytics & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {/* Main Stat Card - Requests */}
        <Link href="/counselor/requests" className="md:col-span-2 group relative overflow-hidden bg-foreground text-white p-6 rounded-[2.5rem] shadow-xl hover:-translate-y-1 transition-all">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-accent" />
              </div>
              {stats.pending_requests > 0 && (
                <div className="bg-accent text-foreground px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Action Required
                </div>
              )}
            </div>
            <div>
              <div className="text-4xl font-bold mb-1">{stats.pending_requests} Pending Requests</div>
              <p className="text-white/60 text-sm font-medium">Students are waiting for your response.</p>
            </div>
            <div className="mt-6 flex items-center text-accent font-bold text-sm">
              <span>View All Requests</span>
              <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2 group-hover:bg-primary/40 transition-all duration-700"></div>
        </Link>

        {/* Simple Stat Cards */}
        <div className="bg-card border border-border/60 p-6 rounded-[2.5rem] shadow-sm flex flex-col justify-between hover:border-primary/20 transition-all">
          <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center mb-4">
            <Users className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <div className="text-3xl font-bold text-foreground tracking-tight">{stats.total_students}</div>
            <div className="text-xs uppercase tracking-widest font-bold text-muted-foreground mt-1">Total Students</div>
          </div>
        </div>

        <div className="bg-card border border-border/60 p-6 rounded-[2.5rem] shadow-sm flex flex-col justify-between hover:border-primary/20 transition-all">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
            <CheckCircle2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="text-3xl font-bold text-foreground tracking-tight">{stats.completed_sessions}</div>
            <div className="text-xs uppercase tracking-widest font-bold text-muted-foreground mt-1">Sessions Held</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Schedule Section - Left 2/3 */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center space-x-2">
              <span>Today's Schedule</span>
              {todayAppointments.length > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 bg-secondary/10 text-secondary rounded-full uppercase tracking-tighter">Current</span>
              )}
            </h2>
            <div className="text-sm font-bold text-muted-foreground">{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(i => <div key={i} className="h-32 bg-muted/20 rounded-[2rem] animate-pulse" />)}
            </div>
          ) : todayAppointments.length === 0 ? (
            <div className="bg-muted/10 border-2 border-dashed border-border p-16 rounded-[2.5rem] text-center space-y-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Clock className="w-8 h-8 text-muted" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-foreground text-lg">No appointments today</p>
                <p className="text-sm text-muted-foreground">Catch up on notes or review student records.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {todayAppointments.map((apt: any) => (
                <div key={apt.id} className="bg-card border border-border/60 p-6 rounded-[2.5rem] shadow-sm hover:shadow-md transition-all group overflow-hidden relative border-l-[6px] border-l-primary/10 hover:border-l-primary duration-300">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="md:w-32 flex flex-col items-start md:items-center justify-center md:border-r border-border md:pr-6 gap-1">
                      <div className="text-xl font-bold text-foreground tracking-tighter">{apt.start_time.slice(0, 5)}</div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-2 py-0.5 rounded-full">{apt.duration_minutes} min</div>
                    </div>

                    <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center overflow-hidden">
                          <span className="text-lg font-bold text-muted-foreground">{apt.student_name[0]}</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground">{apt.student_name}</h3>
                          <div className="flex items-center text-sm text-muted-foreground space-x-3 mt-0.5">
                            <span className={`flex items-center font-bold ${apt.type === 'virtual' ? 'text-primary' : 'text-secondary'}`}>
                              {apt.type === 'virtual' ? <><Video className="w-3.5 h-3.5 mr-1" /> Virtual</> : <><MapPin className="w-3.5 h-3.5 mr-1" /> Physical</>}
                            </span>
                            <span className="text-muted-foreground/50">|</span>
                            <span className="font-medium text-xs uppercase tracking-wider">{apt.status}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/counselor/appointments/${apt.id}`}
                          className="px-6 py-3 bg-foreground text-white rounded-2xl text-xs font-bold hover:shadow-lg transition-all"
                        >
                          Manage
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Student Records Quick Access */}
          <div className="bg-muted/10 p-8 rounded-[3rem] border border-border/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <h3 className="text-xl font-bold flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-secondary" />
                <span>Recent Students</span>
              </h3>
              <Link href="/counselor/students" className="text-sm font-bold text-muted-foreground hover:text-foreground">View Directory</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {uniqueStudents.map((s, i) => (
                <div key={i} className="bg-card p-4 rounded-[2rem] text-center space-y-2 border border-border hover:border-secondary/20 transition-all cursor-pointer group shadow-sm">
                  <div className="w-14 h-14 rounded-full bg-muted mx-auto flex items-center justify-center transition-transform group-hover:scale-105">
                    <span className="text-lg font-bold text-muted-foreground">{s.initial}</span>
                  </div>
                  <div className="font-bold text-sm">{s.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Area - Right 1/3 */}
        <div className="space-y-10">
          {/* counselor Profile Preview */}
          <div className="bg-card border border-border/60 p-8 rounded-[2.5rem] shadow-sm space-y-6 text-center">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full bg-muted mx-auto border-4 border-background shadow-md overflow-hidden">
                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-10 h-10 text-primary" />
                </div>
              </div>
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-secondary border-4 border-background rounded-full"></div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">{user?.full_name || 'Counselor'}</h3>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Lead Counselor</p>
            </div>
            <div className="flex items-center justify-center space-x-2 px-4 py-2 bg-muted rounded-2xl text-[10px] font-bold text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>ACTIVE • 09:00 - 17:00</span>
            </div>
            <Link href="/counselor/profile" className="block w-full py-4 text-sm font-bold border border-border rounded-2xl hover:bg-muted transition-all">Edit Public Profile</Link>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg px-2">Knowledge Base</h3>
            <div className="bg-secondary/5 border border-secondary/10 p-6 rounded-[2.5rem] space-y-4 shadow-sm">
              <div className="w-12 h-12 bg-card rounded-2xl flex items-center justify-center shadow-sm border border-secondary/10">
                <MessageSquare className="w-6 h-6 text-secondary" />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-foreground text-sm">Guidelines for Sessions</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Always review the student's history and previous notes before joining a live session.
                </p>
              </div>
              <button className="text-[10px] font-bold text-secondary uppercase tracking-widest hover:underline">Download Handbook</button>
            </div>
          </div>
        </div>
      </div>
      {/* Setup Modal */}
      <Dialog open={isSetupOpen} onOpenChange={() => { }}>
        <DialogContent className="sm:max-w-xl bg-background border-border/50 rounded-[2.5rem] p-10 outline-none">
          <DialogHeader className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center font-black text-primary text-xl">
                {setupStep}
              </div>
              <div>
                <DialogTitle className="text-3xl font-black tracking-tight">
                  {setupStep === 1 ? "Professional Intro" : "Your Expertise"}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground font-medium text-lg">
                  {setupStep === 1
                    ? "Tell students a bit about your background and counseling philosophy."
                    : "Select the areas you specialize in to help students find you."}
                </DialogDescription>
              </div>
            </div>

            {/* Step Indicator */}
            <div className="flex gap-2 pt-2">
              <div className={`h-1.5 flex-1 rounded-full ${setupStep >= 1 ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`h-1.5 flex-1 rounded-full ${setupStep >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            </div>
          </DialogHeader>

          <div className="py-8">
            {setupStep === 1 ? (
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Short Biography</label>
                <textarea
                  value={setupData.bio}
                  onChange={(e) => setSetupData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="e.g. Dedicated counselor with 10 years experience in student well-being..."
                  className="w-full h-40 p-6 bg-muted/50 border-none rounded-[1.5rem] text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Specializations (Select at least 1)</label>
                <div className="grid grid-cols-2 gap-3">
                  {SPECIALIZATIONS.map((spec) => (
                    <button
                      key={spec}
                      onClick={() => toggleSpecialization(spec)}
                      className={`p-4 rounded-2xl border text-xs font-bold transition-all text-left flex items-center justify-between group ${setupData.specializations.includes(spec)
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'bg-card border-border hover:border-primary/50 text-muted-foreground'
                        }`}
                    >
                      {spec}
                      {setupData.specializations.includes(spec) && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3">
            {setupStep > 1 && (
              <button
                onClick={() => setSetupStep(1)}
                className="px-8 py-4 rounded-[1.5rem] text-sm font-bold border border-border hover:bg-muted transition-all"
              >
                Back
              </button>
            )}
            <button
              onClick={handleSetupSubmit}
              disabled={savingSetup}
              className="flex-1 px-8 py-4 bg-primary text-primary-foreground rounded-[1.5rem] text-sm font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {savingSetup ? "Saving Profile..." : setupStep === 1 ? "Next Step" : "Complete Setup"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
