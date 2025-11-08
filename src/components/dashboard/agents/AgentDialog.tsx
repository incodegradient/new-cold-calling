import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Agent } from '@/types/agents';
import { useAgents } from '@/hooks/useAgents';
import { useState } from 'react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AgentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  agent?: Agent;
}

const agentSchema = z.object({
  name: z.string().min(2, { message: "Agent name is required" }),
  platform: z.enum(['vapi', 'retell'], { required_error: "Platform is required" }),
  provider_agent_id: z.string().min(1, { message: "Provider Agent ID is required" }),
});

type AgentFormValues = z.infer<typeof agentSchema>;

const AgentDialog = ({ isOpen, onClose, agent }: AgentDialogProps) => {
  const { upsertAgent } = useAgents();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, control, reset } = useForm<AgentFormValues>({
    resolver: zodResolver(agentSchema),
    defaultValues: agent ? {
      name: agent.name,
      platform: agent.platform,
      provider_agent_id: agent.provider_agent_id,
    } : {
      name: '',
      platform: undefined,
      provider_agent_id: '',
    },
  });

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset();
      onClose();
    }
  };

  const onSubmit = async (data: AgentFormValues) => {
    setLoading(true);
    try {
      const agentData: Partial<Agent> = {
        ...data,
        id: agent?.id,
      };
      await upsertAgent(agentData);
      toast.success(`Agent ${agent ? 'updated' : 'created'} successfully!`);
      handleOpenChange(false);
    } catch (error: any) {
      toast.error(`Failed to save agent: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{agent ? 'Edit Agent' : 'Add New Agent'}</DialogTitle>
          <DialogDescription>
            {agent ? 'Update the details for your AI agent.' : 'Add a new AI agent from Vapi or Retell.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Agent Name</Label>
            <Input
              id="name"
              placeholder="e.g., Sales Development Rep"
              {...register("name")}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="platform">Platform</Label>
            <Controller
              control={control}
              name="platform"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vapi">Vapi.ai</SelectItem>
                    <SelectItem value="retell">Retell.ai</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.platform && <p className="text-sm text-destructive">{errors.platform.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="provider_agent_id">Provider Agent ID</Label>
            <Input
              id="provider_agent_id"
              placeholder="Enter the Agent ID from Vapi/Retell"
              {...register("provider_agent_id")}
            />
            {errors.provider_agent_id && <p className="text-sm text-destructive">{errors.provider_agent_id.message}</p>}
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Agent'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AgentDialog;
