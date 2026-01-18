-- University Counseling Appointment Manager - Initial Schema
-- Neon PostgreSQL Database

-- =====================================================
-- USERS TABLE (Base for all roles)
-- =====================================================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'counselor', 'admin')),
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);

-- =====================================================
-- STUDENTS TABLE
-- =====================================================
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  matric_number VARCHAR(50) UNIQUE NOT NULL,
  department VARCHAR(100),
  year_of_study INT,
  date_of_birth DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_students_matric ON students(matric_number);
CREATE INDEX idx_students_user_id ON students(user_id);

-- =====================================================
-- COUNSELORS TABLE
-- =====================================================
CREATE TABLE counselors (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profile_picture_url VARCHAR(500),
  bio TEXT,
  specializations TEXT[],
  is_approved BOOLEAN DEFAULT true,
  google_refresh_token TEXT,
  google_calendar_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_counselors_user_id ON counselors(user_id);
CREATE INDEX idx_counselors_approved ON counselors(is_approved);

-- =====================================================
-- COUNSELOR AVAILABILITY (Weekly Schedule)
-- =====================================================
CREATE TABLE counselor_availability (
  id SERIAL PRIMARY KEY,
  counselor_id INT NOT NULL REFERENCES counselors(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(counselor_id, day_of_week)
);

CREATE INDEX idx_availability_counselor ON counselor_availability(counselor_id);

-- =====================================================
-- APPOINTMENTS TABLE
-- =====================================================
CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  counselor_id INT NOT NULL REFERENCES counselors(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
  type VARCHAR(20) NOT NULL CHECK (type IN ('virtual', 'physical')),
  scheduled_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INT NOT NULL,
  meet_link VARCHAR(500),
  google_event_id VARCHAR(500),
  
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP,
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  cancelled_by VARCHAR(20) CHECK (cancelled_by IN ('student', 'counselor')),
  cancellation_reason TEXT,
  
  no_show BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_appointments_student ON appointments(student_id);
CREATE INDEX idx_appointments_counselor ON appointments(counselor_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_date ON appointments(scheduled_date);

-- =====================================================
-- APPOINTMENT REVIEWS
-- =====================================================
CREATE TABLE appointment_reviews (
  id SERIAL PRIMARY KEY,
  appointment_id INT UNIQUE NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  counselor_id INT NOT NULL REFERENCES counselors(id) ON DELETE CASCADE,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_appointment ON appointment_reviews(appointment_id);
CREATE INDEX idx_reviews_counselor ON appointment_reviews(counselor_id);

-- =====================================================
-- COUNSELOR NOTES (Student-specific, Confidential)
-- =====================================================
CREATE TABLE counselor_notes (
  id SERIAL PRIMARY KEY,
  counselor_id INT NOT NULL REFERENCES counselors(id) ON DELETE CASCADE,
  student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  appointment_id INT REFERENCES appointments(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notes_counselor_student ON counselor_notes(counselor_id, student_id);
CREATE INDEX idx_notes_appointment ON counselor_notes(appointment_id);

-- =====================================================
-- MESSAGES (DM between Student & Counselor)
-- =====================================================
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  appointment_id INT NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  sender_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_role VARCHAR(20) NOT NULL CHECK (sender_role IN ('student', 'counselor')),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_appointment ON messages(appointment_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at);

-- =====================================================
-- MESSAGE ATTACHMENTS
-- =====================================================
CREATE TABLE message_attachments (
  id SERIAL PRIMARY KEY,
  message_id INT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  file_url VARCHAR(500) NOT NULL,
  file_name VARCHAR(255),
  file_size_bytes INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attachments_message ON message_attachments(message_id);

-- =====================================================
-- ADMIN INVITATIONS
-- =====================================================
CREATE TABLE admin_invitations (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('counselor', 'admin')),
  token VARCHAR(500) UNIQUE NOT NULL,
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invitations_email ON admin_invitations(email);
CREATE INDEX idx_invitations_token ON admin_invitations(token);

-- =====================================================
-- COMPREHENSIVE AUDIT LOG
-- =====================================================
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  actor_id INT REFERENCES users(id) ON DELETE SET NULL,
  actor_role VARCHAR(50),
  action VARCHAR(100),
  entity_type VARCHAR(50),
  entity_id INT,
  changes JSONB,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- =====================================================
-- CALENDAR SYNC TRACKING
-- =====================================================
CREATE TABLE calendar_syncs (
  id SERIAL PRIMARY KEY,
  counselor_id INT NOT NULL REFERENCES counselors(id) ON DELETE CASCADE,
  appointment_id INT NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  google_calendar_id VARCHAR(500),
  synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(counselor_id, appointment_id)
);

CREATE INDEX idx_sync_counselor ON calendar_syncs(counselor_id);
CREATE INDEX idx_sync_appointment ON calendar_syncs(appointment_id);
