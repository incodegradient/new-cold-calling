/*
# [Function] get_campaigns_with_lead_count
This function retrieves all campaigns for a specific user, joining them with agent details and calculating the total number of leads associated with each campaign.

## Query Description:
This operation creates or replaces a PostgreSQL function. It is a read-only function and does not modify any existing data. It is designed to improve query performance and encapsulate complex logic for fetching campaign data.

## Metadata:
- Schema-Category: ["Structural"]
- Impact-Level: ["Low"]
- Requires-Backup: false
- Reversible: true (The function can be dropped)

## Structure Details:
- Function Name: get_campaigns_with_lead_count
- Arguments: p_user_id (UUID)
- Returns: A table of campaign data including a lead count and agent details.

## Security Implications:
- RLS Status: Not applicable to the function itself, but the function queries tables that have RLS enabled. The function is designed to be called with a user's ID, and the underlying query respects the `user_id` filter.
- Policy Changes: No
- Auth Requirements: The function should be called within a context where the user's ID is known and verified.

## Performance Impact:
- Indexes: This function will benefit from indexes on `campaigns.user_id`, `agents.id`, and `campaign_leads.campaign_id`.
- Triggers: None
- Estimated Impact: Positive. Encapsulates a join and a subquery into a single RPC call, reducing round-trips to the database.
*/

CREATE OR REPLACE FUNCTION get_campaigns_with_lead_count(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  name TEXT,
  agent_id UUID,
  schedule JSONB,
  pacing JSONB,
  retry_rules JSONB,
  status TEXT,
  created_at TIMESTAMPTZ,
  agents JSON,
  lead_count BIGINT
) AS $$
BEGIN
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
    row_to_json(a.*) as agents,
    (SELECT count(*) FROM public.campaign_leads cl WHERE cl.campaign_id = c.id) as lead_count
  FROM
    public.campaigns c
  JOIN
    public.agents a ON c.agent_id = a.id
  WHERE
    c.user_id = p_user_id
  ORDER BY
    c.created_at DESC;
END;
$$ LANGUAGE plpgsql;
