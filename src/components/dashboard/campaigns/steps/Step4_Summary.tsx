import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAgents } from '@/hooks/useAgents';
import { useLeads } from '@/hooks/useLeads';
import { useLeadGroups } from '@/hooks/useLeadGroups';

const summarySchema = z.object({
  retry_rules: z.object({
    max_attempts: z.coerce.number().min(1, "Must be at least 1"),
    backoff_time_minutes: z.coerce.number().min(0, "Must be 0 or more"),
  }),
});

type SummaryFormValues = z.infer<typeof summarySchema>;

interface Step4SummaryProps {
  onSubmit: (data: SummaryFormValues) => void;
  onBack: () => void;
  data: any;
  loading: boolean;
}

const Step4Summary = ({ onSubmit, onBack, data, loading }: Step4SummaryProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<SummaryFormValues>({
    resolver: zodResolver(summarySchema),
    defaultValues: {
      retry_rules: data.retry_rules || { max_attempts: 3, backoff_time_minutes: 5 },
    },
  });

  const { agents } = useAgents();
  const { leads } = useLeads();
  const { leadGroups } = useLeadGroups();
  
  const selectedAgent = agents.find(a => a.id === data.agent_id);
  const totalLeads = new Set(data.selectedLeads);
  data.selectedGroups.forEach((groupId: string) => {
    leads.filter(l => l.group_id === groupId).forEach(l => totalLeads.add(l.id));
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div>
        <h3 className="text-lg font-medium">Retry Rules</h3>
        <p className="text-sm text-muted-foreground">Configure how the system retries failed calls.</p>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="max_attempts">Max Attempts</Label>
            <Input id="max_attempts" type="number" {...register('retry_rules.max_attempts')} />
            {errors.retry_rules?.max_attempts && <p className="text-sm text-destructive">{errors.retry_rules.max_attempts.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="backoff_time_minutes">Backoff Time (minutes)</Label>
            <Input id="backoff_time_minutes" type="number" {...register('retry_rules.backoff_time_minutes')} />
            {errors.retry_rules?.backoff_time_minutes && <p className="text-sm text-destructive">{errors.retry_rules.backoff_time_minutes.message}</p>}
          </div>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Campaign Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SummaryItem label="Campaign Name" value={data.name} />
          <SummaryItem label="Agent" value={selectedAgent?.name} />
          <SummaryItem label="Total Unique Leads" value={totalLeads.size} />
          <SummaryItem 
            label="Schedule" 
            value={`${data.schedule.start_time} - ${data.schedule.end_time} (${data.schedule.timezone || 'N/A'}) on ${data.schedule.weekdays.join(', ')}`} 
          />
          <SummaryItem label="Pacing" value={`${data.pacing.max_concurrent_calls} concurrent calls, ${data.pacing.gap_minutes} min gap`} />
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack} disabled={loading}>Back</Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating Campaign...' : 'Create & Launch Campaign'}
        </Button>
      </div>
    </form>
  );
};

const SummaryItem = ({ label, value }: { label: string, value: any }) => (
  <div className="flex justify-between text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium text-right">{value || '-'}</span>
  </div>
);

export default Step4Summary;
