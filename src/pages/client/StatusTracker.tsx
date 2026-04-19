import { CheckCircle2, Circle, Clock, AlertCircle, ArrowRight } from 'lucide-react';

export default function StatusTracker() {
  const filings = [
    {
      id: 'f1',
      title: 'Income Tax Return (ITR-1)',
      period: 'FY 2024-25',
      status: 'In Progress',
      progress: 65,
      steps: [
        { label: 'Data Collection', status: 'completed' },
        { label: 'Tax Calculation', status: 'completed' },
        { label: 'Review with Client', status: 'active' },
        { label: 'Final Filing', status: 'pending' },
      ]
    },
    {
      id: 'f2',
      title: 'GST Monthly Return (GSTR-3B)',
      period: 'March 2026',
      status: 'Awaiting Documents',
      progress: 25,
      steps: [
        { label: 'Ledger Audit', status: 'completed' },
        { label: 'Purchase Recon', status: 'active' },
        { label: 'Tax Liability computation', status: 'pending' },
        { label: 'Filing', status: 'pending' },
      ]
    }
  ];

  return (
    <div className="status-tracker">
      <div className="status-tracker__header">
        <h1 className="font-serif">Filing Progress</h1>
        <p>Real-time tracking of all your ongoing statutory compliances.</p>
      </div>

      <div className="status-tracker__list">
        {filings.map((filing) => (
          <div key={filing.id} className="status-card glass-card animate-fadeInUp">
            <div className="status-card__header">
              <div className="status-card__title">
                <h3>{filing.title}</h3>
                <span className="badge badge--dark">{filing.period}</span>
              </div>
              <div className="status-card__meta">
                <span className={`status-text ${filing.status.toLowerCase().replace(/\s+/g, '-')}`}>
                  {filing.status}
                </span>
                <div className="progress-mini">
                  <div className="progress-mini__bar" style={{ width: `${filing.progress}%` }}></div>
                </div>
              </div>
            </div>

            <div className="status-card__steps">
              {filing.steps.map((step, idx) => (
                <div key={idx} className={`step ${step.status}`}>
                  <div className="step__indicator">
                    {step.status === 'completed' ? <CheckCircle2 size={18} /> : 
                     step.status === 'active' ? <Clock size={18} /> : 
                     <Circle size={18} />}
                    {idx < filing.steps.length - 1 && <div className="step__line"></div>}
                  </div>
                  <div className="step__label">{step.label}</div>
                </div>
              ))}
            </div>

            <div className="status-card__footer">
              <div className="alert-box">
                <AlertCircle size={14} />
                <span>Need 2 missing bank statements for further processing.</span>
              </div>
              <button className="btn btn--primary">
                Resolve Issues <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
