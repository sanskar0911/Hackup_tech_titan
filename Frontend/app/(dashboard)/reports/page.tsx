"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { mockAccounts, mockAlerts, mockDashboardStats, mockTransactions, type Alert } from "@/lib/mock-data"
import { FileText, Calendar, TrendingUp, AlertTriangle, Users, DollarSign, FileDown, Printer } from "lucide-react"
import { cn } from "@/lib/utils"

const reportTypes = [
  {
    id: "executive",
    name: "Executive Summary",
    description: "High-level overview for leadership",
    icon: TrendingUp,
  },
  {
    id: "suspicious",
    name: "Suspicious Activity Report",
    description: "Detailed SAR documentation",
    icon: AlertTriangle,
  },
  {
    id: "account",
    name: "Account Analysis",
    description: "Individual account risk breakdown",
    icon: Users,
  },
  {
    id: "transaction",
    name: "Transaction Report",
    description: "Transaction flow analysis",
    icon: DollarSign,
  },
]

export default function ReportsPage() {
  return (
    <Suspense fallback={<div>Loading reports...</div>}>
      <ReportsContent />
    </Suspense>
  )
}

function ReportsContent() {
  const searchParams = useSearchParams()
  const accountParam = searchParams.get("accountId")

  const [selectedReport, setSelectedReport] = useState("executive")
  const [dateRange, setDateRange] = useState("7d")

  const ALERTS_STORAGE_KEY = "fraudshield_alerts_override_v1"

  const [accountIdInput, setAccountIdInput] = useState("")
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null)

  const [alertsOverride, setAlertsOverride] = useState<Alert[]>(mockAlerts)
  const [mounted, setMounted] = useState(false)
  const [reportId, setReportId] = useState("")
  const [generatedAt, setGeneratedAt] = useState("")

  useEffect(() => {
    setMounted(true)
    setReportId(`RPT-${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`)
    setGeneratedAt(new Date().toLocaleDateString())
  }, [])

  useEffect(() => {
    if (accountParam) {
      const cleanId = accountParam.trim().toUpperCase()
      setActiveAccountId(cleanId)
      setAccountIdInput(cleanId)
    }
  }, [accountParam])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ALERTS_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Alert[]
      if (Array.isArray(parsed) && parsed.length > 0) setAlertsOverride(parsed)
    } catch {
      // ignore
    }
  }, [])

  const suspiciousAccounts = mockAccounts
    .filter((a) => a.isSuspicious)
    .sort((a, b) => b.riskScore - a.riskScore)

  const openAlerts = alertsOverride.filter((a) => a.status === "open")

  const selectedAccount = activeAccountId
    ? mockAccounts.find((a) => a.id.toLowerCase() === activeAccountId.toLowerCase()) || null
    : null

  const accountTransactions = selectedAccount
    ? mockTransactions.filter((t) => t.from === selectedAccount.id || t.to === selectedAccount.id)
    : []

  const accountAlerts = selectedAccount
    ? alertsOverride
        .filter((a) => a.accountId === selectedAccount.id)
        .slice()
        .sort((x, y) => new Date(y.timestamp).getTime() - new Date(x.timestamp).getTime())
    : []

  const accountSuspiciousTransactions = accountTransactions.filter((t) => t.status !== "normal")

  const activeExecutiveStats = selectedAccount
    ? {
        totalTransactions: accountTransactions.length,
        suspiciousTransactions: accountSuspiciousTransactions.length,
        highRiskAccounts: selectedAccount.isSuspicious && selectedAccount.riskScore >= 75 ? 1 : 0,
        fraudAlerts: accountAlerts.length,
        totalVolume: accountTransactions.reduce((sum, t) => sum + t.amount, 0),
        avgRiskScore:
          accountTransactions.length > 0
            ? Math.round(accountTransactions.reduce((sum, t) => sum + t.riskScore, 0) / accountTransactions.length)
            : 0,
      }
    : mockDashboardStats

  const downloadUserReport = (accountId: string) => {
    const account = mockAccounts.find((a) => a.id === accountId)
    if (!account) return
    const transactions = mockTransactions.filter((t) => t.from === accountId || t.to === accountId)
    const alerts = alertsOverride.filter((a) => a.accountId === accountId)
    const lines = [
      `User Report: ${account.name} (${account.id})`,
      `Emails: ${(account.contactEmails || []).join(", ")}`,
      `Risk Score: ${account.riskScore}%`,
      `Suspicious: ${account.isSuspicious ? "Yes" : "No"}`,
      `Total Transactions: ${transactions.length}`,
      `Total Alerts: ${alerts.length}`,
      "",
      "Recent Alerts:",
      ...alerts.slice(0, 5).map((a) => `- ${a.id} | ${a.type} | ${a.riskScore}% | ${a.status}`),
    ]
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `report-${accountId}.txt`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const downloadAnalystReport = () => {
    const lines = [
      `Analyst Daily Operations Report`,
      `Date: ${new Date().toLocaleDateString()}`,
      `Total Suspicious Accounts: ${suspiciousAccounts.length}`,
      `Total Open Alerts: ${openAlerts.length}`,
      "",
      "--- CRITICAL ESCALATIONS ---",
      ...openAlerts.filter(a => a.riskScore >= 80).map(a => `- ${a.id} | ${a.type} | Risk: ${a.riskScore}%`),
      "",
      "--- PENDING TASKS ---",
      ...openAlerts.filter(a => a.riskScore < 80).map(a => `- ${a.id} | ${a.type} | Risk: ${a.riskScore}%`),
    ]
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `analyst-daily-ops-${new Date().toISOString().slice(0, 10)}.txt`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const printUserReport = (accountId: string) => {
    const account = mockAccounts.find((a) => a.id === accountId)
    if (!account) return
    const alerts = alertsOverride.filter((a) => a.accountId === accountId)
    const html = `
      <html>
        <head><title>Report ${account.id}</title></head>
        <body style="font-family: Arial, sans-serif; padding: 24px;">
          <h2>User Report: ${account.name} (${account.id})</h2>
          <p><strong>Emails:</strong> ${(account.contactEmails || []).join(", ")}</p>
          <p><strong>Risk Score:</strong> ${account.riskScore}%</p>
          <p><strong>Country:</strong> ${account.country}</p>
          <h3>Recent Alerts</h3>
          <ul>
            ${alerts
              .slice(0, 6)
              .map((a) => `<li>${a.id} - ${a.type.replace(/_/g, " ")} - ${a.riskScore}% - ${a.status}</li>`)
              .join("")}
          </ul>
        </body>
      </html>`
    const popup = window.open("", "_blank", "width=900,height=700")
    if (!popup) return
    popup.document.open()
    popup.document.write(html)
    popup.document.close()
    popup.focus()
    popup.print()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground">
          Generate and download compliance and analysis reports
        </p>
      </div>

      {/* Report Type Selection */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {reportTypes.map((report) => (
          <Card
            key={report.id}
            className={cn(
              "cursor-pointer transition-all hover:border-primary",
              selectedReport === report.id && "border-primary bg-primary/5"
            )}
            onClick={() => setSelectedReport(report.id)}
          >
            <CardContent className="flex items-start gap-4 p-4">
              <div
                className={cn(
                  "rounded-lg p-2",
                  selectedReport === report.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <report.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium text-card-foreground">{report.name}</h3>
                <p className="text-xs text-muted-foreground">{report.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Configuration */}
      <Card className="border-border bg-card border-primary/25 shadow-[0_0_18px_rgba(59,130,246,0.18)]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-card-foreground">Report Configuration</CardTitle>
              <CardDescription>Customize your report parameters</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[150px]">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Input
                value={accountIdInput}
                onChange={(e) => setAccountIdInput(e.target.value)}
                placeholder="Optional: Enter Account ID (e.g., ACC001)"
                className="border-primary/20"
              />
              <Button
                variant="outline"
                onClick={() =>
                  setActiveAccountId(accountIdInput.trim() ? accountIdInput.trim().toUpperCase() : null)
                }
              >
                Generate
              </Button>
            </div>
            <div className="flex gap-4">
              <Button className="gap-2" onClick={() => {
                if (activeAccountId) downloadUserReport(activeAccountId)
                else alert("Please enter an Account ID to download the User Report")
              }}>
                <FileDown className="h-4 w-4" />
                Download User Report
              </Button>
              <Button variant="outline" className="gap-2" onClick={downloadAnalystReport}>
                <FileText className="h-4 w-4" />
                Download Analyst Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      <Card className="border-border bg-card border-primary/25 shadow-[0_0_18px_rgba(59,130,246,0.18)]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle className="text-card-foreground">
                {reportTypes.find((r) => r.id === selectedReport)?.name} Preview
              </CardTitle>
            </div>
            <Badge variant="outline">Preview Mode</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border bg-muted/30 p-6 space-y-6">
            {/* Report Header */}
            <div className="border-b border-border pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-card-foreground">
                    FraudShield - {reportTypes.find((r) => r.id === selectedReport)?.name}
                    {selectedAccount ? (
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        • Account: <span className="font-mono">{selectedAccount.id}</span>
                      </span>
                    ) : activeAccountId ? (
                      <span className="ml-2 text-sm font-normal text-destructive">
                        • Account not found: <span className="font-mono">{activeAccountId}</span>
                      </span>
                    ) : null}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Generated on {mounted ? generatedAt : "Loading..."} | Period: Last{" "}
                    {dateRange === "24h" ? "24 hours" : dateRange === "7d" ? "7 days" : dateRange === "30d" ? "30 days" : "90 days"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Report ID</p>
                  <p className="font-mono text-sm">{mounted ? reportId : "RPT-XXXXXXXX"}</p>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div>
              <h3 className="text-lg font-semibold text-card-foreground mb-4">
                Executive Summary
              </h3>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-lg bg-card p-4 border border-border">
                  <p className="text-sm text-muted-foreground">Total Transactions</p>
                  <p className="text-2xl font-bold text-card-foreground">
                    {activeExecutiveStats.totalTransactions.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg bg-card p-4 border border-border">
                  <p className="text-sm text-muted-foreground">Suspicious Activity</p>
                  <p className="text-2xl font-bold text-warning">
                    {activeExecutiveStats.suspiciousTransactions}
                  </p>
                </div>
                <div className="rounded-lg bg-card p-4 border border-border">
                  <p className="text-sm text-muted-foreground">High-Risk Accounts</p>
                  <p className="text-2xl font-bold text-destructive">
                    {activeExecutiveStats.highRiskAccounts}
                  </p>
                </div>
                <div className="rounded-lg bg-card p-4 border border-border">
                  <p className="text-sm text-muted-foreground">Open Alerts</p>
                  <p className="text-2xl font-bold text-destructive">
                    {selectedAccount
                      ? accountAlerts.filter((a) => a.status === "open").length
                      : openAlerts.length}
                  </p>
                </div>
              </div>
            </div>

            {/* High Risk Accounts */}
            <div>
              <h3 className="text-lg font-semibold text-card-foreground mb-4">
                High-Risk Accounts
              </h3>
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-2 text-left text-muted-foreground font-medium">
                        Account ID
                      </th>
                      <th className="px-4 py-2 text-left text-muted-foreground font-medium">
                        Name
                      </th>
                      <th className="px-4 py-2 text-left text-muted-foreground font-medium">
                        Type
                      </th>
                      <th className="px-4 py-2 text-left text-muted-foreground font-medium">
                        Country
                      </th>
                      <th className="px-4 py-2 text-left text-muted-foreground font-medium">
                        Bank
                      </th>
                      <th className="px-4 py-2 text-left text-muted-foreground font-medium">
                        Location
                      </th>
                      <th className="px-4 py-2 text-left text-muted-foreground font-medium">
                        Risk Score
                      </th>
                      <th className="px-4 py-2 text-left text-muted-foreground font-medium">
                        User Emails
                      </th>
                      <th className="px-4 py-2 text-left text-muted-foreground font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedAccount ? [selectedAccount] : suspiciousAccounts.slice(0, 5)).map((account) => (
                      <tr key={account.id} className="border-t border-border">
                        <td className="px-4 py-2 font-mono">{account.id}</td>
                        <td className="px-4 py-2">{account.name}</td>
                        <td className="px-4 py-2 capitalize">{account.type}</td>
                        <td className="px-4 py-2">{account.country}</td>
                        <td className="px-4 py-2 text-xs font-medium">{account.bank}</td>
                        <td className="px-4 py-2 text-xs text-muted-foreground">{account.city}, {account.state}</td>
                        <td className="px-4 py-2">
                          <span className="text-destructive font-semibold">{account.riskScore}%</span>
                        </td>
                        <td className="px-4 py-2 text-xs text-muted-foreground">
                          {(account.contactEmails || []).join(", ")}
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1"
                              onClick={() => downloadUserReport(account.id)}
                            >
                              <FileDown className="h-3.5 w-3.5" />
                              Download
                            </Button>
                            <Button
                              size="sm"
                              className="gap-1"
                              onClick={() => printUserReport(account.id)}
                            >
                              <Printer className="h-3.5 w-3.5" />
                              Print
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Alerts */}
            <div>
              <h3 className="text-lg font-semibold text-card-foreground mb-4">
                Recent Fraud Alerts
              </h3>
              <div className="space-y-3">
                {(selectedAccount ? accountAlerts : alertsOverride.slice(0, 3)).map((alert) => (
                  <div
                    key={alert.id}
                    className="rounded-lg bg-card p-4 border border-border flex items-start justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <span className="font-medium text-card-foreground">
                          {alert.type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                        <Badge
                          variant={
                            alert.status === "open"
                              ? "destructive"
                              : alert.status === "investigating"
                              ? "default"
                              : "secondary"
                          }
                          className={cn(
                            "text-xs",
                            alert.status === "investigating" && "bg-warning text-warning-foreground"
                          )}
                        >
                          {alert.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-destructive">
                        Risk: {alert.riskScore}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border pt-4 text-center text-xs text-muted-foreground">
              <p>
                This report is generated by FraudShield AI Detection System. For questions, contact
                compliance@fraudshield.ai
              </p>
              <p className="mt-1">
                Confidential - Internal Use Only | Page 1 of 1
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
