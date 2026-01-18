"use client"

import { useState, useEffect } from "react"
import {
  Users,
  UserPlus,
  Search,
  MoreHorizontal,
  Mail,
  Star,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUpRight,
  X,
  Filter
} from "lucide-react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/shared/app-sidebar"
import { adminService, type AdminCounselor } from "@/services/admin.service"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useAuthStore } from "@/store/auth.store"

export default function ManageCounselors() {
  const { user } = useAuthStore()
  const [counselors, setCounselors] = useState<AdminCounselor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviting, setInviting] = useState(false)

  useEffect(() => {
    fetchCounselors()
  }, [])

  async function fetchCounselors() {
    try {
      const data = await adminService.getCounselors()
      setCounselors(data)
    } catch (error) {
      toast.error("Failed to load counselors")
    } finally {
      setLoading(false)
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviting(true)
    try {
      await adminService.inviteCounselor(inviteEmail)
      toast.success("Invitation sent successfully!")
      setIsInviteOpen(false)
      setInviteEmail("")
      fetchCounselors() // Refresh the list
    } catch (error: any) {
      toast.error(error.message || "Failed to send invitation")
    } finally {
      setInviting(false)
    }
  }

  const filteredCounselors = counselors.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = {
    total: counselors.length,
    active: counselors.filter(c => c.status === 'active').length,
    pending: counselors.filter(c => c.status === 'pending').length,
    avgRating: counselors.length > 0
      ? (counselors.reduce((acc, curr) => acc + curr.rating, 0) / counselors.length).toFixed(1)
      : "0.0"
  }

  return (
    <div className="space-y-8">
      {/* Page Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">
            Counselor <span className="text-primary italic">Roster</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-lg font-medium mt-1">
            Monitor performance and maintain organizational health.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center px-4 py-2 bg-muted/50 rounded-2xl border border-border/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <Search className="w-4 h-4 text-muted-foreground mr-2" />
            <input
              type="text"
              placeholder="Find counselor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-xs outline-none w-32 md:w-48 font-bold"
            />
          </div>
          <button
            onClick={() => setIsInviteOpen(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl text-sm font-black hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95 whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite New</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Counselors", value: stats.total, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Active Now", value: stats.active, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "Pending Invites", value: stats.pending, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Average Rating", value: `★ ${stats.avgRating}`, icon: Star, color: "text-primary", bg: "bg-primary/10" },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border/50 p-6 rounded-[2rem] flex items-center gap-4 shadow-sm hover:shadow-md transition-all group">
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-foreground mt-0.5">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Counselor Table Section */}
      <div className="bg-card border border-border/50 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Counselor Roster</h2>
            <p className="text-sm text-muted-foreground mt-1 text-bold">Monitor performance and enrollment status.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2.5 rounded-xl border border-border hover:bg-muted transition-colors">
              <Filter className="w-4 h-4" />
            </button>
            <button className="p-2.5 rounded-xl border border-border hover:bg-muted transition-colors">
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Counselor</th>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Specialization</th>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Workload</th>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Rating</th>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Status</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-8 py-6">
                      <div className="h-10 bg-muted rounded-2xl w-full"></div>
                    </td>
                  </tr>
                ))
              ) : filteredCounselors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="max-w-xs mx-auto space-y-4">
                      <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">No counselors found</h3>
                        <p className="text-sm text-muted-foreground italic">Try adjusting your search or invite a new counselor.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCounselors.map((counselor) => (
                  <tr key={counselor.id} className="hover:bg-muted/20 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary border border-primary/20 shadow-inner group-hover:scale-105 transition-transform">
                          {counselor.name.charAt(0)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-black text-foreground text-sm truncate">{counselor.name}</span>
                          <span className="text-xs text-muted-foreground font-medium truncate">{counselor.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-wrap gap-1.5">
                        {counselor.specializations?.slice(0, 2).map((s, j) => (
                          <span key={j} className="px-2.5 py-1 bg-muted rounded-lg text-[10px] font-bold text-muted-foreground border border-border/50">
                            {s}
                          </span>
                        )) || (
                            <span className="text-[10px] font-bold text-muted-foreground/40 italic uppercase tracking-tighter">No Specialization</span>
                          )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-black text-foreground">{counselor.total_students} Sessions</span>
                        <div className="w-24 h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${Math.min((counselor.total_students / 100) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-primary fill-primary" />
                        <span className="font-black text-sm">{counselor.rating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${counselor.status === 'active'
                        ? 'bg-green-500/10 text-green-500'
                        : counselor.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-error/10 text-error'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${counselor.status === 'active' ? 'bg-green-500' : 'bg-amber-500'
                          }`} />
                        {counselor.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-2 hover:bg-muted rounded-xl transition-all">
                        <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="sm:max-w-md bg-background border-border/50 rounded-[2.5rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tight flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              Invite Counselor
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium pt-2 text-lg">
              Send an invitation link to a verified counselor. They will be required to set their password on first login.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleInvite} className="space-y-6 pt-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="counselor@university.edu"
                  className="w-full pl-14 pr-6 py-5 bg-muted/50 border-none rounded-[1.5rem] text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <button
                type="button"
                onClick={() => setIsInviteOpen(false)}
                className="px-6 py-4 rounded-2xl text-sm font-bold hover:bg-muted transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={inviting}
                className="flex-1 px-6 py-4 bg-primary text-primary-foreground rounded-2xl text-sm font-bold hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {inviting ? (
                  <Clock className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                {inviting ? "Sending..." : "Send Invitation Link"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
