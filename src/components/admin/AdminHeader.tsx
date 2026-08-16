import type { AdminTab } from './AdminSidebar';
import { useAuth } from '../../lib/authContext';

interface AdminHeaderProps {
  activeTab: AdminTab;
  onToggleSidebar: () => void;
}

export default function AdminHeader({
  activeTab,
  onToggleSidebar,
}: AdminHeaderProps) {
  const { user } = useAuth();

  const tabTitles: Record<AdminTab, { title: string; subtitle: string }> = {
    overview: {
      title: 'Dashboard Overview',
      subtitle: 'Summary of cake enquiries, gallery, and operations',
    },
    enquiries: {
      title: 'Customer Enquiries',
      subtitle: 'Manage custom orders and customer communications',
    },
    cakes: {
      title: 'Cake Portfolio & Gallery',
      subtitle: 'Manage cake photos, captions, and display order',
    },
    settings: {
      title: 'Business & Store Settings',
      subtitle: 'Update phone numbers, timings, address and social links',
    },
  };

  const current = tabTitles[activeTab];

  return (
    <header className="admin-header">
      <div className="admin-header__left">
        <button
          type="button"
          className="admin-header__menu-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>
        <div>
          <h1 className="admin-header__title">{current.title}</h1>
          <p className="admin-header__subtitle">{current.subtitle}</p>
        </div>
      </div>

      <div className="admin-header__right">
        <div className="admin-header__status-indicator">
          <span className="admin-status-dot" />
          <span className="admin-status-text">Connected to Supabase</span>
        </div>
        <div className="admin-header__avatar" title={user?.email || 'Admin'}>
          {user?.email ? user.email[0].toUpperCase() : 'A'}
        </div>
      </div>
    </header>
  );
}
