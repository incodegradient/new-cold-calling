import { ColumnDef } from "@tanstack/react-table"
import { Campaign } from "@/types/campaigns"
import { Badge } from "@/components/ui/badge"
import { CampaignActions } from "./CampaignActions"
import { BotMessageSquare, Users } from "lucide-react"

export const getCampaignColumns = (onEdit: (campaign: Campaign) => void): ColumnDef<Campaign>[] => [
  {
    accessorKey: "name",
    header: "Campaign",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      // Add color logic here
      return <Badge variant="outline">{status}</Badge>;
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
