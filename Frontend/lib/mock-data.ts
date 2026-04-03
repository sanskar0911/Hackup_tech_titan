// Mock data for the fraud detection dashboard

export interface Transaction {
  id: string
  from: string
  to: string
  amount: number
  timestamp: string
  riskScore: number
  status: 'normal' | 'suspicious' | 'flagged'
  type: 'wire' | 'ach' | 'internal' | 'card'
}

export interface Account {
  id: string
  name: string
  type: 'individual' | 'business' | 'shell'
  balance: number
  riskScore: number
  country: string
  createdAt: string
  transactionCount: number
  isSuspicious: boolean
}

export interface Alert {
  id: string
  type: 'circular_transaction' | 'rapid_transfer' | 'structuring' | 'velocity' | 'dormant_activation'
  accountId: string
  riskScore: number
  timestamp: string
  status: 'open' | 'investigating' | 'resolved'
  description: string
  amount?: number
  reasons?: string[]
}

export interface DashboardStats {
  totalTransactions: number
  suspiciousTransactions: number
  highRiskAccounts: number
  fraudAlerts: number
  totalVolume: number
  avgRiskScore: number
}

// Generate realistic mock transactions
export const mockTransactions: Transaction[] = [
  { id: 'TXN001', from: 'ACC001', to: 'ACC002', amount: 15000, timestamp: '2024-01-15T10:30:00Z', riskScore: 25, status: 'normal', type: 'wire' },
  { id: 'TXN002', from: 'ACC002', to: 'ACC003', amount: 14999, timestamp: '2024-01-15T10:35:00Z', riskScore: 85, status: 'flagged', type: 'wire' },
  { id: 'TXN003', from: 'ACC003', to: 'ACC004', amount: 14998, timestamp: '2024-01-15T10:40:00Z', riskScore: 90, status: 'flagged', type: 'ach' },
  { id: 'TXN004', from: 'ACC004', to: 'ACC001', amount: 44000, timestamp: '2024-01-15T11:00:00Z', riskScore: 95, status: 'flagged', type: 'wire' },
  { id: 'TXN005', from: 'ACC005', to: 'ACC006', amount: 5000, timestamp: '2024-01-15T11:30:00Z', riskScore: 15, status: 'normal', type: 'internal' },
  { id: 'TXN006', from: 'ACC006', to: 'ACC007', amount: 8500, timestamp: '2024-01-15T12:00:00Z', riskScore: 30, status: 'normal', type: 'card' },
  { id: 'TXN007', from: 'ACC007', to: 'ACC008', amount: 25000, timestamp: '2024-01-15T12:30:00Z', riskScore: 65, status: 'suspicious', type: 'wire' },
  { id: 'TXN008', from: 'ACC008', to: 'ACC009', amount: 24999, timestamp: '2024-01-15T12:35:00Z', riskScore: 80, status: 'flagged', type: 'wire' },
  { id: 'TXN009', from: 'ACC009', to: 'ACC010', amount: 24998, timestamp: '2024-01-15T12:40:00Z', riskScore: 82, status: 'flagged', type: 'ach' },
  { id: 'TXN010', from: 'ACC001', to: 'ACC005', amount: 3500, timestamp: '2024-01-15T13:00:00Z', riskScore: 10, status: 'normal', type: 'internal' },
  { id: 'TXN011', from: 'ACC011', to: 'ACC012', amount: 9999, timestamp: '2024-01-15T13:30:00Z', riskScore: 75, status: 'suspicious', type: 'wire' },
  { id: 'TXN012', from: 'ACC012', to: 'ACC013', amount: 9999, timestamp: '2024-01-15T13:35:00Z', riskScore: 88, status: 'flagged', type: 'wire' },
]

