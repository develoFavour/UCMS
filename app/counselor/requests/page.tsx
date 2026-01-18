"use client"

import { useState } from "react"
import { Navbar } from "@/components/shared/navbar"

type RequestStatus = "pending" | "approved" | "rejected"

export default function AppointmentRequests() {
  const [requests, setRequests] = useState<any[]>([])
  const [activeStatus, setActiveStatus] = useState<RequestStatus>("pending")

  const filteredRequests = requests.filter((r) => r.status === activeStatus)

  const handleApprove = (requestId: number) => {
    setRequests(requests.map((r) => (r.id === requestId ? { ...r, status: "approved" } : r)))
    // TODO: Call API to approve
  }

  const handleReject = (requestId: number) => {
    setRequests(requests.map((r) => (r.id === requestId ? { ...r, status: "rejected" } : r)))
    // TODO: Call API to reject
  }

  return (
    <div className="min-h-screen bg-muted">
      <Navbar userRole="counselor" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Appointment Requests</h1>
          <p className="text-muted-foreground">Review and manage appointment booking requests</p>
        </div>

        {/* Status Tabs */}
        <div className="flex space-x-4 mb-8 border-b border-border">
          {(["pending", "approved", "rejected"] as RequestStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              className={`px-4 py-3 font-medium border-b-2 transition-colors capitalize ${
                activeStatus === status
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="card-base p-12 text-center">
            <p className="text-muted-foreground">No {activeStatus} requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div key={request.id} className="card-base p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground">{request.student_name}</h3>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <p>📅 {request.requested_date}</p>
                      <p>🕒 {request.requested_time}</p>
                      <p>{request.type === "virtual" ? "🎥 Virtual" : "📍 Physical"}</p>
                      <p>⏱️ {request.duration} minutes</p>
                    </div>
                  </div>

                  {activeStatus === "pending" && (
                    <div className="flex gap-2 w-full md:w-auto">
                      <button
                        onClick={() => handleApprove(request.id)}
                        className="flex-1 md:flex-none px-4 py-2 bg-secondary text-white rounded-lg font-medium hover:bg-secondary-dark transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        className="flex-1 md:flex-none px-4 py-2 border-2 border-error text-error rounded-lg font-medium hover:bg-error/10 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
