import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useLeads } from '@/hooks/useLeads';
import { useLeadGroups } from '@/hooks/useLeadGroups';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/ui/data-table';
import { getLeadColumns } from '../../leads/columns';

interface Step2LeadsProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData: any;
}

const Step2Leads = ({ onNext, onBack, initialData }: Step2LeadsProps) => {
  const { leads, loading: leadsLoading } = useLeads();
  const { leadGroups, loading: groupsLoading } = useLeadGroups();
  const [selectedLeads, setSelectedLeads] = useState<string[]>(initialData.selectedLeads || []);
  const [selectedGroups, setSelectedGroups] = useState<string[]>(initialData.selectedGroups || []);

  const handleSubmit = () => {
    onNext({ selectedLeads, selectedGroups });
  };

  const handleGroupToggle = (groupId: string) => {
    setSelectedGroups(prev => 
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
    );
  };
  
  const columns = getLeadColumns(() => {});

  return (
    <div className="space-y-6">
      <Tabs defaultValue="groups">
        <TabsList>
          <TabsTrigger value="groups">By Group</TabsTrigger>
          <TabsTrigger value="individual">By Individual Lead</TabsTrigger>
        </TabsList>
        <TabsContent value="groups" className="mt-4">
          <p className="text-sm text-muted-foreground mb-4">Select entire groups of leads to include in this campaign.</p>
          {groupsLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
              {leadGroups.map(group => (
                <div key={group.id} className="flex items-center space-x-2 rounded-md border p-3">
                  <Checkbox
                    id={group.id}
                    checked={selectedGroups.includes(group.id)}
                    onCheckedChange={() => handleGroupToggle(group.id)}
                  />
                  <Label htmlFor={group.id} className="font-medium cursor-pointer">{group.name}</Label>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="individual" className="mt-4">
          <p className="text-sm text-muted-foreground mb-4">Select individual leads. Note: Leads from selected groups will be included automatically.</p>
          {leadsLoading ? (
            <Skeleton className="h-60 w-full" />
          ) : (
             <DataTable columns={columns} data={leads} />
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={handleSubmit}>Next</Button>
      </div>
    </div>
  );
};

export default Step2Leads;
