import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAgents } from "@/hooks/useAgents";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useConnections } from "@/hooks/useConnections";
import { useLeads } from "@/hooks/useLeads";
import { BarChart2, Bot, Users, Target, Zap } from "lucide-react";

const OverviewPage = () => {
  const { campaigns, loading: campaignsLoading } = useCampaigns();
  const { agents, loading: agentsLoading } = useAgents();
  const { leads, loading: leadsLoading } = useLeads();
  const { connections, loading: connectionsLoading } = useConnections();

  const isLoading = campaignsLoading || agentsLoading || leadsLoading || connectionsLoading;

  const activeCampaigns = campaigns.filter(c => c.status === 'Active').length;
  const totalAgents = agents.length;
  const totalLeads = leads.length;
  const activeConnections = connections.length;

  return (
    <div>
      <h1 className="text-3xl font-bold font-display tracking-tight">Dashboard Overview</h1>
      <p className="text-muted-foreground">Welcome back! Here's a snapshot of your calling activity.</p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard title="Active Campaigns" value={activeCampaigns} icon={<Target className="h-4 w-4 text-muted-foreground" />} />
            <StatCard title="Total Agents" value={totalAgents} icon={<Bot className="h-4 w-4 text-muted-foreground" />} />
            <StatCard title="Total Leads" value={totalLeads} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
            <StatCard title="Connections" value={activeConnections} icon={<Zap className="h-4 w-4 text-muted-foreground" />} />
          </>
        )}
      </div>
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Recent campaign activity will be shown here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const StatCardSkeleton = () => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
            <Skeleton className="h-8 w-1/3" />
        </CardContent>
    </Card>
)


export default OverviewPage;
