import { useState } from 'react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Lead } from '@/types/leads';
import { useLeads } from '@/hooks/useLeads';
import { toast } from 'sonner';

interface LeadActionsProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
}

export const LeadActions = ({ lead, onEdit }: LeadActionsProps) => {
  const { deleteLead } = useLeads();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete the lead "${lead.name}"?`)) {
      return;
    }
    setIsDeleting(true);
    try {
      await deleteLead(lead.id);
      toast.success('Lead deleted successfully.');
    } catch (error: any) {
      toast.error(`Failed to delete lead: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onEdit(lead)}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} disabled={isDeleting} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          {isDeleting ? 'Deleting...' : 'Delete'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
