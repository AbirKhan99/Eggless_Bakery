import { useState, useEffect } from 'react';
import './Navbar.css';

const NAV_LINKS = [
  { href: '#home',    label: 'Home' },
  { href: '#cakes',   label: 'Cakes' },
  { href: '#about',   label: 'About' },
  { href: '#contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);

      // Determine active section
      const sections = NAV_LINKS.map(l => l.href.slice(1));
      for (const sec of [...sections].reverse()) {
        const el = document.getElementById(sec);
        if (el && window.scrollY >= el.offsetTop - 120) {
          setActiveSection(sec);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [menuOpen]);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      className={`navbar ${scrolled ? 'navbar--scrolled' : ''} ${menuOpen ? 'navbar--menu-open' : ''}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="navbar__inner container">
        {/* Logo */}
        <a
          href="#home"
          className="navbar__logo"
          onClick={(e) => { e.preventDefault(); handleNavClick('#home'); }}
          aria-label="Eggless Baker home"
        >
          <span className="navbar__logo-icon" aria-hidden="true">🎂</span>
          <span className="navbar__logo-text">
            <span className="navbar__logo-name">Eggless Baker</span>
          </span>
        </a>

        {/* Desktop Nav Links */}
        <ul className="navbar__links" role="list">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <a
                href={href}
                className={`navbar__link ${activeSection === href.slice(1) ? 'navbar__link--active' : ''}`}
                onClick={(e) => { e.preventDefault(); handleNavClick(href); }}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <a
          href="#contact"
          className="btn btn-primary navbar__cta"
          id="navbar-order-btn"
          onClick={(e) => { e.preventDefault(); handleNavClick('#contact'); }}
        >
          Order a Cake
        </a>

        {/* Mobile Hamburger */}
        <button
          className={`navbar__hamburger ${menuOpen ? 'navbar__hamburger--open' : ''}`}
          onClick={(e) => { e.stopPropagation(); setMenuOpen(m => !m); }}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          id="hamburger-btn"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`navbar__drawer ${menuOpen ? 'navbar__drawer--open' : ''}`}
        aria-hidden={!menuOpen}
        onClick={(e) => e.stopPropagation()}
      >
        <ul className="navbar__drawer-links" role="list">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <a
                href={href}
                className={`navbar__drawer-link ${activeSection === href.slice(1) ? 'navbar__drawer-link--active' : ''}`}
                onClick={(e) => { e.preventDefault(); handleNavClick(href); }}
              >
                {label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="#contact"
              className="btn btn-primary navbar__drawer-cta"
              id="mobile-order-btn"
              onClick={(e) => { e.preventDefault(); handleNavClick('#contact'); }}
            >
              Order a Cake
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
