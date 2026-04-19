import { useState } from 'react';
import type { ReactNode } from 'react';
import { Brain, Sparkles, TrendingUp, AlertTriangle, ShieldCheck, Zap, ArrowUpRight, BarChart3, LineChart, X, Check } from 'lucide-react';
import './AiInsights.css';

interface Insight {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'critical' | 'medium';
  icon: ReactNode;
  actionText: string;
}

const initialInsights: Insight[] = [
  {
    id: '1',
    title: 'Tax Optimization Opportunity',
    description: 'Based on Q3 expenses for Stellar Infra, a potential ₹4.2L saving identified under Section 80JJAA.',
    severity: 'high',
    icon: <Zap size={20} />,
    actionText: 'Generate Report'
  },
  {
    id: '2',
    title: 'Compliance Risk Alert',
    description: 'Recent regulatory changes in GST specifically affect TechNova Solutions. Impact evaluation recommended.',
    severity: 'critical',
    icon: <AlertTriangle size={20} />,
    actionText: 'Analyze Impact'
  },
  {
    id: '3',
    title: 'Revenue Growth Signal',
    description: 'CloudNine SaaS shows a 28% month-over-month revenue growth. Ideal candidate for revised tax planning.',
    severity: 'medium',
    icon: <TrendingUp size={20} />,
    actionText: 'View Projection'
  }
];

export default function AiInsights() {
  const [insights, setInsights] = useState<Insight[]>(initialInsights);
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);

  const handleActionClick = (insight: Insight) => {
    setSelectedInsight(insight);
  };

  const handleDismiss = (id: string) => {
    setInsights(insights.filter(i => i.id !== id));
    setSelectedInsight(null);
  };

  return (
    <div className="ai-insights">
      <div className="ai-insights__header animate-fadeInDown">
        <div className="ai-insights__header-content">
          <div className="ai-badge">
            <Sparkles size={14} />
            <span>AI ENGINE ACTIVE</span>
          </div>
          <h1 className="font-serif">Intelligence Oracle</h1>
          <p>Predictive analysis and automated strategic insights for your practice.</p>
        </div>
        <div className="ai-insights__stats">
          <div className="insight-stat">
            <span className="insight-stat__label">Efficiency Gain</span>
            <span className="insight-stat__value">+32%</span>
          </div>
          <div className="insight-stat">
            <span className="insight-stat__label">Risk Shield</span>
            <span className="insight-stat__value">99.8%</span>
          </div>
        </div>
      </div>

      <div className="ai-insights__grid">
        <div className="ai-insights__main animate-fadeInLeft">
          <div className="glass-card ai-insights__overview">
            <div className="card-header">
              <LineChart size={20} color="var(--color-accent-primary)" />
              <h2>Practice Pulse</h2>
            </div>
            <div className="pulse-viz">
              <div className="pulse-circles">
                <div className="circle circle-1"></div>
                <div className="circle circle-2"></div>
                <div className="circle circle-3"></div>
                <Brain size={48} className="brain-icon" />
              </div>
              <div className="pulse-text">
                <h3>System Status: Optimized</h3>
                <p>Scanning 42 active client portals for growth patterns and anomalies.</p>
              </div>
            </div>
          </div>

          <div className="ai-insights__list">
            <h3 className="section-label">Critical Insights ({insights.length})</h3>
            {insights.map((insight) => (
              <div key={insight.id} className={`insight-card ${insight.severity}`}>
                <div className="insight-card__icon">{insight.icon}</div>
                <div className="insight-card__body">
                  <h4>{insight.title}</h4>
                  <p>{insight.description}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                   <button className="insight-card__btn" onClick={() => handleActionClick(insight)}>
                    {insight.actionText}
                    <ArrowUpRight size={14} />
                  </button>
                  <button 
                    onClick={() => handleDismiss(insight.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '12px', cursor: 'pointer', textAlign: 'right' }}>
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
            {insights.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)', background: 'var(--color-bg-secondary)', borderRadius: '12px', border: '1px dashed var(--color-border)' }}>
                <Check size={40} style={{ margin: '0 auto 16px', color: 'var(--color-success)', opacity: 0.8 }} />
                <h3>All Caught Up</h3>
                <p>No pending insights at the moment. Your practice is fully optimized.</p>
              </div>
            )}
          </div>
        </div>

        <div className="ai-insights__side animate-fadeInRight">
          <div className="glass-card ai-insights__forecast">
            <div className="card-header">
              <BarChart3 size={20} color="var(--color-accent-primary)" />
              <h2>Revenue Forecast</h2>
            </div>
            <div className="forecast-chart">
               {/* Mock chart bars */}
               {[60, 45, 80, 55, 90, 75].map((h, i) => (
                 <div key={i} className="forecast-bar" style={{ '--height': `${h}%` } as any}>
                   <div className="bar-glow"></div>
                 </div>
               ))}
            </div>
            <div className="forecast-legend">
              <span>JAN</span><span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span><span>JUN</span>
            </div>
          </div>

          <div className="glass-card ai-insights__compliance">
            <div className="card-header">
              <ShieldCheck size={20} color="var(--color-success)" />
              <h2>Security & Compliance</h2>
            </div>
            <ul className="compliance-checklist">
              <li><div className="dot active"></div> Data Encryption: RSA-4096</li>
              <li><div className="dot active"></div> Privacy Shield: Active</li>
              <li><div className="dot"></div> ISO 27001 Audit: Upcoming</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Insight Action Modal */}
      {selectedInsight && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setSelectedInsight(null)}>
          <div style={{ background: 'var(--color-bg-primary)', width: '500px', borderRadius: '16px', border: `1px solid var(--color-border)`, padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ padding: '12px', background: selectedInsight.severity === 'high' ? 'rgba(234, 179, 8, 0.1)' : selectedInsight.severity === 'critical' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(96, 165, 250, 0.1)', color: selectedInsight.severity === 'high' ? 'var(--color-warning)' : selectedInsight.severity === 'critical' ? 'var(--color-error)' : 'var(--color-info)', borderRadius: '12px' }}>
                    {selectedInsight.icon}
                  </div>
                  <h2 style={{ fontSize: '20px', fontWeight: 600, fontFamily: 'var(--font-serif)' }}>{selectedInsight.title}</h2>
                </div>
                <button onClick={() => setSelectedInsight(null)} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
             </div>

             <div style={{ background: 'var(--color-bg-secondary)', padding: '20px', borderRadius: '8px', border: '1px solid var(--color-border)', marginBottom: '24px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
               {selectedInsight.description}
             </div>

             <div style={{ display: 'flex', gap: '16px' }}>
                <button 
                  onClick={() => handleDismiss(selectedInsight.id)}
                  style={{ flex: 1, padding: '14px', background: 'var(--color-accent-primary)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Check size={18} /> Confirm Action
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
