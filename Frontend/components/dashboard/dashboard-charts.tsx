"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { transactionVolumeData, riskDistributionData, fraudVsNormalData } from "@/lib/mock-data"

function useMounted() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return mounted
}

export function TransactionChart() {
  const mounted = useMounted()

  if (!mounted) {
    return (
      <Card className="col-span-2 border-primary/25 bg-card shadow-[0_0_18px_rgba(59,130,246,0.18)]">
        <CardHeader>
          <CardTitle className="text-card-foreground">Transaction Volume</CardTitle>
          <CardDescription>Daily transaction count over the past 15 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full animate-pulse rounded-md bg-muted/50" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-2 border-primary/25 bg-card shadow-[0_0_18px_rgba(59,130,246,0.18)]">
      <CardHeader>
        <CardTitle className="text-card-foreground">Transaction Volume</CardTitle>
        <CardDescription>Daily transaction count over the past 15 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={transactionVolumeData}>
              <defs>
                <linearGradient id="transactionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="suspiciousGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--card-foreground))",
                }}
              />
              <Area
                type="monotone"
                dataKey="transactions"
                stroke="hsl(var(--chart-1))"
                fill="url(#transactionGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="suspicious"
                stroke="hsl(var(--chart-3))"
                fill="url(#suspiciousGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function RiskDistributionChart() {
  const mounted = useMounted()

  if (!mounted) {
    return (
      <Card className="border-primary/25 bg-card shadow-[0_0_18px_rgba(59,130,246,0.18)]">
        <CardHeader>
          <CardTitle className="text-card-foreground">Risk Distribution</CardTitle>
          <CardDescription>Accounts by risk level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full animate-pulse rounded-md bg-muted/50" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-primary/25 bg-card shadow-[0_0_18px_rgba(59,130,246,0.18)]">
      <CardHeader>
        <CardTitle className="text-card-foreground">Risk Distribution</CardTitle>
        <CardDescription>Accounts by risk level</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={riskDistributionData} layout="vertical">
              <XAxis
                type="number"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                dataKey="risk"
                type="category"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--card-foreground))",
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {riskDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function FraudPieChart() {
  const mounted = useMounted()

  if (!mounted) {
    return (
      <Card className="border-primary/25 bg-card shadow-[0_0_18px_rgba(59,130,246,0.18)]">
        <CardHeader>
          <CardTitle className="text-card-foreground">Transaction Status</CardTitle>
          <CardDescription>Normal vs Suspicious</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full animate-pulse rounded-md bg-muted/50" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-primary/25 bg-card shadow-[0_0_18px_rgba(59,130,246,0.18)]">
      <CardHeader>
        <CardTitle className="text-card-foreground">Transaction Status</CardTitle>
        <CardDescription>Normal vs Suspicious</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={fraudVsNormalData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {fraudVsNormalData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--card-foreground))",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6">
            {fraudVsNormalData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-sm text-muted-foreground">
                  {item.name}: {item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
