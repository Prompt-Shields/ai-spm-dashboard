"use client"

import { Card } from "@/components/ui/card"
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

const violationData = [
  { name: "Marketing", value: 36, color: "#00ABBD" }, // Turquoise
  { name: "Engineering", value: 28, color: "#2C5379" }, // Dark Blue
  { name: "Sales", value: 18, color: "#B5D334" }, // Fresh Green
  { name: "Finance", value: 12, color: "#6E9C78" }, // Moss Green
]

export function RiskCompliance() {
  return (
    <Card className="p-6 bg-white border border-gray-200 shadow-sm space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-[#2A2A2A]">Risk & Compliance Posture</h3>
        <p className="text-sm text-gray-600 mt-1">Data exposure and policy adherence</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2 p-5 bg-[#6E9C78]/10 rounded-lg border border-[#6E9C78]/30">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[#6E9C78]" />
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">PII Detection</p>
          </div>
          <p className="text-4xl font-bold text-[#2A2A2A]">94%</p>
        </div>

        <div className="space-y-2 p-5 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Redacted</p>
          </div>
          <p className="text-4xl font-bold text-[#2A2A2A]">312</p>
        </div>

        <div className="space-y-2 p-5 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Blocked</p>
          </div>
          <p className="text-4xl font-bold text-[#2A2A2A]">47</p>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-[#2A2A2A] mb-4">Violations by Department</p>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={violationData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}`}
              labelStyle={{ fontSize: 13, fontWeight: 600, fill: "#2A2A2A" }}
            >
              {violationData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={3} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3">
        <div className="p-5 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-[#2A2A2A] leading-relaxed">
            <span className="font-bold text-red-600">Top risk source:</span> Marketing team – 36 redactions this week.
          </p>
        </div>
        <div className="p-5 bg-[#6E9C78]/10 border border-[#6E9C78]/30 rounded-lg">
          <p className="text-sm text-[#2A2A2A] leading-relaxed">
            <span className="font-bold text-[#6E9C78]">Success:</span> Finance team achieved 98% compliance after policy
            update.
          </p>
        </div>
      </div>
    </Card>
  )
}
