import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Connection, ServiceName } from '@/types/connections';
import { useAuth } from '@/contexts/AuthContext';

export const useConnections = () => {
  const { user } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConnections = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setConnections(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const upsertConnection = async (service: ServiceName, credentials: Record<string, any>) => {
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('connections')
      .upsert({
        user_id: user.id,
        service,
        credentials,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,service' })
      .select()
      .single();

    if (error) throw error;
    
    await fetchConnections(); // Refetch to update state
    return data;
  };

  const deleteConnection = async (service: ServiceName) => {
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from('connections')
      .delete()
      .match({ user_id: user.id, service });

    if (error) throw error;

    await fetchConnections(); // Refetch to update state
  };

  return { connections, loading, error, upsertConnection, deleteConnection, refetch: fetchConnections };
};
