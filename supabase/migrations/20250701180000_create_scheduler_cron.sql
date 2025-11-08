-- Enable pg_cron extension if not already enabled
create extension if not exists pg_cron with schema extensions;

-- Grant usage to postgres role
grant usage on schema cron to postgres;

-- Grant all privileges to the postgres role for the cron schema
grant all privileges on all tables in schema cron to postgres;

-- Remove any existing job with the same name to prevent conflicts
select cron.unschedule('campaign-scheduler-job');

-- Schedule the campaign-scheduler function to run every minute
select
  cron.schedule(
    'campaign-scheduler-job',
    '* * * * *', -- This is a cron expression for every minute
    $$
    select
      net.http_post(
        url:='https://narqksiaygtunqvywvrx.supabase.co/functions/v1/campaign-scheduler', -- IMPORTANT: Replace with your project's URL
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hcnFrc2lheWd0dW5xdnl3dnJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1ODc1NzIsImV4cCI6MjA3ODE2MzU3Mn0.NU76snMDwpP7qdRRQ82-V2qnsB9ZkOb9CpqyI-oS47U"}' -- IMPORTANT: Replace with your project's anon key
      ) as request_id;
    $$
  );
