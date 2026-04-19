import { useAuthStore } from '../../store/authStore';
import {
  TrendingUp, TrendingDown, ArrowUpRight, ChevronRight,
  FileText, Upload, MessageSquare, CheckCircle2,
  IndianRupee, PiggyBank, CreditCard, BarChart3,
  FolderOpen, AlertCircle, Calendar, Clock, Send,
  Shield, Sparkles
} from 'lucide-react';
import { clientFinancialSnapshot, clientDocuments, formatCurrency } from '../../data/mockData';
import './ClientDashboard.css';

export default function ClientDashboard() {
  const { profile } = useAuthStore();
  const snapshot = clientFinancialSnapshot;

  const companyName = profile?.companyName || 'Valued Client';

  // Status Tracker steps
  const trackerSteps = [
    { label: 'Documents Received', status: 'complete', date: 'Apr 10' },
    { label: 'Under Processing', status: 'complete', date: 'Apr 12' },
    { label: 'Review', status: 'active', date: 'In Progress' },
    { label: 'Filed Successfully', status: 'pending', date: 'Estimated Apr 18' },
  ];

  // Pending approvals
  const approvals = [
    { id: 'a1', title: 'GST Return - GSTR-3B (March 2026)', type: 'Tax Filing', status: 'awaiting' },
    { id: 'a2', title: 'TDS Certificate - Form 16A', type: 'Certificate', status: 'approved' },
  ];

  // Cash flow chart calculation
  const maxFlow = Math.max(...snapshot.cashFlow.map(d => Math.max(d.inflow, d.outflow)));

  return (
    <div className="client-dash">
      {/* Welcome Header */}
      <header className="client-dash__header animate-fadeInDown">
        <div className="client-dash__header-left">
          <h1 className="client-dash__greeting">
            Welcome back, <span className="text-gradient font-serif">{companyName}</span>
          </h1>
          <p className="client-dash__subtext">
            <Calendar size={14} />
            Your financial snapshot for FY 2025-26
          </p>
        </div>
        <div className="client-dash__header-actions">
          <button className="btn btn--secondary" id="upload-doc-btn">
            <Upload size={16} />
            Upload Document
          </button>
          <button className="btn btn--primary" id="ask-ca-btn">
            <MessageSquare size={16} />
            Ask CA
          </button>
        </div>
      </header>

      {/* Financial Snapshot Cards */}
      <section className="client-dash__finance-grid" id="financial-snapshot-section">
        <div className="client-dash__finance-card client-dash__finance-card--revenue animate-fadeInUp">
          <div className="client-dash__finance-icon">
            <IndianRupee size={22} />
          </div>
          <div className="client-dash__finance-content">
            <span className="client-dash__finance-value">{formatCurrency(snapshot.totalRevenue)}</span>
            <span className="client-dash__finance-label">Total Revenue</span>
          </div>
          <div className="client-dash__finance-trend client-dash__finance-trend--up">
            <TrendingUp size={14} />
            +18.5% YoY
          </div>
        </div>

        <div className="client-dash__finance-card client-dash__finance-card--expense animate-fadeInUp delay-100">
          <div className="client-dash__finance-icon client-dash__finance-icon--red">
            <CreditCard size={22} />
          </div>
          <div className="client-dash__finance-content">
            <span className="client-dash__finance-value">{formatCurrency(snapshot.totalExpenses)}</span>
            <span className="client-dash__finance-label">Total Expenses</span>
          </div>
          <div className="client-dash__finance-trend client-dash__finance-trend--down">
            <TrendingDown size={14} />
            78.4% of revenue
          </div>
        </div>

        <div className="client-dash__finance-card client-dash__finance-card--profit animate-fadeInUp delay-200">
          <div className="client-dash__finance-icon client-dash__finance-icon--green">
            <PiggyBank size={22} />
          </div>
          <div className="client-dash__finance-content">
            <span className="client-dash__finance-value">{formatCurrency(snapshot.netProfit)}</span>
            <span className="client-dash__finance-label">Net Profit</span>
          </div>
          <div className="client-dash__finance-trend client-dash__finance-trend--up">
            <ArrowUpRight size={14} />
            21.6% margin
          </div>
        </div>

        <div className="client-dash__finance-card client-dash__finance-card--tax animate-fadeInUp delay-300">
          <div className="client-dash__finance-icon client-dash__finance-icon--amber">
            <BarChart3 size={22} />
          </div>
          <div className="client-dash__finance-content">
            <span className="client-dash__finance-value">{formatCurrency(snapshot.gstLiability)}</span>
            <span className="client-dash__finance-label">GST Liability</span>
          </div>
          <div className="client-dash__finance-trend client-dash__finance-trend--neutral">
            <Clock size={14} />
            Due Apr 20
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="client-dash__grid">
        {/* Cash Flow Chart */}
        <section className="client-dash__card animate-fadeInUp delay-200" id="cash-flow-section">
          <div className="client-dash__card-header">
            <div className="client-dash__card-title">
              <BarChart3 size={18} className="icon--accent" />
              <h2>Cash Flow Overview</h2>
            </div>
            <div className="client-dash__flow-legend">
              <span className="client-dash__legend-item">
                <span className="client-dash__legend-dot client-dash__legend-dot--inflow" />
                Inflow
              </span>
              <span className="client-dash__legend-item">
                <span className="client-dash__legend-dot client-dash__legend-dot--outflow" />
                Outflow
              </span>
            </div>
          </div>
          <div className="client-dash__flow-chart">
            {snapshot.cashFlow.map((item) => (
              <div key={item.month} className="client-dash__flow-group">
                <div className="client-dash__flow-bars">
                  <div
                    className="client-dash__flow-bar client-dash__flow-bar--inflow"
                    style={{ height: `${(item.inflow / maxFlow) * 160}px` }}
                    title={`Inflow: ${formatCurrency(item.inflow)}`}
                  />
                  <div
                    className="client-dash__flow-bar client-dash__flow-bar--outflow"
                    style={{ height: `${(item.outflow / maxFlow) * 160}px` }}
                    title={`Outflow: ${formatCurrency(item.outflow)}`}
                  />
                </div>
                <span className="client-dash__flow-month">{item.month}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Tax Summary */}
        <section className="client-dash__card animate-fadeInUp delay-300" id="tax-summary-section">
          <div className="client-dash__card-header">
            <div className="client-dash__card-title">
              <Shield size={18} className="icon--accent" />
              <h2>Tax Summary</h2>
            </div>
          </div>
          <div className="client-dash__tax-list">
            <div className="client-dash__tax-item">
              <div className="client-dash__tax-info">
                <span className="client-dash__tax-label">GST Liability (Current Quarter)</span>
                <span className="client-dash__tax-value">{formatCurrency(snapshot.gstLiability)}</span>
              </div>
              <span className="tag tag--warning">Due Apr 20</span>
            </div>
            <div className="client-dash__tax-item">
              <div className="client-dash__tax-info">
                <span className="client-dash__tax-label">TDS Deducted</span>
                <span className="client-dash__tax-value">{formatCurrency(snapshot.tdsDeducted)}</span>
              </div>
              <span className="tag tag--success">Filed</span>
            </div>
            <div className="client-dash__tax-item">
              <div className="client-dash__tax-info">
                <span className="client-dash__tax-label">Advance Tax Paid</span>
                <span className="client-dash__tax-value">{formatCurrency(snapshot.advanceTaxPaid)}</span>
              </div>
              <span className="tag tag--success">Paid</span>
            </div>
            <div className="client-dash__tax-item">
              <div className="client-dash__tax-info">
                <span className="client-dash__tax-label">Pending Refund</span>
                <span className="client-dash__tax-value">{formatCurrency(snapshot.pendingRefund)}</span>
              </div>
              <span className="tag tag--info">Processing</span>
            </div>
          </div>
        </section>

        {/* Live Status Tracker */}
        <section className="client-dash__card client-dash__tracker animate-fadeInUp delay-400" id="status-tracker-section">
          <div className="client-dash__card-header">
            <div className="client-dash__card-title">
              <CheckCircle2 size={18} className="icon--accent" />
              <h2>GST Return Filing Status</h2>
            </div>
            <span className="tag tag--warning">In Progress</span>
          </div>
          <div className="client-dash__tracker-steps">
            {trackerSteps.map((step, i) => (
              <div key={i} className={`client-dash__tracker-step client-dash__tracker-step--${step.status}`}>
                <div className="client-dash__tracker-dot">
                  {step.status === 'complete' && <CheckCircle2 size={18} />}
                  {step.status === 'active' && <div className="client-dash__tracker-pulse" />}
                </div>
                {i < trackerSteps.length - 1 && <div className="client-dash__tracker-line" />}
                <div className="client-dash__tracker-info">
                  <span className="client-dash__tracker-label">{step.label}</span>
                  <span className="client-dash__tracker-date">{step.date}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pending Approvals */}
        <section className="client-dash__card animate-fadeInUp delay-500" id="approvals-section">
          <div className="client-dash__card-header">
            <div className="client-dash__card-title">
              <FileText size={18} className="icon--accent" />
              <h2>Pending Approvals</h2>
            </div>
          </div>
          <div className="client-dash__approval-list">
            {approvals.map((item) => (
              <div key={item.id} className="client-dash__approval-item">
                <div className="client-dash__approval-info">
                  <h4>{item.title}</h4>
                  <p>{item.type}</p>
                </div>
                {item.status === 'awaiting' ? (
                  <div className="client-dash__approval-actions">
                    <button className="btn btn--primary btn--sm" id={`approve-${item.id}-btn`}>
                      <CheckCircle2 size={14} />
                      Approve
                    </button>
                    <button className="btn btn--ghost btn--sm" id={`review-${item.id}-btn`}>
                      Review
                    </button>
                  </div>
                ) : (
                  <span className="tag tag--success">
                    <CheckCircle2 size={12} />
                    Approved
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Recent Documents */}
        <section className="client-dash__card animate-fadeInUp delay-300" id="recent-docs-section">
          <div className="client-dash__card-header">
            <div className="client-dash__card-title">
              <FolderOpen size={18} className="icon--accent" />
              <h2>Document Vault</h2>
            </div>
            <button className="btn btn--ghost btn--sm" id="view-all-docs-btn">
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="client-dash__doc-list">
            {clientDocuments.map((doc) => (
              <div key={doc.id} className="client-dash__doc-item">
                <div className="client-dash__doc-icon">
                  <FileText size={18} />
                </div>
                <div className="client-dash__doc-info">
                  <h4>{doc.name}</h4>
                  <p>{doc.category}</p>
                </div>
                <span className="client-dash__doc-size">{doc.size}</span>
                <span className={`tag ${doc.status === 'processed' ? 'tag--success' : doc.status === 'pending' ? 'tag--warning' : 'tag--error'}`}>
                  {doc.status === 'processed' && <CheckCircle2 size={10} />}
                  {doc.status === 'pending' && <Clock size={10} />}
                  {doc.status === 'error' && <AlertCircle size={10} />}
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Ask Assistant Chatbot */}
        <section className="client-dash__card client-dash__chat animate-fadeInUp delay-400" id="ask-ca-section">
          <div className="client-dash__card-header">
            <div className="client-dash__card-title">
              <Sparkles size={18} className="icon--accent" />
              <h2>Ask Assistant</h2>
            </div>
            <span className="tag tag--accent">
              <Sparkles size={10} />
              AI-Powered
            </span>
          </div>
          <div className="client-dash__chat-messages">
            <div className="client-dash__chat-msg client-dash__chat-msg--bot">
              <div className="client-dash__chat-avatar">
                <Sparkles size={14} />
              </div>
              <div className="client-dash__chat-bubble">
                Hello! I'm your AI-powered assistant. I can answer questions about your tax filings, 
                compliance status, and financial data. Ask me anything!
              </div>
            </div>
            <div className="client-dash__chat-msg client-dash__chat-msg--user">
              <div className="client-dash__chat-bubble">
                How much GST do I owe this month?
              </div>
            </div>
            <div className="client-dash__chat-msg client-dash__chat-msg--bot">
              <div className="client-dash__chat-avatar">
                <Sparkles size={14} />
              </div>
              <div className="client-dash__chat-bubble">
                Based on your March 2026 transactions, your estimated GST liability is <strong>₹4,85,000</strong>. 
                This includes CGST of ₹2,42,500 and SGST of ₹2,42,500. The filing deadline is <strong>April 20, 2026</strong>. 
                We are currently reviewing the reconciliation.
              </div>
            </div>
          </div>
          <div className="client-dash__chat-input">
            <input
              type="text"
              placeholder="Ask about your finances, tax, compliance..."
              id="chat-input"
            />
            <button className="client-dash__chat-send" id="chat-send-btn">
              <Send size={18} />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
