import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

const metrics = [
  { label: "Total Active Users", value: "742", trend: "+7%", up: true },
  { label: "Total Prompts", value: "18,450", trend: "+12%", up: true },
  { label: "Shadow AI Tools", value: "6", trend: "-2", up: false },
  { label: "Blocked/Redacted", value: "312", trend: "+5%", up: true },
  { label: "Adoption Health Score", value: "83/100", trend: "+3", up: true },
]

export function ExecutiveOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-[#2A2A2A]">Executive Overview</h2>
        <p className="text-base text-gray-600 mt-2">Real-time AI usage and security metrics</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        {metrics.map((metric) => (
          <Card
            key={metric.label}
            className="p-6 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{metric.label}</p>
              <div className="flex items-end justify-between">
                <p className="text-4xl font-bold text-[#2A2A2A]">{metric.value}</p>
                <div
                  className={`flex items-center gap-1 text-sm font-bold px-2.5 py-1 rounded-md ${
                    metric.up ? "text-[#6E9C78] bg-[#6E9C78]/10" : "text-gray-500 bg-gray-100"
                  }`}
                >
                  {metric.up ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span>{metric.trend}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
