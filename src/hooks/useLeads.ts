import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Lead } from '@/types/leads';
import { useAuth } from '@/contexts/AuthContext';

export const useLeads = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*, lead_groups(name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const upsertLead = async (leadData: Partial<Lead>) => {
    if (!user) throw new Error("User not authenticated");

    const dataToUpsert = {
      ...leadData,
      user_id: user.id,
      updated_at: new Date().toISOString(),
    };

    if (!leadData.id) {
      delete dataToUpsert.id;
    }

    const { data, error } = await supabase
      .from('leads')
      .upsert(dataToUpsert)
      .select('*, lead_groups(name)')
      .single();

    if (error) throw error;
    
    await fetchLeads();
    return data;
  };
  
  const bulkInsertLeads = async (leadsToInsert: Partial<Lead>[]) => {
    if (!user) throw new Error("User not authenticated");

    const leadsWithUser = leadsToInsert.map(lead => ({ ...lead, user_id: user.id }));

    const { data, error } = await supabase
      .from('leads')
      .insert(leadsWithUser)
      .select();

    if (error) throw error;
    
    await fetchLeads();
    return data;
  };

  const deleteLead = async (id: string) => {
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from('leads')
      .delete()
      .match({ id, user_id: user.id });

    if (error) throw error;

    await fetchLeads();
  };

  return { leads, loading, error, upsertLead, deleteLead, bulkInsertLeads, refetch: fetchLeads };
};
