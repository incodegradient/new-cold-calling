export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  agent_id: string;
  schedule: {
    start_time: string;
    end_time: string;
    weekdays: string[];
    timezone: string;
  };
  pacing: {
    gap_minutes: number;
    max_concurrent_calls: number;
  };
  retry_rules: {
    max_attempts: number;
    backoff_time_minutes: number;
  };
  status: 'Draft' | 'Active' | 'Paused' | 'Completed';
  created_at: string;
  agents?: { name: string }; // For joins
  lead_count?: number; // For aggregated counts
}
