-- Optional: Seed some sample data for testing

-- Insert admin user
INSERT INTO users (email, password_hash, role, full_name, phone, is_active)
VALUES (
  'admin@university.edu',
  'salt:hash', -- TODO: Replace with actual hash
  'admin',
  'System Administrator',
  '+1234567890',
  true
) ON CONFLICT DO NOTHING;

-- Insert sample counselors
INSERT INTO users (email, password_hash, role, full_name, phone, is_active)
VALUES
  (
    'dr.smith@university.edu',
    'salt:hash',
    'counselor',
    'Dr. James Smith',
    '+1234567891',
    true
  ),
  (
    'dr.johnson@university.edu',
    'salt:hash',
    'counselor',
    'Dr. Sarah Johnson',
    '+1234567892',
    true
  )
ON CONFLICT DO NOTHING;

-- Insert sample students
INSERT INTO users (email, password_hash, role, full_name, phone, is_active)
VALUES
  (
    'john.doe@student.university.edu',
    'salt:hash',
    'student',
    'John Doe',
    '+1234567893',
    true
  ),
  (
    'jane.smith@student.university.edu',
    'salt:hash',
    'student',
    'Jane Smith',
    '+1234567894',
    true
  )
ON CONFLICT DO NOTHING;
