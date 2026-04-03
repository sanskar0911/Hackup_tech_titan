"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { mockAccounts, mockTransactions, type Account, type Transaction } from "@/lib/mock-data"
import PathTracer from "@/components/investigation/path_tracer"
import TransactionTimeline from "@/components/investigation/transaction_timeline"
import {
  Search,
  Network,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  MapPin,
  Building2,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function InvestigationPage() {
  const [accountId, setAccountId] = useState("")
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [relatedTransactions, setRelatedTransactions] = useState<Transaction[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = (id?: string) => {
    const searchId = (id || accountId).trim()
    if (!searchId) return

    setIsSearching(true)

    setTimeout(() => {
      const account = mockAccounts.find(
        (a) => a.id.toLowerCase() === searchId.toLowerCase()
      )
      setSelectedAccount(account || null)

      if (account) {
        const transactions = mockTransactions.filter(
          (t) => t.from === account.id || t.to === account.id
        )
        setRelatedTransactions(transactions)
      } else {
        setRelatedTransactions([])
      }

      setIsSearching(false)
    }, 500)
  }

  const tracedSteps =
    selectedAccount && relatedTransactions.length > 0
      ? [...relatedTransactions]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 6)
          .map((txn) => ({
            from: txn.from,
            to: txn.to,
            amount: txn.amount,
            riskScore: txn.riskScore,
            reason:
              txn.status === "flagged"
                ? "Flagged by ML due to high anomaly and linked risk indicators."
                : txn.status === "suspicious"
                ? "Suspicious pattern detected from transaction behavior."
                : "Normal transaction in traced path context.",
          }))
      : undefined

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Investigation Mode</h1>
        <p className="text-muted-foreground">
          Deep dive into account activity and trace fund flows
        </p>
      </div>

      {/* Search Section */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Search className="h-5 w-5" />
            Account Investigation
          </CardTitle>
          <CardDescription>
            Enter an account ID to view detailed transaction history and risk analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Input
                placeholder="Enter Account ID (e.g., ACC001)"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pr-10"
              />
            </div>
            <Button onClick={() => handleSearch()} disabled={isSearching}>
              {isSearching ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Searching...
                </>
              ) : (
                <>
                  <Network className="mr-2 h-4 w-4" />
                  Trace Fund Flow
                </>
              )}
            </Button>
          </div>
          
          {/* Quick Access */}
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">Quick access to suspicious accounts:</p>
            <div className="flex flex-wrap gap-2">
              {mockAccounts
                .filter((a) => a.isSuspicious)
                .slice(0, 5)
                .map((account) => (
                  <Button
                    key={account.id}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setAccountId(account.id)
                      handleSearch(account.id)
                    }}
                  >
                    <AlertTriangle className="mr-1 h-3 w-3 text-destructive" />
                    {account.id}
                  </Button>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {selectedAccount && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
          {/* Account Details */}
          <Card className="border-border bg-card border-primary/25 shadow-[0_0_18px_rgba(59,130,246,0.18)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-card-foreground">Account Profile</CardTitle>
                <Badge
                  variant={selectedAccount.isSuspicious ? "destructive" : "default"}
                  className={cn(
                    !selectedAccount.isSuspicious && "bg-success text-success-foreground"
                  )}
                >
                  {selectedAccount.isSuspicious ? (
                    <>
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      Suspicious
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Normal
                    </>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Account ID</p>
                <p className="font-mono text-lg font-semibold text-card-foreground">
                  {selectedAccount.id}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Account Name</p>
                <p className="font-semibold text-card-foreground">{selectedAccount.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    Type
                  </p>
                  <p className="font-medium capitalize text-card-foreground">
                    {selectedAccount.type}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Country
                  </p>
                  <p className="font-medium text-card-foreground">{selectedAccount.country}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Balance
                </p>
                <p className="text-2xl font-bold text-card-foreground">
                  ₹{selectedAccount.balance.toLocaleString("en-IN")}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-card-foreground">{selectedAccount.createdAt}</p>
              </div>
            </CardContent>
          </Card>

          {/* Risk Analysis */}
          <Card className="border-border bg-card border-primary/25 shadow-[0_0_18px_rgba(59,130,246,0.18)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <TrendingUp className="h-5 w-5" />
                Risk Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div
                  className={cn(
                    "mx-auto flex h-24 w-24 items-center justify-center rounded-full text-4xl font-bold",
                    selectedAccount.riskScore >= 75
                      ? "bg-destructive/20 text-destructive"
                      : selectedAccount.riskScore >= 50
                      ? "bg-warning/20 text-warning"
                      : "bg-success/20 text-success"
                  )}
                >
                  {selectedAccount.riskScore}
                </div>
                <p className="mt-2 text-lg font-medium text-card-foreground">Risk Score</p>
                <p className="text-sm text-muted-foreground">
                  {selectedAccount.riskScore >= 75
                    ? "Critical - Immediate review required"
                    : selectedAccount.riskScore >= 50
                    ? "High - Investigation recommended"
                    : "Low - Normal activity"}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Transaction Count</span>
                  <span className="font-medium text-card-foreground">
                    {selectedAccount.transactionCount}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Account Age</span>
                  <span className="font-medium text-card-foreground">
                    {Math.floor(
                      (Date.now() - new Date(selectedAccount.createdAt).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    days
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Avg Transaction</span>
                  <span className="font-medium text-card-foreground">
                    ₹
                    {Math.round(
                      selectedAccount.balance / selectedAccount.transactionCount
                    ).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Risk Factors */}
              {selectedAccount.isSuspicious && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                  <p className="text-sm font-medium text-destructive mb-2">Risk Factors Detected:</p>
                  <ul className="space-y-1 text-xs text-destructive">
                    {selectedAccount.type === "shell" && (
                      <li className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Shell company structure
                      </li>
                    )}
                    {selectedAccount.country !== "US" && (
                      <li className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Offshore jurisdiction ({selectedAccount.country})
                      </li>
                    )}
                    {selectedAccount.transactionCount < 50 && (
                      <li className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Low transaction history
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card border-primary/25 shadow-[0_0_18px_rgba(59,130,246,0.18)]">
            <CardHeader>
              <CardTitle className="text-card-foreground">Tracing Summary</CardTitle>
              <CardDescription>{relatedTransactions.length} related transactions</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                Path tracer uses recent account-linked transactions to build stepwise movement.
              </p>
              <p>
                Timeline shows incoming/outgoing flow, risk score and status on each transaction.
              </p>
            </CardContent>
          </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <PathTracer steps={tracedSteps} />
            <TransactionTimeline
              transactions={relatedTransactions}
              accountId={selectedAccount.id}
            />
          </div>
        </div>
      )}

      {/* No Results */}
      {accountId && !selectedAccount && !isSearching && (
        <Card className="border-border bg-card">
          <CardContent className="py-12 text-center">
            <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-card-foreground">Account Not Found</h3>
            <p className="text-muted-foreground">
              No account found with ID &quot;{accountId}&quot;. Try searching for another account.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}