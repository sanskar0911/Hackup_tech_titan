const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

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

    const response = await fetch(url, {
      ...options,
      headers,
    })

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

/**
 * 🔥 FINAL GRAPH API (ULTRA SAFE)
 */
export const getFundFlow = async (accountId: string) => {
  try {
    const response = await fraudApi.investigateAccount(accountId)

    console.log("GRAPH RESPONSE:", response)

    // ✅ HANDLE MULTIPLE BACKEND FORMATS
    const data =
      (response as any)?.nodes && (response as any)?.edges
        ? (response as any)
        : (response as any)?.data?.nodes && (response as any)?.data?.edges
        ? (response as any).data
        : { nodes: [], edges: [] }

    console.log("FINAL GRAPH DATA:", data)

    return {
      nodes: data.nodes || [],
      edges: data.edges || [],
    }
  } catch (error) {
    console.error("Fund Flow API Error:", error)

    return {
      nodes: [],
      edges: [],
    }
  }
}