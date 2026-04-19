import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { API_URL } from '../../config';
import {
  Users, TrendingUp, AlertTriangle, Receipt, Brain, Clock,
  ArrowUpRight, ArrowDownRight, ChevronRight, Sparkles,
  FileText, Shield, Bell, Search, Calendar, MoreHorizontal,
  CheckCircle2, XCircle, AlertCircle, Info, X, Eye, 
  ExternalLink, Download, Check, RefreshCw
} from 'lucide-react';
import {
  adminStats, clients, workflows, notifications as initialNotifications, complianceItems,
  aiInsights, revenueTrend, formatCurrency
} from '../../data/mockData';
import './AdminDashboard.css';

// ---- Types for internal state ----
interface InsightModalData {
  id: string;
  title: string;
  description: string;
  type: string;
  confidence: number;
  action: string;
  details: string;
  recommendations: string[];
  affectedItems: { label: string; value: string }[];
  resolvedAt?: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [clientCount, setClientCount] = useState(adminStats.totalClients);

  // Notification state
  const [notifList, setNotifList] = useState(initialNotifications.map(n => ({ ...n })));
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // AI Insight modal state
  const [insightModal, setInsightModal] = useState<InsightModalData | null>(null);
  const [resolvedInsights, setResolvedInsights] = useState<Set<string>>(new Set());
  const [processingInsight, setProcessingInsight] = useState<string | null>(null);

  // Revenue tooltip state
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  // Compliance filter
  const [complianceFilter, setComplianceFilter] = useState<string>('all');

  // Client context menu
  const [clientMenu, setClientMenu] = useState<string | null>(null);

