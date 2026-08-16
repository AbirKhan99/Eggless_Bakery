import React, { useState, useEffect, useCallback } from 'react';
import { supabase, type BusinessSetting } from '../../lib/supabase';
import { useToast } from './Toast';

interface SettingsFormState {
  phone: string;
  whatsapp_number: string;
  address: string;
  hours_display: string;
  hours_note: string;
  google_maps_url: string;
  instagram_url: string;
  whatsapp_url: string;
}

const DEFAULT_SETTINGS: SettingsFormState = {
  phone: '+91 98765 43210',
  whatsapp_number: '+91 98765 43210',
  address: '123 Baker Street, Sweet Corner, Bangalore, Karnataka 560001',
  hours_display: 'Tue - Sun: 9:00 AM – 8:00 PM',
  hours_note: 'Mondays: Closed for fresh prep & creative baking',
  google_maps_url: 'https://maps.google.com',
  instagram_url: 'https://instagram.com',
  whatsapp_url: 'https://wa.me/919876543210',
};

export default function AdminSettings() {
  const { addToast } = useToast();
  const [formData, setFormData] = useState<SettingsFormState>(DEFAULT_SETTINGS);
  const [initialData, setInitialData] = useState<SettingsFormState>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from('business_settings')
        .select('*');

      if (fetchErr) throw fetchErr;

      const map = { ...DEFAULT_SETTINGS };
      (data || []).forEach((row: BusinessSetting) => {
        if (row.key in map) {
          (map as unknown as Record<string, string>)[row.key] = row.value;
        }
      });

      setFormData(map);
      setInitialData(map);
    } catch (err: unknown) {
      console.error('Error fetching settings:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load business settings.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAutoGenerateWhatsAppUrl = () => {
    const digits = formData.whatsapp_number.replace(/[^0-9]/g, '');
    if (digits) {
      const url = `https://wa.me/${digits}?text=${encodeURIComponent(
        'Hi Eggless Baker, I would like to enquire about ordering a custom cake!'
      )}`;
      setFormData((prev) => ({ ...prev, whatsapp_url: url }));
      addToast({
        type: 'info',
        title: 'WhatsApp URL Generated',
        message: 'Updated WhatsApp direct chat link using the phone digits.',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updates = Object.entries(formData).map(([key, value]) => ({
        key,
        value: value.trim(),
        updated_at: new Date().toISOString(),
      }));

      // Upsert all settings keys
      const { error: upsertErr } = await supabase
        .from('business_settings')
        .upsert(updates, { onConflict: 'key' });

      if (upsertErr) throw upsertErr;

      setInitialData(formData);
      addToast({
        type: 'success',
        title: 'Settings Saved',
        message: 'Business contact details and store timings updated live.',
      });
    } catch (err: unknown) {
      console.error('Error saving business settings:', err);
      addToast({
        type: 'error',
        title: 'Save Failed',
        message:
          err instanceof Error
            ? err.message
            : 'Could not update business settings.',
      });
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData);

  return (
    <div className="admin-settings">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Business Settings</h2>
          <p className="admin-page-subtitle">
            Configure contact info, store timings, and social profiles displayed across the website.
          </p>
        </div>
        <div className="admin-page-header__actions">
          <button
            type="button"
            className="btn btn-outline admin-btn--sm"
            onClick={fetchSettings}
            disabled={loading || saving}
          >
            🔄 Reset Changes
          </button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="admin-alert admin-alert--error" role="alert">
          <p>
            <strong>Error:</strong> {error}
          </p>
          <button
            type="button"
            className="btn btn-outline admin-btn--sm"
            onClick={fetchSettings}
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="admin-section-card">
          <div className="admin-loading-skeleton">
            <div className="admin-skeleton-row" />
            <div className="admin-skeleton-row" />
            <div className="admin-skeleton-row" />
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="admin-settings-form">
          {/* Contact Details Card */}
          <div className="admin-section-card">
            <h3 className="admin-section-card__title">📞 Contact Numbers</h3>
            <p className="admin-section-card__subtitle">
              Used on the hero buttons, contact section, and footer
            </p>

            <div className="admin-form-grid">
              <div className="form-group">
                <label htmlFor="setting-phone" className="form-label">
                  Display Phone Number
                </label>
                <input
                  id="setting-phone"
                  name="phone"
                  type="text"
                  className="form-input"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
                <span className="admin-field-tip">
                  Direct call button target in mobile navbar and footer.
                </span>
              </div>

              <div className="form-group">
                <label htmlFor="setting-whatsapp" className="form-label">
                  WhatsApp Contact Number
                </label>
                <div className="admin-input-action-wrap">
                  <input
                    id="setting-whatsapp"
                    name="whatsapp_number"
                    type="text"
                    className="form-input"
                    placeholder="+91 98765 43210"
                    value={formData.whatsapp_number}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline admin-btn--xs"
                    onClick={handleAutoGenerateWhatsAppUrl}
                    title="Auto-format direct WhatsApp chat link below"
                  >
                    Sync URL
                  </button>
                </div>
                <span className="admin-field-tip">
                  Used for WhatsApp click-to-chat features.
                </span>
              </div>
            </div>
          </div>

          {/* Bakery Address & Map */}
          <div className="admin-section-card">
            <h3 className="admin-section-card__title">📍 Bakery Address & Location</h3>
            <p className="admin-section-card__subtitle">
              Display location on contact page and directions link
            </p>

            <div className="form-group">
              <label htmlFor="setting-address" className="form-label">
                Physical Store Address
              </label>
              <textarea
                id="setting-address"
                name="address"
                rows={2}
                className="form-textarea"
                placeholder="123 Baker Street, Sweet Corner, Bangalore, Karnataka 560001"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="setting-maps-url" className="form-label">
                Google Maps Directions URL
              </label>
              <input
                id="setting-maps-url"
                name="google_maps_url"
                type="url"
                className="form-input"
                placeholder="https://maps.google.com/?q=..."
                value={formData.google_maps_url}
                onChange={handleChange}
              />
              <span className="admin-field-tip">
                Opens when visitors click "Get Directions" on the website.
              </span>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="admin-section-card">
            <h3 className="admin-section-card__title">⏰ Operating Hours</h3>
            <p className="admin-section-card__subtitle">
              Show when you are taking orders and baking fresh cakes
            </p>

            <div className="admin-form-grid">
              <div className="form-group">
                <label htmlFor="setting-hours-display" className="form-label">
                  Business Hours Display
                </label>
                <input
                  id="setting-hours-display"
                  name="hours_display"
                  type="text"
                  className="form-input"
                  placeholder="Tue - Sun: 9:00 AM – 8:00 PM"
                  value={formData.hours_display}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="setting-hours-note" className="form-label">
                  Hours Sub-note / Closed Days
                </label>
                <input
                  id="setting-hours-note"
                  name="hours_note"
                  type="text"
                  className="form-input"
                  placeholder="Mondays: Closed for fresh prep & creative baking"
                  value={formData.hours_note}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Social Links & Direct URLs */}
          <div className="admin-section-card">
            <h3 className="admin-section-card__title">🔗 Social & Chat Links</h3>
            <p className="admin-section-card__subtitle">
              Direct links for Instagram profile and WhatsApp pre-filled order conversations
            </p>

            <div className="admin-form-grid">
              <div className="form-group">
                <label htmlFor="setting-instagram-url" className="form-label">
                  Instagram Profile URL
                </label>
                <input
                  id="setting-instagram-url"
                  name="instagram_url"
                  type="url"
                  className="form-input"
                  placeholder="https://instagram.com/egglessbaker"
                  value={formData.instagram_url}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="setting-whatsapp-url" className="form-label">
                  Direct WhatsApp Chat URL (with optional message)
                </label>
                <input
                  id="setting-whatsapp-url"
                  name="whatsapp_url"
                  type="url"
                  className="form-input"
                  placeholder="https://wa.me/919876543210?text=..."
                  value={formData.whatsapp_url}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Sticky Save Bar */}
          <div className="admin-save-bar">
            <div className="admin-save-bar__status">
              {hasChanges ? (
                <span className="admin-save-bar__changed">
                  ⚠️ You have unsaved changes
                </span>
              ) : (
                <span className="admin-save-bar__synced">
                  ✓ All settings are up to date
                </span>
              )}
            </div>
            <button
              type="submit"
              className="btn btn-primary admin-btn--save"
              disabled={saving || !hasChanges}
            >
              {saving ? (
                <span className="admin-btn-spinner-wrap">
                  <span className="admin-spinner" /> Saving Settings...
                </span>
              ) : (
                'Save Business Settings'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
