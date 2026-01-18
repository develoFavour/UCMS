"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Star, User, Clock, ArrowRight, Loader2, Video, MapPin, X } from "lucide-react"
import { counselorService, type Counselor } from "@/services/counselor.service"
import { appointmentService } from "@/services/appointment.service"
import { toast } from "sonner" // Assuming we use sonner for premium toast

export default function SearchCounselors() {
  const [counselors, setCounselors] = useState<Counselor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpecialization, setSelectedSpecialization] = useState<string | null>(null)

  // States for Booking Flow
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null)
  const [bookingType, setBookingType] = useState<"virtual" | "physical">("virtual")
  const [bookingDate, setBookingDate] = useState("")
  const [bookingTime, setBookingTime] = useState("")
  const [isBooking, setIsBooking] = useState(false)

  useEffect(() => {
    async function fetchDocs() {
      try {
        const data = await counselorService.getCounselors()
        setCounselors(data)
      } catch (err) {
        console.error("Search fetch error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchDocs()
  }, [])

  const specializations = Array.from(
    new Set(counselors.flatMap((c) => c.specializations || []))
  )

  const filteredCounselors = counselors.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.bio?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpec = !selectedSpecialization || c.specializations?.includes(selectedSpecialization)
    return matchesSearch && matchesSpec
  })

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCounselor) return

    setIsBooking(true)
    try {
      await appointmentService.createAppointment({
        counselor_id: selectedCounselor.id,
        type: bookingType,
        scheduled_date: bookingDate,
        start_time: bookingTime,
        duration_minutes: 60
      })

      // Reset flow
      setSelectedCounselor(null)
      toast.success("Appointment request sent! Wait for approval.")
    } catch (err: any) {
      toast.error(err.message || "Booking failed")
    } finally {
      setIsBooking(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] pb-20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center px-4 py-1.5 bg-primary/10 rounded-full text-xs font-black text-primary uppercase tracking-widest animate-in fade-in slide-in-from-bottom-2">
            Professional Support
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter">
            Find the right <span className="text-primary italic">guide</span> for you.
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl font-medium">
            Connect with experienced university counselors tailored to your personal and academic success.
          </p>
        </div>

        {/* Dynamic Search & Filter Bar */}
        <div className="sticky top-4 z-40 mb-12">
          <div className="bg-white/80 backdrop-blur-xl border border-white shadow-2xl shadow-primary/10 p-2 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-2 max-w-4xl mx-auto">
            <div className="flex-1 w-full relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search by name, expertise, or bio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-transparent border-none focus:ring-0 text-foreground font-medium placeholder:text-muted-foreground/60 outline-none"
              />
            </div>

            <div className="h-10 w-[1px] bg-border hidden md:block"></div>

            <div className="flex items-center gap-2 px-2 w-full md:w-auto overflow-x-auto no-scrollbar scroll-smooth">
              <button
                onClick={() => setSelectedSpecialization(null)}
                className={`px-6 py-4 rounded-full text-xs font-bold transition-all whitespace-nowrap ${!selectedSpecialization ? 'bg-foreground text-white shadow-xl' : 'hover:bg-muted text-muted-foreground'}`}
              >
                All Expertise
              </button>
              {specializations.map(spec => (
                <button
                  key={spec}
                  onClick={() => setSelectedSpecialization(spec)}
                  className={`px-6 py-4 rounded-full text-xs font-bold transition-all whitespace-nowrap ${selectedSpecialization === spec ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'hover:bg-muted text-muted-foreground'}`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-8 px-4">
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
            {loading ? "Discovering Experts..." : `${filteredCounselors.length} Counselors Available`}
          </p>
          <button className="flex items-center gap-2 text-primary font-bold text-sm hover:underline transition-all">
            <Filter className="w-4 h-4" />
            <span>Advanced Filters</span>
          </button>
        </div>

        {/* Counselors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-[400px] bg-white rounded-[3rem] animate-pulse border border-border/50" />
            ))
          ) : filteredCounselors.length === 0 ? (
            <div className="col-span-full py-32 text-center space-y-4">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto opacity-50">
                <Search className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold">No counselors found matching your search.</h3>
              <p className="text-muted-foreground max-w-md mx-auto">Try adjusting your filters or search keywords to explore more options.</p>
              <button
                onClick={() => { setSearchTerm(""); setSelectedSpecialization(null); }}
                className="text-primary font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            filteredCounselors.map((counselor) => (
              <div
                key={counselor.id}
                className="group relative bg-white border border-border/60 p-8 rounded-[3rem] shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
              >
                {/* Visual Flair */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] translate-x-1/2 -translate-y-1/2 group-hover:bg-primary/10 transition-colors"></div>

                {/* Header: Avatar & Base Info */}
                <div className="flex items-start justify-between mb-8 relative z-10">
                  <div className="flex items-start space-x-5">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-[2rem] bg-muted overflow-hidden border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-500">
                        {counselor.profile_picture_url ? (
                          <img src={counselor.profile_picture_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10">
                            <User className="w-10 h-10 text-primary" />
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{counselor.name}</h3>
                      <div className="flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-black text-foreground">{counselor.rating}</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">({counselor.review_count} Reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Body: Bio */}
                <div className="space-y-4 mb-8">
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed line-clamp-3">
                    {counselor.bio || "No specialized biography provided. Expert in general student well-being and academic guidance."}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {counselor.specializations?.map(spec => (
                      <span key={spec} className="px-3 py-1 bg-muted rounded-full text-[10px] font-bold text-muted-foreground uppercase tracking-widest border border-border/50 group-hover:border-primary/20 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer: Action */}
                <div className="pt-6 border-t border-border/40 flex items-center justify-between mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Pricing</span>
                    <span className="text-sm font-bold text-foreground">Free for Students</span>
                  </div>
                  <button
                    onClick={() => setSelectedCounselor(counselor)}
                    className="flex items-center gap-2 bg-foreground text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-black/10 hover:bg-primary hover:shadow-primary/20 transition-all active:scale-95"
                  >
                    <span>Schedule</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Modern Booking Modal Overlay */}
      {selectedCounselor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/60 backdrop-blur-xl animate-in fade-in duration-300"
            onClick={() => setSelectedCounselor(null)}
          />
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden border border-border/50 animate-in zoom-in-95 slide-in-from-bottom-5 duration-500">
            <button
              onClick={() => setSelectedCounselor(null)}
              className="absolute top-8 right-8 p-2 hover:bg-muted rounded-full transition-colors z-20"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            <form onSubmit={handleBook} className="relative">
              {/* Modal Header */}
              <div className="p-10 pb-0 space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-3xl font-black text-foreground tracking-tighter">Request a session</h2>
                <p className="text-muted-foreground font-medium">You're booking with <span className="text-foreground font-bold">{selectedCounselor.name}</span></p>
              </div>

              <div className="p-10 space-y-8">
                {/* Session Type Select */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Session Protocol</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setBookingType('virtual')}
                      className={`flex flex-col items-center gap-3 p-5 rounded-[2rem] border-2 transition-all ${bookingType === 'virtual' ? 'border-primary bg-primary/5 ring-4 ring-primary/5' : 'border-border hover:border-border/80'}`}
                    >
                      <Video className={`w-6 h-6 ${bookingType === 'virtual' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className={`text-sm font-bold ${bookingType === 'virtual' ? 'text-primary' : 'text-muted-foreground'}`}>Virtual Meet</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookingType('physical')}
                      className={`flex flex-col items-center gap-3 p-5 rounded-[2rem] border-2 transition-all ${bookingType === 'physical' ? 'border-foreground bg-foreground/5 ring-4 ring-foreground/5' : 'border-border hover:border-border/80'}`}
                    >
                      <MapPin className={`w-6 h-6 ${bookingType === 'physical' ? 'text-foreground' : 'text-muted-foreground'}`} />
                      <span className={`text-sm font-bold ${bookingType === 'physical' ? 'text-foreground' : 'text-muted-foreground'}`}>On-Campus</span>
                    </button>
                  </div>
                </div>

                {/* Date & Time Select */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Choose Date</label>
                    <input
                      type="date"
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full p-4 bg-muted border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Preffered Time</label>
                    <input
                      type="time"
                      required
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full p-4 bg-muted border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="p-6 bg-primary/5 flex items-start gap-4 rounded-[2rem] border border-primary/10">
                  <Star className="w-5 h-5 text-primary shrink-0 mt-1" />
                  <div>
                    <p className="text-sm font-bold text-primary">Pre-session Requirement</p>
                    <p className="text-xs text-primary/70 leading-relaxed">Please ensure you're in a quiet environment and have your student ID ready for verification.</p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isBooking}
                  className="w-full py-5 bg-foreground text-white rounded-[1.5rem] font-bold text-lg flex items-center justify-center gap-3 shadow-2xl shadow-black/20 hover:bg-primary transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isBooking ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <span>Confirm Request</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
