export type AgentPlatform = 'vapi' | 'retell';

export interface Agent {
  id: string;
  user_id: string;
  name: string;
  platform: AgentPlatform;
  provider_agent_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
