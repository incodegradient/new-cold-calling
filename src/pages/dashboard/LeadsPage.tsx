import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Upload } from 'lucide-react';
import { useLeads } from '@/hooks/useLeads';
import { Lead } from '@/types/leads';
import { DataTable } from '@/components/ui/data-table';
import { getLeadColumns } from '@/components/dashboard/leads/columns';
import LeadDialog from '@/components/dashboard/leads/LeadDialog';
import CSVImportDialog from '@/components/dashboard/leads/CSVImportDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

const LeadsPage = () => {
  const { leads, loading, error } = useLeads();
  const [isLeadDialogOpen, setIsLeadDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | undefined>(undefined);

  const handleAddNew = () => {
    setSelectedLead(undefined);
    setIsLeadDialogOpen(true);
  };

  const handleEdit = (lead: Lead) => {
    setSelectedLead(lead);
    setIsLeadDialogOpen(true);
  };

  const columns = getLeadColumns(handleEdit);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight">Leads</h1>
          <p className="text-muted-foreground">Manage your leads and lead groups.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import from CSV
          </Button>
          <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Lead
          </Button>
        </div>
      </div>

      {error && <p className="mt-4 text-destructive">Error loading leads: {error}</p>}

      <Card className="mt-6">
        <CardContent className="pt-6">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <DataTable columns={columns} data={leads} />
          )}
        </CardContent>
      </Card>

      <LeadDialog
        isOpen={isLeadDialogOpen}
        onClose={() => setIsLeadDialogOpen(false)}
        lead={selectedLead}
      />
      <CSVImportDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
      />
    </div>
  );
};

export default LeadsPage;
