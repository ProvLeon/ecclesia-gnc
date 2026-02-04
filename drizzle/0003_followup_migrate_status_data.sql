-- Safe migration for follow-up feature
-- This migration handles partially-applied changes gracefully

-- Step 1: Convert status column to text to allow any value
ALTER TABLE "follow_ups" ALTER COLUMN "status" SET DATA TYPE text;

-- Step 2: Update existing status values to new enum values
-- Map old statuses to new statuses:
-- 'scheduled' -> 'pending'
-- 'completed' -> 'completed'
UPDATE "follow_ups" SET "status" = 'pending' WHERE "status" = 'scheduled';

-- Step 3: Create new follow_up_status enum (drop old one first if it exists)
DROP TYPE IF EXISTS "public"."follow_up_status" CASCADE;
CREATE TYPE "public"."follow_up_status" AS ENUM('pending', 'assigned', 'in_progress', 'completed', 'cancelled');

-- Step 4: Convert status column to new enum type
ALTER TABLE "follow_ups" ALTER COLUMN "status" TYPE "public"."follow_up_status" USING "status"::"public"."follow_up_status";
ALTER TABLE "follow_ups" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."follow_up_status";

-- Step 5: Create new enum types (only if they don't exist)
DO $$ BEGIN
  CREATE TYPE "public"."audit_action" AS ENUM('created', 'assigned', 'status_changed', 'completed', 'cancelled', 'notes_added');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."follow_up_outcome" AS ENUM('contacted', 'not_home', 'left_message', 'promised_action', 'resolved', 'escalated', 'no_contact');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."follow_up_priority" AS ENUM('low', 'medium', 'high', 'urgent');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."reminder_type" AS ENUM('email', 'sms', 'in_app');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Step 6: Add new enum values to follow_up_type (safely)
DO $$ BEGIN
  ALTER TYPE "public"."follow_up_type" ADD VALUE 'new_member' BEFORE 'phone_call';
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TYPE "public"."follow_up_type" ADD VALUE 'absence' BEFORE 'phone_call';
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TYPE "public"."follow_up_type" ADD VALUE 'pastoral_care' BEFORE 'phone_call';
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TYPE "public"."follow_up_type" ADD VALUE 'prayer_request' BEFORE 'phone_call';
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TYPE "public"."follow_up_type" ADD VALUE 'discipleship' BEFORE 'phone_call';
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TYPE "public"."follow_up_type" ADD VALUE 'other';
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Step 7: Create follow_up_audit_log table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS "follow_up_audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"follow_up_id" uuid NOT NULL,
	"action" "audit_action" NOT NULL,
	"changed_by" uuid NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"action_date" timestamp DEFAULT now() NOT NULL
);

-- Step 8: Create follow_up_reminders table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS "follow_up_reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"follow_up_id" uuid NOT NULL,
	"reminder_date" date NOT NULL,
	"reminder_type" "reminder_type" NOT NULL,
	"is_sent" boolean DEFAULT false NOT NULL,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Step 9: Create follow_up_templates table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS "follow_up_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"department_id" uuid,
	"name" varchar(255) NOT NULL,
	"description" text,
	"follow_up_type" "follow_up_type" NOT NULL,
	"suggested_questions" jsonb,
	"duration_minutes" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Step 10: Make follow_up_type and scheduled_date NOT NULL
ALTER TABLE "follow_ups" ALTER COLUMN "follow_up_type" SET NOT NULL;
ALTER TABLE "follow_ups" ALTER COLUMN "scheduled_date" SET NOT NULL;

-- Step 11: Add audit tracking columns to follow_ups
ALTER TABLE "follow_ups" ADD COLUMN IF NOT EXISTS "created_by" uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE "follow_ups" ADD COLUMN IF NOT EXISTS "assigned_by" uuid;
ALTER TABLE "follow_ups" ADD COLUMN IF NOT EXISTS "completed_by" uuid;

-- Step 12: Add content columns to follow_ups
ALTER TABLE "follow_ups" ADD COLUMN IF NOT EXISTS "title" varchar(255) NOT NULL DEFAULT 'Follow-up';
ALTER TABLE "follow_ups" ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE "follow_ups" ADD COLUMN IF NOT EXISTS "due_date" date;

-- Step 13: Add follow-up management columns to follow_ups
ALTER TABLE "follow_ups" ADD COLUMN IF NOT EXISTS "priority" "follow_up_priority" DEFAULT 'medium' NOT NULL;
ALTER TABLE "follow_ups" ADD COLUMN IF NOT EXISTS "outcome" "follow_up_outcome";
ALTER TABLE "follow_ups" ADD COLUMN IF NOT EXISTS "outcome_notes" text;
ALTER TABLE "follow_ups" ADD COLUMN IF NOT EXISTS "is_template" boolean DEFAULT false NOT NULL;
ALTER TABLE "follow_ups" ADD COLUMN IF NOT EXISTS "template_id" uuid;

-- Step 14: Add foreign key constraints (with error handling for duplicates)
DO $$ BEGIN
  ALTER TABLE "follow_up_audit_log" ADD CONSTRAINT "follow_up_audit_log_follow_up_id_follow_ups_id_fk" FOREIGN KEY ("follow_up_id") REFERENCES "public"."follow_ups"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "follow_up_audit_log" ADD CONSTRAINT "follow_up_audit_log_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "follow_up_reminders" ADD CONSTRAINT "follow_up_reminders_follow_up_id_follow_ups_id_fk" FOREIGN KEY ("follow_up_id") REFERENCES "public"."follow_ups"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "follow_up_templates" ADD CONSTRAINT "follow_up_templates_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "follow_up_templates" ADD CONSTRAINT "follow_up_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_completed_by_users_id_fk" FOREIGN KEY ("completed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_template_id_follow_up_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."follow_up_templates"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
