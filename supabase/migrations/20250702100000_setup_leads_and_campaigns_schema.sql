/*
# [Composite Schema Migration for Leads & Campaigns]
This script creates all necessary tables, types, and functions for the Leads and Campaigns features. It is designed to be run once to bring the database schema up to date with the application's requirements.

## Query Description:
This is a structural migration that creates several new database objects. It is safe to run on a new project or a project missing these tables. It will not delete any existing data. It includes checks to avoid errors if some parts of the schema already exist.

## Metadata:
- Schema-Category: ["Structural"]
- Impact-Level: ["Medium"]
- Requires-Backup: false
- Reversible: false

## Structure Details:
- Types: lead_status, campaign_status
- Tables: lead_groups, leads, campaigns, campaign_leads
- Functions: get_campaigns_with_lead_count

## Security Implications:
- RLS Status: Enabled on all new tables.
- Policy Changes: Adds new RLS policies for authenticated users to manage their own data.
*/

-- Create custom types only if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_status') THEN
        CREATE TYPE public.lead_status AS ENUM ('New', 'Queued', 'Called', 'Scheduled', 'Do-Not-Call');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'campaign_status') THEN
        CREATE TYPE public.campaign_status AS ENUM ('Draft', 'Active', 'Paused', 'Completed');
    END IF;
END$$;

-- Create Lead Groups Table
CREATE TABLE IF NOT EXISTS public.lead_groups (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create Leads Table
CREATE TABLE IF NOT EXISTS public.leads (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    group_id uuid REFERENCES public.lead_groups(id) ON DELETE SET NULL,
    name text NOT NULL,
    phone text NOT NULL,
    email text,
    city text,
    industries text,
    "where" text, -- Quoted because 'where' is a reserved keyword
    status public.lead_status DEFAULT 'New'::public.lead_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create Campaigns Table
CREATE TABLE IF NOT EXISTS public.campaigns (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    agent_id uuid NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    schedule jsonb,
    pacing jsonb,
    retry_rules jsonb,
    status public.campaign_status DEFAULT 'Draft'::public.campaign_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create Campaign Leads Join Table
CREATE TABLE IF NOT EXISTS public.campaign_leads (
    campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    PRIMARY KEY (campaign_id, lead_id)
);

-- Apply RLS Policies (wrapped to be idempotent)
DO $$
BEGIN
    -- lead_groups policies
    ALTER TABLE public.lead_groups ENABLE ROW LEVEL SECURITY;
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow authenticated users to manage their own lead groups' AND polrelid = 'public.lead_groups'::regclass) THEN
        CREATE POLICY "Allow authenticated users to manage their own lead groups" ON public.lead_groups FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;

    -- leads policies
    ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow authenticated users to manage their own leads' AND polrelid = 'public.leads'::regclass) THEN
        CREATE POLICY "Allow authenticated users to manage their own leads" ON public.leads FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;

    -- campaigns policies
    ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow authenticated users to manage their own campaigns' AND polrelid = 'public.campaigns'::regclass) THEN
        CREATE POLICY "Allow authenticated users to manage their own campaigns" ON public.campaigns FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;

    -- campaign_leads policies
    ALTER TABLE public.campaign_leads ENABLE ROW LEVEL SECURITY;
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow users to access campaign_leads based on campaign ownership' AND polrelid = 'public.campaign_leads'::regclass) THEN
        CREATE POLICY "Allow users to access campaign_leads based on campaign ownership" ON public.campaign_leads FOR ALL USING (
            EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_leads.campaign_id AND campaigns.user_id = auth.uid())
        ) WITH CHECK (
            EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_leads.campaign_id AND campaigns.user_id = auth.uid())
        );
    END IF;
END$$;


-- Recreate the RPC function to ensure it's up-to-date and secure
DROP FUNCTION IF EXISTS public.get_campaigns_with_lead_count(p_user_id uuid);

CREATE OR REPLACE FUNCTION public.get_campaigns_with_lead_count(p_user_id uuid)
RETURNS TABLE(id uuid, name text, status public.campaign_status, created_at timestamp with time zone, agents json, lead_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Security check inside the function
  IF p_user_id IS NULL OR p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'User ID does not match authenticated user';
  END IF;

  RETURN QUERY
  SELECT
    c.id,
    c.name,
    c.status,
    c.created_at,
    json_build_object('id', a.id, 'name', a.name) as agents,
    COUNT(cl.lead_id) as lead_count
  FROM
    campaigns c
  LEFT JOIN
    agents a ON c.agent_id = a.id
  LEFT JOIN
    campaign_leads cl ON c.id = cl.campaign_id
  WHERE
    c.user_id = p_user_id
  GROUP BY
    c.id, a.id;
END;
$$;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.get_campaigns_with_lead_count(uuid) TO authenticated;
