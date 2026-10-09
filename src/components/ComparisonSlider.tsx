import React, { useState, useRef, useEffect } from 'react';
import { ChevronsLeftRight, ZoomIn } from 'lucide-react';

interface ComparisonSliderProps {
  beforeUrl: string;
  afterUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
  lang?: 'ar' | 'en';
}

export const ComparisonSlider: React.FC<ComparisonSliderProps> = ({
  beforeUrl,
  afterUrl,
  beforeLabel = 'قبل (الأصلية)',
  afterLabel = 'بعد (المعدلة)',
  lang = 'ar'
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percent);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleInteractionStart = () => setIsDragging(true);
  const handleInteractionEnd = () => setIsDragging(false);

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <div className="relative w-full flex flex-col items-center">
      <div
        ref={containerRef}
        onMouseDown={handleInteractionStart}
        onMouseUp={handleInteractionEnd}
        onMouseMove={handleMouseMove}
        onTouchStart={handleInteractionStart}
        onTouchEnd={handleInteractionEnd}
        onTouchMove={handleTouchMove}
        className="relative w-full aspect-[4/3] max-h-[520px] rounded-2xl overflow-hidden shadow-2xl border border-slate-800 select-none cursor-ew-resize bg-slate-900"
      >
        {/* Checkered pattern background for transparent images */}
        <div 
          className="absolute inset-0 z-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#4f46e5 1px, transparent 1px), radial-gradient(#4f46e5 1px, #0f172a 1px)`,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 10px 10px'
          }}
        />

        {/* After Image (Background layer) */}
        <img
          src={afterUrl}
          alt="After"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        />

        {/* Before Image (Clipped layer) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={beforeUrl}
            alt="Before"
            className="absolute inset-0 w-full h-full object-contain max-w-none"
            style={{
              width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
              height: containerRef.current ? `${containerRef.current.clientHeight}px` : '100%',
            }}
          />
        </div>

        {/* Slider Divider Line */}
        <div
          className="absolute top-0 bottom-0 z-20 w-1 bg-white shadow-[0_0_12px_rgba(0,0,0,0.8)] pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Draggable Circle Handle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white text-slate-900 border-2 border-brand-500 shadow-xl flex items-center justify-center pointer-events-auto cursor-ew-resize hover:scale-110 active:scale-95 transition-transform">
            <ChevronsLeftRight className="w-5 h-5 text-brand-600" />
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 z-30 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/80 text-[11px] font-bold text-white shadow-md">
          {beforeLabel}
        </div>
        <div className="absolute top-3 right-3 z-30 px-3 py-1 rounded-full bg-brand-600/90 backdrop-blur-md border border-brand-400/40 text-[11px] font-bold text-white shadow-md">
          {afterLabel}
        </div>
      </div>

      <p className="mt-2 text-xs text-slate-400 flex items-center gap-1.5 font-medium">
        <ChevronsLeftRight className="w-3.5 h-3.5 text-brand-400" />
        {lang === 'ar' ? 'اسحب المقبض يميناً ويساراً لمقارنة التفاصيل بدقة عالية' : 'Drag the handle left/right to compare pixel details'}
      </p>
    </div>
  );
};
