import { StatsCards } from "@/components/dashboard/stats-cards"
import { TransactionChart, RiskDistributionChart, FraudPieChart } from "@/components/dashboard/dashboard-charts"
import { RecentAlerts } from "@/components/dashboard/recent-alerts"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">AI-powered fraud detection overview</p>
      </div>

      <StatsCards />

      <div className="grid gap-6 lg:grid-cols-4">
        <TransactionChart />
        <RiskDistributionChart />
        <FraudPieChart />
      </div>

      <RecentAlerts />
    </div>
  )
}
