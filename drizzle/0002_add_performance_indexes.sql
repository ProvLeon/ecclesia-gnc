-- Performance-critical indexes for analytics queries
-- Supabase-compatible migration with idempotent operations

-- Tithes table indexes
CREATE INDEX IF NOT EXISTS idx_tithes_payment_date ON tithes(payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_tithes_member_id ON tithes(member_id);
CREATE INDEX IF NOT EXISTS idx_tithes_month_year ON tithes(month_year);

-- Offerings table indexes
CREATE INDEX IF NOT EXISTS idx_offerings_service_date ON offerings(service_date DESC);
CREATE INDEX IF NOT EXISTS idx_offerings_member_id ON offerings(member_id);
CREATE INDEX IF NOT EXISTS idx_offerings_department_id ON offerings(department_id);

-- Expenses table indexes
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON expenses(expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_department_id ON expenses(department_id);

-- Attendance table indexes
CREATE INDEX IF NOT EXISTS idx_attendance_service_id ON attendance(service_id);
CREATE INDEX IF NOT EXISTS idx_attendance_member_id ON attendance(member_id);
CREATE INDEX IF NOT EXISTS idx_attendance_checked_in_at ON attendance(checked_in_at DESC);

-- Services table indexes
CREATE INDEX IF NOT EXISTS idx_services_service_date ON services(service_date DESC);
CREATE INDEX IF NOT EXISTS idx_services_department_id ON services(department_id);

-- Members table indexes
CREATE INDEX IF NOT EXISTS idx_members_join_date ON members(join_date DESC);
CREATE INDEX IF NOT EXISTS idx_members_member_status ON members(member_status);
CREATE INDEX IF NOT EXISTS idx_members_user_id ON members(user_id);

-- Member departments indexes
CREATE INDEX IF NOT EXISTS idx_member_departments_member_id ON member_departments(member_id);
CREATE INDEX IF NOT EXISTS idx_member_departments_department_id ON member_departments(department_id);
CREATE INDEX IF NOT EXISTS idx_member_departments_is_active ON member_departments(is_active);

-- Departments table indexes
CREATE INDEX IF NOT EXISTS idx_departments_is_active ON departments(is_active);
CREATE INDEX IF NOT EXISTS idx_departments_leader_id ON departments(leader_id);
