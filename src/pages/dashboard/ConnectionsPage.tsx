import { useState } from 'react';
import { useConnections } from '@/hooks/useConnections';
import { serviceDetails, ServiceName, Connection } from '@/types/connections';
import ConnectionCard from '@/components/dashboard/connections/ConnectionCard';
import ConnectionDialog from '@/components/dashboard/connections/ConnectionDialog';
import { Skeleton } from '@/components/ui/skeleton';

const ConnectionsPage = () => {
  const { connections, loading, error } = useConnections();
  const [selectedService, setSelectedService] = useState<ServiceName | null>(null);

  const connectionsMap = new Map<ServiceName, Connection>(
    connections.map(c => [c.service, c])
  );

  const handleManage = (service: ServiceName) => {
    setSelectedService(service);
  };

  const handleClose = () => {
    setSelectedService(null);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold font-display tracking-tight">Connections</h1>
      <p className="text-muted-foreground">Manage your integrations with third-party services.</p>
      
      {error && <p className="mt-4 text-destructive">Error loading connections: {error}</p>}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[160px] rounded-lg" />
            ))
          : (Object.keys(serviceDetails) as ServiceName[]).map(serviceKey => (
              <ConnectionCard
                key={serviceKey}
                serviceKey={serviceKey}
                service={serviceDetails[serviceKey]}
                connection={connectionsMap.get(serviceKey)}
                onManage={handleManage}
              />
            ))}
      </div>

      {selectedService && (
        <ConnectionDialog
          serviceKey={selectedService}
          isOpen={!!selectedService}
          onClose={handleClose}
          existingConnection={connectionsMap.get(selectedService)}
        />
      )}
    </div>
  );
};

export default ConnectionsPage;
