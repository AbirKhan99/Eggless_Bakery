import { useBusinessSettings } from '../lib/useBusinessSettings';
import { useRouter } from '../lib/router';
import './Footer.css';

const FOOTER_NAV = [
  { href: '#home',    label: 'Home' },
  { href: '#cakes',   label: 'Cakes' },
  { href: '#about',   label: 'About' },
  { href: '#contact', label: 'Contact' },
];

export default function Footer() {
  const { settings } = useBusinessSettings();
  const { navigate } = useRouter();
  const currentYear = new Date().getFullYear();

  const handleNav = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const whatsappHref =
    settings.whatsapp_url ||
    (settings.whatsapp_number
      ? `https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`
      : undefined);

  return (
    <footer className="footer" role="contentinfo">
      {/* Wave divider */}
      <div className="footer__wave" aria-hidden="true">
        <svg viewBox="0 0 1200 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0,40 C300,80 900,0 1200,40 L1200,80 L0,80 Z"
            fill="var(--text-dark)"
          />
        </svg>
      </div>

      <div className="footer__body">
        <div className="container footer__inner">
          {/* Brand */}
          <div className="footer__brand">
            <div className="footer__logo">
              <span className="footer__logo-icon" aria-hidden="true">🎂</span>
              <span className="footer__logo-name">Eggless Baker</span>
            </div>
            <p className="footer__tagline">
              Handcrafted eggless cakes for every celebration.
              <br />Made with love, delivered with care.
            </p>
            <div className="footer__social" aria-label="Social media">
              {settings.instagram_url && (
                <a
                  href={settings.instagram_url}
                  id="footer-instagram"
                  className="footer__social-icon"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow Eggless Baker on Instagram"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
                  </svg>
                </a>
              )}
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  id="footer-whatsapp"
                  className="footer__social-icon"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat with Eggless Baker on WhatsApp"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Nav */}
          <nav className="footer__nav" aria-label="Footer navigation">
            <p className="footer__nav-title">Quick Links</p>
            <ul className="footer__nav-list" role="list">
              {FOOTER_NAV.map(({ href, label }) => (
                <li key={href}>
                  <a
                    href={href}
                    className="footer__nav-link"
                    onClick={(e) => { e.preventDefault(); handleNav(href); }}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* CTA */}
          <div className="footer__cta-col">
            <p className="footer__nav-title">Ready to Order?</p>
            <p className="footer__cta-text">
              Get in touch to enquire about your custom eggless cake.
            </p>
            <button
              id="footer-order-btn"
              className="btn btn-primary footer__cta-btn"
              onClick={() => handleNav('#contact')}
            >
              Order a Cake
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer__bottom">
          <div className="container footer__bottom-inner">
            <p className="footer__copy">
              © {currentYear} Eggless Baker. All rights reserved.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <a
                href="/admin"
                className="footer__copy"
                style={{ fontSize: '0.75rem', opacity: 0.6 }}
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/admin');
                }}
              >
                🔒 Admin
              </a>
              <p className="footer__made">
                Crafted with <span className="footer__heart" aria-label="love">❤️</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
