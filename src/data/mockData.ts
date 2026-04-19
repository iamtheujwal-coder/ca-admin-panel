// ============================================
// Mock Data for Anand Thakur Platform
// ============================================

export interface Client {
  id: string;
  name: string;
  type: string;
  industry: string;
  gstin: string;
  pan: string;
  directors: string[];
  status: 'active' | 'inactive' | 'pending';
  complianceScore: number;
  lastActivity: string;
  revenue: number;
  pendingTasks: number;
  avatar: string;
}

export interface Workflow {
  id: string;
  title: string;
  client: string;
  clientId: string;
  type: string;
  status: 'todo' | 'in-progress' | 'review' | 'filed';
  assignee: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  client: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  issueDate: string;
  dueDate: string;
  services: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  activeTasks: number;
  completedTasks: number;
  status: 'online' | 'offline' | 'busy';
  email?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: string;
  read: boolean;
}

export interface ComplianceItem {
  id: string;
  title: string;
  client: string;
  dueDate: string;
  status: 'pending' | 'filed' | 'overdue' | 'upcoming';
  type: string;
}

export interface Document {
  id: string;
  name: string;
  category: string;
  uploadDate: string;
  size: string;
  status: 'processed' | 'pending' | 'error';
  type: string;
}

// ---- Admin Stats ----
export const adminStats = {
  totalClients: 47,
  activeWorkflows: 23,
  pendingCompliances: 8,
  revenue: 2847500,
  invoicesPending: 12,
  aiProcessed: 156,
  monthlyGrowth: 12.5,
  taskCompletionRate: 87,
};

// ---- Clients ----
export const clients: Client[] = [
  {
    id: 'c1',
    name: 'PaySwift Technologies Pvt. Ltd.',
    type: 'Private Limited',
    industry: 'Fintech',
    gstin: '07AABCP1234E1Z5',
    pan: 'AABCP1234E',
    directors: ['Rajesh Mehta', 'Priya Sharma'],
    status: 'active',
    complianceScore: 92,
    lastActivity: '2 hours ago',
    revenue: 12500000,
    pendingTasks: 3,
    avatar: 'PS',
  },
  {
    id: 'c2',
    name: 'QuickMart E-Commerce LLP',
    type: 'LLP',
    industry: 'E-Commerce',
    gstin: '09AABCQ5678R2Z1',
    pan: 'AABCQ5678R',
    directors: ['Amit Gupta'],
    status: 'active',
    complianceScore: 78,
    lastActivity: '1 day ago',
    revenue: 8700000,
    pendingTasks: 5,
    avatar: 'QM',
  },
  {
    id: 'c3',
    name: 'Stellar Infra Projects Ltd.',
    type: 'Public Limited',
    industry: 'Infrastructure',
    gstin: '27AABCS9876T3Z0',
    pan: 'AABCS9876T',
    directors: ['Vikram Singh', 'Neha Kapoor', 'Arjun Reddy'],
    status: 'active',
    complianceScore: 95,
    lastActivity: '5 hours ago',
    revenue: 45000000,
    pendingTasks: 2,
    avatar: 'SI',
  },
  {
    id: 'c4',
    name: 'GreenLeaf Organics',
    type: 'Proprietorship',
    industry: 'FMCG',
    gstin: '06AABCG4321L1Z8',
    pan: 'AABCG4321L',
    directors: ['Sunita Devi'],
    status: 'active',
    complianceScore: 65,
    lastActivity: '3 days ago',
    revenue: 3200000,
    pendingTasks: 7,
    avatar: 'GL',
  },
  {
    id: 'c5',
    name: 'MedLife Healthcare Solutions',
    type: 'Private Limited',
    industry: 'Healthcare',
    gstin: '29AABCM7890H2Z3',
    pan: 'AABCM7890H',
    directors: ['Dr. Arun Patel', 'Dr. Kavita Joshi'],
    status: 'active',
    complianceScore: 88,
    lastActivity: '6 hours ago',
    revenue: 18500000,
    pendingTasks: 4,
    avatar: 'ML',
  },
  {
    id: 'c6',
    name: 'CloudNine SaaS Pvt. Ltd.',
    type: 'Private Limited',
    industry: 'SaaS',
    gstin: '29AABCC5544N1Z9',
    pan: 'AABCC5544N',
    directors: ['Rohan Iyer'],
    status: 'pending',
    complianceScore: 45,
    lastActivity: '1 week ago',
    revenue: 6800000,
    pendingTasks: 9,
    avatar: 'CN',
  },
];

