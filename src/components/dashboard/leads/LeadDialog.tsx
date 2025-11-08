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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Lead, LeadGroup } from '@/types/leads';
import { useLeads } from '@/hooks/useLeads';
import { useLeadGroups } from '@/hooks/useLeadGroups';
import { useState } from 'react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LeadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  lead?: Lead;
}

const leadSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "A valid phone number is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  city: z.string().optional(),
  industries: z.string().optional(),
  where: z.string().optional(),
  group_id: z.string().optional().nullable(),
  new_group_name: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadSchema>;

const LeadDialog = ({ isOpen, onClose, lead }: LeadDialogProps) => {
  const { upsertLead } = useLeads();
  const { leadGroups, findOrCreateGroup } = useLeadGroups();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, control, reset, watch } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: lead || {},
  });

  const groupId = watch("group_id");

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset();
      onClose();
    }
  };

  const onSubmit = async (data: LeadFormValues) => {
    setLoading(true);
    try {
      let finalGroupId = data.group_id;
      if (data.group_id === 'new' && data.new_group_name) {
        const newGroup = await findOrCreateGroup(data.new_group_name);
        finalGroupId = newGroup.id;
      }

      const leadData: Partial<Lead> = {
        ...data,
        id: lead?.id,
        group_id: finalGroupId,
      };
      delete (leadData as any).new_group_name;

      await upsertLead(leadData);
      toast.success(`Lead ${lead ? 'updated' : 'created'} successfully!`);
      handleOpenChange(false);
    } catch (error: any) {
      toast.error(`Failed to save lead: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{lead ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
          <DialogDescription>
            {lead ? 'Update the details for this lead.' : 'Enter the information for the new lead.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" {...register("phone")} />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" {...register("city")} />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="industries">Industries</Label>
              <Input id="industries" {...register("industries")} />
            </div>
          </div>
           <div className="grid gap-2">
              <Label htmlFor="where">Source</Label>
              <Input id="where" placeholder="e.g., LinkedIn, Website" {...register("where")} />
            </div>
          <div className="grid gap-2">
            <Label htmlFor="group_id">Lead Group</Label>
            <Controller
              control={control}
              name="group_id"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a group (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Create new group...</SelectItem>
                    {leadGroups.map((group: LeadGroup) => (
                      <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          {groupId === 'new' && (
            <div className="grid gap-2">
              <Label htmlFor="new_group_name">New Group Name</Label>
              <Input id="new_group_name" {...register("new_group_name")} />
              {errors.new_group_name && <p className="text-sm text-destructive">{errors.new_group_name.message}</p>}
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Lead'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LeadDialog;
