import { useState } from 'react';
import { UserPlus, Shield, Mail, Phone, Lock, Loader2, Trash2 } from 'lucide-react';
import { teamMembers as initialMembers } from '../../data/mockData';

export default function Team() {
  const [members, setMembers] = useState(initialMembers.map(m => ({...m})));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: ''
  });

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const newMember = {
        id: `t${Date.now()}`,
        name: formData.name,
        role: formData.role || 'Staff',
        email: formData.email,
        status: 'online' as const,
        avatar: formData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'M',
        activeTasks: 0,
        completedTasks: 0
      };
      setMembers([...members, newMember]);
      setIsModalOpen(false);
      setIsSubmitting(false);
      setFormData({ name: '', role: '', email: '' });
    }, 600);
  };

  const handleRemoveMember = (id: string) => {
    if (window.confirm("Are you sure you want to remove this team member?")) {
      setMembers(members.filter(m => m.id !== id));
    }
  };

  return (
    <div style={{ padding: 'var(--space-8)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 className="font-serif" style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>Team Management</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>Manage staff accounts, assign roles, and track task allocation.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-accent-primary)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
          <UserPlus size={18} /> Invite Member
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {members.map(member => (
          <div key={member.id} style={{ background: 'var(--color-bg-secondary)', borderRadius: '16px', border: '1px solid var(--color-border)', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                 <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-accent-primary), var(--color-info))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px', fontWeight: 700, position: 'relative' }}>
                   {member.avatar}
                   <div style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', borderRadius: '50%', background: member.status === 'online' ? 'var(--color-success)' : member.status === 'busy' ? 'var(--color-error)' : 'var(--color-text-secondary)', border: '2px solid var(--color-bg-secondary)' }} />
                 </div>
                 <div>
                   <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>{member.name}</h3>
                   <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                     <Shield size={12} /> {member.role}
                   </span>
                 </div>
               </div>
               <button onClick={() => handleRemoveMember(member.id)} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                  <Trash2 size={16} />
               </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-accent-primary-light)' }}>{member.activeTasks}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Active Tasks</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-success)' }}>{member.completedTasks}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Completed</div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
              <button style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
                <Lock size={14} /> Permissions
              </button>
              <div style={{ display: 'flex', gap: '12px' }}>
                <a href={`mailto:${member.email}`} style={{ color: 'var(--color-text-primary)' }}><Mail size={16} /></a>
                <button style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', cursor: 'pointer' }}><Phone size={16} /></button>
              </div>
            </div>
          </div>
        ))}
        {members.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)', gridColumn: '1 / -1' }}>No team members found.</div>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--color-bg-primary)', width: '400px', borderRadius: '16px', border: `1px solid var(--color-border)`, padding: '32px' }}>
             <h2 className="font-serif" style={{ fontSize: '20px', marginBottom: '20px' }}>Invite Team Member</h2>
             <form onSubmit={handleAddMember}>
               <div style={{ marginBottom: '16px' }}>
                 <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: 'var(--color-text-secondary)' }}>Full Name</label>
                 <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '10px 12px', color: 'var(--color-text-primary)' }} placeholder="John Doe" />
               </div>
               <div style={{ marginBottom: '16px' }}>
                 <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: 'var(--color-text-secondary)' }}>Email Address</label>
                 <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '10px 12px', color: 'var(--color-text-primary)' }} placeholder="john@anand.com" />
               </div>
               <div style={{ marginBottom: '24px' }}>
                 <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: 'var(--color-text-secondary)' }}>Role</label>
                 <select required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{ width: '100%', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '10px 12px', color: 'var(--color-text-primary)' }}>
                    <option value="">Select a role</option>
                    <option value="Senior Auditor">Senior Auditor</option>
                    <option value="Tax Consultant">Tax Consultant</option>
                    <option value="Junior Accountant">Junior Accountant</option>
                    <option value="Admin">Admin</option>
                 </select>
               </div>
               <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" disabled={isSubmitting} style={{ flex: 1, padding: '10px', background: 'var(--color-accent-primary)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Send Invite'}
                  </button>
               </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}

