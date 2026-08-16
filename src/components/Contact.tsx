import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useBusinessSettings } from '../lib/useBusinessSettings';
import './Contact.css';

export default function Contact() {
  const { settings, loading: settingsLoading } = useBusinessSettings();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    occasion: '',
    celebration_date: '',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (status === 'error') {
      setStatus('idle');
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (status === 'submitting') return;

    // Basic validation
    if (!formData.name.trim()) {
      setStatus('error');
      setErrorMessage('Please enter your name.');
      return;
    }

    if (!formData.phone.trim()) {
      setStatus('error');
      setErrorMessage('Please enter your phone number.');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || null,
        occasion: formData.occasion || null,
        celebration_date: formData.celebration_date || null,
        message: formData.message.trim() || null,
        status: 'new',
      };

      console.log('[Contact Debug] Submitting enquiry to Supabase...');
      console.log('[Contact Debug] Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('[Contact Debug] Payload:', payload);

      // NOTE: Do not append .select() because anonymous users do not have SELECT permissions on enquiries
      const response = await supabase.from('enquiries').insert(payload);

      console.log('[Contact Debug] Full Supabase Response:', response);
      console.log('[Contact Debug] Response Status:', response.status, response.statusText);
      console.log('[Contact Debug] Response Error:', response.error);

      if (response.error) {
        throw response.error;
      }

      console.log('[Contact Debug] INSERT succeeded! Showing success state.');
      setStatus('success');
      setFormData({
        name: '',
        phone: '',
        email: '',
        occasion: '',
        celebration_date: '',
        message: '',
      });
    } catch (err: unknown) {
      console.error('[Contact Debug] Error submitting enquiry:', err);
      setStatus('error');
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Something went wrong while sending your enquiry. Please try again or reach out to us directly on WhatsApp or Phone.'
      );
    }
  };

  const handleResetSuccess = () => {
    setStatus('idle');
    setErrorMessage('');
  };

  return (
    <section id="contact" className="contact section" aria-labelledby="contact-heading">
      <div className="container">
        <div className="text-center contact__header">
          <p className="section-label">Get in Touch</p>
          <h2 id="contact-heading" className="section-title">Order or Enquire</h2>
          <div className="pink-divider" />
          <p className="section-subtitle">
            Ready to place an order or have a question? Reach out to us and
            we'll get back to you as soon as possible.
          </p>
        </div>

        <div className="contact__layout">
          {/* Enquiry Form */}
          <div className="contact__form-wrap">
            {status === 'success' ? (
              <div className="contact__success-card" role="status" aria-live="polite">
                <div className="contact__success-icon" aria-hidden="true">🎂</div>
                <h3 className="contact__success-title">Enquiry Sent Successfully!</h3>
                <p className="contact__success-desc">
                  Thank you for reaching out to Eggless Baker. We have received your details
                  and will get back to you shortly to confirm your order and customize your celebration cake!
                </p>
                <button
                  type="button"
                  id="contact-send-another-btn"
                  onClick={handleResetSuccess}
                  className="btn btn-primary contact__success-btn"
                >
                  Send Another Enquiry
                </button>
              </div>
            ) : (
              <form
                className="contact__form"
                id="contact-form"
                onSubmit={handleSubmit}
                noValidate
              >
                {status === 'error' && (
                  <div className="contact__alert contact__alert--error" role="alert">
                    <span className="contact__alert-icon" aria-hidden="true">⚠️</span>
                    <span>{errorMessage || 'Failed to submit enquiry. Please check your information and try again.'}</span>
                  </div>
                )}

                <div className="contact__form-row">
                  <div className="contact__field">
                    <label htmlFor="contact-name" className="contact__label">
                      Your Name <span className="contact__required" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      className="contact__input"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={status === 'submitting'}
                      required
                      autoComplete="name"
                    />
                  </div>
                  <div className="contact__field">
                    <label htmlFor="contact-phone" className="contact__label">
                      Phone Number <span className="contact__required" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      className="contact__input"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={status === 'submitting'}
                      required
                      autoComplete="tel"
                    />
                  </div>
                </div>

                <div className="contact__field">
                  <label htmlFor="contact-email" className="contact__label">Email Address</label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    className="contact__input"
                    placeholder="Enter your email (optional)"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={status === 'submitting'}
                    autoComplete="email"
                  />
                </div>

                <div className="contact__field">
                  <label htmlFor="contact-occasion" className="contact__label">Occasion / Cake Type</label>
                  <select
                    id="contact-occasion"
                    name="occasion"
                    className="contact__select"
                    value={formData.occasion}
                    onChange={handleChange}
                    disabled={status === 'submitting'}
                  >
                    <option value="">Select occasion...</option>
                    <option value="birthday">Birthday</option>
                    <option value="wedding">Wedding / Engagement</option>
                    <option value="anniversary">Anniversary</option>
                    <option value="baby-shower">Baby Shower</option>
                    <option value="other">Other Celebration</option>
                  </select>
                </div>

                <div className="contact__field">
                  <label htmlFor="contact-date" className="contact__label">Celebration Date</label>
                  <input
                    id="contact-date"
                    name="celebration_date"
                    type="date"
                    className="contact__input"
                    value={formData.celebration_date}
                    onChange={handleChange}
                    disabled={status === 'submitting'}
                  />
                </div>

                <div className="contact__field">
                  <label htmlFor="contact-message" className="contact__label">Your Message / Design Ideas</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    className="contact__textarea"
                    rows={4}
                    placeholder="Tell us about the cake you have in mind — theme, flavour, size, any special requests..."
                    value={formData.message}
                    onChange={handleChange}
                    disabled={status === 'submitting'}
                  />
                </div>

                <button
                  type="submit"
                  id="contact-submit-btn"
                  className="btn btn-primary contact__submit"
                  disabled={status === 'submitting'}
                  aria-busy={status === 'submitting'}
                >
                  {status === 'submitting' ? (
                    <>
                      <span className="contact__spinner" aria-hidden="true" />
                      Sending Enquiry...
                    </>
                  ) : (
                    <>
                      <span aria-hidden="true">🎂</span>
                      Send Enquiry
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Info Panel */}
          <aside className="contact__info" aria-label="Contact information">
            <div className="contact__info-card">
              <h3 className="contact__info-title">Contact Details</h3>

              <div className="contact__info-items">
                {/* Address */}
                <div className="contact__info-item" id="contact-location">
                  <span className="contact__info-icon" aria-hidden="true">📍</span>
                  <div>
                    <p className="contact__info-item-label">Location</p>
                    <p className="contact__info-item-value">
                      {settings.address || (settingsLoading ? 'Loading location...' : 'Jaipur, Rajasthan')}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="contact__info-item" id="contact-phone-info">
                  <span className="contact__info-icon" aria-hidden="true">📞</span>
                  <div>
                    <p className="contact__info-item-label">Phone</p>
                    {settings.phone ? (
                      <a
                        href={`tel:${settings.phone.replace(/[^0-9+]/g, '')}`}
                        className="contact__info-link"
                        aria-label="Call Eggless Baker"
                      >
                        {settings.phone}
                      </a>
                    ) : (
                      <span className="contact__info-item-value">
                        {settingsLoading ? 'Loading phone...' : 'Not available'}
                      </span>
                    )}
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="contact__info-item" id="contact-whatsapp-info">
                  <span className="contact__info-icon" aria-hidden="true">💬</span>
                  <div>
                    <p className="contact__info-item-label">WhatsApp</p>
                    {settings.whatsapp_url || settings.whatsapp_number ? (
                      <a
                        href={settings.whatsapp_url || `https://wa.me/${settings.whatsapp_number?.replace(/[^0-9]/g, '')}`}
                        className="contact__info-link"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Chat on WhatsApp"
                      >
                        {settings.whatsapp_number || settings.phone || 'Chat on WhatsApp'}
                      </a>
                    ) : (
                      <span className="contact__info-item-value">
                        {settingsLoading ? 'Loading WhatsApp...' : 'Not available'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Working Hours */}
                <div className="contact__info-item" id="contact-hours">
                  <span className="contact__info-icon" aria-hidden="true">🕐</span>
                  <div>
                    <p className="contact__info-item-label">Working Hours</p>
                    <p className="contact__info-item-value">
                      {settings.hours_display || (settingsLoading ? 'Loading hours...' : 'Open daily')}
                    </p>
                    {settings.hours_note && (
                      <p className="contact__info-hours-sub">{settings.hours_note}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Get Directions Button */}
              {settings.google_maps_url ? (
                <a
                  href={settings.google_maps_url}
                  id="btn-get-directions"
                  className="contact__directions-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Get directions to Eggless Baker on Google Maps"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                  </svg>
                  Get Directions
                </a>
              ) : null}

              {/* Social */}
              {settings.instagram_url && (
                <div className="contact__social" aria-label="Social media">
                  <p className="contact__social-label">Follow us</p>
                  <div className="contact__social-links">
                    <a
                      href={settings.instagram_url}
                      id="social-instagram"
                      className="contact__social-btn"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Follow Eggless Baker on Instagram"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                        <circle cx="12" cy="12" r="4"/>
                        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
                      </svg>
                      Instagram
                    </a>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
