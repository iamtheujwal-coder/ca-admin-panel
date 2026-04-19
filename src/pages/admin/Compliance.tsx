import { FileCheck, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { workflows } from '../../data/mockData';

export default function Compliance() {
  const complianceTasks = workflows.filter(w => ['GST', 'TDS', 'ROC', 'Audit'].includes(w.type));

  return (
    <div style={{ padding: 'var(--space-8)' }}>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 className="font-serif" style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>Compliance Calendar</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Track statutory deadlines and filing statuses across all clients.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
        {['GST', 'TDS', 'Income Tax', 'ROC'].map((type, idx) => (
          <div key={idx} style={{ background: 'var(--color-bg-secondary)', padding: '24px', borderRadius: '16px', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
              <FileCheck size={24} color={`hsl(${idx * 40 + 200}, 80%, 65%)`} />
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700 }}>{workflows.filter(w => w.type === type).length || 2} Pending</div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{type} Filings</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--color-bg-secondary)', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Upcoming Deadlines (Next 30 Days)</h2>
        </div>
        <div style={{ padding: '0 24px' }}>
          {complianceTasks.map(task => (
             <div key={task.id} style={{ padding: '20px 0', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: task.priority === 'critical' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: task.priority === 'critical' ? '#ef4444' : '#3b82f6' }}>
                    {task.priority === 'critical' ? <ShieldAlert size={24} /> : <Clock size={24} />}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>{task.title}</h3>
                    <div style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>{task.client}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: task.priority === 'critical' ? 'var(--color-error)' : 'var(--color-text-primary)', marginBottom: '4px' }}>Due: {task.dueDate}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', color: task.status === 'review' ? 'var(--color-warning)' : 'var(--color-text-secondary)', fontSize: '13px', fontWeight: 500 }}>
                    <CheckCircle2 size={14} /> 
                    {task.status === 'todo' ? 'Not Started' : task.status === 'in-progress' ? 'In Progress' : 'In Review'}
                  </div>
                </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}
