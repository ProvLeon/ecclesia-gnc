CREATE TYPE "public"."audit_action" AS ENUM('created', 'assigned', 'status_changed', 'completed', 'cancelled', 'notes_added');--> statement-breakpoint
CREATE TYPE "public"."department_role" AS ENUM('member', 'co_leader', 'leader');--> statement-breakpoint
CREATE TYPE "public"."follow_up_outcome" AS ENUM('contacted', 'not_home', 'left_message', 'promised_action', 'resolved', 'escalated', 'no_contact');--> statement-breakpoint
CREATE TYPE "public"."follow_up_priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."reminder_type" AS ENUM('email', 'sms', 'in_app');--> statement-breakpoint
ALTER TYPE "public"."follow_up_type" ADD VALUE 'new_member' BEFORE 'phone_call';--> statement-breakpoint
ALTER TYPE "public"."follow_up_type" ADD VALUE 'absence' BEFORE 'phone_call';--> statement-breakpoint
ALTER TYPE "public"."follow_up_type" ADD VALUE 'pastoral_care' BEFORE 'phone_call';--> statement-breakpoint
ALTER TYPE "public"."follow_up_type" ADD VALUE 'prayer_request' BEFORE 'phone_call';--> statement-breakpoint
ALTER TYPE "public"."follow_up_type" ADD VALUE 'discipleship' BEFORE 'phone_call';--> statement-breakpoint
ALTER TYPE "public"."follow_up_type" ADD VALUE 'other';--> statement-breakpoint
CREATE TABLE "follow_up_audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"follow_up_id" uuid NOT NULL,
	"action" "audit_action" NOT NULL,
	"changed_by" uuid NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"action_date" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "follow_up_reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"follow_up_id" uuid NOT NULL,
	"reminder_date" date NOT NULL,
	"reminder_type" "reminder_type" NOT NULL,
	"is_sent" boolean DEFAULT false NOT NULL,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "follow_up_templates" (
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
--> statement-breakpoint
ALTER TABLE "follow_ups" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "follow_ups" ALTER COLUMN "status" SET DEFAULT 'pending'::text;--> statement-breakpoint
DROP TYPE "public"."follow_up_status";--> statement-breakpoint
CREATE TYPE "public"."follow_up_status" AS ENUM('pending', 'assigned', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
ALTER TABLE "follow_ups" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."follow_up_status";--> statement-breakpoint
ALTER TABLE "follow_ups" ALTER COLUMN "status" SET DATA TYPE "public"."follow_up_status" USING "status"::"public"."follow_up_status";--> statement-breakpoint
ALTER TABLE "follow_ups" ALTER COLUMN "follow_up_type" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "follow_ups" ALTER COLUMN "scheduled_date" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "follow_ups" ADD COLUMN "created_by" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "follow_ups" ADD COLUMN "assigned_by" uuid;--> statement-breakpoint
ALTER TABLE "follow_ups" ADD COLUMN "completed_by" uuid;--> statement-breakpoint
ALTER TABLE "follow_ups" ADD COLUMN "title" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "follow_ups" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "follow_ups" ADD COLUMN "due_date" date;--> statement-breakpoint
ALTER TABLE "follow_ups" ADD COLUMN "priority" "follow_up_priority" DEFAULT 'medium' NOT NULL;--> statement-breakpoint
ALTER TABLE "follow_ups" ADD COLUMN "outcome" "follow_up_outcome";--> statement-breakpoint
ALTER TABLE "follow_ups" ADD COLUMN "outcome_notes" text;--> statement-breakpoint
ALTER TABLE "follow_ups" ADD COLUMN "is_template" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "follow_ups" ADD COLUMN "template_id" uuid;--> statement-breakpoint
ALTER TABLE "member_departments" ADD COLUMN "role" "department_role" DEFAULT 'member' NOT NULL;--> statement-breakpoint
ALTER TABLE "follow_up_audit_log" ADD CONSTRAINT "follow_up_audit_log_follow_up_id_follow_ups_id_fk" FOREIGN KEY ("follow_up_id") REFERENCES "public"."follow_ups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_up_audit_log" ADD CONSTRAINT "follow_up_audit_log_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_up_reminders" ADD CONSTRAINT "follow_up_reminders_follow_up_id_follow_ups_id_fk" FOREIGN KEY ("follow_up_id") REFERENCES "public"."follow_ups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_up_templates" ADD CONSTRAINT "follow_up_templates_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_up_templates" ADD CONSTRAINT "follow_up_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_completed_by_users_id_fk" FOREIGN KEY ("completed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_template_id_follow_up_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."follow_up_templates"("id") ON DELETE set null ON UPDATE no action;