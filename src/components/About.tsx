import './About.css';

export default function About() {
  return (
    <section id="about" className="about section" aria-labelledby="about-heading">
      <div className="container about__inner">
        {/* Text Column */}
        <div className="about__content">
          <p className="section-label">Our Story</p>
          <h2 id="about-heading" className="section-title">
            Baked with Heart,<br />
            <em>Free from Eggs</em>
          </h2>
          <div className="pink-divider" />

          <p className="about__para">
            At <strong>Eggless Baker</strong>, we believe that great cakes should
            be accessible to everyone — regardless of dietary choices or
            restrictions. That is why every single cake that leaves our kitchen
            is completely eggless, without any compromise on taste, texture, or
            visual beauty.
          </p>

          <p className="about__para">
            We craft custom celebration cakes for birthdays, weddings,
            anniversaries, baby showers and everything in between. Each creation
            is made to order, carefully decorated, and baked fresh — so your
            cake is as unique as your occasion.
          </p>

          <p className="about__para">
            Whether you have a specific design in mind or would like our help
            creating something special, we're here to bring your vision to life.
          </p>

          <div className="about__highlights">
            {[
              { icon: '🥚', text: 'Zero Eggs, Full Flavour' },
              { icon: '🎨', text: 'Custom Designs on Request' },
              { icon: '🍰', text: 'Baked Fresh to Order' },
            ].map(({ icon, text }) => (
              <div key={text} className="about__highlight">
                <span className="about__highlight-icon" aria-hidden="true">{icon}</span>
                <span className="about__highlight-text">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative column */}
        <div className="about__visual" aria-hidden="true">
          <div className="about__visual-card">
            <div className="about__visual-ring about__visual-ring--outer" />
            <div className="about__visual-ring about__visual-ring--inner" />
            <div className="about__visual-emoji">🎂</div>
            <div className="about__visual-text">
              <span className="about__visual-tagline">Made with</span>
              <span className="about__visual-tagline about__visual-tagline--pink">❤️ &amp; care</span>
            </div>
          </div>

          {/* Floating badges */}
          <div className="about__float about__float--1">
            <span>🌟 Custom Orders</span>
          </div>
          <div className="about__float about__float--2">
            <span>✨ Freshly Baked</span>
          </div>
        </div>
      </div>
    </section>
  );
}
