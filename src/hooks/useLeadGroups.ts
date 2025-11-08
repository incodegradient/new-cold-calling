import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { LeadGroup } from '@/types/leads';
import { useAuth } from '@/contexts/AuthContext';

export const useLeadGroups = () => {
  const { user } = useAuth();
  const [leadGroups, setLeadGroups] = useState<LeadGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeadGroups = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('lead_groups')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (error) throw error;
      setLeadGroups(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLeadGroups();
  }, [fetchLeadGroups]);

  const upsertLeadGroup = async (groupData: Partial<LeadGroup>) => {
    if (!user) throw new Error("User not authenticated");

    const dataToUpsert = {
      ...groupData,
      user_id: user.id,
      updated_at: new Date().toISOString(),
    };

    if (!groupData.id) {
      delete dataToUpsert.id;
    }

    const { data, error } = await supabase
      .from('lead_groups')
      .upsert(dataToUpsert)
      .select()
      .single();

    if (error) throw error;
    
    await fetchLeadGroups();
    return data;
  };
  
  const findOrCreateGroup = async (name: string): Promise<LeadGroup> => {
    if (!user) throw new Error("User not authenticated");

    const { data: existingGroup, error: findError } = await supabase
      .from('lead_groups')
      .select('*')
      .eq('user_id', user.id)
      .eq('name', name)
      .maybeSingle();

    if (findError) throw findError;
    if (existingGroup) return existingGroup;

    const { data: newGroup, error: createError } = await supabase
      .from('lead_groups')
      .insert({ name, user_id: user.id })
      .select()
      .single();
    
    if (createError) throw createError;
    
    await fetchLeadGroups();
    return newGroup;
  };


  return { leadGroups, loading, error, upsertLeadGroup, findOrCreateGroup, refetch: fetchLeadGroups };
};
