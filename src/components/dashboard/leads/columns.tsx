import { ColumnDef } from "@tanstack/react-table"
import { Lead } from "@/types/leads"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { LeadActions } from "./LeadActions"

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
      const status = row.getValue("status") as string;
      return <Badge variant="outline">{status}</Badge>;
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
