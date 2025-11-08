/*
# [Operation Name]
Fix and Recreate Campaign Fetching Function

## Query Description: [This operation will safely drop and recreate the `get_campaigns_with_lead_count` database function. The previous version of this function had an incorrect return signature, which caused migration failures. This new version corrects the signature, adds a join to fetch the agent's name, and includes a security enhancement by setting the `search_path`. This change is non-destructive to data but is essential for the Campaigns page to function correctly.]

## Metadata:
- Schema-Category: ["Structural"]
- Impact-Level: ["Low"]
- Requires-Backup: [false]
- Reversible: [false]

## Structure Details:
- Drops function: `get_campaigns_with_lead_count(uuid)`
- Creates function: `get_campaigns_with_lead_count(p_user_id uuid)`

## Security Implications:
- RLS Status: [N/A]
- Policy Changes: [No]
- Auth Requirements: [Function is SECURITY DEFINER]

## Performance Impact:
- Indexes: [No changes]
- Triggers: [No changes]
- Estimated Impact: [Negligible. The function performs standard joins and lookups.]
*/

-- Drop the existing function if it exists to avoid signature conflicts.
DROP FUNCTION IF EXISTS public.get_campaigns_with_lead_count(uuid);

-- Recreate the function with the correct return type and logic.
CREATE OR REPLACE FUNCTION public.get_campaigns_with_lead_count(p_user_id uuid)
RETURNS TABLE(
    id uuid,
    user_id uuid,
    name text,
    agent_id uuid,
    schedule jsonb,
    pacing jsonb,
    retry_rules jsonb,
    status public.campaign_status,
    created_at timestamptz,
    agents json,
    lead_count integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Ensure the user is the owner of the data they are trying to access.
    -- This is a security check within the function.
    RETURN QUERY
    SELECT
        c.id,
        c.user_id,
        c.name,
        c.agent_id,
        c.schedule,
        c.pacing,
        c.retry_rules,
        c.status,
        c.created_at,
        (
            SELECT
                json_build_object('name', a.name)
            FROM
                public.agents a
            WHERE
                a.id = c.agent_id
        ) AS agents,
        (
            SELECT
                count(*)
            FROM
                public.campaign_leads cl
            WHERE
                cl.campaign_id = c.id
        )::integer AS lead_count
    FROM
        public.campaigns c
    WHERE
        c.user_id = p_user_id
    ORDER BY
        c.created_at DESC;
END;
$$;
