"use client"

import { useState } from "react"
import { Navbar } from "@/components/shared/navbar"

export default function ManageStudents() {
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState<any>(null)

  return (
    <div className="min-h-screen bg-muted">
      <Navbar userRole="counselor" />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-foreground mb-8">My Students</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Students List */}
          <div className="card-base p-4">
            <h2 className="font-semibold text-foreground mb-4">Students ({students.length})</h2>
            <div className="space-y-2">
              {students.map((student: any) => (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedStudent?.id === student.id ? "bg-primary text-white" : "hover:bg-muted text-foreground"
                  }`}
                >
                  <p className="font-medium">{student.name}</p>
                  <p className="text-xs opacity-75">{student.matric_number}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Student Details & Notes */}
          <div className="lg:col-span-2">
            {selectedStudent ? (
              <div className="card-base p-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">{selectedStudent.name}</h2>
                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-xs text-muted-foreground">Matric Number</p>
                    <p className="font-medium">{selectedStudent.matric_number}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Department</p>
                    <p className="font-medium">{selectedStudent.department}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Sessions Completed</p>
                    <p className="font-medium">{selectedStudent.sessions_completed}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">Notes</h3>
                  <textarea
                    placeholder="Add notes about this student..."
                    className="input-base h-32"
                    defaultValue={selectedStudent.notes || ""}
                  />
                  <button className="btn-primary w-full mt-2">Save Notes</button>
                </div>
              </div>
            ) : (
              <div className="card-base p-12 text-center text-muted-foreground">Select a student to view details</div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
