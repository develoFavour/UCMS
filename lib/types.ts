// =====================================================
// User Types
// =====================================================
export type UserRole = "student" | "counselor" | "admin"

export interface User {
  id: number
  email: string
  role: UserRole
  full_name: string
  phone?: string
  is_active: boolean
  created_at: string
}

export interface Student extends User {
  matric_number: string
  department?: string
  year_of_study?: number
  date_of_birth?: string
}

export interface Counselor extends User {
  profile_picture_url?: string
  bio?: string
  specializations: string[]
  is_approved: boolean
  availability?: CounselorAvailability[]
}

// =====================================================
// Appointment Types
// =====================================================
export type AppointmentStatus = "pending" | "approved" | "rejected" | "completed" | "cancelled"
export type AppointmentType = "virtual" | "physical"

export interface Appointment {
  id: number
  student_id: number
  counselor_id: number
  status: AppointmentStatus
  type: AppointmentType
  scheduled_date: string
  start_time: string
  end_time: string
  duration_minutes: number
  meet_link?: string
  google_event_id?: string
  requested_at: string
  approved_at?: string
  completed_at?: string
  cancelled_at?: string
  cancelled_by?: "student" | "counselor"
  cancellation_reason?: string
  no_show: boolean
}

export interface AppointmentReview {
  id: number
  appointment_id: number
  student_id: number
  counselor_id: number
  rating: number
  review_text?: string
  created_at: string
}

// =====================================================
// Availability & Scheduling
// =====================================================
export interface CounselorAvailability {
  id: number
  counselor_id: number
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
}

// =====================================================
// Communication Types
// =====================================================
export interface Message {
  id: number
  appointment_id: number
  sender_id: number
  sender_role: "student" | "counselor"
  content: string
  created_at: string
}

export interface MessageAttachment {
  id: number
  message_id: number
  file_url: string
  file_name?: string
  file_size_bytes?: number
  created_at: string
}

// =====================================================
// Notes & Admin
// =====================================================
export interface CounselorNotes {
  id: number
  counselor_id: number
  student_id: number
  appointment_id?: number
  content: string
  created_at: string
  updated_at: string
}

export interface AuditLog {
  id: number
  actor_id?: number
  actor_role?: string
  action: string
  entity_type: string
  entity_id?: number
  changes?: any
  ip_address?: string
  created_at: string
}

export interface AdminInvitation {
  id: number
  email: string
  role: "counselor" | "admin"
  token: string
  used: boolean
  expires_at: string
  created_at: string
}
