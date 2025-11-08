export interface LeadGroup {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface Lead {
  id: string;
  user_id: string;
  group_id?: string | null;
  name: string;
  phone: string;
  email?: string;
  city?: string;
  industries?: string;
  where?: string;
  status: 'New' | 'Queued' | 'Called' | 'Scheduled' | 'Do-Not-Call';
  created_at: string;
  lead_groups?: { name: string }; // For joins
}
