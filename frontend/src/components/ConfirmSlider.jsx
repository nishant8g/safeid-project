import { useState, useRef, useEffect, useCallback } from 'react';

export default function ConfirmSlider({ onConfirm, label = 'Slide to confirm' }) {
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const containerRef = useRef(null);

  const calculateProgress = useCallback((clientX) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const thumbWidth = 56;
    const padding = 8;
    const maxTravel = rect.width - thumbWidth - padding;
    const x = clientX - rect.left - thumbWidth / 2 - padding / 2;
    return Math.max(0, Math.min(1, x / maxTravel));
  }, []);

  // --- SENIOR ENGINEER GLOBAL DRAG PATTERN ---
  useEffect(() => {
    if (!isDragging || confirmed) return;

    const handleMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const p = calculateProgress(clientX);
      setProgress(p);

      // Trigger SUCCESS at 85% for better UX on mobile
      if (p >= 0.85) {
        setConfirmed(true);
        setIsDragging(false);
        setProgress(1);
        if (onConfirm) onConfirm();
      }
    };

    const handleEnd = () => {
      if (!confirmed) setProgress(0);
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, confirmed, calculateProgress, onConfirm]);

  const handleStart = (e) => {
    if (confirmed) return;
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setProgress(calculateProgress(clientX));
  };

  const thumbLeft = confirmed ? `calc(100% - 60px)` : `${4 + progress * (100 - 12)}%`;

  return (
    <div
      ref={containerRef}
      className="slider-container"
      style={{ 
        opacity: confirmed ? 0.8 : 1,
        border: confirmed ? '2px solid #22c55e' : '2px solid rgba(220, 38, 38, 0.3)',
        transition: 'all 0.3s'
      }}
    >
      <div 
        className="slider-fill" 
        style={{ 
          width: `${progress * 100}%`,
          background: confirmed ? 'rgba(34, 197, 94, 0.2)' : 'rgba(220, 38, 38, 0.15)'
        }} 
      />
      <div className="slider-track-text">
        {confirmed ? '✅ FAMILY NOTIFIED' : `⟫⟫ ${label} ⟫⟫`}
      </div>
      <div
        className="slider-thumb"
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        style={{
          left: thumbLeft,
          transition: isDragging ? 'none' : 'left 0.3s ease',
          background: confirmed ? 'linear-gradient(135deg, #16a34a, #22c55e)' : undefined,
          boxShadow: isDragging ? '0 0 20px rgba(220, 38, 38, 0.4)' : 'none',
          transform: isDragging ? 'scale(1.1)' : 'scale(1)'
        }}
      >
        {confirmed ? '✓' : '⟫'}
      </div>
    </div>
  );
}
