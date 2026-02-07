ALTER TABLE "members" ADD COLUMN "portal_token" uuid;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_portal_token_unique" UNIQUE("portal_token");