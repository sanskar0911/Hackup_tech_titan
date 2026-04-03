"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Bell, Search, Moon, Sun, User, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function TopNavbar() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [alerts, setAlerts] = useState<any[]>([])

  useEffect(() => {
    setMounted(true)
    const loadAlerts = async () => {
      try {
        const { fraudApi } = await import("@/lib/api-service")
        const fetched = await fraudApi.getAlerts()
        
        // Filter out closed ones usually, but here we just take the highest risk ones
        const sorted = (fetched as any[]).sort((a, b) => b.riskScore - a.riskScore).slice(0, 4)
        setAlerts(sorted)
      } catch (err) {
        console.error(err)
      }
    }
    loadAlerts()
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Search */}
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search account ID, transaction ID..."
          className="pl-10 bg-muted/50 border-border"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Theme toggle */}
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-muted-foreground hover:text-foreground"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        )}

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
              {alerts.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                  {alerts.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Highest Risk Alerts</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {alerts.length > 0 ? alerts.map((alert, idx) => (
              <DropdownMenuItem 
                key={idx} 
                className="flex flex-col items-start gap-1 cursor-pointer"
                onClick={() => router.push(`/fund-flow`)}
              >
                <div className="flex w-full justify-between items-center">
                  <span className="font-medium text-destructive">{alert.type || "Suspicious Activity"}</span>
                  <span className="text-xs font-bold text-destructive">Risk: {alert.riskScore}%</span>
                </div>
                <span className="text-xs text-muted-foreground">{alert.description || `Account: ${alert.accountId}`}</span>
              </DropdownMenuItem>
            )) : (
              <div className="p-4 text-center text-sm text-muted-foreground">No active alerts</div>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-primary cursor-pointer w-full justify-center" onClick={() => router.push('/alerts')}>
              View all alerts
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start md:flex">
                <span className="text-sm font-medium">Alex Chen</span>
                <span className="text-xs text-muted-foreground">Fraud Analyst</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