  // Activity state
  const [activityList, setActivityList] = useState(initialNotifications.map(n => ({ ...n })));

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get(`${API_URL}/admin/clients`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClientCount(response.data.length);
      } catch (err) {
        console.error('Failed to fetch clients for stats', err);
      }
    };
    if (token) fetchClients();
  }, [token]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifPanel(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
      setClientMenu(null);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ---- Search Logic ----
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    const q = searchQuery.toLowerCase();
    const results: any[] = [];

    // Search clients
    clients.filter(c => c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q))
      .slice(0, 3).forEach(c => results.push({ type: 'client', label: c.name, sub: c.industry, path: '/admin/clients', icon: 'user' }));

    // Search workflows
    workflows.filter(w => w.title.toLowerCase().includes(q) || w.client.toLowerCase().includes(q))
      .slice(0, 3).forEach(w => results.push({ type: 'workflow', label: w.title, sub: w.client, path: '/admin/workflows', icon: 'workflow' }));

    // Search compliance
    complianceItems.filter(c => c.title.toLowerCase().includes(q) || c.client.toLowerCase().includes(q))
      .slice(0, 2).forEach(c => results.push({ type: 'compliance', label: c.title, sub: c.client, path: '/admin/compliance', icon: 'shield' }));

    // Search documents
    if ('document'.includes(q) || 'file'.includes(q) || 'upload'.includes(q)) {
      results.push({ type: 'page', label: 'Documents', sub: 'Manage all documents', path: '/admin/documents', icon: 'file' });
    }

    setSearchResults(results);
    setShowSearchResults(results.length > 0);
  }, [searchQuery]);

  // ---- AI Insight Detail Generation ----
  const getInsightDetails = (insight: typeof aiInsights[0]): InsightModalData => {
    const detailsMap: Record<string, Omit<InsightModalData, 'id' | 'title' | 'description' | 'type' | 'confidence' | 'action'>> = {
      'ai1': {
        details: 'The AI reconciliation engine detected a discrepancy between GSTR-2A (supplier-reported) and GSTR-3B (self-reported) filings for PaySwift Technologies. Three purchase invoices worth ₹4.2 Lakhs from vendor "TechSupply Solutions" appear in GSTR-2A but were not claimed as Input Tax Credit in the GSTR-3B filing for March 2026.',
        recommendations: [
          `Verify with PaySwift's accounts team if these invoices were received and recorded in books`,
          'Cross-check with purchase register entries for March 2026',
          'If valid, include these invoices in the next GSTR-3B amendment',
          'Update ITC register to reflect the corrected amount'
        ],
        affectedItems: [
          { label: 'Client', value: 'PaySwift Technologies Pvt. Ltd.' },
          { label: 'Period', value: 'March 2026 (Q4 FY25-26)' },
          { label: 'Mismatch Amount', value: '₹4,20,000' },
          { label: 'ITC Impact', value: '₹75,600 (18% GST)' },
          { label: 'Vendor', value: 'TechSupply Solutions' },
          { label: 'Invoice Count', value: '3 invoices' }
        ]
      },
      'ai2': {
        details: 'Based on historical income patterns from Q1-Q3 FY25-26, the AI tax engine has projected Stellar Infra Projects\' total tax liability at ₹18.5 Lakhs. Current advance tax installments (Q1-Q3) total ₹14 Lakhs, leaving a shortfall of ₹4.5 Lakhs for the Q4 installment due on March 15, 2026.',
        recommendations: [
          'Calculate exact Q4 advance tax based on revised profit estimates',
          'Review any additional deductions available under Chapter VI-A',
          'Consider Section 80JJAA benefits for new employee additions',
          'File revised advance tax challan before March 15 deadline',
          'Schedule advisory call with Vikram Singh (Director)'
        ],
        affectedItems: [
          { label: 'Client', value: 'Stellar Infra Projects Ltd.' },
          { label: 'Assessment Year', value: 'AY 2026-27' },
          { label: 'Projected Liability', value: '₹18,50,000' },
          { label: 'Advance Tax Paid', value: '₹14,00,000' },
          { label: 'Shortfall', value: '₹4,50,000' },
          { label: 'Interest Risk (234C)', value: '~₹27,000' }
        ]
      },
      'ai3': {
        details: 'The AI anomaly detection system flagged an unusual spike in refund transactions for QuickMart E-Commerce LLP. In March 2026, 47 refund transactions totaling ₹8.9 Lakhs were processed — a 340% increase over the monthly average of ₹2.0 Lakhs. This pattern could indicate returns fraud, system errors, or a legitimate seasonal trend that requires verification.',
        recommendations: [
          'Request QuickMart to provide refund authorization reports',
          'Cross-verify refund entries with bank statements',
          'Check if there was a product recall or quality issue',
          'Review GST implications of credit notes issued',
          'Flag for internal audit if no valid explanation provided'
        ],
        affectedItems: [
          { label: 'Client', value: 'QuickMart E-Commerce LLP' },
          { label: 'Period', value: 'March 2026' },
          { label: 'Refund Count', value: '47 transactions' },
          { label: 'Total Refunds', value: '₹8,90,000' },
          { label: 'Monthly Average', value: '₹2,00,000' },
          { label: 'Variance', value: '+340%' }
        ]
      },
      'ai4': {
        details: 'The AI document processing engine successfully categorized 156 documents uploaded by 6 clients this week. Documents were automatically sorted into the correct fiscal year, quarter, and category folders. 3 documents require manual review due to ambiguous content classification.',
        recommendations: [
          'Review 3 flagged documents in the Document Vault',
          'Confirm auto-categorization accuracy with a spot-check',
          'Update AI training data if recurring mis-classifications found',
          'Notify clients about successfully processed uploads'
        ],
        affectedItems: [
          { label: 'Documents Processed', value: '156' },
          { label: 'Clients Covered', value: '6' },
          { label: 'Auto-Categorized', value: '153 (98.1%)' },
          { label: 'Manual Review', value: '3 documents' },
          { label: 'Processing Time', value: '12.4 seconds avg' },
          { label: 'Accuracy Rate', value: '98.1%' }
        ]
      },
    };
    return {
      id: insight.id,
      title: insight.title,
      description: insight.description,
      type: insight.type,
      confidence: insight.confidence,
      action: insight.action,
      ...(detailsMap[insight.id] || {
        details: insight.description,
        recommendations: ['Review the flagged item', 'Take corrective action if needed'],
        affectedItems: []
      })
    };
  };

  // ---- Handlers ----
  const handleInsightAction = (insight: typeof aiInsights[0]) => {
    setInsightModal(getInsightDetails(insight));
  };

  const handleResolveInsight = (id: string) => {
    setProcessingInsight(id);
    setTimeout(() => {
      setResolvedInsights(prev => new Set(prev).add(id));
      setProcessingInsight(null);
      if (insightModal?.id === id) {
        setInsightModal({ ...insightModal, resolvedAt: new Date().toLocaleTimeString() });
      }
    }, 1500);
  };

  const handleMarkNotifRead = (id: string) => {
    setNotifList(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllRead = () => {
    setNotifList(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleDismissActivity = (id: string) => {
    setActivityList(prev => prev.filter(n => n.id !== id));
  };

  const handleMarkActivityRead = (id: string) => {
    setActivityList(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const userName = user?.name || user?.email?.split('@')[0] || 'Anand';
  const greetingName = userName.charAt(0).toUpperCase() + userName.slice(1);

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  // Today's date
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'tag--info';
      case 'in-progress': return 'tag--warning';
      case 'review': return 'tag--accent';
      case 'filed': return 'tag--success';
      default: return 'tag--info';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'tag--error';
      case 'high': return 'tag--warning';
      case 'medium': return 'tag--info';
      case 'low': return 'tag--success';
      default: return 'tag--info';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle size={18} />;
      case 'error': return <XCircle size={18} />;
      case 'success': return <CheckCircle2 size={18} />;
      case 'info': return <Info size={18} />;
      default: return <Info size={18} />;
    }
  };

  const getComplianceStatusClass = (status: string) => {
    switch (status) {
      case 'filed': return 'tag--success';
      case 'pending': return 'tag--warning';
      case 'overdue': return 'tag--error';
      case 'upcoming': return 'tag--info';
      default: return 'tag--info';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertCircle size={16} className="notif-icon--warning" />;
      case 'error': return <XCircle size={16} className="notif-icon--error" />;
      case 'success': return <CheckCircle2 size={16} className="notif-icon--success" />;
      case 'info': return <Info size={16} className="notif-icon--info" />;
      default: return <Bell size={16} />;
    }
  };

  const maxRevenue = Math.max(...revenueTrend.map(r => r.value));
  const unreadCount = notifList.filter(n => !n.read).length;

  const filteredCompliance = complianceFilter === 'all'
    ? complianceItems
    : complianceItems.filter(c => c.status === complianceFilter);

  const getSearchIcon = (type: string) => {
    switch (type) {
      case 'client': return <Users size={14} />;
      case 'workflow': return <FileText size={14} />;
      case 'compliance': return <Shield size={14} />;
      case 'page': return <FileText size={14} />;
      default: return <Search size={14} />;
    }
  };

  return (
    <div className="admin-dash">
      {/* Top Bar */}
      <header className="admin-dash__header">
        <div className="admin-dash__header-left">
          <div>
            <h1 className="admin-dash__greeting">
              {greeting}, <span className="text-gradient font-serif">{greetingName}</span>
            </h1>
            <p className="admin-dash__date">
              <Calendar size={14} />
              {dateStr}
            </p>
          </div>
        </div>
        <div className="admin-dash__header-right">
          {/* Search with results dropdown */}
          <div className="admin-dash__search-wrapper" ref={searchRef}>
            <div className="admin-dash__search">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search clients, tasks, documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowSearchResults(true)}
                id="admin-search-input"
              />
              {searchQuery && (
                <button className="search-clear-btn" onClick={() => { setSearchQuery(''); setShowSearchResults(false); }}>
                  <X size={14} />
                </button>
              )}
            </div>
            {showSearchResults && searchResults.length > 0 && (
              <div className="search-results-dropdown" id="search-results-dropdown">
                <div className="search-results-header">
                  <span>Results ({searchResults.length})</span>
                </div>
                {searchResults.map((r, i) => (
                  <button
                    key={i}
                    className="search-result-item"
                    onClick={() => { navigate(r.path); setShowSearchResults(false); setSearchQuery(''); }}
                  >
                    <span className="search-result-icon">{getSearchIcon(r.type)}</span>
                    <div className="search-result-text">
                      <span className="search-result-label">{r.label}</span>
                      <span className="search-result-sub">{r.sub}</span>
                    </div>
                    <span className="search-result-type">{r.type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notification Bell with dropdown */}
          <div className="admin-dash__notif-wrapper" ref={notifRef}>
            <button
              className="admin-dash__notif-btn"
              id="admin-notif-btn"
              onClick={() => setShowNotifPanel(!showNotifPanel)}
            >
              <Bell size={20} />
              {unreadCount > 0 && <span className="admin-dash__notif-dot">{unreadCount}</span>}
            </button>

            {showNotifPanel && (
              <div className="notif-dropdown" id="notification-panel">
                <div className="notif-dropdown__header">
                  <h3>Notifications</h3>
                  <button className="btn btn--ghost btn--sm" onClick={handleMarkAllRead}>
                    Mark all read
                  </button>
                </div>
                <div className="notif-dropdown__list">
                  {notifList.map(notif => (
                    <div
                      key={notif.id}
                      className={`notif-dropdown__item ${!notif.read ? 'notif-dropdown__item--unread' : ''}`}
                      onClick={() => handleMarkNotifRead(notif.id)}
                    >
                      <div className={`notif-dropdown__icon notif-dropdown__icon--${notif.type}`}>
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className="notif-dropdown__content">
                        <h4>{notif.title}</h4>
                        <p>{notif.message}</p>
                        <span className="notif-dropdown__time">{notif.timestamp}</span>
                      </div>
                      {!notif.read && <div className="notif-dropdown__unread-dot" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="admin-dash__stats" id="admin-stats-section">
        <div className="stat-card animate-fadeInUp" onClick={() => navigate('/admin/clients')} style={{ cursor: 'pointer' }}>
          <div className="stat-card__icon stat-card__icon--clients">
            <Users size={22} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__value">{clientCount}</span>
            <span className="stat-card__label">Active Clients</span>
          </div>
          <div className="stat-card__trend stat-card__trend--up">
            <ArrowUpRight size={14} />
            <span>+3 this month</span>
          </div>
        </div>

        <div className="stat-card animate-fadeInUp delay-100" onClick={() => navigate('/admin/workflows')} style={{ cursor: 'pointer' }}>
          <div className="stat-card__icon stat-card__icon--workflows">
            <Clock size={22} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__value">{adminStats.activeWorkflows}</span>
            <span className="stat-card__label">Active Workflows</span>
          </div>
          <div className="stat-card__trend stat-card__trend--up">
            <ArrowUpRight size={14} />
            <span>{adminStats.taskCompletionRate}% completion</span>
          </div>
        </div>

        <div className="stat-card animate-fadeInUp delay-200" onClick={() => navigate('/admin/compliance')} style={{ cursor: 'pointer' }}>
          <div className="stat-card__icon stat-card__icon--compliance">
            <AlertTriangle size={22} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__value">{adminStats.pendingCompliances}</span>
            <span className="stat-card__label">Pending Compliances</span>
          </div>
          <div className="stat-card__trend stat-card__trend--down">
            <ArrowDownRight size={14} />
            <span>2 overdue</span>
          </div>
        </div>

        <div className="stat-card animate-fadeInUp delay-300" onClick={() => navigate('/admin/billing')} style={{ cursor: 'pointer' }}>
          <div className="stat-card__icon stat-card__icon--revenue">
            <TrendingUp size={22} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__value">{formatCurrency(adminStats.revenue)}</span>
            <span className="stat-card__label">Monthly Revenue</span>
          </div>
          <div className="stat-card__trend stat-card__trend--up">
            <ArrowUpRight size={14} />
            <span>+{adminStats.monthlyGrowth}%</span>
          </div>
        </div>

        <div className="stat-card animate-fadeInUp delay-400" onClick={() => navigate('/admin/ai-insights')} style={{ cursor: 'pointer' }}>
          <div className="stat-card__icon stat-card__icon--ai">
            <Brain size={22} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__value">{adminStats.aiProcessed}</span>
            <span className="stat-card__label">AI Docs Processed</span>
          </div>
          <div className="stat-card__trend stat-card__trend--up">
            <Sparkles size={14} />
            <span>This week</span>
          </div>
        </div>

        <div className="stat-card animate-fadeInUp delay-500" onClick={() => navigate('/admin/billing')} style={{ cursor: 'pointer' }}>
          <div className="stat-card__icon stat-card__icon--invoices">
            <Receipt size={22} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__value">{adminStats.invoicesPending}</span>
            <span className="stat-card__label">Invoices Pending</span>
          </div>
          <div className="stat-card__trend stat-card__trend--down">
            <ArrowDownRight size={14} />
            <span>3 overdue</span>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="admin-dash__grid">
        {/* AI Insights Panel */}
        <section className="admin-dash__card admin-dash__ai-panel animate-fadeInUp delay-200" id="ai-insights-panel">
          <div className="admin-dash__card-header">
            <div className="admin-dash__card-title">
              <Brain size={18} className="icon--accent" />
              <h2>AI Insights & Alerts</h2>
            </div>
            <button className="btn btn--ghost btn--sm" id="view-all-insights-btn" onClick={() => navigate('/admin/ai-insights')}>
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="admin-dash__ai-list">
            {aiInsights.map((insight) => (
              <div
                key={insight.id}
                className={`admin-dash__ai-item admin-dash__ai-item--${insight.type} ${resolvedInsights.has(insight.id) ? 'admin-dash__ai-item--resolved' : ''}`}
              >
                <div className="admin-dash__ai-icon">
                  {resolvedInsights.has(insight.id) ? <CheckCircle2 size={18} /> : getInsightIcon(insight.type)}
                </div>
                <div className="admin-dash__ai-content">
                  <h4>
                    {insight.title}
                    {resolvedInsights.has(insight.id) && <span className="resolved-badge">Resolved</span>}
                  </h4>
                  <p>{insight.description}</p>
                  <div className="admin-dash__ai-meta">
                    <span className="tag tag--accent">
                      <Sparkles size={10} />
                      {insight.confidence}% confidence
                    </span>
                    {!resolvedInsights.has(insight.id) ? (
                      <button
                        className="btn btn--primary btn--sm"
                        onClick={() => handleInsightAction(insight)}
                        id={`insight-action-${insight.id}`}
                      >
                        {insight.action}
                      </button>
                    ) : (
                      <span className="tag tag--success"><Check size={10} /> Done</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Revenue Chart */}
        <section className="admin-dash__card admin-dash__revenue animate-fadeInUp delay-300" id="revenue-chart-section">
          <div className="admin-dash__card-header">
            <div className="admin-dash__card-title">
              <TrendingUp size={18} className="icon--accent" />
              <h2>Revenue Trend</h2>
            </div>
            <span className="tag tag--success">
              <ArrowUpRight size={12} />
              +12.5% growth
            </span>
          </div>
          <div className="admin-dash__chart">
            {revenueTrend.map((item, idx) => (
              <div
                key={item.month}
                className={`admin-dash__chart-bar-group ${hoveredBar === idx ? 'admin-dash__chart-bar-group--hovered' : ''}`}
                onMouseEnter={() => setHoveredBar(idx)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                <div className={`admin-dash__chart-value ${hoveredBar === idx ? 'visible' : ''}`}>
                  {formatCurrency(item.value)}
                </div>
                <div className="admin-dash__chart-bar-container">
                  <div
                    className="admin-dash__chart-bar"
                    style={{ '--height': `${(item.value / maxRevenue) * 100}%` } as React.CSSProperties}
                  />
                </div>
                <span className="admin-dash__chart-label">{item.month}</span>
                {hoveredBar === idx && (
                  <div className="chart-tooltip">
                    <strong>{item.month} 2026</strong>
                    <span>{formatCurrency(item.value)}</span>
                    {idx > 0 && (
                      <span className={item.value > revenueTrend[idx - 1].value ? 'tooltip-up' : 'tooltip-down'}>
                        {item.value > revenueTrend[idx - 1].value ? '↑' : '↓'}
                        {Math.abs(((item.value - revenueTrend[idx - 1].value) / revenueTrend[idx - 1].value) * 100).toFixed(1)}%
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="revenue-summary">
            <div className="revenue-summary__item">
              <span className="revenue-summary__label">Total (7 months)</span>
              <span className="revenue-summary__value">{formatCurrency(revenueTrend.reduce((s, r) => s + r.value, 0))}</span>
            </div>
            <div className="revenue-summary__item">
              <span className="revenue-summary__label">Average Monthly</span>
              <span className="revenue-summary__value">{formatCurrency(Math.round(revenueTrend.reduce((s, r) => s + r.value, 0) / revenueTrend.length))}</span>
            </div>
            <div className="revenue-summary__item">
              <span className="revenue-summary__label">Peak Month</span>
              <span className="revenue-summary__value">Mar ({formatCurrency(Math.max(...revenueTrend.map(r => r.value)))})</span>
            </div>
          </div>
        </section>

        {/* Active Workflows */}
        <section className="admin-dash__card admin-dash__workflows animate-fadeInUp delay-400" id="active-workflows-section">
          <div className="admin-dash__card-header">
            <div className="admin-dash__card-title">
              <FileText size={18} className="icon--accent" />
              <h2>Active Workflows</h2>
            </div>
            <button className="btn btn--ghost btn--sm" id="view-all-workflows-btn" onClick={() => navigate('/admin/workflows')}>
              See All <ChevronRight size={14} />
            </button>
          </div>
          <div className="admin-dash__workflow-list">
            {workflows.filter(w => w.status !== 'filed').slice(0, 5).map((wf) => (
              <div
                key={wf.id}
                className="admin-dash__workflow-item"
                onClick={() => navigate('/admin/workflows')}
                style={{ cursor: 'pointer' }}
              >
                <div className="admin-dash__workflow-info">
                  <h4>{wf.title}</h4>
                  <p>{wf.client}</p>
                </div>
                <div className="admin-dash__workflow-meta">
                  <span className={`tag ${getStatusColor(wf.status)}`}>
                    {wf.status.replace('-', ' ')}
                  </span>
                  <span className={`tag ${getPriorityColor(wf.priority)}`}>
                    {wf.priority}
                  </span>
                </div>
                <div className="admin-dash__workflow-progress">
                  <div className="admin-dash__progress-bar">
                    <div
                      className="admin-dash__progress-fill"
                      style={{ width: `${wf.progress}%` }}
                    />
                  </div>
                  <span className="admin-dash__progress-text">{wf.progress}%</span>
                </div>
                <span className="admin-dash__workflow-due">{wf.dueDate}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Compliance Calendar */}
        <section className="admin-dash__card admin-dash__compliance animate-fadeInUp delay-500" id="compliance-section">
          <div className="admin-dash__card-header">
            <div className="admin-dash__card-title">
              <Shield size={18} className="icon--accent" />
              <h2>Compliance Calendar</h2>
            </div>
            <button className="btn btn--ghost btn--sm" id="view-compliance-btn" onClick={() => navigate('/admin/compliance')}>
              Full Calendar <ChevronRight size={14} />
            </button>
          </div>
          {/* Filter tabs */}
          <div className="compliance-filters" id="compliance-filters">
            {['all', 'overdue', 'pending', 'upcoming', 'filed'].map(status => (
              <button
                key={status}
                className={`compliance-filter-btn ${complianceFilter === status ? 'compliance-filter-btn--active' : ''}`}
                onClick={() => setComplianceFilter(status)}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                {status !== 'all' && (
                  <span className="compliance-filter-count">
                    {complianceItems.filter(c => c.status === status).length}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="admin-dash__compliance-list">
            {filteredCompliance.length === 0 ? (
              <div className="empty-state">
                <CheckCircle2 size={24} />
                <p>No {complianceFilter} items</p>
              </div>
            ) : (
              filteredCompliance.map((item) => (
                <div
                  key={item.id}
                  className="admin-dash__compliance-item"
                  onClick={() => navigate('/admin/compliance')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="admin-dash__compliance-date">
                    <span className="admin-dash__compliance-day">
                      {item.dueDate.split(' ')[1]?.replace(',', '')}
                    </span>
                    <span className="admin-dash__compliance-month">
                      {item.dueDate.split(' ')[0]}
                    </span>
                  </div>
                  <div className="admin-dash__compliance-info">
                    <h4>{item.title}</h4>
                    <p>{item.client}</p>
                  </div>
                  <span className={`tag ${getComplianceStatusClass(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Client Overview */}
        <section className="admin-dash__card admin-dash__clients animate-fadeInUp delay-300" id="clients-overview-section">
          <div className="admin-dash__card-header">
            <div className="admin-dash__card-title">
              <Users size={18} className="icon--accent" />
              <h2>Client Overview</h2>
            </div>
            <button className="btn btn--ghost btn--sm" id="view-all-clients-btn" onClick={() => navigate('/admin/clients')}>
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="admin-dash__client-list">
            {clients.slice(0, 5).map((client) => (
              <div key={client.id} className="admin-dash__client-item">
                <div className="admin-dash__client-avatar">
                  {client.avatar}
                </div>
                <div className="admin-dash__client-info" onClick={() => navigate('/admin/clients')} style={{ cursor: 'pointer' }}>
                  <h4>{client.name}</h4>
                  <p>{client.industry} • {client.type}</p>
                </div>
                <div className="admin-dash__client-score">
                  <div className="admin-dash__score-ring" style={{
                    '--score': client.complianceScore,
                    '--score-color': client.complianceScore >= 80 ? 'var(--color-success)' : client.complianceScore >= 60 ? 'var(--color-warning)' : 'var(--color-error)',
                  } as React.CSSProperties}>
                    <span>{client.complianceScore}</span>
                  </div>
                </div>
                <div className="client-menu-wrapper">
                  <button
                    className="btn btn--ghost btn--sm"
                    aria-label="More options"
                    onClick={() => setClientMenu(clientMenu === client.id ? null : client.id)}
                  >
                    <MoreHorizontal size={16} />
                  </button>
                  {clientMenu === client.id && (
                    <div className="client-context-menu">
                      <button onClick={() => { navigate('/admin/clients'); setClientMenu(null); }}>
                        <ExternalLink size={14} /> View Profile
                      </button>
                      <button onClick={() => { navigate('/admin/workflows'); setClientMenu(null); }}>
                        <FileText size={14} /> View Tasks
                      </button>
                      <button onClick={() => { navigate('/admin/billing'); setClientMenu(null); }}>
                        <Receipt size={14} /> View Invoices
                      </button>
                      <button onClick={() => { navigate('/admin/documents'); setClientMenu(null); }}>
                        <Download size={14} /> Documents
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Activity / Notifications */}
        <section className="admin-dash__card admin-dash__notifications animate-fadeInUp delay-400" id="notifications-section">
          <div className="admin-dash__card-header">
            <div className="admin-dash__card-title">
              <Bell size={18} className="icon--accent" />
              <h2>Recent Activity</h2>
            </div>
            {activityList.length > 0 && (
              <button className="btn btn--ghost btn--sm" onClick={() => setActivityList(prev => prev.map(n => ({ ...n, read: true })))}>
                <Check size={12} /> Read All
              </button>
            )}
          </div>
          <div className="admin-dash__notif-list">
            {activityList.length === 0 ? (
              <div className="empty-state">
                <CheckCircle2 size={24} />
                <p>All caught up!</p>
              </div>
            ) : (
              activityList.map((notif) => (
                <div
                  key={notif.id}
                  className={`admin-dash__notif-item ${notif.read ? '' : 'admin-dash__notif-item--unread'}`}
                >
                  <div className={`admin-dash__notif-icon admin-dash__notif-icon--${notif.type}`}>
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="admin-dash__notif-content">
                    <h4>{notif.title}</h4>
                    <p>{notif.message}</p>
                    <span className="admin-dash__notif-time">{notif.timestamp}</span>
                  </div>
                  <div className="admin-dash__notif-actions">
                    {!notif.read && (
                      <button
                        className="notif-action-btn"
                        onClick={() => handleMarkActivityRead(notif.id)}
                        title="Mark as read"
                      >
                        <Eye size={14} />
                      </button>
                    )}
                    <button
                      className="notif-action-btn notif-action-btn--dismiss"
                      onClick={() => handleDismissActivity(notif.id)}
                      title="Dismiss"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* ===== AI Insight Detail Modal ===== */}
      {insightModal && (
        <div className="insight-modal-overlay" onClick={() => setInsightModal(null)}>
          <div className="insight-modal" onClick={e => e.stopPropagation()}>
            <div className="insight-modal__header">
              <div className={`insight-modal__type insight-modal__type--${insightModal.type}`}>
                {getInsightIcon(insightModal.type)}
                <span>{insightModal.type === 'error' ? 'Critical Alert' : insightModal.type === 'warning' ? 'Warning' : insightModal.type === 'success' ? 'Automated Action' : 'Advisory'}</span>
              </div>
              <button className="insight-modal__close" onClick={() => setInsightModal(null)}>
                <X size={20} />
              </button>
            </div>

            <h2 className="insight-modal__title">{insightModal.title}</h2>
            <p className="insight-modal__confidence">
              <Sparkles size={14} />
              AI Confidence: {insightModal.confidence}%
              <span className="confidence-bar">
                <span className="confidence-fill" style={{ width: `${insightModal.confidence}%` }} />
              </span>
            </p>

            <div className="insight-modal__section">
              <h3>Analysis Details</h3>
              <p>{insightModal.details}</p>
            </div>

            {insightModal.affectedItems.length > 0 && (
              <div className="insight-modal__section">
                <h3>Affected Items</h3>
                <div className="insight-modal__items-grid">
                  {insightModal.affectedItems.map((item, i) => (
                    <div key={i} className="insight-modal__data-item">
                      <span className="data-item__label">{item.label}</span>
                      <span className="data-item__value">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="insight-modal__section">
              <h3>Recommended Actions</h3>
              <div className="insight-modal__recommendations">
                {insightModal.recommendations.map((rec, i) => (
                  <div key={i} className="recommendation-item">
                    <span className="recommendation-num">{i + 1}</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="insight-modal__actions">
              {insightModal.resolvedAt ? (
                <div className="insight-modal__resolved">
                  <CheckCircle2 size={20} />
                  <span>Resolved at {insightModal.resolvedAt}</span>
                </div>
              ) : (
                <>
                  <button
                    className="btn btn--primary"
                    onClick={() => handleResolveInsight(insightModal.id)}
                    disabled={processingInsight === insightModal.id}
                    id="resolve-insight-btn"
                  >
                    {processingInsight === insightModal.id ? (
                      <><RefreshCw size={16} className="spin" /> Processing...</>
                    ) : (
                      <><Check size={16} /> Mark as Resolved</>
                    )}
                  </button>
                  <button className="btn btn--outline" onClick={() => navigate('/admin/ai-insights')}>
                    <ExternalLink size={16} /> View in AI Insights
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
