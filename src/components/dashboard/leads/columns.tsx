import { ColumnDef } from "@tanstack/react-table"
import { Lead } from "@/types/leads"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { LeadActions } from "./LeadActions"
import { cn } from "@/lib/utils"

export const getLeadColumns = (onEdit: (lead: Lead) => void): ColumnDef<Lead>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "lead_groups.name",
    header: "Group",
    cell: ({ row }) => {
      const groupName = row.original.lead_groups?.name;
      return groupName ? <Badge variant="secondary">{groupName}</Badge> : <span className="text-muted-foreground">-</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as Lead['status'];
      const statusStyles: Record<Lead['status'], string> = {
        'New': "bg-blue-500/20 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-300 dark:border-blue-700",
        'Queued': "bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700",
        'Called': "bg-muted/50 text-muted-foreground border-border",
        'Scheduled': "bg-green-500/20 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-300 dark:border-green-700",
        'Do-Not-Call': "bg-red-500/20 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-300 dark:border-red-700",
      };
      return <Badge variant="outline" className={cn(statusStyles[status] || "")}>{status}</Badge>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const lead = row.original;
      return <LeadActions lead={lead} onEdit={onEdit} />;
    },
  },
]
