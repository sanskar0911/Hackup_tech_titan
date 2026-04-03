"use client"

import { useEffect, useState, Fragment } from "react"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { mockAlerts, type Alert } from "@/lib/mock-data"
import {
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Search,
  Filter,
  Eye,
} from "lucide-react"
import { cn } from "@/lib/utils"

const alertTypeLabels: Record<Alert["type"], string> = {
  circular_transaction: "Circular Transaction",
  rapid_transfer: "Rapid Transfer",
  structuring: "Structuring",
  velocity: "Velocity Anomaly",
  dormant_activation: "Dormant Activation",
}

const statusConfig = {
  open: {
    icon: AlertTriangle,
    label: "Open",
    color: "bg-destructive text-destructive-foreground",
  },
  investigating: {
    icon: RefreshCw,
    label: "Investigating",
    color: "bg-warning text-warning-foreground",
  },
  resolved: {
    icon: CheckCircle2,
    label: "Resolved",
    color: "bg-success text-success-foreground",
  },
}

export default function AlertsPage() {
  const ALERTS_STORAGE_KEY = "fraudshield_alerts_override_v1"
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [riskFilter, setRiskFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null)

  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ALERTS_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Alert[]
      if (Array.isArray(parsed) && parsed.length > 0) setAlerts(parsed)
    } catch {
      // Ignore localStorage issues
    }
  }, [])

  const persistAlerts = (next: Alert[]) => {
    setAlerts(next)
    try {
      localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Ignore localStorage issues
    }
  }

  const updateAlertStatus = (alertId: string, status: Alert["status"]) => {
    const next = alerts.map((a) =>
      a.id === alertId ? { ...a, status, timestamp: new Date().toISOString() } : a
    )
    persistAlerts(next)
  }

  // ML output (riskScore) is model-driven; analyst still manually sets alert status.
  const rerunMlScore = (alertId: string) => {
    const current = alerts.find((a) => a.id === alertId)
    if (!current) return

    const delta = Math.round((Math.random() - 0.5) * 18) // +/-9 band
    const nextRiskScore = Math.max(0, Math.min(100, current.riskScore + delta))

    const next = alerts.map((a) =>
      a.id === alertId
        ? { ...a, riskScore: nextRiskScore, timestamp: new Date().toISOString() }
        : a
    )
    persistAlerts(next)
  }

  const filteredAlerts = alerts.filter((alert) => {
    if (statusFilter !== "all" && alert.status !== statusFilter) return false
    if (riskFilter === "high" && alert.riskScore < 70) return false
    if (riskFilter === "medium" && (alert.riskScore < 40 || alert.riskScore >= 70)) return false
    if (riskFilter === "low" && alert.riskScore >= 40) return false
    if (
      searchQuery &&
      !alert.accountId.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !alert.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Fraud Alerts</h1>
        <p className="text-muted-foreground">
          Monitor and manage detected suspicious activities
        </p>
      </div>

      {/* Filters */}
      <Card className="border-primary/25 shadow-[0_0_18px_rgba(59,130,246,0.18)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" /> Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-primary/25 shadow-[0_0_18px_rgba(59,130,246,0.18)]">
        <CardHeader>
          <CardTitle>Alert List</CardTitle>
          <CardDescription>
            {filteredAlerts.length} alerts found
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredAlerts.map((alert) => {
                const StatusIcon = statusConfig[alert.status].icon
                const isOpen = expandedAlert === alert.id

                return (
                  <Fragment key={alert.id}>
                    {/* Main Row */}
                    <TableRow>
                      <TableCell>{alert.id}</TableCell>
                      <TableCell>{alert.accountId}</TableCell>

                      <TableCell>
                        <span
                          className={cn(
                            alert.riskScore > 70
                              ? "text-red-500"
                              : alert.riskScore > 40
                              ? "text-yellow-500"
                              : "text-green-500"
                          )}
                        >
                          {alert.riskScore}%
                        </span>
                      </TableCell>

                      <TableCell>
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </TableCell>

                      <TableCell>
                        <Badge className={statusConfig[alert.status].color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {alert.status}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setExpandedAlert(isOpen ? null : alert.id)
                          }
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {isOpen ? "Hide" : "View"}
                        </Button>
                      </TableCell>
                    </TableRow>

                    {/* Expanded Row */}
                    {isOpen && (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <div className="p-4 bg-muted rounded-lg space-y-2">
                            <p className="font-semibold text-sm">
                              🚨 Fraud Analysis
                            </p>

                            <div className="space-y-1 text-sm">
                              <p className="text-muted-foreground">
                                ML Prediction (model output)
                              </p>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                ML combines transaction behavior (velocity, structuring, circular loops) with account signals (dormant reactivation, geo/IP mismatch, shell linkage) to generate the risk score.
                              </p>
                              <p className="font-medium">
                                {(alert.fraudType || alert.type)
                                  .replace(/_/g, " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                                {" "}• Risk Score{" "}
                                <span
                                  className={cn(
                                    alert.riskScore >= 80
                                      ? "text-destructive"
                                      : alert.riskScore >= 60
                                      ? "text-warning"
                                      : "text-success"
                                  )}
                                >
                                  {alert.riskScore}%
                                </span>
                              </p>
                              <div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="mt-2"
                                  onClick={() => rerunMlScore(alert.id)}
                                >
                                  Re-run ML score
                                </Button>
                              </div>
                            </div>

                            {alert.reasons?.length ? (
                              <ul className="text-sm space-y-1">
                                {alert.reasons.map((r, i) => (
                                  <li key={i}>⚠ {r}</li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-muted-foreground text-sm">
                                No explanation available
                              </p>
                            )}

                            <div className="pt-2 border-t border-border">
                              <p className="text-xs font-medium text-muted-foreground">
                                Analyst Actions
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={alert.status === "investigating"}
                                  onClick={() =>
                                    updateAlertStatus(alert.id, "investigating")
                                  }
                                >
                                  Mark Investigating
                                </Button>
                                <Button
                                  size="sm"
                                  disabled={alert.status === "resolved"}
                                  onClick={() =>
                                    updateAlertStatus(alert.id, "resolved")
                                  }
                                >
                                  Mark Resolved
                                </Button>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}