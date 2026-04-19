import { useState, useEffect } from 'react';
import { Download, Plus, CreditCard, Search, FileText, X } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { API_URL } from '../../config';
import { formatCurrency } from '../../data/mockData';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export interface Invoice {
  id: string;
  invoiceNo: string;
  client: string;
  clientId: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  issueDate: string;
  dueDate: string;
  services: string[];
}

export default function Billing() {
  const { token } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [localInvoices, setLocalInvoices] = useState<Invoice[]>([]);
  const [liveClients, setLiveClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [newInvoice, setNewInvoice] = useState({
    client: '',
    amount: '',
    status: 'pending',
    issueDate: '',
    dueDate: '',
    services: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [invoicesRes, clientsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/invoices`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/admin/clients`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setLocalInvoices(invoicesRes.data);
      setLiveClients(clientsRes.data);
    } catch (err) {
      console.error('Failed to fetch billing data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newInvoice.client || !newInvoice.amount) return;
    
    // Fallback invoiceNo if backend doesn't handle sequence
    const nextNum = (localInvoices.length + 1).toString().padStart(4, '0');
    const invoiceNo = `AT-2026-${nextNum}`;
    
    try {
      const selectedClient = liveClients.find(c => c.id === newInvoice.client);
      const res = await axios.post(`${API_URL}/admin/invoices`, {
        invoiceNo,
        clientId: newInvoice.client,
        amount: newInvoice.amount,
        status: newInvoice.status,
        issueDate: newInvoice.issueDate || new Date().toISOString().split('T')[0],
        dueDate: newInvoice.dueDate || new Date().toISOString().split('T')[0],
        services: newInvoice.services.split(',').map(s => s.trim()).filter(Boolean)
      }, { headers: { Authorization: `Bearer ${token}` } });

      const inv: Invoice = {
        id: res.data.id,
        invoiceNo: res.data.invoiceNo,
        client: selectedClient?.clientProfile?.companyName || selectedClient?.email || 'Unknown',
        clientId: res.data.clientId,
        amount: res.data.amount,
        status: res.data.status,
        issueDate: new Date(res.data.issueDate).toISOString().split('T')[0],
        dueDate: new Date(res.data.dueDate).toISOString().split('T')[0],
        services: JSON.parse(res.data.services || '[]')
      };

      setLocalInvoices([inv, ...localInvoices]);
      setShowModal(false);
      setNewInvoice({ client: '', amount: '', status: 'pending', issueDate: '', dueDate: '', services: '' });
    } catch (err) {
      console.error('Failed to create invoice', err);
      alert('Error creating invoice');
    }
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
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading invoices...</div>
        ) : (
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
        )}
        {!isLoading && filteredInvoices.length === 0 && (
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
                <select 
                  value={newInvoice.client} onChange={e => setNewInvoice({...newInvoice, client: e.target.value})}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', outline: 'none' }} 
                >
                  <option value="">Select a client</option>
                  {liveClients.map(c => <option key={c.id} value={c.id}>{c.clientProfile?.companyName || c.email}</option>)}
                </select>
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
