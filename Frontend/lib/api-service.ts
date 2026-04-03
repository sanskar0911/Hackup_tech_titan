export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/, "")

export interface ApiConfig {
  baseUrl: string
  apiKey?: string
}

class FraudDetectionAPI {
  private baseUrl: string
  private apiKey?: string

  constructor(config?: Partial<ApiConfig>) {
    this.baseUrl = config?.baseUrl || API_BASE_URL
    this.apiKey = config?.apiKey
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(this.apiKey && {
        Authorization: `Bearer ${this.apiKey}`,
      }),
      ...options?.headers,
    }

    let response: Response
    try {
      response = await fetch(url, {
        ...options,
        headers,
      })
    } catch (error) {
      throw new Error(`Network error while calling ${endpoint}: ${(error as Error).message}`)
    }

    if (!response.ok) {
      console.error("API ERROR:", url, response.status)
      throw new Error(
        `API Error: ${response.status} ${response.statusText}`
      )
    }

    const data = await response.json()

    console.log("API SUCCESS:", url, data)

    return data
  }

  // Health Check
  async healthCheck() {
    return this.request("/api/health")
  }

  // Accounts
  async getAccounts() {
    return this.request("/api/accounts")
  }

  async getAccount(accountId: string) {
    return this.request(`/api/accounts/${accountId}`)
  }

  async getAccountTransactions(accountId: string) {
    return this.request(`/api/accounts/${accountId}/transactions`)
  }

  // Transactions
  async getTransactions(params?: {
    status?: string
    risk_min?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.set("status", params.status)
    if (params?.risk_min)
      searchParams.set("risk_min", params.risk_min.toString())

    const query = searchParams.toString()

    return this.request(
      `/api/transactions${query ? `?${query}` : ""}`
    )
  }

  // Alerts
  async getAlerts() {
    return this.request("/api/alerts")
  }

  async createAlert(data: {
    type: string
    accountId: string
    riskScore: number
    description: string
    amount?: number
  }) {
    return this.request("/api/alerts", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateAlertStatus(
    alertId: string,
    status: "open" | "investigating" | "resolved"
  ) {
    return this.request(`/api/alerts/${alertId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    })
  }

  // Statistics
  async getStats() {
    return this.request("/api/stats")
  }

  // Graph Data (if needed separately)
  async getGraphNodes() {
    return this.request("/api/graph/nodes")
  }

  async getGraphEdges() {
    return this.request("/api/graph/edges")
  }

  // 🔥 FINAL FIX: MATCH BACKEND ROUTE
  async investigateAccount(accountId: string) {
    // ⚠️ IMPORTANT: MUST MATCH YOUR BACKEND ROUTE
    return this.request(`/api/fund-flow/${accountId}`)
  }

  // AI Detection
  async detectCircularTransactions() {
    return this.request("/api/detect/circular", {
      method: "POST",
    })
  }
}

// ✅ Singleton instance
export const fraudApi = new FraudDetectionAPI()

export { FraudDetectionAPI }

const fallbackFundFlow = {
  nodes: [
    {
      id: "A1",
      type: "accountNode",
      position: { x: 120, y: 120 },
      data: {
        label: "Anchor Account A1",
        account: {
          id: "A1",
          riskScore: 88,
          isSuspicious: true,
          balance: 420000,
          type: "shell",
          country: "IN",
        },
      },
    },
    {
      id: "B1",
      type: "accountNode",
      position: { x: 360, y: 90 },
      data: {
        label: "Mule Account B1",
        account: {
          id: "B1",
          riskScore: 74,
          isSuspicious: true,
          balance: 195000,
          type: "business",
          country: "IN",
        },
      },
    },
    {
      id: "C1",
      type: "accountNode",
      position: { x: 560, y: 230 },
      data: {
        label: "Layering Account C1",
        account: {
          id: "C1",
          riskScore: 83,
          isSuspicious: true,
          balance: 305000,
          type: "shell",
          country: "CY",
        },
      },
    },
    {
      id: "D1",
      type: "accountNode",
      position: { x: 260, y: 280 },
      data: {
        label: "Collector Account D1",
        account: {
          id: "D1",
          riskScore: 67,
          isSuspicious: true,
          balance: 255000,
          type: "individual",
          country: "IN",
        },
      },
    },
  ],
  edges: [
    {
      id: "e-a1-b1",
      source: "A1",
      target: "B1",
      label: "₹52,000",
      animated: true,
      style: { stroke: "#ef4444", strokeWidth: 2 },
    },
    {
      id: "e-b1-c1",
      source: "B1",
      target: "C1",
      label: "₹49,500",
      animated: true,
      style: { stroke: "#f59e0b", strokeWidth: 2 },
    },
    {
      id: "e-c1-d1",
      source: "C1",
      target: "D1",
      label: "₹48,700",
      animated: true,
      style: { stroke: "#ef4444", strokeWidth: 2 },
    },
    {
      id: "e-d1-a1",
      source: "D1",
      target: "A1",
      label: "₹47,900",
      animated: true,
      style: { stroke: "#f59e0b", strokeWidth: 2 },
    },
  ],
}

export const getFundFlow = async (accountId: string) => {
  try {
    const response = await fraudApi.investigateAccount(accountId)
    const data =
      (response as any)?.nodes && (response as any)?.edges
        ? (response as any)
        : (response as any)?.data?.nodes && (response as any)?.data?.edges
        ? (response as any).data
        : null

    if (!data || !Array.isArray(data.nodes) || !Array.isArray(data.edges) || data.nodes.length === 0) {
      return fallbackFundFlow
    }

    return { nodes: data.nodes, edges: data.edges }
  } catch (error) {
    console.error("Fund Flow API Error. Using fallback graph.", error)
    return fallbackFundFlow
  }
}