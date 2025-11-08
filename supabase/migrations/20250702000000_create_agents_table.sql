/*
# [Structural] Create Agents Table and Policies
This migration creates the `agents` table required for storing AI agent configurations, along with an enum type for the platform and necessary Row Level Security (RLS) policies.

## Query Description: This script performs the following actions:
1. Creates a new ENUM type `agent_platform` for agent providers ('vapi', 'retell').
2. Creates the `agents` table with columns for name, platform, provider ID, status, and timestamps. It links agents to users.
3. Enables Row Level Security on the `agents` table to ensure data privacy.
4. Creates policies that allow users to manage (create, read, update, delete) only their own agents.
5. Adds a trigger to automatically update the `updated_at` timestamp on any row modification.
This operation is safe and does not affect existing data as it only creates new database objects.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (manually, by dropping the created objects)

## Structure Details:
- Tables created: `public.agents`
- Types created: `public.agent_platform`
- Columns added to `public.agents`: `id`, `user_id`, `name`, `platform`, `provider_agent_id`, `is_active`, `created_at`, `updated_at`
- Foreign Keys: `agents.user_id` -> `auth.users.id`

## Security Implications:
- RLS Status: Enabled on `public.agents`
- Policy Changes: Yes, new policies are created for SELECT, INSERT, UPDATE, DELETE on `public.agents`.
- Auth Requirements: Policies are based on `auth.uid()`, restricting access to the record owner.

## Performance Impact:
- Indexes: A primary key index is automatically created on `id`. An index on `user_id` is added for faster lookups.
- Triggers: A trigger is added to update the `updated_at` column on updates.
- Estimated Impact: Low. This is a standard table creation.
*/

-- 1. Create Platform Enum Type
CREATE TYPE public.agent_platform AS ENUM ('vapi', 'retell');

-- 2. Create Agents Table
CREATE TABLE public.agents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    platform public.agent_platform NOT NULL,
    provider_agent_id text NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Add Comments
COMMENT ON TABLE public.agents IS 'Stores AI agent configurations linked to users.';
COMMENT ON COLUMN public.agents.user_id IS 'Link to the user who owns the agent.';
COMMENT ON COLUMN public.agents.provider_agent_id IS 'The unique identifier for the agent from the external provider (Vapi/Retell).';

-- 4. Add Index for performance
CREATE INDEX idx_agents_user_id ON public.agents(user_id);

-- 5. Enable Row Level Security
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies
CREATE POLICY "Users can view their own agents"
ON public.agents FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own agents"
ON public.agents FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agents"
ON public.agents FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agents"
ON public.agents FOR DELETE
USING (auth.uid() = user_id);

-- 7. Trigger to automatically update `updated_at`
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_agent_update
BEFORE UPDATE ON public.agents
FOR EACH ROW
EXECUTE PROCEDURE public.handle_updated_at();
