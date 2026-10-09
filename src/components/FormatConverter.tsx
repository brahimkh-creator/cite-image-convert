import React, { useState } from 'react';
import { ArrowRight, Download, RefreshCw, Zap, Sliders, CheckCircle2, ShieldAlert } from 'lucide-react';
import { ImageFileItem, SupportedFormat } from '../types';
import { formatBytes, processImage } from '../services/imageProcessor';
import { translations } from '../translations';
import { ComparisonSlider } from './ComparisonSlider';

interface FormatConverterProps {
  imageItem: ImageFileItem;
  onUpdateItem: (updated: ImageFileItem) => void;
  lang: 'ar' | 'en';
  onOperationCompleted: () => void;
}

const FORMAT_OPTIONS: { format: SupportedFormat; label: string; desc: string; ext: string; isLossless?: boolean }[] = [
  { format: 'image/webp', label: 'WebP', desc: 'أفضل صيغة عصرية لسرعة المواقع', ext: 'webp' },
  { format: 'image/png', label: 'PNG', desc: 'يدعم الشفافية وجودة بلا ضياع', ext: 'png', isLossless: true },
  { format: 'image/jpeg', label: 'JPG / JPEG', desc: 'الأكثر توافقاً للصور الفوتوغرافية', ext: 'jpg' },
  { format: 'image/avif', label: 'AVIF', desc: 'تقنية ضغط متطورة بحجم أصغر بـ 50%', ext: 'avif' },
  { format: 'image/x-icon', label: 'ICO (Favicon)', desc: 'أيقونة مواقع متعددة المقاسات', ext: 'ico', isLossless: true },
  { format: 'image/bmp', label: 'BMP', desc: 'صيغة نقطية أصلية غير مضغوطة', ext: 'bmp', isLossless: true },
  { format: 'image/svg+xml', label: 'SVG', desc: 'متجه قابل للتكبير اللانهائي', ext: 'svg', isLossless: true }
];

