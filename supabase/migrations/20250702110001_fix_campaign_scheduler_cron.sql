/*
# [Operation Name]
Fix and Reschedule Campaign Processing Cron Job

[Description of what this operation does]
This script safely updates the cron job responsible for running the campaign scheduler. It first checks if an old version of the job exists and removes it to prevent conflicts. It then creates a new, correctly configured job that runs every minute to process active campaigns.

## Query Description: [This operation will modify the pg_cron schedule for the 'campaign-scheduler-job'. It first attempts to remove any existing job with that name to prevent errors, and then schedules a new one. This is a safe operation and will not impact any user data. It ensures the background task for processing campaigns is running correctly.]

## Metadata:
- Schema-Category: ["Structural"]
- Impact-Level: ["Low"]
- Requires-Backup: [false]
- Reversible: [true]

## Structure Details:
- Modifies `cron.job` table entries.

## Security Implications:
- RLS Status: [Not Applicable]
- Policy Changes: [No]
- Auth Requirements: [The cron job uses the project's anon key to authenticate with the Edge Function.]

## Performance Impact:
- Indexes: [Not Applicable]
- Triggers: [Not Applicable]
- Estimated Impact: [Negligible. Schedules a lightweight background job.]
*/

-- Step 1: Ensure the pg_cron extension is available
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Step 2: Grant usage to the postgres user
GRANT USAGE ON SCHEMA cron TO postgres;

-- Step 3: Safely unschedule the job if it exists to prevent errors
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'campaign-scheduler-job') THEN
    PERFORM cron.unschedule('campaign-scheduler-job');
  END IF;
END
$$;

-- Step 4: Schedule the Edge Function to run every minute
-- This job calls the campaign-scheduler Edge Function to process campaigns.
SELECT cron.schedule(
  'campaign-scheduler-job', -- name of the cron job
  '* * * * *', -- every minute
  $$
  SELECT net.http_post(
    url:='https://narqksiaygtunqvywvrx.supabase.co/functions/v1/campaign-scheduler',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hcnFrc2lheWd0dW5xdnl3dnJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1ODc1NzIsImV4cCI6MjA3ODE2MzU3Mn0.NU76snMDwpP7qdRRQ82-V2qnsB9ZkOb9CpqyI-oS47U"}'::jsonb,
    body:='{}'::jsonb
  ) AS "status";
  $$
);
