import './WhyUs.css';

const FEATURES = [
  {
    id: 'eggless',
    icon: '🥚',
    title: '100% Eggless',
    desc: 'Every single cake we make is completely free from eggs — no exceptions. Perfect for vegetarians, those with egg allergies, and conscious bakers.',
  },
  {
    id: 'freshly-baked',
    icon: '🔥',
    title: 'Freshly Baked',
    desc: 'We bake to order, not in bulk. Your cake is prepared fresh and delivered at its absolute best — never sitting on a shelf.',
  },
  {
    id: 'custom-designs',
    icon: '🎨',
    title: 'Custom Designs',
    desc: 'Have a theme or design in mind? We love bringing creative visions to life. Every cake is crafted to match your unique celebration.',
  },
  {
    id: 'celebrations',
    icon: '🎉',
    title: 'Made for Celebrations',
    desc: 'Birthdays, weddings, anniversaries, baby showers — whatever the occasion, we create cakes that make the moment memorable.',
  },
  {
    id: 'handcrafted',
    icon: '🤍',
    title: 'Handcrafted with Care',
    desc: 'We take pride in our work. Each cake is carefully decorated by hand with attention to detail, ensuring a truly artisan product.',
  },
  {
    id: 'no-compromise',
    icon: '⭐',
    title: 'No Compromise on Taste',
    desc: "Eggless doesn't mean flavourless. Our recipes are perfected to deliver the same moist, rich, and delicious taste you expect from any great cake.",
  },
];

export default function WhyUs() {
  return (
    <section className="why-us section" aria-labelledby="why-us-heading">
      <div className="container">
        <div className="text-center why-us__header">
          <p className="section-label">Why Choose Us</p>
          <h2 id="why-us-heading" className="section-title">
            Why Eggless Baker?
          </h2>
          <div className="pink-divider" />
          <p className="section-subtitle">
            We're not just a bakery. We're your partner in making every celebration
            sweeter, more beautiful, and completely eggless.
          </p>
        </div>

        <div className="why-us__grid" role="list">
          {FEATURES.map(({ id, icon, title, desc }) => (
            <article
              key={id}
              className="why-card"
              id={`why-card-${id}`}
              role="listitem"
            >
              <div className="why-card__icon-wrap" aria-hidden="true">
                <span className="why-card__icon">{icon}</span>
              </div>
              <h3 className="why-card__title">{title}</h3>
              <p className="why-card__desc">{desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
