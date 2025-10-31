"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, Clock, Zap } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const useCaseData = [
  { name: "Doc Summaries", value: 35 },
  { name: "Coding Support", value: 28 },
  { name: "Slide Generation", value: 18 },
  { name: "Report Drafting", value: 12 },
  { name: "Other", value: 7 },
]

export function AIAdoptionInsights() {
  return (
    <Card className="p-6 bg-white border border-gray-200 shadow-sm space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-[#2A2A2A]">AI Adoption Insights</h3>
        <p className="text-sm text-gray-600 mt-1">Business value and productivity metrics</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#00ABBD]" />
            <p className="text-xs font-medium text-gray-600">Productivity Score</p>
          </div>
          <p className="text-3xl font-bold text-[#2A2A2A]">8.2</p>
          <p className="text-xs text-gray-500">prompts/user/week</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#B5D334]" />
            <p className="text-xs font-medium text-gray-600">Time Saved</p>
          </div>
          <p className="text-3xl font-bold text-[#2A2A2A]">2,310</p>
          <p className="text-xs text-gray-500">hours/month</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-[#6E9C78]" />
            <p className="text-xs font-medium text-gray-600">FTE Gain</p>
          </div>
          <p className="text-3xl font-bold text-[#2A2A2A]">1.3</p>
          <p className="text-xs text-gray-500">equivalent</p>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-[#2A2A2A] mb-4">Top Use Cases (%)</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={useCaseData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeWidth={1} />
            <XAxis
              dataKey="name"
              stroke="#2A2A2A"
              fontSize={12}
              fontWeight={600}
              angle={-15}
              textAnchor="end"
              height={70}
              tick={{ fill: "#2A2A2A" }}
            />
            <YAxis stroke="#2A2A2A" fontSize={12} fontWeight={600} tick={{ fill: "#2A2A2A" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              labelStyle={{ color: "#2A2A2A", fontWeight: 600 }}
            />
            <Bar dataKey="value" fill="#2C5379" radius={[6, 6, 0, 0]} maxBarSize={60} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="p-5 bg-[#6E9C78]/10 border border-[#6E9C78]/30 rounded-lg">
        <p className="text-sm text-[#2A2A2A] leading-relaxed">
          <span className="font-semibold text-[#6E9C78]">Value:</span> Estimated time saved: 2,310 hours/month ≈ 1.3 FTE
          productivity gain.
        </p>
      </div>
    </Card>
  )
}
