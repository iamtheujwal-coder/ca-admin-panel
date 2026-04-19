import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SplashScreen from './components/SplashScreen';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import ErrorBoundary from './components/ErrorBoundary';
import AdminDashboard from './pages/admin/AdminDashboard';
import ClientCrm from './pages/admin/ClientCrm';
import ClientDashboard from './pages/client/ClientDashboard';
import Workflows from './pages/admin/Workflows';
import Billing from './pages/admin/Billing';
import Team from './pages/admin/Team';
import AiInsights from './pages/admin/AiInsights';
import Compliance from './pages/admin/Compliance';
import Documents from './pages/admin/Documents';
import DocumentVault from './pages/client/DocumentVault';
import StatusTracker from './pages/client/StatusTracker';
import AskAssistant from './pages/client/AskAssistant';
import { useAuthStore } from './store/authStore';
import './App.css';

function AppLayout({ role, onLogout }: { role: 'admin' | 'client'; onLogout: () => void }) {
  return (
    <div className="app-layout">
      <Sidebar role={role} onLogout={onLogout} />
      <main className="app-main">
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/clients" element={<ClientCrm />} />
          <Route path="/admin/workflows" element={<Workflows />} />
          <Route path="/admin/billing" element={<Billing />} />
          <Route path="/admin/team" element={<Team />} />
          <Route path="/admin/ai-insights" element={<AiInsights />} />
          <Route path="/admin/compliance" element={<Compliance />} />
          <Route path="/admin/documents" element={<Documents />} />

          {/* Client Routes */}
          <Route path="/client" element={<ClientDashboard />} />
          <Route path="/client/documents" element={<DocumentVault />} />
          <Route path="/client/status" element={<StatusTracker />} />
          <Route path="/client/approvals" element={<Workflows />} />
          <Route path="/client/chat" element={<AskAssistant />} />
          <Route path="/client/invoices" element={<Billing />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to={role === 'admin' ? '/admin' : '/client'} replace />} />
        </Routes>
      </main>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [appState, setAppState] = useState<'splash' | 'ready'>('splash');

  if (appState === 'splash') {
    return <SplashScreen onComplete={() => setAppState('ready')} />;
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => {}} />;
  }

  const role = (user?.role?.toLowerCase() || 'admin') as 'admin' | 'client';

  return <AppLayout role={role} onLogout={logout} />;
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;

