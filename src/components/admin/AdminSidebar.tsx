import { useAuth } from '../../lib/authContext';
import { useRouter } from '../../lib/router';

export type AdminTab = 'overview' | 'enquiries' | 'cakes' | 'settings';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  isOpen: boolean;
  onClose: () => void;
  newEnquiriesCount?: number;
}

export default function AdminSidebar({
  activeTab,
  onTabChange,
  isOpen,
  onClose,
  newEnquiriesCount = 0,
}: AdminSidebarProps) {
  const { user, signOut } = useAuth();
  const { navigate } = useRouter();

  const navItems: {
    id: AdminTab;
    label: string;
    icon: string;
    badge?: number;
  }[] = [
    { id: 'overview', label: 'Dashboard', icon: '📊' },
    {
      id: 'enquiries',
      label: 'Enquiries',
      icon: '📬',
      badge: newEnquiriesCount > 0 ? newEnquiriesCount : undefined,
    },
    { id: 'cakes', label: 'Cake Gallery', icon: '🎂' },
    { id: 'settings', label: 'Business Settings', icon: '⚙️' },
  ];

  const handleItemClick = (tabId: AdminTab) => {
    onTabChange(tabId);
    onClose();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`admin-sidebar ${isOpen ? 'is-open' : ''}`}>
        {/* Brand */}
        <div className="admin-sidebar__header">
          <div className="admin-sidebar__brand">
            <span className="admin-sidebar__brand-icon">🍰</span>
            <div className="admin-sidebar__brand-text">
              <span className="admin-sidebar__brand-title">Eggless Baker</span>
              <span className="admin-sidebar__brand-sub">Admin Dashboard</span>
            </div>
          </div>
          <button
            type="button"
            className="admin-sidebar__close-btn"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            ×
          </button>
        </div>

        {/* Navigation */}
        <nav className="admin-sidebar__nav">
          <span className="admin-sidebar__section-title">Navigation</span>
          <ul className="admin-sidebar__menu">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`admin-nav-item ${
                    activeTab === item.id ? 'is-active' : ''
                  }`}
                  onClick={() => handleItemClick(item.id)}
                >
                  <span className="admin-nav-item__icon">{item.icon}</span>
                  <span className="admin-nav-item__label">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="admin-nav-item__badge">{item.badge}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>

          <span className="admin-sidebar__section-title">Website</span>
          <ul className="admin-sidebar__menu">
            <li>
              <button
                type="button"
                className="admin-nav-item"
                onClick={() => navigate('/')}
              >
                <span className="admin-nav-item__icon">🌐</span>
                <span className="admin-nav-item__label">View Public Site</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* User Footer */}
        <div className="admin-sidebar__footer">
          <div className="admin-user-card">
            <div className="admin-user-avatar">
              {user?.email ? user.email[0].toUpperCase() : 'A'}
            </div>
            <div className="admin-user-info">
              <span className="admin-user-name">Authorized Admin</span>
              <span className="admin-user-email" title={user?.email || ''}>
                {user?.email || 'admin'}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="admin-logout-btn"
            onClick={handleSignOut}
            title="Sign Out"
          >
            🚪 Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
