import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useCampaigns } from '@/hooks/useCampaigns';
import { Campaign } from '@/types/campaigns';
import { DataTable } from '@/components/ui/data-table';
import { getCampaignColumns } from '@/components/dashboard/campaigns/columns';
import CreateCampaignWizard from '@/components/dashboard/campaigns/CreateCampaignWizard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

const CampaignsPage = () => {
  const { campaigns, loading, error } = useCampaigns();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | undefined>(undefined);

  const handleCreateNew = () => {
    setSelectedCampaign(undefined);
    setIsWizardOpen(true);
  };

  const handleEdit = (campaign: Campaign) => {
    // For now, this just opens the wizard. A full edit flow would be more complex.
    setSelectedCampaign(campaign);
    setIsWizardOpen(true);
  };

  const columns = getCampaignColumns(handleEdit);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">Create and monitor your outbound calling campaigns.</p>
        </div>
        <Button onClick={handleCreateNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Campaign
        </Button>
      </div>

      {error && <p className="mt-4 text-destructive">Error loading campaigns: {error.message}</p>}

      <Card className="mt-6">
        <CardContent className="pt-6">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <DataTable columns={columns} data={campaigns} />
          )}
        </CardContent>
      </Card>

      {isWizardOpen && (
        <CreateCampaignWizard
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
        />
      )}
    </div>
  );
};

export default CampaignsPage;
