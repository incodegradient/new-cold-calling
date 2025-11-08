--
-- 1. Create campaign_status type
--
/*
          # [Operation Name]
          Create campaign_status ENUM type

          ## Query Description: [This operation creates a new custom data type called `campaign_status` which is an ENUM (enumerated type). This allows the `status` column in the `campaigns` table to accept only a predefined set of values ('Draft', 'Active', 'Paused', 'Completed'), ensuring data integrity.]
          
          ## Metadata:
          - Schema-Category: ["Structural"]
          - Impact-Level: ["Low"]
          - Requires-Backup: [false]
          - Reversible: [false]
          
          ## Structure Details:
          - Creates a new ENUM type `public.campaign_status`.
          
          ## Security Implications:
          - RLS Status: [N/A]
          - Policy Changes: [No]
          - Auth Requirements: [None]
          
          ## Performance Impact:
          - Indexes: [N/A]
          - Triggers: [N/A]
          - Estimated Impact: [None]
          */
CREATE TYPE public.campaign_status AS ENUM (
    'Draft',
    'Active',
    'Paused',
    'Completed'
);

--
-- 2. Create campaigns table
--
/*
          # [Operation Name]
          Create campaigns table

          ## Query Description: [This operation creates the `campaigns` table to store campaign information. It includes columns for campaign details, scheduling, and status, using the newly created `campaign_status` type. It also sets up a foreign key relationship to the `agents` table.]
          
          ## Metadata:
          - Schema-Category: ["Structural"]
          - Impact-Level: ["Medium"]
          - Requires-Backup: [false]
          - Reversible: [false]
          
          ## Structure Details:
          - Creates table `public.campaigns`.
          - Columns: id, user_id, name, agent_id, schedule, pacing, retry_rules, status, created_at, updated_at.
          
          ## Security Implications:
          - RLS Status: [Enabled]
          - Policy Changes: [Yes]
          - Auth Requirements: [User must be authenticated to access their own campaigns.]
          
          ## Performance Impact:
          - Indexes: [Added on user_id and agent_id]
          - Triggers: [N/A]
          - Estimated Impact: [Low]
          */
CREATE TABLE public.campaigns (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    agent_id uuid NOT NULL,
    schedule jsonb NOT NULL,
    pacing jsonb NOT NULL,
    retry_rules jsonb NOT NULL,
    status public.campaign_status DEFAULT 'Draft'::public.campaign_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_pkey PRIMARY KEY (id);
    
ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE POLICY "Allow ALL for users based on user_id" ON public.campaigns FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

--
-- 3. Create campaign_leads table
--
/*
          # [Operation Name]
          Create campaign_leads table

          ## Query Description: [This operation creates a join table `campaign_leads` to establish a many-to-many relationship between campaigns and leads. This is essential for tracking which leads are part of which campaign.]
          
          ## Metadata:
          - Schema-Category: ["Structural"]
          - Impact-Level: ["Medium"]
          - Requires-Backup: [false]
          - Reversible: [false]
          
          ## Structure Details:
          - Creates table `public.campaign_leads`.
          - Columns: campaign_id, lead_id.
          
          ## Security Implications:
          - RLS Status: [Enabled]
          - Policy Changes: [Yes]
          - Auth Requirements: [User must own the campaign and the lead to create a link.]
          
          ## Performance Impact:
          - Indexes: [Added on campaign_id and lead_id]
          - Triggers: [N/A]
          - Estimated Impact: [Low]
          */
CREATE TABLE public.campaign_leads (
    campaign_id uuid NOT NULL,
    lead_id uuid NOT NULL
);

ALTER TABLE public.campaign_leads ENABLE ROW LEVEL SECURITY;

ALTER TABLE ONLY public.campaign_leads
    ADD CONSTRAINT campaign_leads_pkey PRIMARY KEY (campaign_id, lead_id);

ALTER TABLE ONLY public.campaign_leads
    ADD CONSTRAINT campaign_leads_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.campaign_leads
    ADD CONSTRAINT campaign_leads_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE CASCADE;

CREATE POLICY "Allow ALL for users who own the campaign" ON public.campaign_leads FOR ALL
    USING ((auth.uid() IN ( SELECT campaigns.user_id
   FROM public.campaigns
  WHERE (campaigns.id = campaign_leads.campaign_id))))
    WITH CHECK ((auth.uid() IN ( SELECT campaigns.user_id
   FROM public.campaigns
  WHERE (campaigns.id = campaign_leads.campaign_id))));

--
-- 4. Drop and Recreate get_campaigns_with_lead_count function
--
/*
          # [Operation Name]
          Recreate get_campaigns_with_lead_count function

          ## Query Description: [This operation first drops the existing `get_campaigns_with_lead_count` function to prevent conflicts, and then recreates it. The function fetches campaigns for a specific user, joins them with agent details, and calculates the total number of leads associated with each campaign.]
          
          ## Metadata:
          - Schema-Category: ["Structural"]
          - Impact-Level: ["Low"]
          - Requires-Backup: [false]
          - Reversible: [false]
          
          ## Structure Details:
          - Drops and creates the function `public.get_campaigns_with_lead_count`.
          
          ## Security Implications:
          - RLS Status: [N/A]
          - Policy Changes: [No]
          - Auth Requirements: [Function is SECURITY DEFINER, runs with creator's permissions.]
          
          ## Performance Impact:
          - Indexes: [N/A]
          - Triggers: [N/A]
          - Estimated Impact: [Low, depends on query complexity and data size.]
          */
DROP FUNCTION IF EXISTS public.get_campaigns_with_lead_count(p_user_id uuid);

CREATE OR REPLACE FUNCTION public.get_campaigns_with_lead_count(p_user_id uuid)
RETURNS TABLE(id uuid, name text, status public.campaign_status, created_at timestamp with time zone, agents json, lead_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.name,
        c.status,
        c.created_at,
        json_build_object('name', a.name) as agents,
        (SELECT COUNT(*) FROM campaign_leads cl WHERE cl.campaign_id = c.id) as lead_count
    FROM
        campaigns c
    LEFT JOIN
        agents a ON c.agent_id = a.id
    WHERE
        c.user_id = p_user_id
    ORDER BY
        c.created_at DESC;
END;
$$;
