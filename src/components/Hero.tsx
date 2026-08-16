import './Hero.css';

export default function Hero() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="hero" aria-label="Hero section">
      {/* Decorative background layer */}
      <div className="hero__bg" aria-hidden="true">
        <div className="hero__bg-blob hero__bg-blob--1" />
        <div className="hero__bg-blob hero__bg-blob--2" />
        <div className="hero__bg-blob hero__bg-blob--3" />
        <div className="hero__bg-dots" />
      </div>

      {/* Main layout: text left / banner right (split hero) */}
      <div className="hero__content container">

        {/* ── Left: Text Column ── */}
        <div className="hero__text">
          {/* Eyebrow */}
          <p className="hero__eyebrow animate-fade-in-up">
            <span className="hero__eyebrow-dot" aria-hidden="true" />
            100% Eggless · Freshly Baked · Made with Love
          </p>

          {/* Heading */}
          <h1 className="hero__heading animate-fade-in-up delay-1">
            Every Celebration
            <br />
            <em>Deserves a</em>
            <br />
            <span className="hero__heading-accent">Beautiful Cake</span>
          </h1>

          {/* Subheading */}
          <p className="hero__sub animate-fade-in-up delay-2">
            Handcrafted custom eggless cakes for birthdays, weddings,
            anniversaries and every sweet moment in between.
          </p>

          {/* CTAs */}
          <div className="hero__actions animate-fade-in-up delay-3">
            <button
              id="hero-order-btn"
              className="btn btn-primary hero__btn-primary"
              onClick={() => scrollTo('contact')}
            >
              Order / Enquire Now
            </button>
            <button
              id="hero-gallery-btn"
              className="btn hero__btn-outline"
              onClick={() => scrollTo('cakes')}
            >
              View Our Cakes
            </button>
          </div>

          {/* Trust badges */}
          <div className="hero__badges animate-fade-in-up delay-4" aria-label="Key highlights">
            {[
              { icon: '🥚', label: '100% Eggless' },
              { icon: '🎂', label: 'Custom Designs' },
              { icon: '✨', label: 'Premium Quality' },
            ].map(({ icon, label }) => (
              <div key={label} className="hero__badge">
                <span className="hero__badge-icon" aria-hidden="true">{icon}</span>
                <span className="hero__badge-label">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Banner Illustration ── */}
        <div className="hero__banner-col animate-fade-in-up delay-2" aria-hidden="false">
          <div className="hero__banner-frame">
            {/* Decorative ring behind image */}
            <div className="hero__banner-ring" aria-hidden="true" />
            <img
              src="/images/hero/banner.jpeg"
              alt="Eggless Baker — the bakers behind the brand, holding a beautiful cake. Baking a kinder world, by Puso."
              className="hero__banner-img"
              fetchPriority="high"
              loading="eager"
              width="1080"
              height="390"
            />
          </div>
          {/* Floating badge below banner */}
          <div className="hero__banner-badge" aria-hidden="true">
            <span>🎀</span>
            <span>Baking a Kinder World</span>
          </div>
        </div>

      </div>

      {/* Scroll indicator */}
      <button
        className="hero__scroll-indicator"
        id="hero-scroll-down"
        onClick={() => scrollTo('cakes')}
        aria-label="Scroll to cakes section"
      >
        <span className="hero__scroll-arrow" aria-hidden="true" />
      </button>
    </section>
  );
}
