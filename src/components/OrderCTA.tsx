import './OrderCTA.css';

export default function OrderCTA() {
  const scrollToContact = () => {
    const el = document.getElementById('contact');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="order-cta" aria-labelledby="order-cta-heading">
      <div className="order-cta__bg" aria-hidden="true" />
      <div className="container order-cta__inner">
        <div className="order-cta__content">
          {/* Decorative script */}
          <p className="order-cta__script" aria-hidden="true">Let's create something beautiful</p>

          <h2 id="order-cta-heading" className="order-cta__heading">
            Have a Custom Cake in Mind?
          </h2>

          <p className="order-cta__sub">
            Whether it's a dream birthday cake, a stunning wedding tier or a sweet
            anniversary surprise — we'd love to help. Send us your idea and we'll
            make it happen.
          </p>

          <div className="order-cta__actions">
            <button
              id="order-cta-main-btn"
              className="btn order-cta__btn-primary"
              onClick={scrollToContact}
            >
              <span aria-hidden="true">🎂</span>
              Order / Enquire Now
            </button>
            <button
              id="order-cta-gallery-btn"
              className="btn order-cta__btn-outline"
              onClick={() => {
                const el = document.getElementById('cakes');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Browse Our Cakes
            </button>
          </div>

          {/* Notes */}
          <ul className="order-cta__notes" aria-label="Ordering notes">
            {[
              '🎨 Share your design idea or theme',
              '📅 Let us know your celebration date',
              "💬 We'll get back to you with options",
            ].map(note => (
              <li key={note} className="order-cta__note">{note}</li>
            ))}
          </ul>
        </div>

        {/* Decorative cakes */}
        <div className="order-cta__deco" aria-hidden="true">
          <div className="order-cta__deco-circle order-cta__deco-circle--1">🎂</div>
          <div className="order-cta__deco-circle order-cta__deco-circle--2">🍰</div>
          <div className="order-cta__deco-circle order-cta__deco-circle--3">✨</div>
        </div>
      </div>
    </section>
  );
}
