-- Run this query in your Supabase SQL Editor to add the portal_token column

ALTER TABLE "members" 
ADD COLUMN IF NOT EXISTS "portal_token" uuid UNIQUE DEFAULT NULL;

-- Optional: Create an index for faster lookups if you have many members
CREATE INDEX IF NOT EXISTS "members_portal_token_idx" ON "members" ("portal_token");
