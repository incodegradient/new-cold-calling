import { MoreHorizontal, Pencil, Play, Pause, StopCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Campaign } from '@/types/campaigns';

interface CampaignActionsProps {
  campaign: Campaign;
  onEdit: (campaign: Campaign) => void;
}

export const CampaignActions = ({ campaign, onEdit }: CampaignActionsProps) => {
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
        <DropdownMenuItem onClick={() => onEdit(campaign)}>
          <Pencil className="mr-2 h-4 w-4" />
          View/Edit
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Play className="mr-2 h-4 w-4" />
          Resume
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Pause className="mr-2 h-4 w-4" />
          Pause
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive focus:text-destructive">
          <StopCircle className="mr-2 h-4 w-4" />
          Stop
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
