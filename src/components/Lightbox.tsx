import { useEffect, useRef } from 'react';
import './Lightbox.css';

interface LightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export default function Lightbox({
  src,
  alt,
  onClose,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
}: LightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();

    // Close on backdrop click (light dismiss)
    const handleClick = (e: MouseEvent) => {
      const rect = dialog.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      if (!inside) onClose();
    };

    dialog.addEventListener('click', handleClick);
    return () => dialog.removeEventListener('click', handleClick);
  }, [onClose]);

  // Keyboard nav
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev && onPrev) onPrev();
      if (e.key === 'ArrowRight' && hasNext && onNext) onNext();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  return (
    <dialog
      ref={dialogRef}
      className="lightbox"
      aria-label="Cake photo viewer"
      onClose={onClose}
    >
      <div className="lightbox__inner" onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        <button
          className="lightbox__close"
          id="lightbox-close-btn"
          onClick={onClose}
          aria-label="Close image viewer"
        >
          ✕
        </button>

        {/* Prev */}
        {hasPrev && (
          <button
            className="lightbox__nav lightbox__nav--prev"
            id="lightbox-prev-btn"
            onClick={onPrev}
            aria-label="Previous cake"
          >
            ‹
          </button>
        )}

        {/* Image */}
        <figure className="lightbox__figure">
          <img
            src={src}
            alt={alt}
            className="lightbox__img"
            loading="eager"
          />
        </figure>

        {/* Next */}
        {hasNext && (
          <button
            className="lightbox__nav lightbox__nav--next"
            id="lightbox-next-btn"
            onClick={onNext}
            aria-label="Next cake"
          >
            ›
          </button>
        )}
      </div>
    </dialog>
  );
}
