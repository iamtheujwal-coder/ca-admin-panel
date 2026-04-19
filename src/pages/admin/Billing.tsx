import { useState } from 'react';
import { Download, Plus, CreditCard, Search, FileText, X } from 'lucide-react';
import { invoices as mockInvoices, formatCurrency } from '../../data/mockData';
import type { Invoice } from '../../data/mockData';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function Billing() {
  const [searchTerm, setSearchTerm] = useState('');
  const [localInvoices, setLocalInvoices] = useState<Invoice[]>(mockInvoices);
  const [showModal, setShowModal] = useState(false);
  
  const [newInvoice, setNewInvoice] = useState({
    client: '',
    amount: '',
    status: 'pending',
    issueDate: '',
    dueDate: '',
    services: ''
  });

  const handleCreate = () => {
    if (!newInvoice.client || !newInvoice.amount) return;
    
    const nextNum = (localInvoices.length + 1).toString().padStart(4, '0');
    
    const inv: Invoice = {
      id: `inv_new_${Date.now()}`,
      invoiceNo: `AT-2026-${nextNum}`,
      client: newInvoice.client,
      amount: parseFloat(newInvoice.amount),
      status: newInvoice.status as any,
      issueDate: newInvoice.issueDate || new Date().toISOString().split('T')[0],
      dueDate: newInvoice.dueDate || new Date().toISOString().split('T')[0],
      services: newInvoice.services.split(',').map(s => s.trim()).filter(Boolean)
    };

    setLocalInvoices([inv, ...localInvoices]);
    setShowModal(false);
    setNewInvoice({ client: '', amount: '', status: 'pending', issueDate: '', dueDate: '', services: '' });
  };

  const handleDownload = (invoice: Invoice) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(40);
    doc.text(`INVOICE`, 14, 22);
    
    doc.setFontSize(14);
    doc.text(`#${invoice.invoiceNo}`, 14, 30);
    
    doc.setFontSize(11);
    doc.setTextColor(80);
    doc.text(`Client: ${invoice.client}`, 14, 40);
    doc.text(`Issue Date: ${invoice.issueDate}`, 14, 46);
    doc.text(`Due Date: ${invoice.dueDate}`, 14, 52);
    doc.text(`Status: ${invoice.status.toUpperCase()}`, 14, 58);
    
    const tableData = invoice.services.length > 0 
      ? invoice.services.map(s => [s, '-']) 
      : [['Consulting Services', '-']];
      
    (doc as any).autoTable({
      startY: 65,
      head: [['Description', 'Amount']],
      body: tableData,
      foot: [['Total', formatCurrency(invoice.amount)]],
      theme: 'grid',
      headStyles: { fillColor: [168, 85, 247] }
    });
    
    doc.save(`${invoice.invoiceNo}.pdf`);
  };

  const filteredInvoices = localInvoices.filter(inv => 
    inv.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: 'var(--space-8)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 className="font-serif" style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>Billing & Invoicing</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>Manage invoices, track payments, and follow up on dues.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-accent-primary)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
        >
          <Plus size={18} /> Create Invoice
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <div style={{ background: 'var(--color-bg-secondary)', padding: '24px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '8px' }}>Total Outstanding</div>
          <div style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'var(--font-serif)' }}>{formatCurrency(850000)}</div>
        </div>
        <div style={{ background: 'var(--color-bg-secondary)', padding: '24px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '8px' }}>Collected This Month</div>
          <div style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--color-success)' }}>{formatCurrency(340000)}</div>
        </div>
        <div style={{ background: 'var(--color-bg-secondary)', padding: '24px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '8px' }}>Overdue Invoices</div>
          <div style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--color-error)' }}>
            {localInvoices.filter(i => i.status === 'overdue').length}
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--color-bg-secondary)', borderRadius: '16px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', flex: 1, alignItems: 'center', background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0 12px' }}>
            <Search size={16} color="var(--color-text-secondary)" />
            <input 
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)} 
              style={{ flex: 1, background: 'transparent', border: 'none', padding: '12px', color: 'var(--color-text-primary)', outline: 'none' }} 
              placeholder="Search invoices by client or number..." 
            />
          </div>
        </div>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--color-border)' }}>
              <th style={{ padding: '16px 24px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Invoice</th>
              <th style={{ padding: '16px 24px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Client</th>
              <th style={{ padding: '16px 24px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Amount</th>
              <th style={{ padding: '16px 24px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Status</th>
              <th style={{ padding: '16px 24px', color: 'var(--color-text-secondary)', fontWeight: 500, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map(invoice => (
              <tr key={invoice.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
                      <FileText size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{invoice.invoiceNo}</div>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Due: {invoice.dueDate}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 24px', color: 'var(--color-text-secondary)' }}>{invoice.client}</td>
                <td style={{ padding: '16px 24px', fontWeight: 600 }}>{formatCurrency(invoice.amount)}</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ 
                    padding: '6px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 600,
                    background: invoice.status === 'paid' ? 'rgba(34, 197, 94, 0.1)' : invoice.status === 'overdue' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                    color: invoice.status === 'paid' ? 'var(--color-success)' : invoice.status === 'overdue' ? 'var(--color-error)' : 'var(--color-warning)'
                  }}>
                    {invoice.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <button 
                    onClick={() => handleDownload(invoice)}
                    style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '8px' }}
                    title="Download Invoice"
                  >
                    <Download size={16} />
                  </button>
                  <button style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '8px' }}><CreditCard size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredInvoices.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            No invoices found.
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--color-bg-primary)', padding: '32px', borderRadius: '16px', width: '500px', border: '1px solid var(--color-border)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 className="font-serif" style={{ fontSize: '24px' }}>Create Invoice</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Client Name</label>
                <input 
                  value={newInvoice.client} onChange={e => setNewInvoice({...newInvoice, client: e.target.value})}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', outline: 'none' }} 
                  placeholder="e.g. Acme Corp" 
                />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Amount (₹)</label>
                  <input 
                    type="number"
                    value={newInvoice.amount} onChange={e => setNewInvoice({...newInvoice, amount: e.target.value})}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', outline: 'none' }} 
                    placeholder="0.00"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Status</label>
                  <select 
                    value={newInvoice.status} onChange={e => setNewInvoice({...newInvoice, status: e.target.value as any})}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', outline: 'none', appearance: 'none' }}
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                 <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Issue Date</label>
                  <input 
                    type="date"
                    value={newInvoice.issueDate} onChange={e => setNewInvoice({...newInvoice, issueDate: e.target.value})}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', outline: 'none', colorScheme: 'dark' }} 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Due Date</label>
                  <input 
                    type="date"
                    value={newInvoice.dueDate} onChange={e => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', outline: 'none', colorScheme: 'dark' }} 
                  />
                </div>
              </div>

               <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Services (comma separated)</label>
                <input 
                  value={newInvoice.services} onChange={e => setNewInvoice({...newInvoice, services: e.target.value})}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', outline: 'none' }} 
                  placeholder="e.g. Audit, Tax Filing" 
                />
              </div>

              <button 
                onClick={handleCreate}
                style={{ width: '100%', padding: '16px', marginTop: '8px', background: 'var(--color-accent-primary)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '16px' }}
              >
                Save Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
