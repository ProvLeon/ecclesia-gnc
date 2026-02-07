-- Create department_leader_role enum if not exists
DO $$ BEGIN
    CREATE TYPE department_leader_role AS ENUM ('president', 'vice_president', 'secretary', 'treasurer', 'coordinator');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create department_leaders table
CREATE TABLE IF NOT EXISTS department_leaders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    role department_leader_role NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    assigned_date DATE NOT NULL,
    assigned_by UUID REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE(department_id, member_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_department_leaders_department_id ON department_leaders(department_id);
CREATE INDEX IF NOT EXISTS idx_department_leaders_member_id ON department_leaders(member_id);
