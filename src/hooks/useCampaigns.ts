import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Campaign } from '@/types/campaigns';
import { useAuth } from '@/contexts/AuthContext';

export const useCampaigns = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      // This RPC function is now created via a migration file.
      const { data, error } = await supabase
        .rpc('get_campaigns_with_lead_count', { p_user_id: user.id });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const createCampaign = async (campaignData: Omit<Campaign, 'id' | 'user_id' | 'created_at' | 'status'>, leads: string[], leadGroups: string[]) => {
    if (!user) throw new Error("User not authenticated");

    // 1. Create the campaign
    const { data: newCampaign, error: campaignError } = await supabase
      .from('campaigns')
      .insert({ ...campaignData, user_id: user.id })
      .select()
      .single();

    if (campaignError) throw campaignError;

    // 2. Get all lead IDs
    let allLeadIds = new Set<string>(leads);
    if (leadGroups.length > 0) {
      const { data: groupLeads, error: groupLeadsError } = await supabase
        .from('leads')
        .select('id')
        .in('group_id', leadGroups)
        .eq('user_id', user.id);

      if (groupLeadsError) throw groupLeadsError;
      groupLeads.forEach(l => allLeadIds.add(l.id));
    }

    // 3. Insert into campaign_leads
    const campaignLeadsData = Array.from(allLeadIds).map(leadId => ({
      campaign_id: newCampaign.id,
      lead_id: leadId,
    }));

    if (campaignLeadsData.length > 0) {
      const { error: campaignLeadsError } = await supabase
        .from('campaign_leads')
        .insert(campaignLeadsData);

      if (campaignLeadsError) throw campaignLeadsError;
    }

    await fetchCampaigns();
    return newCampaign;
  };

  return { campaigns, loading, error, createCampaign, refetch: fetchCampaigns };
};
