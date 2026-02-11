"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts"

const data = [
  { name: "Mon", a: 40, b: 24 },
  { name: "Tue", a: 30, b: 13 },
  { name: "Wed", a: 20, b: 98 },
  { name: "Thu", a: 27, b: 39 },
  { name: "Fri", a: 18, b: 48 },
  { name: "Sat", a: 23, b: 38 },
  { name: "Sun", a: 34, b: 43 },
]

export function OverviewChart({ data: propData }: { data?: any[] }) {
  const chartData = propData && propData.length > 0 ? propData : data

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#27272a" strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          stroke="#52525b"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#52525b"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#09090b",
            border: "1px solid #27272a",
            borderRadius: "6px",
            color: "#fafafa",
          }}
          itemStyle={{ color: "#fafafa" }}
          cursor={{ stroke: "#27272a", strokeWidth: 1 }}
        />
        <Area
          type="monotone"
          dataKey="a"
          stroke="#8b5cf6"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorA)"
        />
        <Area
          type="monotone"
          dataKey="b"
          stroke="#10b981"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorB)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
