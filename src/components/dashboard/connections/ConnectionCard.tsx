import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ServiceName, ServiceDetail, Connection } from '@/types/connections';

interface ConnectionCardProps {
  serviceKey: ServiceName;
  service: ServiceDetail;
  connection: Connection | undefined;
  onManage: (service: ServiceName) => void;
}

const ConnectionCard = ({ serviceKey, service, connection, onManage }: ConnectionCardProps) => {
  const isConnected = !!connection;

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
            <service.icon className="w-6 h-6 text-muted-foreground" />
          </div>
        </div>
        <div className="flex-1">
          <CardTitle>{service.name}</CardTitle>
          <CardDescription className="mt-1 line-clamp-2">{service.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow"></CardContent>
      <CardFooter className="flex justify-between items-center">
        <Badge variant={isConnected ? 'default' : 'outline'} className={isConnected ? 'bg-green-500/20 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-300 dark:border-green-700' : ''}>
          {isConnected ? 'Connected' : 'Not Connected'}
        </Badge>
        <Button variant="outline" size="sm" onClick={() => onManage(serviceKey)}>
          Manage
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ConnectionCard;
