import { useState } from 'react';
import { Upload, FileText, Search, Folder, MoreVertical, Download, X, Trash2 } from 'lucide-react';

export default function Documents() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({ name: '', client: '' });
  
  const [files, setFiles] = useState([
    { id: 1, name: 'Stellar_Infra_Audit_Report_FY25.pdf', client: 'Stellar Infra', size: '2.4 MB', date: 'Apr 12, 2026', type: 'pdf' },
    { id: 2, name: 'TechNova_GST_Returns_Q4.xlsx', client: 'TechNova Solutions', size: '1.1 MB', date: 'Apr 10, 2026', type: 'excel' },
    { id: 3, name: 'CloudNine_Bank_Stmt_Mar26.csv', client: 'CloudNine SaaS', size: '542 KB', date: 'Apr 08, 2026', type: 'csv' },
    { id: 4, name: 'GreenLeaf_Incorporation_Cert.pdf', client: 'GreenLeaf Organics', size: '3.8 MB', date: 'Mar 25, 2026', type: 'pdf' },
    { id: 5, name: 'MedLife_TDS_Challans.zip', client: 'MedLife Healthcare', size: '12.5 MB', date: 'Mar 20, 2026', type: 'zip' },
  ]);

  const [activeMenu, setActiveMenu] = useState<number | null>(null);

  const handleUpload = () => {
    if (!uploadData.name) return;
    const newFile = {
      id: Date.now(),
      name: uploadData.name,
      client: uploadData.client || 'General',
      size: `${Math.floor(Math.random() * 10) + 1}.${Math.floor(Math.random() * 9)} MB`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      type: uploadData.name.split('.').pop()?.toLowerCase() || 'unknown'
    };
    setFiles([newFile, ...files]);
    setShowUploadModal(false);
    setUploadData({ name: '', client: '' });
  };

  const deleteFile = (id: number) => {
    setFiles(files.filter(f => f.id !== id));
    setActiveMenu(null);
  };

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: 'var(--space-8)' }} onClick={() => setActiveMenu(null)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 className="font-serif" style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>Document Vault</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>Secure storage and exchange for all client financial documents.</p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', border: '1px dashed var(--color-border)', color: 'var(--color-text-primary)', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          <Upload size={18} /> Upload Files
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {['Audits', 'Tax Returns', 'Bank Statements', 'Corporate Records'].map(folder => (
          <div key={folder} style={{ flex: 1, background: 'var(--color-bg-secondary)', padding: '20px', borderRadius: '12px', border: '1px solid var(--color-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Folder size={24} color="var(--color-accent-primary)" />
            <span style={{ fontWeight: 500 }}>{folder}</span>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--color-bg-secondary)', borderRadius: '16px', border: '1px solid var(--color-border)', overflow: 'visible' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', flex: 1, alignItems: 'center', background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0 12px' }}>
            <Search size={16} color="var(--color-text-secondary)" />
            <input 
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)} 
              style={{ flex: 1, background: 'transparent', border: 'none', padding: '12px', color: 'var(--color-text-primary)', outline: 'none' }} 
              placeholder="Search documents by name or client..." 
            />
          </div>
        </div>
        <div style={{ overflowX: 'auto', paddingBottom: '40px' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '16px 24px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>File Name</th>
                <th style={{ padding: '16px 24px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Client</th>
                <th style={{ padding: '16px 24px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Size</th>
                <th style={{ padding: '16px 24px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Uploaded</th>
                <th style={{ padding: '16px 24px', color: 'var(--color-text-secondary)', fontWeight: 500, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((file) => (
                <tr key={file.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <FileText size={20} color={file.type === 'pdf' ? '#ef4444' : file.type === 'excel' ? '#10b981' : 'var(--color-text-secondary)'} />
                      <span style={{ fontWeight: 500 }}>{file.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', color: 'var(--color-text-secondary)' }}>{file.client}</td>
                  <td style={{ padding: '16px 24px', color: 'var(--color-text-secondary)' }}>{file.size}</td>
                  <td style={{ padding: '16px 24px', color: 'var(--color-text-secondary)' }}>{file.date}</td>
                  <td style={{ padding: '16px 24px', textAlign: 'right', position: 'relative' }}>
                    <button style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', cursor: 'pointer', padding: '8px' }} title="Download"><Download size={16} /></button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === file.id ? null : file.id); }}
                      style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '8px' }}
                    >
                      <MoreVertical size={16} />
                    </button>
                    
                    {activeMenu === file.id && (
                      <div style={{ position: 'absolute', right: '30px', top: '40px', background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', borderRadius: '8px', zIndex: 10, padding: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                        <button 
                          onClick={() => deleteFile(file.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', width: '100%', textAlign: 'left', borderRadius: '4px' }}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredFiles.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              No documents found.
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowUploadModal(false)}>
          <div style={{ background: 'var(--color-bg-primary)', padding: '32px', borderRadius: '16px', width: '400px', border: '1px solid var(--color-border)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 className="font-serif" style={{ fontSize: '20px' }}>Upload Document</h2>
              <button onClick={() => setShowUploadModal(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>File Name (with extension)</label>
                <input 
                  value={uploadData.name} onChange={e => setUploadData({...uploadData, name: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} 
                  placeholder="e.g. Audit_Report.pdf" 
                />
              </div>

               <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>Client (Optional)</label>
                <input 
                  value={uploadData.client} onChange={e => setUploadData({...uploadData, client: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} 
                  placeholder="e.g. Stellar Infra" 
                />
              </div>

              <div style={{ border: '2px dashed var(--color-border)', borderRadius: '8px', padding: '32px', textAlign: 'center', color: 'var(--color-text-secondary)', cursor: 'pointer', marginTop: '8px' }}>
                <Upload size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
                <div>Click or drag file to simulate upload</div>
              </div>

              <button 
                onClick={handleUpload}
                style={{ width: '100%', padding: '14px', marginTop: '8px', background: 'var(--color-accent-primary)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                Upload File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
