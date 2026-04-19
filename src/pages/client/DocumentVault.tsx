import { Folder, FileText, Download, Search, Upload, MoreVertical } from 'lucide-react';

export default function DocumentVault() {
  const categories = [
    { name: 'Tax Returns', count: 12, color: '#ef4444' },
    { name: 'Audit Reports', count: 4, color: '#3b82f6' },
    { name: 'Registration Docs', count: 8, color: '#10b981' },
    { name: 'Invoices', count: 45, color: '#f59e0b' },
  ];

  const recentFiles = [
    { name: 'GSTR-3B_Mar_2026.pdf', date: 'Apr 12, 2026', size: '1.2 MB' },
    { name: 'Balance_Sheet_Draft.xlsx', date: 'Apr 08, 2026', size: '2.4 MB' },
    { name: 'Certificate_of_Inc.pdf', date: 'Mar 15, 2026', size: '4.2 MB' },
  ];

  return (
    <div className="doc-vault">
      <div className="doc-vault__header">
        <div>
          <h1 className="font-serif">Document Vault</h1>
          <p>Secure repository for all your compliance and financial records.</p>
        </div>
        <button className="btn btn--primary">
          <Upload size={18} /> Upload New Document
        </button>
      </div>

      <div className="doc-vault__grid">
        {categories.map((cat, idx) => (
          <div key={idx} className="folder-card animate-fadeIn">
            <div className="folder-card__icon" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
              <Folder size={32} />
            </div>
            <div className="folder-card__info">
              <h3>{cat.name}</h3>
              <span>{cat.count} Files</span>
            </div>
            <button className="btn-icon"><MoreVertical size={18} /></button>
          </div>
        ))}
      </div>

      <div className="doc-vault__section">
        <div className="section-header">
          <h2>Recent Documents</h2>
          <div className="search-bar">
            <Search size={16} />
            <input type="text" placeholder="Search records..." />
          </div>
        </div>

        <div className="file-list glass-card">
          <div className="file-list__header">
            <span>Name</span>
            <span>Date Modified</span>
            <span>Size</span>
            <span style={{ textAlign: 'right' }}>Action</span>
          </div>
          {recentFiles.map((file, idx) => (
            <div key={idx} className="file-row">
              <div className="file-info">
                <FileText size={20} color="var(--color-accent-primary)" />
                <span>{file.name}</span>
              </div>
              <div className="file-date">{file.date}</div>
              <div className="file-size">{file.size}</div>
              <div className="file-actions">
                <button className="btn-icon"><Download size={18} /></button>
                <button className="btn-icon"><MoreVertical size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