// ---- Workflows ----
export const workflows: Workflow[] = [
  { id: 'w1', title: 'GST Return - Q4 FY25-26', client: 'PaySwift Technologies', clientId: 'c1', type: 'GST', status: 'in-progress', assignee: 'Ravi Kumar', dueDate: 'Apr 20, 2026', priority: 'high', progress: 65 },
  { id: 'w2', title: 'Annual Audit FY25-26', client: 'Stellar Infra Projects', clientId: 'c3', type: 'Audit', status: 'review', assignee: 'Anand', dueDate: 'Apr 30, 2026', priority: 'critical', progress: 85 },
  { id: 'w3', title: 'TDS Filing - March 2026', client: 'QuickMart E-Commerce', clientId: 'c2', type: 'TDS', status: 'todo', assignee: 'Meera Jain', dueDate: 'Apr 15, 2026', priority: 'high', progress: 10 },
  { id: 'w4', title: 'Company ROC Filing', client: 'MedLife Healthcare', clientId: 'c5', type: 'ROC', status: 'in-progress', assignee: 'Ravi Kumar', dueDate: 'May 10, 2026', priority: 'medium', progress: 40 },
  { id: 'w5', title: 'IT Return - AY 2026-27', client: 'GreenLeaf Organics', clientId: 'c4', type: 'Income Tax', status: 'todo', assignee: 'Meera Jain', dueDate: 'Jul 31, 2026', priority: 'low', progress: 0 },
  { id: 'w6', title: 'Payroll Processing - April', client: 'PaySwift Technologies', clientId: 'c1', type: 'Payroll', status: 'filed', assignee: 'Ravi Kumar', dueDate: 'Apr 07, 2026', priority: 'medium', progress: 100 },
  { id: 'w7', title: 'GST Reconciliation', client: 'CloudNine SaaS', clientId: 'c6', type: 'GST', status: 'todo', assignee: 'Anand', dueDate: 'Apr 25, 2026', priority: 'critical', progress: 5 },
  { id: 'w8', title: 'Advance Tax - Q1', client: 'Stellar Infra Projects', clientId: 'c3', type: 'Income Tax', status: 'in-progress', assignee: 'Anand', dueDate: 'Jun 15, 2026', priority: 'medium', progress: 30 },
];

// ---- Invoices ----
export const invoices: Invoice[] = [
  { id: 'inv1', invoiceNo: 'AT-2026-0041', client: 'PaySwift Technologies', amount: 125000, status: 'paid', issueDate: 'Mar 01, 2026', dueDate: 'Mar 15, 2026', services: ['GST Filing', 'Reconciliation', 'Advisory'] },
  { id: 'inv2', invoiceNo: 'AT-2026-0042', client: 'Stellar Infra Projects', amount: 275000, status: 'pending', issueDate: 'Mar 15, 2026', dueDate: 'Apr 15, 2026', services: ['Annual Audit', 'ROC Compliance'] },
  { id: 'inv3', invoiceNo: 'AT-2026-0043', client: 'QuickMart E-Commerce', amount: 85000, status: 'overdue', issueDate: 'Feb 20, 2026', dueDate: 'Mar 20, 2026', services: ['TDS Filing', 'GST Return'] },
  { id: 'inv4', invoiceNo: 'AT-2026-0044', client: 'MedLife Healthcare', amount: 150000, status: 'paid', issueDate: 'Mar 10, 2026', dueDate: 'Mar 25, 2026', services: ['Audit', 'Tax Advisory', 'Payroll'] },
  { id: 'inv5', invoiceNo: 'AT-2026-0045', client: 'GreenLeaf Organics', amount: 45000, status: 'pending', issueDate: 'Apr 01, 2026', dueDate: 'Apr 30, 2026', services: ['IT Return', 'Book Keeping'] },
];

// ---- Team Members ----
export const teamMembers: TeamMember[] = [
  { id: 't1', name: 'Anand Thakur', role: 'Principal', avatar: 'AT', activeTasks: 4, completedTasks: 156, status: 'online' },
  { id: 't2', name: 'Ravi Kumar', role: 'Senior Accountant', avatar: 'RK', activeTasks: 6, completedTasks: 89, status: 'online' },
  { id: 't3', name: 'Meera Jain', role: 'Article Assistant', avatar: 'MJ', activeTasks: 5, completedTasks: 42, status: 'busy' },
  { id: 't4', name: 'Deepak Verma', role: 'Tax Consultant', avatar: 'DV', activeTasks: 3, completedTasks: 67, status: 'offline' },
];

// ---- Notifications ----
export const notifications: Notification[] = [
  { id: 'n1', title: 'GST Deadline Approaching', message: 'GSTR-3B for PaySwift Technologies due in 6 days.', type: 'warning', timestamp: '10 minutes ago', read: false },
  { id: 'n2', title: 'AI Reconciliation Complete', message: '1,247 transactions matched. 3 anomalies flagged for review.', type: 'info', timestamp: '1 hour ago', read: false },
  { id: 'n3', title: 'Document Uploaded', message: 'QuickMart uploaded 5 purchase invoices for Q4.', type: 'success', timestamp: '2 hours ago', read: false },
  { id: 'n4', title: 'Compliance Alert', message: 'ROC Annual Return overdue for CloudNine SaaS.', type: 'error', timestamp: '5 hours ago', read: true },
  { id: 'n5', title: 'Invoice Paid', message: 'MedLife Healthcare cleared Invoice AT-2026-0044.', type: 'success', timestamp: '1 day ago', read: true },
];

