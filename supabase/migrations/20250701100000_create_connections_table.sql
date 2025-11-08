/*
  # Create Connections Table
  This script creates the `connections` table to store user-specific API keys and credentials for third-party services.

  ## Query Description:
  - Creates the `connections` table with columns for user ID, service name, and credentials.
  - Establishes a foreign key relationship to `auth.users`.
  - Adds a unique constraint to prevent duplicate connections per user per service.
  - Enables Row Level Security (RLS) to ensure users can only access their own data.
  - Creates RLS policies for SELECT, INSERT, UPDATE, and DELETE operations.
  - This is a foundational and safe structural change. No data is at risk.

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true (the table can be dropped)

  ## Structure Details:
  - Table: `public.connections`
  - Columns: `id`, `user_id`, `service`, `credentials`, `created_at`, `updated_at`
  - Constraints: Primary Key on `id`, Foreign Key on `user_id`, Unique on `(user_id, service)`

  ## Security Implications:
  - RLS Status: Enabled
  - Policy Changes: Yes. Policies are created to restrict access to the record owner.
  - Auth Requirements: A valid user session (JWT) is required to interact with the table.

  ## Performance Impact:
  - Indexes: Primary key and unique constraint will create indexes, improving query performance on `user_id` and `service`.
  - Triggers: None.
  - Estimated Impact: Low.
*/

-- Create the connections table
create table public.connections (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  service text not null,
  credentials jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add a unique constraint on user_id and service
alter table public.connections
  add constraint connections_user_id_service_key unique (user_id, service);

-- Enable Row Level Security
alter table public.connections
  enable row level security;

-- Create RLS policies for users to manage their own connections
create policy "Allow individual access to own connections"
  on public.connections for all
  using (auth.uid() = user_id);

-- Add comments to the table and columns
comment on table public.connections is 'Stores API credentials for third-party services for each user.';
comment on column public.connections.service is 'The name of the service, e.g., ''twilio'', ''vapi''.';
comment on column public.connections.credentials is 'A JSONB object containing the credentials.';