export const mockAccounts: Account[] = [
  { id: 'ACC001', name: 'Acme Corporation', type: 'business', balance: 250000, riskScore: 45, country: 'US', createdAt: '2022-03-15', transactionCount: 156, isSuspicious: false },
  { id: 'ACC002', name: 'John Smith Holdings', type: 'shell', balance: 180000, riskScore: 85, country: 'CY', createdAt: '2023-11-20', transactionCount: 23, isSuspicious: true },
  { id: 'ACC003', name: 'Global Trade Ltd', type: 'shell', balance: 165000, riskScore: 90, country: 'VG', createdAt: '2023-12-01', transactionCount: 18, isSuspicious: true },
  { id: 'ACC004', name: 'Offshore Ventures', type: 'shell', balance: 209000, riskScore: 95, country: 'PA', createdAt: '2023-10-15', transactionCount: 12, isSuspicious: true },
  { id: 'ACC005', name: 'Jane Doe', type: 'individual', balance: 45000, riskScore: 15, country: 'US', createdAt: '2021-06-20', transactionCount: 89, isSuspicious: false },
  { id: 'ACC006', name: 'Tech Innovations Inc', type: 'business', balance: 520000, riskScore: 20, country: 'US', createdAt: '2020-01-10', transactionCount: 312, isSuspicious: false },
  { id: 'ACC007', name: 'Rapid Transfers LLC', type: 'business', balance: 890000, riskScore: 65, country: 'DE', createdAt: '2022-08-05', transactionCount: 445, isSuspicious: false },
  { id: 'ACC008', name: 'Shadow Finance', type: 'shell', balance: 865000, riskScore: 80, country: 'SC', createdAt: '2023-09-12', transactionCount: 34, isSuspicious: true },
  { id: 'ACC009', name: 'Matrix Holdings', type: 'shell', balance: 840000, riskScore: 82, country: 'BZ', createdAt: '2023-08-28', transactionCount: 28, isSuspicious: true },
  { id: 'ACC010', name: 'Sarah Johnson', type: 'individual', balance: 28000, riskScore: 10, country: 'US', createdAt: '2019-04-15', transactionCount: 234, isSuspicious: false },
  { id: 'ACC011', name: 'Structured Payments Co', type: 'business', balance: 125000, riskScore: 75, country: 'MT', createdAt: '2023-07-01', transactionCount: 67, isSuspicious: true },
  { id: 'ACC012', name: 'Cascade Investments', type: 'shell', balance: 135000, riskScore: 88, country: 'KY', createdAt: '2023-06-15', transactionCount: 41, isSuspicious: true },
  { id: 'ACC013', name: 'Final Destination LLC', type: 'shell', balance: 145000, riskScore: 92, country: 'VG', createdAt: '2023-05-20', transactionCount: 15, isSuspicious: true },
]

export const mockAlerts: Alert[] = [
  { id: 'ALT001', type: 'circular_transaction', accountId: 'ACC001', riskScore: 95, timestamp: '2024-01-15T11:00:00Z', status: 'open', description: 'Circular fund flow detected: ACC001 → ACC002 → ACC003 → ACC004 → ACC001', amount: 89000 },
  { id: 'ALT002', type: 'structuring', accountId: 'ACC002', riskScore: 85, timestamp: '2024-01-15T10:45:00Z', status: 'investigating', description: 'Multiple transactions just below $15,000 threshold detected', amount: 44997 },
  { id: 'ALT003', type: 'rapid_transfer', accountId: 'ACC007', riskScore: 78, timestamp: '2024-01-15T12:45:00Z', status: 'open', description: 'Rapid fund transfer through multiple accounts within 15 minutes', amount: 74997 },
  { id: 'ALT004', type: 'velocity', accountId: 'ACC011', riskScore: 72, timestamp: '2024-01-15T13:40:00Z', status: 'open', description: 'Unusual transaction velocity: 5x normal activity', amount: 49995 },
  { id: 'ALT005', type: 'dormant_activation', accountId: 'ACC008', riskScore: 68, timestamp: '2024-01-15T12:30:00Z', status: 'resolved', description: 'Previously dormant account suddenly active with large transactions' },
  { id: 'ALT006', type: 'structuring', accountId: 'ACC012', riskScore: 88, timestamp: '2024-01-15T13:38:00Z', status: 'investigating', description: 'Repeated $9,999 transactions detected - potential structuring', amount: 29997 },
]

export const mockDashboardStats: DashboardStats = {
  totalTransactions: 15847,
  suspiciousTransactions: 234,
  highRiskAccounts: 8,
  fraudAlerts: 12,
  totalVolume: 45600000,
  avgRiskScore: 42,
}

// Chart data
export const transactionVolumeData = [
  { date: 'Jan 1', transactions: 1200, suspicious: 15, volume: 3200000 },
  { date: 'Jan 2', transactions: 1350, suspicious: 22, volume: 3800000 },
  { date: 'Jan 3', transactions: 1180, suspicious: 18, volume: 2900000 },
  { date: 'Jan 4', transactions: 1420, suspicious: 31, volume: 4100000 },
  { date: 'Jan 5', transactions: 1290, suspicious: 25, volume: 3500000 },
  { date: 'Jan 6', transactions: 890, suspicious: 12, volume: 2200000 },
  { date: 'Jan 7', transactions: 750, suspicious: 8, volume: 1800000 },
  { date: 'Jan 8', transactions: 1320, suspicious: 28, volume: 3700000 },
  { date: 'Jan 9', transactions: 1450, suspicious: 35, volume: 4200000 },
  { date: 'Jan 10', transactions: 1380, suspicious: 32, volume: 3900000 },
  { date: 'Jan 11', transactions: 1520, suspicious: 41, volume: 4500000 },
  { date: 'Jan 12', transactions: 1480, suspicious: 38, volume: 4300000 },
  { date: 'Jan 13', transactions: 920, suspicious: 14, volume: 2400000 },
  { date: 'Jan 14', transactions: 810, suspicious: 10, volume: 2000000 },
  { date: 'Jan 15', transactions: 1567, suspicious: 45, volume: 4800000 },
]

