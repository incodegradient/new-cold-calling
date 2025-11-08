import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2, Bot, Phone, Target } from "lucide-react";

const OverviewPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold font-display tracking-tight">Dashboard Overview</h1>
      <p className="text-muted-foreground">Welcome back! Here's a snapshot of your calling activity.</p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
        <StatCard title="Active Campaigns" value="4" icon={<Target className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Calls Made (24h)" value="1,283" icon={<Phone className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Meetings Booked" value="32" icon={<Bot className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Success Rate" value="12.5%" icon={<BarChart2 className="h-4 w-4 text-muted-foreground" />} />
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

const StatCard = ({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) => (
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

export default OverviewPage;
