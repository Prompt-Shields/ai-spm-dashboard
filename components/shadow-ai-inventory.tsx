import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertTriangle, XCircle, MoreHorizontal } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const tools = [
  {
    domain: "chat.openai.com",
    type: "External",
    status: "Allowed",
    users: 325,
    dataAccess: "Public",
    icon: CheckCircle2,
    color: "text-success",
  },
  {
    domain: "claude.ai",
    type: "External",
    status: "Under Review",
    users: 58,
    dataAccess: "Public",
    icon: AlertTriangle,
    color: "text-warning",
  },
  {
    domain: "localhost:11434",
    type: "Internal LLM",
    status: "Allowed",
    users: 21,
    dataAccess: "Private",
    icon: CheckCircle2,
    color: "text-success",
  },
  {
    domain: "notebooks.google.com",
    type: "External",
    status: "Unapproved",
    users: 12,
    dataAccess: "Unknown",
    icon: XCircle,
    color: "text-destructive",
  },
]

export function ShadowAIInventory() {
  return (
    <Card className="p-6 bg-white border border-gray-200 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-[#2A2A2A]">Shadow AI & Tool Inventory</h3>
          <p className="text-sm text-gray-600 mt-1">Manage approved and unapproved AI tools</p>
        </div>
        <Button variant="outline" size="sm" className="border-gray-300 bg-transparent">
          Export Inventory
        </Button>
      </div>

      <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-200">
              <TableHead className="text-[#2A2A2A] font-semibold">Tool / Domain</TableHead>
              <TableHead className="text-[#2A2A2A] font-semibold">Type</TableHead>
              <TableHead className="text-[#2A2A2A] font-semibold">Status</TableHead>
              <TableHead className="text-[#2A2A2A] font-semibold">Users</TableHead>
              <TableHead className="text-[#2A2A2A] font-semibold">Data Access</TableHead>
              <TableHead className="text-[#2A2A2A] font-semibold">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tools.map((tool) => {
              const Icon = tool.icon
              return (
                <TableRow key={tool.domain} className="hover:bg-gray-50 border-b border-gray-100">
                  <TableCell className="font-mono text-sm font-medium text-[#2A2A2A]">{tool.domain}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-medium">
                      {tool.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${tool.color}`} />
                      <span className="text-sm font-medium text-[#2A2A2A]">{tool.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-[#2A2A2A]">{tool.users}</TableCell>
                  <TableCell>
                    <Badge variant={tool.dataAccess === "Private" ? "default" : "secondary"} className="font-medium">
                      {tool.dataAccess}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Allow</DropdownMenuItem>
                        <DropdownMenuItem>Review</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Block</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
