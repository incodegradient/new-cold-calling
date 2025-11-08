/*
# Create Lead Groups and Leads Tables
This migration creates two new tables: `lead_groups` to organize leads, and `leads` to store individual lead information. It also establishes a foreign key relationship between them and enables Row Level Security (RLS) to ensure data privacy.

## Query Description: This operation is structural and safe. It adds new tables to the database without affecting existing data. It is designed to store user-specific lead information, and the RLS policies ensure that users can only access their own data.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (by dropping the tables)

## Structure Details:
- Creates table `public.lead_groups`.
- Creates table `public.leads`.
- Adds a foreign key from `leads.group_id` to `lead_groups.id`.
- Adds indexes on `user_id` for performance.

## Security Implications:
- RLS Status: Enabled on both tables.
- Policy Changes: Yes, new policies are created to restrict access to user-specific data.
- Auth Requirements: Users must be authenticated to interact with these tables.

## Performance Impact:
- Indexes: Added on `user_id` columns to optimize queries that filter by user.
- Triggers: None.
- Estimated Impact: Low performance impact. Queries will be efficient due to indexing.
*/

-- Create lead_groups table
CREATE TABLE public.lead_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add index on user_id for lead_groups
CREATE INDEX idx_lead_groups_user_id ON public.lead_groups(user_id);

-- Enable RLS for lead_groups
ALTER TABLE public.lead_groups ENABLE ROW LEVEL SECURITY;

-- Create policies for lead_groups
CREATE POLICY "Users can manage their own lead groups"
ON public.lead_groups
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


-- Create leads table
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    group_id UUID REFERENCES public.lead_groups(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    city TEXT,
    industries TEXT,
    "where" TEXT, -- "where" is a reserved keyword, so it's quoted
    status TEXT NOT NULL DEFAULT 'New', -- e.g., New, Queued, Called, Scheduled, Do-Not-Call
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes for leads
CREATE INDEX idx_leads_user_id ON public.leads(user_id);
CREATE INDEX idx_leads_group_id ON public.leads(group_id);
CREATE INDEX idx_leads_status ON public.leads(status);

-- Enable RLS for leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create policies for leads
CREATE POLICY "Users can manage their own leads"
ON public.leads
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
