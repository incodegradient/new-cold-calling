import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAgents } from '@/hooks/useAgents';
import { Skeleton } from '@/components/ui/skeleton';

const detailsSchema = z.object({
  name: z.string().min(3, "Campaign name must be at least 3 characters"),
  agent_id: z.string({ required_error: "Please select an agent" }),
});

type DetailsFormValues = z.infer<typeof detailsSchema>;

interface Step1DetailsProps {
  onNext: (data: DetailsFormValues) => void;
  initialData: Partial<DetailsFormValues>;
}

const Step1Details = ({ onNext, initialData }: Step1DetailsProps) => {
  const { agents, loading: agentsLoading } = useAgents();
  const { control, register, handleSubmit, formState: { errors } } = useForm<DetailsFormValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: initialData,
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Campaign Name</Label>
        <Input id="name" placeholder="e.g., Q4 Prospecting" {...register('name')} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="agent_id">Select Agent</Label>
        {agentsLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <Controller
            name="agent_id"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an AI agent for this campaign" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map(agent => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name} ({agent.platform})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )}
        {errors.agent_id && <p className="text-sm text-destructive">{errors.agent_id.message}</p>}
      </div>
      <div className="flex justify-end pt-4">
        <Button type="submit">Next</Button>
      </div>
    </form>
  );
};

export default Step1Details;