export const FormatConverter: React.FC<FormatConverterProps> = ({
  imageItem,
  onUpdateItem,
  lang,
  onOperationCompleted
}) => {
  const t = translations[lang];
  const [selectedFormat, setSelectedFormat] = useState<SupportedFormat>(imageItem.targetFormat || 'image/webp');
  const [quality, setQuality] = useState<number>(imageItem.quality || 85);
  const [scale, setScale] = useState<number>(imageItem.scalePercent || 100);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleConvert = async () => {
    setIsProcessing(true);
    try {
      const result = await processImage(imageItem, selectedFormat, quality, scale);

      const savings = imageItem.originalSize > 0 
        ? Math.round(((imageItem.originalSize - result.size) / imageItem.originalSize) * 100)
        : 0;

      const updated: ImageFileItem = {
        ...imageItem,
        targetFormat: selectedFormat,
        quality,
        scalePercent: scale,
        resultBlob: result.blob,
        resultUrl: result.url,
        resultSize: result.size,
        resultWidth: result.width,
        resultHeight: result.height,
        timeTakenMs: result.timeMs,
        savingsPercent: savings,
        status: 'done'
      };

      onUpdateItem(updated);
      onOperationCompleted();
    } catch (err: any) {
      console.error(err);
      onUpdateItem({
        ...imageItem,
        status: 'error',
        errorMessage: err.message || 'Conversion failed'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!imageItem.resultBlob || !imageItem.resultUrl) return;

    let ext = 'webp';
    const opt = FORMAT_OPTIONS.find((f) => f.format === imageItem.targetFormat);
    if (opt) ext = opt.ext;

    const baseName = imageItem.name.substring(0, imageItem.name.lastIndexOf('.')) || imageItem.name;
    const downloadName = `${baseName}_converted.${ext}`;

    const link = document.createElement('a');
    link.href = imageItem.resultUrl;
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentOption = FORMAT_OPTIONS.find((f) => f.format === selectedFormat);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Left Column: Visual Preview or Split Comparison */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        {imageItem.resultUrl ? (
          <ComparisonSlider
            beforeUrl={imageItem.previewUrl}
            afterUrl={imageItem.resultUrl}
            beforeLabel={`${t.originalSize} ${formatBytes(imageItem.originalSize)}`}
            afterLabel={`${t.newSize} ${formatBytes(imageItem.resultSize || 0)}`}
            lang={lang}
          />
        ) : (
          <div className="relative w-full aspect-[4/3] max-h-[520px] rounded-2xl overflow-hidden shadow-xl border border-slate-800 bg-slate-900 flex items-center justify-center p-4">
            <img
              src={imageItem.previewUrl}
              alt={imageItem.name}
              className="max-h-full max-w-full object-contain rounded-lg"
            />
            <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md text-xs font-semibold text-slate-300 border border-slate-800">
              {imageItem.name} • {imageItem.width} × {imageItem.height} px
            </div>
          </div>
        )}

        {/* Live Performance & Savings Card */}
        {imageItem.resultSize && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div>
              <span className="text-[11px] text-slate-400 block">{t.originalSize}</span>
              <span className="text-sm font-bold text-slate-200">{formatBytes(imageItem.originalSize)}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">{t.newSize}</span>
              <span className="text-sm font-bold text-brand-400">{formatBytes(imageItem.resultSize)}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">{t.savings}</span>
              <span className={`text-sm font-bold ${(imageItem.savingsPercent || 0) > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {(imageItem.savingsPercent || 0) > 0 ? `-${imageItem.savingsPercent}% ⚡` : `+${Math.abs(imageItem.savingsPercent || 0)}%`}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">{t.timeElapsed}</span>
              <span className="text-sm font-bold text-purple-400">{imageItem.timeTakenMs} {t.ms}</span>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Conversion Controls */}
      <div className="lg:col-span-5 flex flex-col gap-6 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm">
        
        <div>
          <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-brand-400" />
            <span>{t.tabConvert}</span>
          </h3>
          <p className="text-xs text-slate-400">
            {lang === 'ar' 
              ? 'اختر الصيغة المستهدفة ومستوى الجودة المطلوب للتحويل محلياً فوراً' 
              : 'Select target format and quality level for instant client conversion'}
          </p>
        </div>

        {/* Format Selector Grid */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">
            {lang === 'ar' ? 'صيغة الإخراج المستهدفة:' : 'Target Output Format:'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {FORMAT_OPTIONS.map((f) => (
              <button
                key={f.format}
                type="button"
                onClick={() => setSelectedFormat(f.format)}
                className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between ${
                  selectedFormat === f.format
                    ? 'border-brand-500 bg-brand-500/15 shadow-md shadow-brand-500/10'
                    : 'border-slate-800 bg-slate-950/50 hover:bg-slate-800/50 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className={`text-sm font-extrabold ${selectedFormat === f.format ? 'text-brand-300' : 'text-white'}`}>
                    .{f.ext.toUpperCase()}
                  </span>
                  {selectedFormat === f.format && <CheckCircle2 className="w-4 h-4 text-brand-400" />}
                </div>
                <span className="text-[10px] text-slate-400 line-clamp-1 leading-snug">
                  {lang === 'ar' ? f.desc : f.format.split('/')[1]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Quality Slider (for lossy formats) */}
        {!currentOption?.isLossless && (
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-300">{t.compressionQuality}</span>
              <span className="px-2 py-0.5 rounded-lg bg-brand-500/20 text-brand-300 font-bold">
                {quality}%
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              step={1}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full accent-brand-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{lang === 'ar' ? 'حجم أصغر' : 'Smaller Size'}</span>
              <span>{lang === 'ar' ? 'جودة أعلى' : 'Higher Quality'}</span>
            </div>
          </div>
        )}

        {/* Dimensions Scale Slider */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-300">{t.scaleDimensions}</span>
            <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold">
              {scale}% ({Math.round(imageItem.width * (scale / 100))} × {Math.round(imageItem.height * (scale / 100))} px)
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[25, 50, 75, 100].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setScale(s)}
                className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  scale === s
                    ? 'bg-brand-600 border-brand-500 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {s}%
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleConvert}
            disabled={isProcessing}
            className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-brand-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{t.processing}</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>{t.convertBtn}</span>
              </>
            )}
          </button>

          {imageItem.resultUrl && (
            <button
              type="button"
              onClick={handleDownload}
              className="py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              <span>{t.downloadBtn}</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
