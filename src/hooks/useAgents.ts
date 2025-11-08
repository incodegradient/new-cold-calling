import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Agent } from '@/types/agents';
import { useAuth } from '@/contexts/AuthContext';

export const useAgents = () => {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAgents(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const upsertAgent = async (agentData: Partial<Agent>) => {
    if (!user) throw new Error("User not authenticated");

    const dataToUpsert = {
      ...agentData,
      user_id: user.id,
      updated_at: new Date().toISOString(),
    };

    if (!agentData.id) {
      // It's an insert
      delete dataToUpsert.id;
    }

    const { data, error } = await supabase
      .from('agents')
      .upsert(dataToUpsert)
      .select()
      .single();

    if (error) throw error;
    
    await fetchAgents();
    return data;
  };

  const deleteAgent = async (id: string) => {
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from('agents')
      .delete()
      .match({ id, user_id: user.id });

    if (error) throw error;

    await fetchAgents();
  };

  return { agents, loading, error, upsertAgent, deleteAgent, refetch: fetchAgents };
};
