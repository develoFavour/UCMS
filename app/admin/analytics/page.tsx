"use client"

import { Navbar } from "@/components/shared/navbar"

export default function Analytics() {
  return (
    <div className="min-h-screen bg-muted">
      <Navbar userRole="admin" userName="Admin" />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">System Analytics</h1>
          <p className="text-muted-foreground">Detailed insights and performance metrics</p>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Appointment Trends */}
          <div className="card-base p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Appointment Trends</h2>
            <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Chart placeholder</p>
            </div>
          </div>

          {/* Department Distribution */}
          <div className="card-base p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Students by Department</h2>
            <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Chart placeholder</p>
            </div>
          </div>

          {/* Counselor Performance */}
          <div className="card-base p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Counselor Performance</h2>
            <div className="space-y-3">
              {["Dr. Smith", "Dr. Johnson", "Dr. Williams"].map((name) => (
                <div key={name} className="flex items-center justify-between">
                  <span className="text-foreground">{name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full">
                      <div className="h-full bg-secondary rounded-full" style={{ width: "85%" }}></div>
                    </div>
                    <span className="text-sm text-muted-foreground">4.5★</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Session Statistics */}
          <div className="card-base p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Session Statistics</h2>
            <div className="space-y-4">
              {[
                { label: "Total Sessions", value: "2,458", change: "+12%" },
                { label: "Completion Rate", value: "94%", change: "+3%" },
                { label: "No-Show Rate", value: "6%", change: "-2%" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center justify-between pb-3 border-b border-border last:border-b-0"
                >
                  <span className="text-foreground">{stat.label}</span>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{stat.value}</p>
                    <p className="text-xs text-secondary">{stat.change}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
