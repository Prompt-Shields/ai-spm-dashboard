"use client"

import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

const toolUsageData = [
  { name: "Copilot", value: 48 },
  { name: "ChatGPT", value: 27 },
  { name: "Gemini", value: 10 },
  { name: "Claude", value: 8 },
  { name: "Others", value: 7 },
]

const trendData = [
  { day: "Day 1", prompts: 450 },
  { day: "Day 7", prompts: 520 },
  { day: "Day 14", prompts: 580 },
  { day: "Day 21", prompts: 610 },
  { day: "Day 30", prompts: 650 },
]

export function AIUsageVisibility() {
  return (
    <Card className="p-6 bg-white border border-gray-200 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-[#2A2A2A]">AI Usage Visibility</h3>
          <p className="text-sm text-gray-600 mt-1">Tool adoption and activity trends</p>
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="engineering">Engineering</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-8">
        <div>
          <p className="text-sm font-semibold text-[#2A2A2A] mb-4">Top AI Tools Used (%)</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={toolUsageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeWidth={1} />
              <XAxis dataKey="name" stroke="#2A2A2A" fontSize={13} fontWeight={600} tick={{ fill: "#2A2A2A" }} />
              <YAxis stroke="#2A2A2A" fontSize={13} fontWeight={600} tick={{ fill: "#2A2A2A" }} />
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
              <Bar dataKey="value" fill="#00ABBD" radius={[8, 8, 0, 0]} maxBarSize={70} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <p className="text-sm font-semibold text-[#2A2A2A] mb-4">Daily Prompt Activity (Last 30 Days)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeWidth={1} />
              <XAxis dataKey="day" stroke="#2A2A2A" fontSize={13} fontWeight={600} tick={{ fill: "#2A2A2A" }} />
              <YAxis stroke="#2A2A2A" fontSize={13} fontWeight={600} tick={{ fill: "#2A2A2A" }} />
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
              <Line
                type="monotone"
                dataKey="prompts"
                stroke="#B5D334"
                strokeWidth={3}
                dot={{ fill: "#B5D334", r: 5, strokeWidth: 2, stroke: "#FFFFFF" }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-5 bg-[#00ABBD]/5 border border-[#00ABBD]/20 rounded-lg">
        <p className="text-sm text-[#2A2A2A] leading-relaxed">
          <span className="font-bold text-[#00ABBD]">Insight:</span> Copilot usage up +25% this month — 72% of prompts
          in Engineering involve internal documents.
        </p>
      </div>
    </Card>
  )
}
