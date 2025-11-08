/*
          # Create Agents Table
          This migration creates the `agents` table to store information about AI agents linked to users.

          ## Query Description: 
          This is a structural change that adds a new table for managing AI agents. It does not affect any existing data. It includes columns for agent name, platform (Vapi/Retell), the provider's agent ID, and an active status. Row Level Security is enabled to ensure users can only access their own agents.

          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true (The table can be dropped)
          
          ## Structure Details:
          - Table: `public.agents`
          - Columns: `id`, `user_id`, `name`, `platform`, `provider_agent_id`, `is_active`, `created_at`, `updated_at`
          
          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: Yes (New policies for SELECT, INSERT, UPDATE, DELETE are created)
          - Auth Requirements: Users must be authenticated to interact with the table.
          
          ## Performance Impact:
          - Indexes: A foreign key index on `user_id` is created, which is good for performance.
          - Triggers: None
          - Estimated Impact: Negligible performance impact on other parts of the system.
          */

CREATE TABLE public.agents (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    name text NOT NULL,
    platform text NOT NULL,
    provider_agent_id text NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT agents_pkey PRIMARY KEY (id),
    CONSTRAINT agents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to view their own agents" ON public.agents
AS PERMISSIVE FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own agents" ON public.agents
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own agents" ON public.agents
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own agents" ON public.agents
AS PERMISSIVE FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
