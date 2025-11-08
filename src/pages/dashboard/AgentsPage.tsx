import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useAgents } from '@/hooks/useAgents';
import { Agent } from '@/types/agents';
import { DataTable } from '@/components/ui/data-table';
import { getColumns } from '@/components/dashboard/agents/columns';
import AgentDialog from '@/components/dashboard/agents/AgentDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

const AgentsPage = () => {
  const { agents, loading, error } = useAgents();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | undefined>(undefined);

  const handleAddNew = () => {
    setSelectedAgent(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (agent: Agent) => {
    setSelectedAgent(agent);
    setIsDialogOpen(true);
  };

  const columns = getColumns(handleEdit);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight">Agents</h1>
          <p className="text-muted-foreground">Manage your AI agents from Vapi and Retell.</p>
        </div>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Agent
        </Button>
      </div>

      {error && <p className="mt-4 text-destructive">Error loading agents: {error}</p>}

      <Card className="mt-6">
        <CardContent className="pt-6">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <DataTable columns={columns} data={agents} />
          )}
        </CardContent>
      </Card>

      <AgentDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        agent={selectedAgent}
      />
    </div>
  );
};

export default AgentsPage;
