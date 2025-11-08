import { ColumnDef } from "@tanstack/react-table"
import { Campaign } from "@/types/campaigns"
import { Badge } from "@/components/ui/badge"
import { CampaignActions } from "./CampaignActions"
import { Users } from "lucide-react"
import { cn } from "@/lib/utils"

export const getCampaignColumns = (onEdit: (campaign: Campaign) => void): ColumnDef<Campaign>[] => [
  {
    accessorKey: "name",
    header: "Campaign",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as Campaign['status'];
      const statusStyles: Record<Campaign['status'], string> = {
        Draft: "bg-muted/50 text-muted-foreground border-border",
        Active: "bg-green-500/20 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-300 dark:border-green-700",
        Paused: "bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700",
        Completed: "bg-blue-500/20 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-300 dark:border-blue-700",
      };
      return <Badge variant="outline" className={cn(statusStyles[status] || "")}>{status}</Badge>;
    },
  },
  {
    accessorKey: "agents.name",
    header: "Agent",
    cell: ({ row }) => row.original.agents?.name || '-',
  },
  {
    accessorKey: "lead_count",
    header: "Leads",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        {row.original.lead_count || 0}
      </div>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => new Date(row.getValue("created_at")).toLocaleDateString(),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const campaign = row.original;
      return <CampaignActions campaign={campaign} onEdit={onEdit} />;
    },
  },
]
