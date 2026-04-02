/**
 * ConfirmSlider — Anti-prank confirmation slider.
 * User must slide thumb to the end to confirm emergency alert.
 */
import { useState, useRef, useCallback } from 'react';

export default function ConfirmSlider({ onConfirm, label = 'Slide to confirm' }) {
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const containerRef = useRef(null);

  const getProgress = useCallback((clientX) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const thumbWidth = 56;
    const maxTravel = rect.width - thumbWidth - 8;
    const x = clientX - rect.left - thumbWidth / 2 - 4;
    return Math.max(0, Math.min(1, x / maxTravel));
  }, []);

  const handleStart = (e) => {
    if (confirmed) return;
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setProgress(getProgress(clientX));
  };

  const handleMove = (e) => {
    if (!isDragging || confirmed) return;
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const p = getProgress(clientX);
    setProgress(p);
    if (p >= 0.95) {
      setConfirmed(true);
      setIsDragging(false);
      setProgress(1);
      onConfirm?.();
    }
  };

  const handleEnd = () => {
    if (!confirmed) {
      setProgress(0);
    }
    setIsDragging(false);
  };

  const thumbLeft = confirmed ? `calc(100% - 60px)` : `${4 + progress * (100 - 12)}%`;

  return (
    <div
      ref={containerRef}
      className="slider-container"
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      style={{ opacity: confirmed ? 0.6 : 1 }}
    >
      <div className="slider-fill" style={{ width: `${progress * 100}%` }} />
      <div className="slider-track-text">
        {confirmed ? '✅ Confirmed!' : `⟫⟫ ${label} ⟫⟫`}
      </div>
      <div
        className="slider-thumb"
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        style={{
          left: thumbLeft,
          transition: isDragging ? 'none' : 'left 0.3s ease',
          background: confirmed ? 'linear-gradient(135deg, #16a34a, #22c55e)' : undefined,
        }}
      >
        {confirmed ? '✓' : '⟫'}
      </div>
    </div>
  );
}