export const riskDistributionData = [
  { risk: 'Low (0-25)', count: 8542, fill: 'hsl(var(--chart-2))' },
  { risk: 'Medium (26-50)', count: 4123, fill: 'hsl(var(--chart-4))' },
  { risk: 'High (51-75)', count: 2456, fill: 'hsl(var(--chart-5))' },
  { risk: 'Critical (76-100)', count: 726, fill: 'hsl(var(--chart-3))' },
]

export const fraudVsNormalData = [
  { name: 'Normal', value: 15613, fill: 'hsl(var(--chart-2))' },
  { name: 'Suspicious', value: 234, fill: 'hsl(var(--chart-3))' },
]

export const alertTypeData = [
  { type: 'Circular', count: 45 },
  { type: 'Structuring', count: 78 },
  { type: 'Rapid Transfer', count: 34 },
  { type: 'Velocity', count: 52 },
  { type: 'Dormant', count: 25 },
]

// Graph nodes and edges for React Flow
export const graphNodes = [
  { id: 'ACC001', position: { x: 100, y: 200 }, data: { label: 'Acme Corp', account: mockAccounts[0] }, type: 'accountNode' },
  { id: 'ACC002', position: { x: 300, y: 100 }, data: { label: 'John Smith Holdings', account: mockAccounts[1] }, type: 'accountNode' },
  { id: 'ACC003', position: { x: 500, y: 100 }, data: { label: 'Global Trade Ltd', account: mockAccounts[2] }, type: 'accountNode' },
  { id: 'ACC004', position: { x: 700, y: 200 }, data: { label: 'Offshore Ventures', account: mockAccounts[3] }, type: 'accountNode' },
  { id: 'ACC005', position: { x: 100, y: 400 }, data: { label: 'Jane Doe', account: mockAccounts[4] }, type: 'accountNode' },
  { id: 'ACC006', position: { x: 300, y: 400 }, data: { label: 'Tech Innovations', account: mockAccounts[5] }, type: 'accountNode' },
  { id: 'ACC007', position: { x: 500, y: 300 }, data: { label: 'Rapid Transfers', account: mockAccounts[6] }, type: 'accountNode' },
  { id: 'ACC008', position: { x: 700, y: 400 }, data: { label: 'Shadow Finance', account: mockAccounts[7] }, type: 'accountNode' },
  { id: 'ACC009', position: { x: 900, y: 300 }, data: { label: 'Matrix Holdings', account: mockAccounts[8] }, type: 'accountNode' },
  { id: 'ACC010', position: { x: 200, y: 300 }, data: { label: 'Sarah Johnson', account: mockAccounts[9] }, type: 'accountNode' },
]

export const graphEdges = [
  { id: 'e1', source: 'ACC001', target: 'ACC002', animated: true, style: { stroke: 'hsl(var(--chart-3))' }, data: { amount: 15000, suspicious: true } },
  { id: 'e2', source: 'ACC002', target: 'ACC003', animated: true, style: { stroke: 'hsl(var(--chart-3))' }, data: { amount: 14999, suspicious: true } },
  { id: 'e3', source: 'ACC003', target: 'ACC004', animated: true, style: { stroke: 'hsl(var(--chart-3))' }, data: { amount: 14998, suspicious: true } },
  { id: 'e4', source: 'ACC004', target: 'ACC001', animated: true, style: { stroke: 'hsl(var(--chart-3))' }, data: { amount: 44000, suspicious: true } },
  { id: 'e5', source: 'ACC005', target: 'ACC006', style: { stroke: 'hsl(var(--chart-2))' }, data: { amount: 5000, suspicious: false } },
  { id: 'e6', source: 'ACC006', target: 'ACC007', style: { stroke: 'hsl(var(--chart-2))' }, data: { amount: 8500, suspicious: false } },
  { id: 'e7', source: 'ACC007', target: 'ACC008', animated: true, style: { stroke: 'hsl(var(--chart-4))' }, data: { amount: 25000, suspicious: true } },
  { id: 'e8', source: 'ACC008', target: 'ACC009', animated: true, style: { stroke: 'hsl(var(--chart-3))' }, data: { amount: 24999, suspicious: true } },
  { id: 'e9', source: 'ACC001', target: 'ACC005', style: { stroke: 'hsl(var(--chart-2))' }, data: { amount: 3500, suspicious: false } },
  { id: 'e10', source: 'ACC010', target: 'ACC006', style: { stroke: 'hsl(var(--chart-2))' }, data: { amount: 2000, suspicious: false } },
]
