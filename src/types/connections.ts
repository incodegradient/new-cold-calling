import { BotMessageSquare, Phone, Calendar, BrainCircuit, Mail, LucideIcon } from 'lucide-react';

export type ServiceName = 'vapi' | 'retell' | 'twilio' | 'cal_com' | 'openai' | 'gmail';

export interface Connection {
  id: string;
  user_id: string;
  service: ServiceName;
  credentials: Record<string, any>;
  created_at: string;
}

export interface ServiceField {
  key: string;
  label: string;
  type: 'text' | 'password';
  placeholder: string;
}

export interface ServiceDetail {
  name: string;
  description: string;
  icon: LucideIcon;
  fields: ServiceField[];
}

export const serviceDetails: Record<ServiceName, ServiceDetail> = {
  vapi: {
    name: 'Vapi.ai',
    description: 'Connect your Vapi account to use their AI agents.',
    icon: BotMessageSquare,
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'Enter your Vapi API key' },
      { key: 'phone_number_id', label: 'Vapi Phone Number ID', type: 'text', placeholder: 'Enter your Vapi Phone Number ID' },
    ],
  },
  retell: {
    name: 'Retell.ai',
    description: 'Connect your Retell account to use their AI agents.',
    icon: BotMessageSquare,
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'Enter your Retell API key' },
    ],
  },
  twilio: {
    name: 'Twilio',
    description: 'Connect your Twilio account for outbound calls.',
    icon: Phone,
    fields: [
      { key: 'account_sid', label: 'Account SID', type: 'text', placeholder: 'AC...' },
      { key: 'auth_token', label: 'Auth Token', type: 'password', placeholder: 'Your Twilio auth token' },
      { key: 'phone_number', label: 'Twilio Phone Number', type: 'text', placeholder: '+1...' },
    ],
  },
  cal_com: {
    name: 'Cal.com',
    description: 'Connect Cal.com for automatic meeting scheduling.',
    icon: Calendar,
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'Your Cal.com API key' },
      { key: 'event_type_id', label: 'Event Type ID', type: 'text', placeholder: 'The ID of the event type to use' },
    ],
  },
  openai: {
    name: 'OpenAI',
    description: 'Connect your OpenAI account for AI capabilities.',
    icon: BrainCircuit,
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'sk-...' },
    ],
  },
  gmail: {
    name: 'Gmail',
    description: 'Connect your Gmail account for email notifications.',
    icon: Mail,
    fields: [
      { key: 'client_id', label: 'Client ID', type: 'text', placeholder: 'Your Google Client ID' },
      { key: 'client_secret', label: 'Client Secret', type: 'password', placeholder: 'Your Google Client Secret' },
    ],
  },
};
