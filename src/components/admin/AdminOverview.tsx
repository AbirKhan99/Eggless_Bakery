import { useState, useEffect, useCallback } from 'react';
import { supabase, type Enquiry, type CakePhoto } from '../../lib/supabase';
import { useRouter } from '../../lib/router';

interface AdminOverviewProps {
  onTabChange: (tab: 'enquiries' | 'cakes' | 'settings') => void;
  onSelectEnquiry?: (enquiry: Enquiry) => void;
}

export default function AdminOverview({ onTabChange, onSelectEnquiry }: AdminOverviewProps) {
  const { navigate } = useRouter();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [cakes, setCakes] = useState<CakePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [enquiriesRes, cakesRes] = await Promise.all([
        supabase
          .from('enquiries')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('cake_photos')
          .select('*')
          .order('display_order', { ascending: true }),
      ]);

      if (enquiriesRes.error) throw enquiriesRes.error;
      if (cakesRes.error) throw cakesRes.error;

      setEnquiries(enquiriesRes.data || []);
      setCakes(cakesRes.data || []);
    } catch (err: unknown) {
      console.error('Error loading dashboard overview:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load dashboard overview data.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const newEnquiriesCount = enquiries.filter((e) => e.status === 'new').length;
  const visibleCakesCount = cakes.filter((c) => c.is_visible).length;

  return (
    <div className="admin-overview">
      {/* Welcome Banner */}
      <div className="admin-banner">
        <div className="admin-banner__content">
          <h2 className="admin-banner__title">Welcome back, Baker! 🍰</h2>
          <p className="admin-banner__text">
            Here's a quick summary of your custom cake orders and bakery operations today.
          </p>
        </div>
        <div className="admin-banner__actions">
          <button
            type="button"
            className="btn btn-outline admin-btn--white"
            onClick={() => navigate('/')}
          >
            🌐 View Public Site
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="admin-alert admin-alert--error" role="alert">
          <p>
            <strong>Error loading overview:</strong> {error}
          </p>
          <button
            type="button"
            className="btn btn-outline admin-btn--sm"
            onClick={loadData}
          >
            Retry
          </button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="admin-stats-grid">
        <div
          className="admin-stat-card admin-stat-card--interactive"
          onClick={() => onTabChange('enquiries')}
          role="button"
          tabIndex={0}
        >
          <div className="admin-stat-card__icon admin-stat-card__icon--pink">
            📬
          </div>
          <div className="admin-stat-card__info">
            <span className="admin-stat-card__label">New Inquiries</span>
            <div className="admin-stat-card__value-wrap">
              <span className="admin-stat-card__value">
                {loading ? '...' : newEnquiriesCount}
              </span>
              {newEnquiriesCount > 0 && (
                <span className="admin-badge admin-badge--new">Requires Action</span>
              )}
            </div>
            <span className="admin-stat-card__subtext">
              Total Inquiries: {loading ? '...' : enquiries.length}
            </span>
          </div>
        </div>

        <div
          className="admin-stat-card admin-stat-card--interactive"
          onClick={() => onTabChange('cakes')}
          role="button"
          tabIndex={0}
        >
          <div className="admin-stat-card__icon admin-stat-card__icon--gold">
            🎂
          </div>
          <div className="admin-stat-card__info">
            <span className="admin-stat-card__label">Gallery Portfolio</span>
            <div className="admin-stat-card__value-wrap">
              <span className="admin-stat-card__value">
                {loading ? '...' : cakes.length}
              </span>
              <span className="admin-badge admin-badge--active">
                {visibleCakesCount} Visible
              </span>
            </div>
            <span className="admin-stat-card__subtext">
              {cakes.length - visibleCakesCount} Hidden photos
            </span>
          </div>
        </div>

        <div
          className="admin-stat-card admin-stat-card--interactive"
          onClick={() => onTabChange('settings')}
          role="button"
          tabIndex={0}
        >
          <div className="admin-stat-card__icon admin-stat-card__icon--blue">
            ⚙️
          </div>
          <div className="admin-stat-card__info">
            <span className="admin-stat-card__label">Store Contact & Hours</span>
            <div className="admin-stat-card__value-wrap">
              <span className="admin-stat-card__value-sm">Active</span>
            </div>
            <span className="admin-stat-card__subtext">
              WhatsApp, Phone & Timings configured
            </span>
          </div>
        </div>
      </div>

      {/* Quick Recent Enquiries Section */}
      <div className="admin-section-card">
        <div className="admin-section-card__header">
          <div>
            <h3 className="admin-section-card__title">Recent Customer Inquiries</h3>
            <p className="admin-section-card__subtitle">
              Newest requests submitted through your website contact form
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline admin-btn--sm"
            onClick={() => onTabChange('enquiries')}
          >
            View All Enquiries →
          </button>
        </div>

        {loading ? (
          <div className="admin-loading-skeleton">
            <div className="admin-skeleton-row" />
            <div className="admin-skeleton-row" />
            <div className="admin-skeleton-row" />
          </div>
        ) : enquiries.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-state__icon">📭</div>
            <p className="admin-empty-state__title">No enquiries yet</p>
            <p className="admin-empty-state__text">
              When customers fill out the enquiry form on your website, their requests will show up here.
            </p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Occasion</th>
                  <th>Celebration Date</th>
                  <th>Status</th>
                  <th>Received</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.slice(0, 6).map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="admin-customer-cell">
                        <span className="admin-customer-avatar">
                          {item.name ? item.name[0].toUpperCase() : '?'}
                        </span>
                        <div>
                          <strong>{item.name}</strong>
                          {item.email && (
                            <div className="admin-cell-subtext">{item.email}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <a
                        href={`tel:${item.phone}`}
                        className="admin-contact-link"
                        onClick={(e) => e.stopPropagation()}
                      >
                        📞 {item.phone}
                      </a>
                    </td>
                    <td>
                      {item.occasion ? (
                        <span className="admin-pill admin-pill--occasion">
                          {item.occasion}
                        </span>
                      ) : (
                        <span className="admin-cell-muted">—</span>
                      )}
                    </td>
                    <td>
                      {item.celebration_date ? (
                        <strong>{item.celebration_date}</strong>
                      ) : (
                        <span className="admin-cell-muted">—</span>
                      )}
                    </td>
                    <td>
                      <span className={`admin-status-badge admin-status-badge--${item.status || 'new'}`}>
                        {item.status || 'new'}
                      </span>
                    </td>
                    <td className="admin-cell-subtext">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        className="btn btn-outline admin-btn--xs"
                        onClick={() => {
                          if (onSelectEnquiry) onSelectEnquiry(item);
                          onTabChange('enquiries');
                        }}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