// ---- Compliance Calendar ----
export const complianceItems: ComplianceItem[] = [
  { id: 'comp1', title: 'GSTR-3B Filing', client: 'PaySwift Technologies', dueDate: 'Apr 20, 2026', status: 'pending', type: 'GST' },
  { id: 'comp2', title: 'TDS Return - Q4', client: 'QuickMart E-Commerce', dueDate: 'Apr 15, 2026', status: 'overdue', type: 'TDS' },
  { id: 'comp3', title: 'Annual Return (AOC-4)', client: 'Stellar Infra Projects', dueDate: 'Apr 30, 2026', status: 'pending', type: 'ROC' },
  { id: 'comp4', title: 'Advance Tax - Q1', client: 'MedLife Healthcare', dueDate: 'Jun 15, 2026', status: 'upcoming', type: 'Income Tax' },
  { id: 'comp5', title: 'GSTR-1 Filing', client: 'GreenLeaf Organics', dueDate: 'Apr 11, 2026', status: 'filed', type: 'GST' },
  { id: 'comp6', title: 'ROC Annual Return', client: 'CloudNine SaaS', dueDate: 'Mar 31, 2026', status: 'overdue', type: 'ROC' },
];

// ---- Client Portal Documents ----
export const clientDocuments: Document[] = [
  { id: 'd1', name: 'Bank Statement - March 2026.pdf', category: 'FY 25-26 > Q4 > Bank Statements', uploadDate: 'Apr 05, 2026', size: '2.4 MB', status: 'processed', type: 'pdf' },
  { id: 'd2', name: 'Purchase Invoices - Q4.zip', category: 'FY 25-26 > Q4 > Purchase Invoices', uploadDate: 'Apr 10, 2026', size: '15.8 MB', status: 'processed', type: 'zip' },
  { id: 'd3', name: 'Razorpay Settlement Report.csv', category: 'FY 25-26 > Q4 > Payment Gateway', uploadDate: 'Apr 12, 2026', size: '890 KB', status: 'pending', type: 'csv' },
  { id: 'd4', name: 'Form 16A - Vendor TDS.pdf', category: 'FY 25-26 > TDS Certificates', uploadDate: 'Apr 08, 2026', size: '340 KB', status: 'processed', type: 'pdf' },
  { id: 'd5', name: 'Board Resolution - AGM.pdf', category: 'FY 25-26 > Legal Documents', uploadDate: 'Apr 01, 2026', size: '1.2 MB', status: 'processed', type: 'pdf' },
];

// ---- Revenue Trend Data (monthly) ----
export const revenueTrend = [
  { month: 'Sep', value: 1850000 },
  { month: 'Oct', value: 2100000 },
  { month: 'Nov', value: 1920000 },
  { month: 'Dec', value: 2450000 },
  { month: 'Jan', value: 2680000 },
  { month: 'Feb', value: 2350000 },
  { month: 'Mar', value: 2847500 },
];

// ---- Client Financial Snapshot ----
export const clientFinancialSnapshot = {
  totalRevenue: 12500000,
  totalExpenses: 9800000,
  netProfit: 2700000,
  gstLiability: 485000,
  tdsDeducted: 312000,
  advanceTaxPaid: 250000,
  pendingRefund: 67000,
  cashFlow: [
    { month: 'Oct', inflow: 1800000, outflow: 1400000 },
    { month: 'Nov', inflow: 2100000, outflow: 1650000 },
    { month: 'Dec', inflow: 1950000, outflow: 1580000 },
    { month: 'Jan', inflow: 2300000, outflow: 1800000 },
    { month: 'Feb', inflow: 2050000, outflow: 1700000 },
    { month: 'Mar', inflow: 2500000, outflow: 1900000 },
  ],
};

// ---- AI Insights ----
export const aiInsights = [
  {
    id: 'ai1',
    title: 'Potential GST Mismatch Detected',
    description: 'PaySwift Technologies: GSTR-2A shows 3 invoices (worth ₹4.2L) not claimed in GSTR-3B. Recommend verification before filing.',
    type: 'warning' as const,
    confidence: 94,
    action: 'Review & Resolve',
  },
  {
    id: 'ai2',
    title: 'Advance Tax Optimization',
    description: 'Stellar Infra: Based on Q1-Q3 trend, estimated tax liability is ₹18.5L. Current advance tax paid: ₹14L. Shortfall: ₹4.5L.',
    type: 'info' as const,
    confidence: 87,
    action: 'Calculate & Advise',
  },
  {
    id: 'ai3',
    title: 'Unusual Transaction Pattern',
    description: 'QuickMart: 47 refund transactions totaling ₹8.9L in March — 340% above monthly average. Verify with client.',
    type: 'error' as const,
    confidence: 91,
    action: 'Flag for Review',
  },
  {
    id: 'ai4',
    title: 'Auto-Categorized 156 Documents',
    description: 'AI successfully processed and categorized 156 documents across 6 clients this week. 3 require manual review.',
    type: 'success' as const,
    confidence: 98,
    action: 'View Details',
  },
];

// Format currency
export const formatCurrency = (amount: number): string => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  return `₹${amount.toLocaleString('en-IN')}`;
};

// Format number
export const formatNumber = (num: number): string => {
  return num.toLocaleString('en-IN');
};
