import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/authContext';
import { useRouter } from '../../lib/router';
import './AdminLogin.css';

export default function AdminLogin() {
  const { user, isAdmin, adminCheckDone, isLoading: authLoading, signIn, signOut } = useAuth();
  const { navigate } = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [nonAdminWarning, setNonAdminWarning] = useState(false);

  useEffect(() => {
    if (!authLoading && adminCheckDone && user) {
      if (isAdmin) {
        navigate('/admin');
      } else {
        setNonAdminWarning(true);
      }
    }
  }, [user, isAdmin, adminCheckDone, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setErrorMessage('');
    setNonAdminWarning(false);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await signIn(email.trim(), password);
      if (error) {
        setErrorMessage(error.message || 'Invalid email or password.');
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'An unexpected error occurred during login.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOutAndReset = async () => {
    await signOut();
    setNonAdminWarning(false);
    setErrorMessage('');
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        {/* Brand Header */}
        <div className="admin-login-header">
          <div className="admin-login-logo">
            <span className="admin-login-logo__icon">🎂</span>
            <span className="admin-login-logo__name">Eggless Baker</span>
          </div>
          <span className="admin-login-badge">Admin Portal</span>
          <h1 className="admin-login-title">Bakery Management</h1>
          <p className="admin-login-subtitle">
            Sign in to manage enquiries, update cake portfolio, and edit business settings.
          </p>
        </div>

        {/* Warning if user is authenticated but not in admin_users */}
        {nonAdminWarning && (
          <div className="admin-login-alert admin-login-alert--warning" role="alert">
            <div className="admin-login-alert__title">⚠️ Unauthorized Account</div>
            <p className="admin-login-alert__text">
              You are signed in as <strong>{user?.email}</strong>, but this account is not registered in the <code>admin_users</code> table.
            </p>
            <p className="admin-login-alert__subtext">
              Please execute the SQL to add this user ID (<code>{user?.id}</code>) to <code>admin_users</code> or sign out.
            </p>
            <button
              type="button"
              className="btn btn-outline admin-login-btn--sm"
              onClick={handleSignOutAndReset}
            >
              Sign Out & Switch Account
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="admin-login-alert admin-login-alert--error" role="alert">
            <span>✕ {errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="admin-login-form" noValidate>
          <div className="form-group">
            <label htmlFor="admin-email" className="form-label">
              Admin Email
            </label>
            <input
              id="admin-email"
              type="email"
              className="form-input"
              placeholder="admin@egglessbaker.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="admin-password" className="form-label">
              Password
            </label>
            <div className="admin-password-input-wrapper">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={submitting}
              />
              <button
                type="button"
                className="admin-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? '👁️' : '🙈'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary admin-login-submit"
            disabled={submitting || authLoading}
          >
            {submitting ? (
              <span className="admin-btn-spinner-wrap">
                <span className="admin-spinner" />
                Signing In...
              </span>
            ) : (
              'Sign In to Dashboard'
            )}
          </button>
        </form>

        {/* Back Link */}
        <div className="admin-login-footer">
          <button
            type="button"
            className="admin-login-back-btn"
            onClick={() => navigate('/')}
          >
            ← Back to Public Website
          </button>
        </div>
      </div>
    </div>
  );
}
