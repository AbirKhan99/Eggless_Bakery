import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/authContext';
import { useRouter } from '../../lib/router';
import AdminSidebar, { type AdminTab } from './AdminSidebar';
import AdminHeader from './AdminHeader';
import AdminOverview from './AdminOverview';
import AdminEnquiries from './AdminEnquiries';
import AdminCakes from './AdminCakes';
import AdminSettings from './AdminSettings';
import { ToastProvider } from './Toast';
import type { Enquiry } from '../../lib/supabase';
import './AdminDashboard.css';

export default function AdminLayout() {
  const { user, isAdmin, adminCheckDone, isLoading: authLoading, signOut } = useAuth();
  const { navigate } = useRouter();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);

  // Authentication & Authorization Guard
  useEffect(() => {
    if (!authLoading && adminCheckDone && !user) {
      navigate('/admin/login', true);
    }
  }, [user, authLoading, adminCheckDone, navigate]);

  // Loading state during auth check
  if (authLoading || !adminCheckDone) {
    return (
      <div className="admin-loading-screen">
        <div className="admin-loading-spinner-wrap">
          <div className="admin-spinner admin-spinner--lg" />
          <p className="admin-loading-text">Verifying Admin Permissions...</p>
        </div>
      </div>
    );
  }

  // Not signed in -> redirecting
  if (!user) {
    return (
      <div className="admin-loading-screen">
        <div className="admin-loading-spinner-wrap">
          <div className="admin-spinner admin-spinner--lg" />
          <p className="admin-loading-text">Redirecting to Admin Login...</p>
        </div>
      </div>
    );
  }

  // Authenticated but unauthorized (not in admin_users)
  if (!isAdmin) {
    return (
      <div className="admin-unauthorized-page">
        <div className="admin-unauthorized-card">
          <div className="admin-unauthorized-icon">🚫</div>
          <h2 className="admin-unauthorized-title">Admin Access Required</h2>
          <p className="admin-unauthorized-desc">
            You are signed in with <strong>{user.email}</strong>, but this account is not authorized as an administrator.
          </p>
          <div className="admin-unauthorized-help">
            <p className="admin-unauthorized-help-title">Required Setup Step:</p>
            <p>
              To grant access, execute the following SQL command in your Supabase SQL Editor:
            </p>
            <pre className="admin-unauthorized-sql">
{`INSERT INTO public.admin_users (user_id, email)
VALUES ('${user.id}', '${user.email || ''}')
ON CONFLICT (user_id) DO NOTHING;`}
            </pre>
          </div>
          <div className="admin-unauthorized-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={async () => {
                await signOut();
                navigate('/admin/login', true);
              }}
            >
              Sign Out & Switch Account
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Check Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="admin-root">
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="admin-main-container">
          <AdminHeader
            activeTab={activeTab}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />

          <main className="admin-content-body">
            {activeTab === 'overview' && (
              <AdminOverview
                onTabChange={setActiveTab}
                onSelectEnquiry={(enq) => {
                  setSelectedEnquiry(enq);
                  setActiveTab('enquiries');
                }}
              />
            )}

            {activeTab === 'enquiries' && (
              <AdminEnquiries
                selectedEnquiryFromOverview={selectedEnquiry}
                onClearSelectedEnquiry={() => setSelectedEnquiry(null)}
              />
            )}

            {activeTab === 'cakes' && <AdminCakes />}

            {activeTab === 'settings' && <AdminSettings />}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
