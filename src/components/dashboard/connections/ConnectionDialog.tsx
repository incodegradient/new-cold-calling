import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { serviceDetails, ServiceName, Connection } from '@/types/connections';
import { useConnections } from '@/hooks/useConnections';
import { useState } from 'react';
import { toast } from 'sonner';

interface ConnectionDialogProps {
  serviceKey: ServiceName;
  isOpen: boolean;
  onClose: () => void;
  existingConnection?: Connection;
}

const ConnectionDialog = ({ serviceKey, isOpen, onClose, existingConnection }: ConnectionDialogProps) => {
  const service = serviceDetails[serviceKey];
  const { upsertConnection, deleteConnection } = useConnections();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const schema = z.object(
    Object.fromEntries(
      service.fields.map(field => [field.key, z.string().min(1, `${field.label} is required`)])
    )
  );

  type FormValues = z.infer<typeof schema>;

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: existingConnection?.credentials || {},
  });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      await upsertConnection(serviceKey, data);
      toast.success(`${service.name} connection saved successfully!`);
      onClose();
    } catch (error: any) {
      toast.error(`Failed to save connection: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteConnection(serviceKey);
      toast.success(`${service.name} connection removed.`);
      onClose();
    } catch (error: any) {
      toast.error(`Failed to remove connection: ${error.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage {service.name} Connection</DialogTitle>
          <DialogDescription>{service.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          {service.fields.map(field => (
            <div key={field.key} className="grid gap-2">
              <Label htmlFor={field.key}>{field.label}</Label>
              <Input
                id={field.key}
                type={field.type}
                placeholder={field.placeholder}
                {...register(field.key as keyof FormValues)}
              />
              {errors[field.key as keyof FormValues] && (
                <p className="text-sm text-destructive">{errors[field.key as keyof FormValues]?.message}</p>
              )}
            </div>
          ))}
          <DialogFooter className="mt-4">
            {existingConnection && (
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleteLoading}>
                {deleteLoading ? 'Disconnecting...' : 'Disconnect'}
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Connection'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectionDialog;
