import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, type Enquiry } from '../../lib/supabase';
import { useToast } from './Toast';

interface AdminEnquiriesProps {
  selectedEnquiryFromOverview?: Enquiry | null;
  onClearSelectedEnquiry?: () => void;
}

type StatusType = 'all' | 'new' | 'replied' | 'confirmed' | 'declined';

export default function AdminEnquiries({
  selectedEnquiryFromOverview,
  onClearSelectedEnquiry,
}: AdminEnquiriesProps) {
  const { addToast } = useToast();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeStatusFilter, setActiveStatusFilter] = useState<StatusType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalEnquiry, setActiveModalEnquiry] = useState<Enquiry | null>(null);
  const [editingNotes, setEditingNotes] = useState<{ [id: string]: string }>({});
  const [savingNotesId, setSavingNotesId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteEnquiry, setConfirmDeleteEnquiry] = useState<Enquiry | null>(null);

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from('enquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;

      setEnquiries(data || []);

      // Pre-fill editingNotes
      const noteMap: { [id: string]: string } = {};
      (data || []).forEach((e) => {
        if (e.id) noteMap[e.id] = e.admin_notes || '';
      });
      setEditingNotes(noteMap);
    } catch (err: unknown) {
      console.error('Error loading enquiries:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load customer enquiries.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  useEffect(() => {
    if (selectedEnquiryFromOverview) {
      setActiveModalEnquiry(selectedEnquiryFromOverview);
      if (onClearSelectedEnquiry) onClearSelectedEnquiry();
    }
  }, [selectedEnquiryFromOverview, onClearSelectedEnquiry]);

  const handleStatusChange = async (enquiryId: string, newStatus: string) => {
    setUpdatingStatusId(enquiryId);
    try {
      const updatePayload: { status: string; replied_at?: string | null } = {
        status: newStatus,
      };

      if (newStatus === 'replied') {
        updatePayload.replied_at = new Date().toISOString();
      }

      const { error: updateErr } = await supabase
        .from('enquiries')
        .update(updatePayload)
        .eq('id', enquiryId);

      if (updateErr) throw updateErr;

      setEnquiries((prev) =>
        prev.map((item) =>
          item.id === enquiryId
            ? {
                ...item,
                status: newStatus,
                ...(newStatus === 'replied' ? { replied_at: updatePayload.replied_at } : {}),
              }
            : item
        )
      );

      if (activeModalEnquiry?.id === enquiryId) {
        setActiveModalEnquiry((prev) =>
          prev ? { ...prev, status: newStatus } : null
        );
      }

      addToast({
        type: 'success',
        title: 'Status Updated',
        message: `Enquiry status changed to "${newStatus}"`,
      });
    } catch (err: unknown) {
      console.error('Error updating status:', err);
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: err instanceof Error ? err.message : 'Could not update status',
      });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleSaveNotes = async (enquiryId: string) => {
    setSavingNotesId(enquiryId);
    try {
      const notes = editingNotes[enquiryId] ?? '';
      const { error: updateErr } = await supabase
        .from('enquiries')
        .update({ admin_notes: notes })
        .eq('id', enquiryId);

      if (updateErr) throw updateErr;

      setEnquiries((prev) =>
        prev.map((item) =>
          item.id === enquiryId ? { ...item, admin_notes: notes } : item
        )
      );

      if (activeModalEnquiry?.id === enquiryId) {
        setActiveModalEnquiry((prev) =>
          prev ? { ...prev, admin_notes: notes } : null
        );
      }

      addToast({
        type: 'success',
        title: 'Notes Saved',
        message: 'Internal admin notes saved successfully.',
      });
    } catch (err: unknown) {
      console.error('Error saving notes:', err);
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: err instanceof Error ? err.message : 'Could not save admin notes',
      });
    } finally {
      setSavingNotesId(null);
    }
  };

  const handleDeleteEnquiry = async () => {
    if (!confirmDeleteEnquiry || !confirmDeleteEnquiry.id) return;
    const targetId = confirmDeleteEnquiry.id;
    setDeletingId(targetId);

    try {
      const { error: deleteErr } = await supabase
        .from('enquiries')
        .delete()
        .eq('id', targetId);

      if (deleteErr) throw deleteErr;

      setEnquiries((prev) => prev.filter((item) => item.id !== targetId));
      if (activeModalEnquiry?.id === targetId) {
        setActiveModalEnquiry(null);
      }
      setConfirmDeleteEnquiry(null);

      addToast({
        type: 'success',
        title: 'Enquiry Deleted',
        message: 'The enquiry record was removed.',
      });
    } catch (err: unknown) {
      console.error('Error deleting enquiry:', err);
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: err instanceof Error ? err.message : 'Could not delete enquiry.',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((item) => {
      const matchesStatus =
        activeStatusFilter === 'all' || item.status === activeStatusFilter;

      if (!matchesStatus) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.phone.toLowerCase().includes(q) ||
        (item.email && item.email.toLowerCase().includes(q)) ||
        (item.occasion && item.occasion.toLowerCase().includes(q)) ||
        (item.message && item.message.toLowerCase().includes(q)) ||
        (item.celebration_date && item.celebration_date.toLowerCase().includes(q))
      );
    });
  }, [enquiries, activeStatusFilter, searchQuery]);

  const countsByStatus = useMemo(() => {
    return {
      all: enquiries.length,
      new: enquiries.filter((e) => e.status === 'new').length,
      replied: enquiries.filter((e) => e.status === 'replied').length,
      confirmed: enquiries.filter((e) => e.status === 'confirmed').length,
      declined: enquiries.filter((e) => e.status === 'declined').length,
    };
  }, [enquiries]);

  return (
    <div className="admin-enquiries">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Customer Enquiries</h2>
          <p className="admin-page-subtitle">
            Manage incoming cake requests, track conversation status, and save private notes.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline admin-btn--sm"
          onClick={fetchEnquiries}
          disabled={loading}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="admin-alert admin-alert--error" role="alert">
          <p>
            <strong>Error:</strong> {error}
          </p>
          <button
            type="button"
            className="btn btn-outline admin-btn--sm"
            onClick={fetchEnquiries}
          >
            Retry
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="admin-filter-bar">
        <div className="admin-status-tabs" role="tablist">
          {(['all', 'new', 'replied', 'confirmed', 'declined'] as StatusType[]).map(
            (status) => (
              <button
                key={status}
                type="button"
                role="tab"
                aria-selected={activeStatusFilter === status}
                className={`admin-status-tab ${
                  activeStatusFilter === status ? 'admin-status-tab--active' : ''
                }`}
                onClick={() => setActiveStatusFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                <span className="admin-status-tab__count">
                  {countsByStatus[status]}
                </span>
              </button>
            )
          )}
        </div>

        <div className="admin-search-wrapper">
          <span className="admin-search-icon">🔍</span>
          <input
            type="search"
            className="admin-search-input"
            placeholder="Search name, phone, message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="admin-search-clear"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Enquiries List / Table */}
      <div className="admin-section-card">
        {loading ? (
          <div className="admin-loading-skeleton">
            <div className="admin-skeleton-row" />
            <div className="admin-skeleton-row" />
            <div className="admin-skeleton-row" />
            <div className="admin-skeleton-row" />
          </div>
        ) : filteredEnquiries.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-state__icon">🔍</div>
            <p className="admin-empty-state__title">No matching enquiries</p>
            <p className="admin-empty-state__text">
              {searchQuery || activeStatusFilter !== 'all'
                ? 'Try adjusting your search query or status filter.'
                : 'No customer enquiries received yet.'}
            </p>
            {(searchQuery || activeStatusFilter !== 'all') && (
              <button
                type="button"
                className="btn btn-outline admin-btn--sm"
                onClick={() => {
                  setActiveStatusFilter('all');
                  setSearchQuery('');
                }}
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Occasion & Date</th>
                  <th>Message Preview</th>
                  <th>Status</th>
                  <th>Admin Notes</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnquiries.map((enquiry) => {
                  const id = enquiry.id || '';
                  const isUpdating = updatingStatusId === id;
                  const isSavingNotes = savingNotesId === id;

                  return (
                    <tr
                      key={id}
                      className={enquiry.status === 'new' ? 'admin-tr--new' : ''}
                    >
                      <td>
                        <div className="admin-customer-cell">
                          <span className="admin-customer-avatar">
                            {enquiry.name ? enquiry.name[0].toUpperCase() : '?'}
                          </span>
                          <div>
                            <strong className="admin-customer-name">
                              {enquiry.name}
                            </strong>
                            <div className="admin-cell-subtext">
                              {enquiry.created_at
                                ? new Date(enquiry.created_at).toLocaleString(
                                    undefined,
                                    {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    }
                                  )
                                : '—'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="admin-contact-stack">
                          <a
                            href={`tel:${enquiry.phone}`}
                            className="admin-contact-link"
                          >
                            📞 {enquiry.phone}
                          </a>
                          <a
                            href={`https://wa.me/${enquiry.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="admin-contact-link admin-contact-link--whatsapp"
                          >
                            💬 WhatsApp
                          </a>
                          {enquiry.email && (
                            <a
                              href={`mailto:${enquiry.email}`}
                              className="admin-contact-link admin-contact-link--email"
                            >
                              ✉️ {enquiry.email}
                            </a>
                          )}
                        </div>
                      </td>

                      <td>
                        <div className="admin-occasion-stack">
                          {enquiry.occasion && (
                            <span className="admin-pill admin-pill--occasion">
                              {enquiry.occasion}
                            </span>
                          )}
                          {enquiry.celebration_date ? (
                            <div className="admin-date-badge">
                              📅 {enquiry.celebration_date}
                            </div>
                          ) : (
                            <span className="admin-cell-muted">No date set</span>
                          )}
                        </div>
                      </td>

                      <td className="admin-msg-cell">
                        {enquiry.message ? (
                          <div
                            className="admin-msg-clamp"
                            title={enquiry.message}
                            onClick={() => setActiveModalEnquiry(enquiry)}
                          >
                            {enquiry.message}
                          </div>
                        ) : (
                          <span className="admin-cell-muted">No message</span>
                        )}
                      </td>

                      <td>
                        <div className="admin-status-dropdown-wrap">
                          <select
                            className={`admin-status-select admin-status-select--${
                              enquiry.status || 'new'
                            }`}
                            value={enquiry.status || 'new'}
                            onChange={(e) => handleStatusChange(id, e.target.value)}
                            disabled={isUpdating}
                            aria-label={`Change status for ${enquiry.name}`}
                          >
                            <option value="new">New</option>
                            <option value="replied">Replied</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="declined">Declined</option>
                          </select>
                        </div>
                      </td>

                      <td>
                        <div className="admin-notes-inline">
                          <input
                            type="text"
                            className="admin-notes-input"
                            placeholder="Add quick note..."
                            value={editingNotes[id] ?? ''}
                            onChange={(e) =>
                              setEditingNotes((prev) => ({
                                ...prev,
                                [id]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveNotes(id);
                              }
                            }}
                          />
                          {(editingNotes[id] ?? '') !== (enquiry.admin_notes ?? '') && (
                            <button
                              type="button"
                              className="btn btn-primary admin-btn--xs"
                              onClick={() => handleSaveNotes(id)}
                              disabled={isSavingNotes}
                              title="Save note"
                            >
                              {isSavingNotes ? '...' : 'Save'}
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="text-right">
                        <div className="admin-action-btn-group">
                          <button
                            type="button"
                            className="btn btn-outline admin-btn--xs"
                            onClick={() => setActiveModalEnquiry(enquiry)}
                            title="View full enquiry details"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            className="admin-icon-btn admin-icon-btn--delete"
                            onClick={() => setConfirmDeleteEnquiry(enquiry)}
                            title="Delete enquiry"
                            aria-label="Delete enquiry"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Full Enquiry Modal */}
      {activeModalEnquiry && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setActiveModalEnquiry(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="enquiry-modal-title"
        >
          <div
            className="admin-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <span className="admin-badge admin-badge--neutral">
                  Enquiry Details
                </span>
                <h3 id="enquiry-modal-title" className="admin-modal-title">
                  {activeModalEnquiry.name}
                </h3>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setActiveModalEnquiry(null)}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <div className="admin-modal-body">
              {/* Status Selector in Modal */}
              <div className="admin-modal-section">
                <label className="admin-modal-label">Status Progression</label>
                <div className="admin-status-progression">
                  {(['new', 'replied', 'confirmed', 'declined'] as const).map(
                    (st) => (
                      <button
                        key={st}
                        type="button"
                        className={`admin-status-prog-btn admin-status-prog-btn--${st} ${
                          activeModalEnquiry.status === st ? 'is-active' : ''
                        }`}
                        onClick={() =>
                          activeModalEnquiry.id &&
                          handleStatusChange(activeModalEnquiry.id, st)
                        }
                      >
                        {st.charAt(0).toUpperCase() + st.slice(1)}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="admin-modal-grid">
                <div>
                  <label className="admin-modal-label">Phone</label>
                  <p className="admin-modal-val">
                    <a href={`tel:${activeModalEnquiry.phone}`}>
                      {activeModalEnquiry.phone}
                    </a>
                  </p>
                </div>
                <div>
                  <label className="admin-modal-label">Email</label>
                  <p className="admin-modal-val">
                    {activeModalEnquiry.email ? (
                      <a href={`mailto:${activeModalEnquiry.email}`}>
                        {activeModalEnquiry.email}
                      </a>
                    ) : (
                      '—'
                    )}
                  </p>
                </div>
                <div>
                  <label className="admin-modal-label">Occasion</label>
                  <p className="admin-modal-val">
                    {activeModalEnquiry.occasion || '—'}
                  </p>
                </div>
                <div>
                  <label className="admin-modal-label">Celebration Date</label>
                  <p className="admin-modal-val">
                    {activeModalEnquiry.celebration_date ? (
                      <strong className="text-pink">
                        📅 {activeModalEnquiry.celebration_date}
                      </strong>
                    ) : (
                      '—'
                    )}
                  </p>
                </div>
              </div>

              {/* Customer Message */}
              <div className="admin-modal-section">
                <label className="admin-modal-label">Customer Message / Specifications</label>
                <div className="admin-modal-quote">
                  {activeModalEnquiry.message || 'No additional message provided.'}
                </div>
              </div>

              {/* Admin Notes */}
              <div className="admin-modal-section">
                <label className="admin-modal-label">
                  Internal Admin Notes (Private)
                </label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Record phone discussions, quotes given, flavour preferences, delivery notes..."
                  value={
                    activeModalEnquiry.id
                      ? editingNotes[activeModalEnquiry.id] ?? ''
                      : ''
                  }
                  onChange={(e) => {
                    const id = activeModalEnquiry.id;
                    if (id) {
                      setEditingNotes((prev) => ({
                        ...prev,
                        [id]: e.target.value,
                      }));
                    }
                  }}
                />
                <div className="admin-modal-notes-save-wrap">
                  <button
                    type="button"
                    className="btn btn-primary admin-btn--sm"
                    onClick={() =>
                      activeModalEnquiry.id &&
                      handleSaveNotes(activeModalEnquiry.id)
                    }
                    disabled={savingNotesId === activeModalEnquiry.id}
                  >
                    {savingNotesId === activeModalEnquiry.id
                      ? 'Saving...'
                      : 'Save Admin Notes'}
                  </button>
                </div>
              </div>

              {/* Timestamps */}
              <div className="admin-modal-meta">
                <span>
                  Received:{' '}
                  {activeModalEnquiry.created_at
                    ? new Date(activeModalEnquiry.created_at).toLocaleString()
                    : '—'}
                </span>
                {activeModalEnquiry.replied_at && (
                  <span>
                    Replied:{' '}
                    {new Date(activeModalEnquiry.replied_at).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <div className="admin-modal-footer">
              <div className="admin-modal-direct-links">
                <a
                  href={`https://wa.me/${activeModalEnquiry.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${activeModalEnquiry.name}, thank you for contacting Eggless Baker regarding your cake enquiry!`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline admin-btn--sm"
                >
                  💬 Open WhatsApp Chat
                </a>
                <a
                  href={`tel:${activeModalEnquiry.phone}`}
                  className="btn btn-outline admin-btn--sm"
                >
                  📞 Call Customer
                </a>
              </div>
              <button
                type="button"
                className="btn btn-outline admin-btn--sm"
                onClick={() => setActiveModalEnquiry(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteEnquiry && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setConfirmDeleteEnquiry(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="admin-modal-card admin-modal-card--sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Delete Enquiry?</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setConfirmDeleteEnquiry(null)}
              >
                ×
              </button>
            </div>
            <div className="admin-modal-body">
              <p>
                Are you sure you want to permanently delete the enquiry from{' '}
                <strong>{confirmDeleteEnquiry.name}</strong>?
              </p>
              <p className="admin-cell-subtext">This action cannot be undone.</p>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="btn btn-outline admin-btn--sm"
                onClick={() => setConfirmDeleteEnquiry(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary admin-btn--sm admin-btn--danger"
                onClick={handleDeleteEnquiry}
                disabled={deletingId === confirmDeleteEnquiry.id}
              >
                {deletingId === confirmDeleteEnquiry.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
