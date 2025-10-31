"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const complianceData = [
  { department: "Legal", score: 95 },
  { department: "Finance", score: 98 },
  { department: "Engineering", score: 87 },
  { department: "Marketing", score: 72 },
  { department: "Sales", score: 81 },
]

export function PolicyCompliance() {
  return (
    <Card className="p-6 bg-white border border-gray-200 shadow-sm space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-[#2A2A2A]">Policy Compliance & Behavioral Metrics</h3>
        <p className="text-sm text-gray-600 mt-1">Employee awareness and adherence</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3 p-5 bg-[#6E9C78]/10 rounded-lg border border-[#6E9C78]/30">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Safe Submissions</p>
          <div className="flex items-end gap-3">
            <p className="text-4xl font-bold text-[#6E9C78]">87%</p>
            <Progress value={87} className="h-3 flex-1" />
          </div>
        </div>

        <div className="space-y-3 p-5 bg-[#00ABBD]/10 rounded-lg border border-[#00ABBD]/30">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Prompt Coach Completion</p>
          <div className="flex items-end gap-3">
            <p className="text-4xl font-bold text-[#00ABBD]">92%</p>
            <Progress value={92} className="h-3 flex-1" />
          </div>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-[#2A2A2A] mb-4">Compliance Score by Department</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={complianceData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeWidth={1} />
            <XAxis type="number" stroke="#2A2A2A" fontSize={13} fontWeight={600} tick={{ fill: "#2A2A2A" }} />
            <YAxis
              dataKey="department"
              type="category"
              stroke="#2A2A2A"
              fontSize={13}
              fontWeight={600}
              width={100}
              tick={{ fill: "#2A2A2A" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              labelStyle={{ color: "#2A2A2A", fontWeight: 700, fontSize: 14 }}
              itemStyle={{ color: "#2A2A2A", fontWeight: 600 }}
            />
            <Bar dataKey="score" fill="#B5D334" radius={[0, 8, 8, 0]} maxBarSize={35} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="p-5 bg-[#2C5379]/10 border border-[#2C5379]/30 rounded-lg">
        <p className="text-sm text-[#2A2A2A] leading-relaxed">
          <span className="font-bold text-[#2C5379]">Insight:</span> Legal and Finance departments show highest
          adherence (95%+) — target Training 2.0 rollout for Marketing.
        </p>
      </div>
    </Card>
  )
}
