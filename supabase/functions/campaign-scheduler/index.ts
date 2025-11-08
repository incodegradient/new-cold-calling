import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

interface Campaign {
  id: string;
  user_id: string;
  agent_id: string;
  schedule: {
    start_time: string;
    end_time: string;
    weekdays: string[];
    timezone: string;
  };
  status: 'Active';
  agents: {
    platform: 'vapi' | 'retell';
    provider_agent_id: string;
  };
}

// Helper to check if a campaign is currently active based on its schedule
function isCampaignActiveNow(campaign: Campaign): boolean {
  try {
    const now = new Date();
    const { start_time, end_time, weekdays, timezone } = campaign.schedule;

    // Get current time in the campaign's specified timezone
    const timeInZone = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const currentDay = timeInZone.toLocaleString('en-US', { weekday: 'long' });
    const currentTime = timeInZone.toTimeString().slice(0, 5); // HH:MM

    if (!weekdays.includes(currentDay)) {
      return false;
    }

    if (currentTime < start_time || currentTime > end_time) {
      return false;
    }

    return true;
  } catch (e) {
    console.error(`Error processing timezone for campaign ${campaign.id}:`, e);
    return false;
  }
}

async function triggerVapiCall(vapiCredentials: { api_key: string, phone_number_id: string }, agentId: string, lead: { name: string, phone: string }) {
  const response = await fetch('https://api.vapi.ai/call/phone', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${vapiCredentials.api_key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      phoneNumberId: vapiCredentials.phone_number_id,
      assistantId: agentId,
      customer: {
        number: lead.phone,
        name: lead.name,
      }
    })
  });
  if (!response.ok) {
    throw new Error(`Vapi API error: ${await response.text()}`);
  }
  return response.json();
}

async function triggerRetellCall(apiKey: string, agentId: string, lead: { name: string, phone: string }, twilioConnection: any) {
  const response = await fetch('https://api.retellai.com/create-phone-call', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      agent_id: agentId,
      from_number: twilioConnection.credentials.phone_number,
      to_number: lead.phone,
      retell_llm_dynamic_variables: {
        lead_name: lead.name
      }
    })
  });
  if (!response.ok) {
    throw new Error(`Retell API error: ${await response.text()}`);
  }
  return response.json();
}


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. Fetch all active campaigns with their agents
    const { data: campaigns, error: campaignError } = await supabaseAdmin
      .from("campaigns")
      .select(`*, agents!inner(platform, provider_agent_id)`)
      .eq("status", "Active");

    if (campaignError) throw campaignError;

    // 2. Filter for campaigns that should be running right now
    const activeNowCampaigns = campaigns.filter(isCampaignActiveNow);
    if (activeNowCampaigns.length === 0) {
      return new Response(JSON.stringify({ message: "No active campaigns scheduled for now." }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    for (const campaign of activeNowCampaigns) {
      // 3. Fetch connections for the user who owns the campaign
      const { data: connections, error: connError } = await supabaseAdmin
        .from("connections")
        .select("service, credentials")
        .eq("user_id", campaign.user_id);
      
      if (connError) throw connError;
      const connectionsMap = new Map(connections.map(c => [c.service, c]));

      // 4. Fetch one lead for this campaign that is 'New'
      const { data: lead, error: leadError } = await supabaseAdmin
        .from("campaign_leads")
        .select(`leads!inner(id, name, phone)`)
        .eq("campaign_id", campaign.id)
        .eq("leads.status", "New")
        .limit(1)
        .single();
      
      if (leadError || !lead) {
        console.log(`No new leads for campaign ${campaign.id}`);
        continue;
      }
      
      const leadDetails = lead.leads;

      // 5. Trigger the call based on the platform
      const platform = campaign.agents.platform;
      const providerAgentId = campaign.agents.provider_agent_id;
      
      console.log(`Triggering call for lead ${leadDetails.name} in campaign ${campaign.id}`);

      // Mark lead as 'Queued' to prevent re-calling in the next run
      await supabaseAdmin.from('leads').update({ status: 'Queued' }).eq('id', leadDetails.id);

      if (platform === 'vapi') {
        const vapiConnection = connectionsMap.get('vapi');
        if (!vapiConnection?.credentials?.api_key || !vapiConnection?.credentials?.phone_number_id) {
            console.error(`Vapi API key or Phone Number ID not found for user ${campaign.user_id}`);
            continue;
        }
        await triggerVapiCall(vapiConnection.credentials, providerAgentId, leadDetails);
      } else if (platform === 'retell') {
        const retellApiKey = connectionsMap.get('retell')?.credentials?.api_key;
        const twilioConnection = connectionsMap.get('twilio');

        if (!retellApiKey) {
          console.error(`Retell API key not found for user ${campaign.user_id}`);
          continue;
        }
        if (!twilioConnection) {
          console.error(`Twilio connection not found for user ${campaign.user_id}, required for Retell calls.`);
          continue;
        }
        await triggerRetellCall(retellApiKey, providerAgentId, leadDetails, twilioConnection);
      }
      
      // Optionally, update lead status to 'Called' after API call
      // await supabaseAdmin.from('leads').update({ status: 'Called' }).eq('id', leadDetails.id);
    }

    return new Response(JSON.stringify({ message: "Campaign scheduler executed." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
