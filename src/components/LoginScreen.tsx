import { useState } from 'react';
import { Eye, EyeOff, Shield, ArrowRight, Fingerprint } from 'lucide-react';
import './LoginScreen.css';

interface LoginScreenProps {
  onLogin: (role: 'admin' | 'client') => void;
}

import { useAuthStore } from '../store/authStore';

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'client'>('admin');
  
  const { login, isLoading, error, clearError } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password, selectedRole);
    if (success) {
      onLogin(selectedRole);
    }
  };

  return (
    <div className="login">
      {/* Ambient background */}
      <div className="login__bg">
        <div className="login__orb login__orb--1" />
        <div className="login__orb login__orb--2" />
        <div className="login__orb login__orb--3" />
        <div className="login__grid" />
      </div>

      <div className="login__container animate-scaleIn">
        {/* Branding Header */}
        <div className="login__header">
          <div className="login__logo">
            <div className="login__logo-mark">
              <span>AT</span>
            </div>
          </div>
          <h1 className="login__title font-serif">ANAND THAKUR</h1>
          <p className="login__subtitle">Practice Management Portal</p>
        </div>

        {/* Role Selector */}
        <div className="login__role-selector">
          <button
            type="button"
            className={`login__role-btn ${selectedRole === 'admin' ? 'login__role-btn--active' : ''}`}
            onClick={() => { setSelectedRole('admin'); clearError(); }}
            id="role-admin-btn"
          >
            <Shield size={16} />
            Admin
          </button>
          <button
            type="button"
            className={`login__role-btn ${selectedRole === 'client' ? 'login__role-btn--active' : ''}`}
            onClick={() => { setSelectedRole('client'); clearError(); }}
            id="role-client-btn"
          >
            <Fingerprint size={16} />
            Client Portal
          </button>
        </div>

        {error && <div className="login__error" style={{ color: 'var(--color-error)', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}

        {/* Login Form */}
        <form className="login__form" onSubmit={handleLogin}>
          <div className="login__field">
            <label className="login__label" htmlFor="email-input">Email Address</label>
            <input
              id="email-input"
              type="email"
              className="login__input"
              placeholder={selectedRole === 'admin' ? 'ca.anand@thakur.com' : 'client@company.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="login__field">
            <label className="login__label" htmlFor="password-input">Password</label>
            <div className="login__input-wrapper">
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                className="login__input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login__toggle-pw"
                onClick={() => setShowPassword(!showPassword)}
                id="toggle-password-btn"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="login__options">
            <label className="login__remember">
              <input type="checkbox" id="remember-checkbox" />
              <span>Remember me</span>
            </label>
            <a href="#" className="login__forgot" id="forgot-password-link">Forgot password?</a>
          </div>

          <button
            type="submit"
            className={`login__submit ${isLoading ? 'login__submit--loading' : ''}`}
            id="login-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="login__spinner" />
            ) : (
              <>
                Sign In
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="login__footer">
          <p>Secured with 256-bit encryption</p>
          <div className="login__footer-dots">
            <span /><span /><span />
          </div>
        </div>
      </div>
    </div>
  );
}
