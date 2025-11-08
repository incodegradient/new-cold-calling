/*
# Create Campaigns and Campaign Leads Tables
This migration introduces the `campaigns` table to store campaign configurations and a `campaign_leads` join table to link campaigns with their respective leads. It includes scheduling, pacing, and retry rules, with RLS enabled to ensure users can only manage their own campaigns.

## Query Description: This is a structural and safe operation. It adds new tables for managing campaigns and does not modify any existing data. The RLS policies are crucial for security, isolating campaign data between different users.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (by dropping the tables)

## Structure Details:
- Creates table `public.campaigns`.
- Creates table `public.campaign_leads`.
- Adds foreign keys from `campaigns.agent_id` to `agents.id`, and between the new tables and `leads`.

## Security Implications:
- RLS Status: Enabled on both tables.
- Policy Changes: Yes, new policies are created to restrict access to user-specific campaign data.
- Auth Requirements: Users must be authenticated.

## Performance Impact:
- Indexes: Added on foreign keys and user IDs to ensure efficient joins and filtering.
- Triggers: None.
- Estimated Impact: Low performance impact.
*/

-- Create campaigns table
CREATE TABLE public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    schedule JSONB, -- { start_time, end_time, weekdays }
    pacing JSONB, -- { gap_minutes, max_concurrent_calls }
    retry_rules JSONB, -- { max_attempts, backoff_time_minutes }
    status TEXT NOT NULL DEFAULT 'Draft', -- e.g., Draft, Active, Paused, Completed
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes for campaigns
CREATE INDEX idx_campaigns_user_id ON public.campaigns(user_id);
CREATE INDEX idx_campaigns_agent_id ON public.campaigns(agent_id);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);

-- Enable RLS for campaigns
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Create policies for campaigns
CREATE POLICY "Users can manage their own campaigns"
ON public.campaigns
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


-- Create campaign_leads join table
CREATE TABLE public.campaign_leads (
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'Queued', -- e.g., Queued, Calling, Called, Failed
    attempts INT NOT NULL DEFAULT 0,
    last_attempted_at TIMESTAMPTZ,
    PRIMARY KEY (campaign_id, lead_id)
);

-- Add indexes for campaign_leads
CREATE INDEX idx_campaign_leads_campaign_id ON public.campaign_leads(campaign_id);
CREATE INDEX idx_campaign_leads_lead_id ON public.campaign_leads(lead_id);
CREATE INDEX idx_campaign_leads_status ON public.campaign_leads(status);

-- Enable RLS for campaign_leads
ALTER TABLE public.campaign_leads ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage leads within their own campaigns.
-- This is a bit more complex as it requires checking ownership of the campaign.
CREATE POLICY "Users can manage leads in their own campaigns"
ON public.campaign_leads
FOR ALL
USING (
  (SELECT user_id FROM public.campaigns WHERE id = campaign_id) = auth.uid()
)
WITH CHECK (
  (SELECT user_id FROM public.campaigns WHERE id = campaign_id) = auth.uid()
);
