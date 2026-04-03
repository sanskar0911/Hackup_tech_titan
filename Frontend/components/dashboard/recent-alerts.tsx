"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { type Alert } from "@/app/(dashboard)/alerts/page"
import { AlertTriangle, RefreshCw, CheckCircle2, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

const alertTypeIcons = {
  circular_transaction: "Circular",
  rapid_transfer: "Rapid",
  structuring: "Structuring",
  velocity: "Velocity",
  dormant_activation: "Dormant",
}

const statusConfig: any = {
  open: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
  investigating: { icon: RefreshCw, color: "text-warning", bg: "bg-warning/10" },
  resolved: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  PENDING: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
  VERIFIED: { icon: RefreshCw, color: "text-warning", bg: "bg-warning/10" },
  FRAUD: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
  CLOSED: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
}

export function RecentAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const loadAlerts = async () => {
      try {
        const { fraudApi } = await import("@/lib/api-service");
        const data: any[] = await fraudApi.getAlerts() as any[];
        const mappedAlerts: Alert[] = data.map((d: any) => ({
          ...d,
          id: d._id || d.id || "unknown",
          type: d.type || "Suspicious Activity",
          riskScore: d.fraudScore ?? d.riskScore ?? 0,
          description: d.reasons?.join(", ") || d.description || "System flagged this activity.",
          timestamp: d.createdAt || d.timestamp || new Date().toISOString(),
          status: d.status || "open"
        }));
        setAlerts(mappedAlerts);
      } catch (err) {
        console.error("Failed to fetch recent alerts", err);
      }
    }
    loadAlerts();
  }, [])

  if (!mounted) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-card-foreground">Recent Fraud Alerts</CardTitle>
              <CardDescription>Latest detected suspicious activities</CardDescription>
            </div>
            <Badge variant="destructive" className="text-sm">
              --
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-48 w-full animate-pulse rounded-md bg-muted/40" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-card-foreground">Recent Fraud Alerts</CardTitle>
            <CardDescription>Latest detected suspicious activities</CardDescription>
          </div>
          <Badge variant="destructive" className="text-sm">
            {alerts.filter((a) => a.status === "open").length} Open
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.slice(0, 5).map((alert) => {
            const StatusIcon = statusConfig[alert.status].icon
            return (
              <div
                key={alert.id}
                className="flex items-start justify-between rounded-lg border border-border bg-muted/50 p-4 transition-colors hover:bg-muted"
              >
                <div className="flex gap-4">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      statusConfig[alert.status].bg
                    )}
                  >
                    <StatusIcon className={cn("h-5 w-5", statusConfig[alert.status].color)} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-card-foreground">
                        {alertTypeIcons[alert.type]} Transaction Alert
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          alert.riskScore >= 80
                            ? "border-destructive text-destructive"
                            : alert.riskScore >= 60
                            ? "border-warning text-warning"
                            : "border-muted-foreground"
                        )}
                      >
                        Risk: {alert.riskScore}%
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Account: {alert.accountId}</span>
                      {alert.amount && <span>Amount: ₹{alert.amount.toLocaleString("en-IN")}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge
                    variant={
                      alert.status === "open"
                        ? "destructive"
                        : alert.status === "investigating"
                        ? "default"
                        : "secondary"
                    }
                    className={cn(
                      alert.status === "investigating" && "bg-warning text-warning-foreground",
                      alert.status === "resolved" && "bg-success text-success-foreground"
                    )}
                  >
                    {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                  </Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
