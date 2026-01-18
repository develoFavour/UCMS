"use client"

import { useState } from "react"
import { Navbar } from "@/components/shared/navbar"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

export default function ManageSchedule() {
  const [availability, setAvailability] = useState({
    Monday: { start: "09:00", end: "17:00", active: true },
    Tuesday: { start: "09:00", end: "17:00", active: true },
    Wednesday: { start: "09:00", end: "17:00", active: true },
    Thursday: { start: "09:00", end: "17:00", active: true },
    Friday: { start: "09:00", end: "17:00", active: true },
  })

  const handleChange = (day: string, field: string, value: string | boolean) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: { ...prev[day as keyof typeof prev], [field]: value },
    }))
  }

  const handleSave = async () => {
    // TODO: Call API to save availability
    console.log("Saving availability:", availability)
  }

  return (
    <div className="min-h-screen bg-muted">
      <Navbar userRole="counselor" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Manage Your Schedule</h1>
          <p className="text-muted-foreground">Set your weekly availability for appointments</p>
        </div>

        <div className="card-base p-6">
          <div className="space-y-4">
            {DAYS.map((day) => (
              <div key={day} className="flex items-center gap-4 pb-4 border-b border-border last:border-b-0">
                <div className="w-24">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={availability[day as keyof typeof availability].active}
                      onChange={(e) => handleChange(day, "active", e.target.checked)}
                      className="w-4 h-4 rounded border-border"
                    />
                    <span className="font-medium text-foreground">{day}</span>
                  </label>
                </div>

                {availability[day as keyof typeof availability].active && (
                  <div className="flex-1 flex gap-4 items-center">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Start Time</label>
                      <input
                        type="time"
                        value={availability[day as keyof typeof availability].start}
                        onChange={(e) => handleChange(day, "start", e.target.value)}
                        className="input-base"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">End Time</label>
                      <input
                        type="time"
                        value={availability[day as keyof typeof availability].end}
                        onChange={(e) => handleChange(day, "end", e.target.value)}
                        className="input-base"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button onClick={handleSave} className="btn-primary w-full mt-6">
            Save Schedule
          </button>
        </div>
      </main>
    </div>
  )
}
