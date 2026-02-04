-- Create the department_role enum type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE department_role AS ENUM ('member', 'co_leader', 'leader');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Add role column to member_departments table if it doesn't exist
ALTER TABLE member_departments
ADD COLUMN IF NOT EXISTS role department_role NOT NULL DEFAULT 'member';

-- Create index on role for faster filtering
CREATE INDEX IF NOT EXISTS idx_member_departments_role ON member_departments(role);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_member_departments_department_role ON member_departments(department_id, role);
