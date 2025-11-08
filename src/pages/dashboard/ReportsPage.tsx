import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const ReportsPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold font-display tracking-tight">Analytics & Reports</h1>
      <p className="text-muted-foreground">Analyze the performance of your campaigns and agents.</p>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>Detailed analytics dashboards and reporting features will be implemented here.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
};

export default ReportsPage;
