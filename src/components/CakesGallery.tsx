import { useState, useCallback, useEffect } from 'react';
import Lightbox from './Lightbox';
import { supabase, type CakePhoto } from '../lib/supabase';
import './CakesGallery.css';

export default function CakesGallery() {
  const [cakes, setCakes] = useState<CakePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const fetchCakes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('cake_photos')
        .select('*')
        .eq('is_visible', true)
        .order('display_order', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setCakes(data || []);
    } catch (err: unknown) {
      console.error('Error fetching cake photos:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load cake photos. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCakes();
  }, [fetchCakes]);

  const openLightbox = useCallback((idx: number) => {
    setLightboxIndex(idx);
    // Prevent body scroll when lightbox open
    document.body.style.overflow = 'hidden';
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
    document.body.style.overflow = '';
  }, []);

  const goToPrev = useCallback(() => {
    setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : i));
  }, []);

  const goToNext = useCallback(() => {
    setLightboxIndex((i) => (i !== null && i < cakes.length - 1 ? i + 1 : i));
  }, [cakes.length]);

  return (
    <section id="cakes" className="cakes section" aria-labelledby="cakes-heading">
      <div className="container">
        {/* Header */}
        <div className="text-center cakes__header">
          <p className="section-label">Our Portfolio</p>
          <h2 id="cakes-heading" className="section-title">Cakes Built By Us</h2>
          <div className="pink-divider" />
          <p className="section-subtitle">
            Every cake is a labour of love — handcrafted, eggless, and made
            to make your celebration unforgettable. Browse our gallery of
            real cakes we've created.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="cakes__grid" role="status" aria-label="Loading cake gallery">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="cake-card-skeleton" aria-hidden="true">
                <div className="cake-card-skeleton__shimmer" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="cakes__error" role="alert">
            <div className="cakes__error-icon" aria-hidden="true">🍰</div>
            <h3 className="cakes__error-title">Could Not Load Cakes</h3>
            <p className="cakes__error-msg">{error}</p>
            <button
              type="button"
              className="btn btn-outline cakes__retry-btn"
              onClick={fetchCakes}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Gallery Grid */}
        {!loading && !error && (
          <>
            {cakes.length === 0 ? (
              <div className="cakes__empty text-center">
                <p className="cakes__empty-text">No cake photos available at the moment.</p>
              </div>
            ) : (
              <div className="cakes__grid" role="list" aria-label="Cake portfolio gallery">
                {cakes.map((cake, idx) => {
                  const altText = cake.alt_text || `Eggless cake created by Eggless Baker — cake ${idx + 1}`;
                  return (
                    <article
                      key={cake.id}
                      className="cake-card"
                      role="listitem"
                      onClick={() => openLightbox(idx)}
                    >
                      <button
                        className="cake-card__btn"
                        id={`cake-card-${idx}`}
                        aria-label={`View cake ${idx + 1} in full size`}
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && openLightbox(idx)}
                      >
                        <div className="cake-card__img-wrap">
                          <img
                            src={cake.public_url}
                            alt={altText}
                            className="cake-card__img"
                            loading={idx < 6 ? 'eager' : 'lazy'}
                            width="400"
                            height="400"
                          />
                          {/* Hover overlay */}
                          <div className="cake-card__overlay" aria-hidden="true">
                            <div className="cake-card__zoom-icon" aria-hidden="true">
                              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                <line x1="11" y1="8" x2="11" y2="14" />
                                <line x1="8" y1="11" x2="14" y2="11" />
                              </svg>
                            </div>
                            <p className="cake-card__overlay-text">View Cake</p>
                          </div>
                        </div>
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Bottom CTA */}
        <div className="cakes__footer text-center">
          <p className="cakes__footer-text">
            Want a custom cake made just for you?
          </p>
          <button
            id="gallery-order-btn"
            className="btn btn-primary"
            onClick={() => {
              const el = document.getElementById('contact');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Enquire About a Custom Cake
          </button>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && cakes[lightboxIndex] && (
        <Lightbox
          src={cakes[lightboxIndex].public_url}
          alt={cakes[lightboxIndex].alt_text || `Eggless cake ${lightboxIndex + 1} — created by Eggless Baker`}
          onClose={closeLightbox}
          onPrev={goToPrev}
          onNext={goToNext}
          hasPrev={lightboxIndex > 0}
          hasNext={lightboxIndex < cakes.length - 1}
        />
      )}
    </section>
  );
}
