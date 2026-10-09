import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, Clipboard, Sparkles, CheckCircle2 } from 'lucide-react';
import { translations } from '../translations';
import { SupportedFormat } from '../types';

interface DropZoneProps {
  lang: 'ar' | 'en';
  onFilesSelected: (files: File[]) => void;
  activeFormat?: SupportedFormat;
}

export const DropZone: React.FC<DropZoneProps> = ({
  lang,
  onFilesSelected,
  activeFormat
}) => {
  const t = translations[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showPasteToast, setShowPasteToast] = useState(false);

  // Global paste handler (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) files.push(file);
        }
      }

      if (files.length > 0) {
        onFilesSelected(files);
        setShowPasteToast(true);
        setTimeout(() => setShowPasteToast(false), 3000);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onFilesSelected]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('image/') || file.name.match(/\.(png|jpe?g|webp|avif|bmp|gif|svg|ico)$/i)
      );
      if (files.length > 0) {
        onFilesSelected(files);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
      e.target.value = ''; // Reset input
    }
  };

  // Helper to load a demo sample image
  const loadSampleImage = async (type: 'portrait' | 'landscape' | 'product') => {
    // Generate an in-browser canvas sample image so no external network request is made
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d')!;

    if (type === 'portrait') {
      // Warm studio portrait background with gradient
      const grad = ctx.createLinearGradient(0, 0, 1200, 800);
      grad.addColorStop(0, '#f97316');
      grad.addColorStop(1, '#db2777');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1200, 800);

      // Draw stylized portrait avatar
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(600, 320, 140, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(600, 680, 240, 180, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#1e1b4b';
      ctx.font = 'bold 36px Cairo, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PixelForge Portrait Sample', 600, 720);
    } else if (type === 'product') {
      // Clean isolated product on light background (great for BG removal)
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(0, 0, 1200, 800);

      // Product box/card with shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 40;
      ctx.shadowOffsetY = 20;

      ctx.fillStyle = '#6366f1';
      ctx.roundRect(400, 250, 400, 300, 24);
      ctx.fill();

      ctx.shadowColor = 'transparent';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 40px Cairo, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Smart Camera Pro', 600, 410);
    } else {
      // Landscape scene
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 500);
      skyGrad.addColorStop(0, '#0284c7');
      skyGrad.addColorStop(1, '#38bdf8');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, 1200, 500);

      // Mountains
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(0, 500);
      ctx.lineTo(300, 200);
      ctx.lineTo(600, 500);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(400, 500);
      ctx.lineTo(850, 160);
      ctx.lineTo(1200, 500);
      ctx.fill();

      // Grass/Lake
      const lakeGrad = ctx.createLinearGradient(0, 500, 0, 800);
      lakeGrad.addColorStop(0, '#0d9488');
      lakeGrad.addColorStop(1, '#042f2e');
      ctx.fillStyle = lakeGrad;
      ctx.fillRect(0, 500, 1200, 300);
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `sample_${type}.png`, { type: 'image/png' });
        onFilesSelected([file]);
      }
    }, 'image/png');
  };

  return (
    <div className="w-full">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.png,.jpg,.jpeg,.webp,.avif,.bmp,.gif,.svg,.ico"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Drop Zone Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative overflow-hidden rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? 'border-brand-400 bg-brand-500/10 scale-[1.01] shadow-2xl shadow-brand-500/20'
            : 'border-slate-800 hover:border-brand-500/50 bg-slate-900/50 hover:bg-slate-900/80'
        }`}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center max-w-xl mx-auto">
          {/* Animated Upload Icon */}
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-brand-600/30 to-purple-600/30 border border-brand-500/30 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:border-brand-400 transition-transform duration-300 shadow-xl shadow-brand-500/10">
            <UploadCloud className="w-10 h-10 text-brand-400 group-hover:text-brand-300 transition-colors" />
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
            {t.dropTitle}
          </h3>

          <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
            {t.dropSubtitle}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-lg shadow-brand-500/25 transition-all hover:scale-105 active:scale-95"
            >
              {t.browseFiles}
            </button>

            <div className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300">
              <Clipboard className="w-3.5 h-3.5 text-brand-400" />
              <span>{lang === 'ar' ? 'يدعم اللصق المباشر (Ctrl+V)' : 'Ctrl+V Paste Ready'}</span>
            </div>
          </div>

          {/* Formats Pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold text-slate-400">
            {['PNG', 'JPG', 'WEBP', 'AVIF', 'BMP', 'ICO', 'SVG'].map((fmt) => (
              <span
                key={fmt}
                className="px-2.5 py-1 rounded-lg bg-slate-800/50 border border-slate-800 hover:border-brand-500/30 hover:text-slate-200 transition-colors"
              >
                .{fmt.toLowerCase()}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Test Demo Samples Bar */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-2">
        <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          {lang === 'ar' ? 'أو جرب بنقرة واحدة باستخدام عينات جاهزة:' : 'Or try with a one-click sample image:'}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadSampleImage('product')}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-brand-500/40 text-xs text-slate-300 hover:text-white transition-all"
          >
            📦 {lang === 'ar' ? 'منتج (عزل خلفية)' : 'Product (Remove BG)'}
          </button>
          <button
            type="button"
            onClick={() => loadSampleImage('portrait')}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-brand-500/40 text-xs text-slate-300 hover:text-white transition-all"
          >
            👤 {lang === 'ar' ? 'صورة شخصية' : 'Portrait'}
          </button>
          <button
            type="button"
            onClick={() => loadSampleImage('landscape')}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-brand-500/40 text-xs text-slate-300 hover:text-white transition-all"
          >
            🏔️ {lang === 'ar' ? 'طبيعة (ضغط/دقة)' : 'Landscape (Compress/Upscale)'}
          </button>
        </div>
      </div>

      {/* Paste Notification Toast */}
      {showPasteToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-500 text-white font-bold text-sm shadow-2xl shadow-emerald-500/30 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{lang === 'ar' ? 'تم استيراد الصورة الملصقة بنجاح محلياً!' : 'Pasted image loaded locally!'}</span>
        </div>
      )}
    </div>
  );
};
