"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/shared/navbar"

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([])
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming")

  useEffect(() => {
    // TODO: Fetch appointments from API
  }, [])

  return (
    <div className="min-h-screen bg-muted">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">My Appointments</h1>
          <p className="text-muted-foreground">Manage your counseling sessions</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "upcoming"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "past"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Past
          </button>
        </div>

        {/* Appointments List */}
        {appointments.length === 0 ? (
          <div className="card-base p-12 text-center">
            <p className="text-muted-foreground mb-4">No {activeTab} appointments</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((apt: any) => (
              <div key={apt.id} className="card-base p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground">{apt.counselor_name}</h3>
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <p>📅 {apt.scheduled_date}</p>
                      <p>
                        🕒 {apt.start_time} - {apt.end_time}
                      </p>
                      <p>{apt.type === "virtual" ? "🎥 Virtual Meeting" : "📍 Physical Location"}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold text-center ${
                        apt.status === "approved"
                          ? "bg-secondary/10 text-secondary"
                          : apt.status === "pending"
                            ? "bg-warning/10 text-warning"
                            : apt.status === "cancelled"
                              ? "bg-error/10 text-error"
                              : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {apt.status}
                    </span>
                    {apt.status === "pending" && <button className="btn-outline text-sm">Cancel Request</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
