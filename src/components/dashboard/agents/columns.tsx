"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Agent } from "@/types/agents"
import { Badge } from "@/components/ui/badge"
import { AgentActions } from "./AgentActions"
import { BotMessageSquare } from "lucide-react"

export const getColumns = (onEdit: (agent: Agent) => void): ColumnDef<Agent>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const platform = row.original.platform;
      return (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <BotMessageSquare className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="font-medium">{row.getValue("name")}</div>
        </div>
      )
    }
  },
  {
    accessorKey: "platform",
    header: "Platform",
    cell: ({ row }) => {
      const platform = row.getValue("platform") as string;
      return <Badge variant="secondary">{platform.charAt(0).toUpperCase() + platform.slice(1)}</Badge>
    },
  },
  {
    accessorKey: "provider_agent_id",
    header: "Provider ID",
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("is_active")
      return <Badge variant={isActive ? "default" : "outline"} className={isActive ? "bg-green-500/20 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-300 dark:border-green-700" : ""}>{isActive ? "Active" : "Inactive"}</Badge>
    },
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => {
        return new Date(row.getValue("created_at")).toLocaleDateString()
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const agent = row.original
      return <AgentActions agent={agent} onEdit={onEdit} />
    },
  },
]
