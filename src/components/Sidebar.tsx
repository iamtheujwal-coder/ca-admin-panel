import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, KanbanSquare, Receipt, UserCog,
  Brain, Bell, Settings, LogOut, ChevronLeft, ChevronRight,
  FileText, Shield, BarChart3, MessageSquare, FolderOpen,
  CheckCircle2, Sparkles, X
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { notifications as initialNotifications } from '../data/mockData';
import './Sidebar.css';

interface SidebarProps {
  role: 'admin' | 'client';
  onLogout: () => void;
}

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  badge?: number;
}

export default function Sidebar({ role, onLogout }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const adminNav: NavItem[] = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/admin' },
    { icon: <Users size={20} />, label: 'Client CRM', path: '/admin/clients' },
    { icon: <KanbanSquare size={20} />, label: 'Workflows', path: '/admin/workflows', badge: 5 },
    { icon: <Receipt size={20} />, label: 'Billing', path: '/admin/billing' },
    { icon: <UserCog size={20} />, label: 'Team', path: '/admin/team' },
    { icon: <Brain size={20} />, label: 'AI Insights', path: '/admin/ai-insights', badge: 3 },
    { icon: <Shield size={20} />, label: 'Compliance', path: '/admin/compliance', badge: 2 },
    { icon: <FileText size={20} />, label: 'Documents', path: '/admin/documents' },
  ];

  const clientNav: NavItem[] = [
    { icon: <BarChart3 size={20} />, label: 'Dashboard', path: '/client' },
    { icon: <FolderOpen size={20} />, label: 'Document Vault', path: '/client/documents' },
    { icon: <CheckCircle2 size={20} />, label: 'Status Tracker', path: '/client/status' },
    { icon: <FileText size={20} />, label: 'Approvals', path: '/client/approvals', badge: 1 },
    { icon: <MessageSquare size={20} />, label: 'Ask CA', path: '/client/chat' },
    { icon: <Receipt size={20} />, label: 'Invoices', path: '/client/invoices' },
  ];

  const navItems = role === 'admin' ? adminNav : clientNav;

  const isActive = (path: string) => {
    if (path === '/admin' || path === '/client') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
        {/* Header */}
        <div className="sidebar__header">
          <div className="sidebar__brand" onClick={() => navigate(role === 'admin' ? '/admin' : '/client')}>
            <div className="sidebar__logo-mark">
              <span>AT</span>
            </div>
            {!collapsed && (
              <div className="sidebar__brand-text">
                <span className="sidebar__brand-name font-serif">Anand Thakur</span>
                <span className="sidebar__brand-role">{role === 'admin' ? 'Admin Panel' : 'Client Portal'}</span>
              </div>
            )}
          </div>
          <button
            className="sidebar__toggle"
            onClick={() => setCollapsed(!collapsed)}
            id="sidebar-toggle-btn"
            aria-label="Toggle sidebar"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* AI Badge */}
        {role === 'admin' && !collapsed && (
          <div className="sidebar__ai-badge">
            <Sparkles size={14} />
            <span>AI-Powered</span>
          </div>
        )}

        {/* Navigation */}
        <nav className="sidebar__nav">
          <div className="sidebar__nav-group">
            {!collapsed && <span className="sidebar__nav-label">Navigation</span>}
            {navItems.map((item) => (
              <button
                key={item.path}
                className={`sidebar__nav-item ${isActive(item.path) ? 'sidebar__nav-item--active' : ''}`}
                onClick={() => navigate(item.path)}
                title={collapsed ? item.label : undefined}
                id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}-btn`}
              >
                <span className="sidebar__nav-icon">{item.icon}</span>
                {!collapsed && <span className="sidebar__nav-text">{item.label}</span>}
                {item.badge && !collapsed && (
                  <span className="sidebar__nav-badge">{item.badge}</span>
                )}
                {item.badge && collapsed && (
                  <span className="sidebar__nav-dot" />
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* Footer Actions */}
        <div className="sidebar__footer">
          <button
            className={`sidebar__nav-item ${showNotifPanel ? 'sidebar__nav-item--active' : ''}`}
            onClick={() => { setShowNotifPanel(!showNotifPanel); setShowSettingsPanel(false); }}
            title={collapsed ? 'Notifications' : undefined}
            id="sidebar-notifications-btn"
          >
            <span className="sidebar__nav-icon"><Bell size={20} /></span>
            {!collapsed && <span className="sidebar__nav-text">Notifications</span>}
          </button>
          <button
            className={`sidebar__nav-item ${showSettingsPanel ? 'sidebar__nav-item--active' : ''}`}
            onClick={() => { setShowSettingsPanel(!showSettingsPanel); setShowNotifPanel(false); }}
            title={collapsed ? 'Settings' : undefined}
            id="sidebar-settings-btn"
          >
            <span className="sidebar__nav-icon"><Settings size={20} /></span>
            {!collapsed && <span className="sidebar__nav-text">Settings</span>}
          </button>
          
          <div className="sidebar__divider" />
          
          {!collapsed && (
            <div className="sidebar__user-profile">
              <div className="user-avatar">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="user-info">
                <span className="user-name">{user?.email?.split('@')[0]}</span>
                <span className="user-role">{role}</span>
              </div>
            </div>
          )}

          <button className="sidebar__nav-item sidebar__nav-item--logout" onClick={onLogout} title={collapsed ? 'Sign Out' : undefined} id="sidebar-logout-btn">
            <span className="sidebar__nav-icon"><LogOut size={20} /></span>
            {!collapsed && <span className="sidebar__nav-text">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Notification Slide Panel */}
      {showNotifPanel && (
        <div className="sidebar-panel-overlay" onClick={() => setShowNotifPanel(false)}>
          <div className="sidebar-slide-panel" onClick={e => e.stopPropagation()}>
            <div className="sidebar-slide-panel__header">
              <h2>Notifications</h2>
              <button className="sidebar-slide-panel__close" onClick={() => setShowNotifPanel(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="sidebar-slide-panel__content">
              {initialNotifications.map(notif => (
                <div key={notif.id} className={`sidebar-notif-item sidebar-notif-item--${notif.type} ${!notif.read ? 'sidebar-notif-item--unread' : ''}`}>
                  <div className="sidebar-notif-item__title">{notif.title}</div>
                  <div className="sidebar-notif-item__message">{notif.message}</div>
                  <div className="sidebar-notif-item__time">{notif.timestamp}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Settings Slide Panel */}
      {showSettingsPanel && (
        <div className="sidebar-panel-overlay" onClick={() => setShowSettingsPanel(false)}>
          <div className="sidebar-slide-panel" onClick={e => e.stopPropagation()}>
            <div className="sidebar-slide-panel__header">
              <h2>Settings</h2>
              <button className="sidebar-slide-panel__close" onClick={() => setShowSettingsPanel(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="sidebar-slide-panel__content">
              <div className="settings-section">
                <h3>Account</h3>
                <div className="settings-item">
                  <span className="settings-item__label">Email</span>
                  <span className="settings-item__value">{user?.email || 'demo@anand.com'}</span>
                </div>
                <div className="settings-item">
                  <span className="settings-item__label">Role</span>
                  <span className="settings-item__value">{role === 'admin' ? 'Administrator' : 'Client'}</span>
                </div>
              </div>
              <div className="settings-section">
                <h3>Preferences</h3>
                <div className="settings-item settings-item--toggle">
                  <span className="settings-item__label">Email Notifications</span>
                  <label className="toggle">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle__slider" />
                  </label>
                </div>
                <div className="settings-item settings-item--toggle">
                  <span className="settings-item__label">Desktop Alerts</span>
                  <label className="toggle">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle__slider" />
                  </label>
                </div>
                <div className="settings-item settings-item--toggle">
                  <span className="settings-item__label">AI Auto-Categorization</span>
                  <label className="toggle">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle__slider" />
                  </label>
                </div>
                <div className="settings-item settings-item--toggle">
                  <span className="settings-item__label">GST Mismatch Alerts</span>
                  <label className="toggle">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle__slider" />
                  </label>
                </div>
                <div className="settings-item settings-item--toggle">
                  <span className="settings-item__label">Dark Mode</span>
                  <label className="toggle">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle__slider" />
                  </label>
                </div>
              </div>
              <div className="settings-section">
                <h3>Data</h3>
                <div className="settings-item">
                  <span className="settings-item__label">Database</span>
                  <span className="settings-item__value settings-item__value--success">Connected</span>
                </div>
                <div className="settings-item">
                  <span className="settings-item__label">Last Backup</span>
                  <span className="settings-item__value">Today, 3:00 AM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
