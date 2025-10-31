import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Shield, TrendingDown, Users } from "lucide-react"

const alerts = [
  {
    type: "High PII Leak Risk",
    icon: AlertTriangle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    borderColor: "border-destructive/30",
    message: "> 20 violations in 24h detected in Marketing department",
    action: "Notify CISO",
    severity: "Critical",
  },
  {
    type: "New Shadow AI Tool",
    icon: Shield,
    color: "text-warning",
    bgColor: "bg-warning/10",
    borderColor: "border-warning/30",
    message: "New domain detected: perplexity.ai (8 users)",
    action: "Review Tool",
    severity: "Medium",
  },
  {
    type: "Policy Non-Compliance",
    icon: Users,
    color: "text-warning",
    bgColor: "bg-warning/10",
    borderColor: "border-warning/30",
    message: "User john.doe@company.com > 5 blocked prompts today",
    action: "Send Training",
    severity: "Medium",
  },
  {
    type: "Adoption Drop",
    icon: TrendingDown,
    color: "text-muted-foreground",
    bgColor: "bg-muted/30",
    borderColor: "border-muted/40",
    message: "AI usage ↓ 30% WoW in Sales department",
    action: "Suggest Refresher",
    severity: "Low",
  },
]

export function AlertsNotifications() {
  return (
    <Card className="p-6 bg-white border border-gray-200 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-[#2A2A2A]">Alerts & Notifications</h3>
          <p className="text-sm text-gray-600 mt-1">Real-time security and compliance alerts</p>
        </div>
        <Button variant="outline" size="sm" className="border-gray-300 bg-transparent">
          View All Alerts
        </Button>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, index) => {
          const Icon = alert.icon
          return (
            <div key={index} className={`p-5 rounded-lg border ${alert.bgColor} ${alert.borderColor}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <Icon className={`h-5 w-5 ${alert.color} mt-0.5 flex-shrink-0`} />
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm text-[#2A2A2A]">{alert.type}</p>
                      <Badge variant={alert.severity === "Critical" ? "destructive" : "secondary"} className="text-xs">
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-[#2A2A2A]/90 leading-relaxed">{alert.message}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="flex-shrink-0 border-gray-300 bg-white hover:bg-gray-50">
                  {alert.action}
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
