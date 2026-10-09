import React, { useState, useEffect } from 'react';
import { Minimize2, Download, Zap, Sparkles, RefreshCw, Layers, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ImageFileItem, SupportedFormat } from '../types';
import { formatBytes, processImage } from '../services/imageProcessor';
import { translations } from '../translations';
import { ComparisonSlider } from './ComparisonSlider';

interface ImageCompressorProps {
  imageItem: ImageFileItem;
  onUpdateItem: (updated: ImageFileItem) => void;
  lang: 'ar' | 'en';
  onOperationCompleted: () => void;
}

export const ImageCompressor: React.FC<ImageCompressorProps> = ({
  imageItem,
  onUpdateItem,
  lang,
  onOperationCompleted
}) => {
  const t = translations[lang];
  const [quality, setQuality] = useState<number>(imageItem.quality || 80);
  const [format, setFormat] = useState<SupportedFormat>(imageItem.targetFormat || 'image/webp');
  const [scale, setScale] = useState<number>(imageItem.scalePercent || 100);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [preset, setPreset] = useState<'max' | 'balanced' | 'high' | 'custom'>('balanced');

  const handlePresetChange = (selected: 'max' | 'balanced' | 'high') => {
    setPreset(selected);
    if (selected === 'max') {
      setQuality(60);
      setScale(80);
      setFormat('image/webp');
    } else if (selected === 'balanced') {
      setQuality(80);
      setScale(100);
      setFormat('image/webp');
    } else if (selected === 'high') {
      setQuality(92);
      setScale(100);
      setFormat('image/webp');
    }
  };

  const handleCompress = async () => {
    setIsProcessing(true);
    try {
      const result = await processImage(imageItem, format, quality, scale);

      const savings = imageItem.originalSize > 0 
        ? Math.round(((imageItem.originalSize - result.size) / imageItem.originalSize) * 100)
        : 0;

      // Celebrate high savings with confetti!
      if (savings >= 40) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 }
        });
      }

      const updated: ImageFileItem = {
        ...imageItem,
        targetFormat: format,
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
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!imageItem.resultBlob || !imageItem.resultUrl) return;

    let ext = 'webp';
    if (format === 'image/jpeg') ext = 'jpg';
    if (format === 'image/png') ext = 'png';
    if (format === 'image/avif') ext = 'avif';

    const baseName = imageItem.name.substring(0, imageItem.name.lastIndexOf('.')) || imageItem.name;
    const downloadName = `${baseName}_compressed.${ext}`;

    const link = document.createElement('a');
    link.href = imageItem.resultUrl;
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Left Column: Visual Before / After Comparison */}
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
              {imageItem.name} • {formatBytes(imageItem.originalSize)}
            </div>
          </div>
        )}

        {/* Big Savings Metric Display */}
        {imageItem.resultSize && (
          <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900/80 to-indigo-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-xs text-slate-300 font-semibold block">
                  {lang === 'ar' ? 'تم توفير المساحة بنجاح محلياً' : 'Local Compression Completed'}
                </span>
                <span className="text-lg font-black text-white">
                  {formatBytes(imageItem.originalSize)} ➔ <span className="text-emerald-400">{formatBytes(imageItem.resultSize)}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black text-lg">
                {(imageItem.savingsPercent || 0) > 0 ? `-${imageItem.savingsPercent}% ⚡` : '0%'}
              </div>
              <span className="text-xs text-slate-400">
                {imageItem.timeTakenMs} {t.ms}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Compression Controls */}
      <div className="lg:col-span-5 flex flex-col gap-6 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm">
        
        <div>
          <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
            <Minimize2 className="w-5 h-5 text-emerald-400" />
            <span>{t.tabCompress}</span>
          </h3>
          <p className="text-xs text-slate-400">
            {lang === 'ar'
              ? 'ضغط ذكي يقلل الحجم حتى 85% مع الحفاظ على وضوح التفاصيل بالعين المجردة'
              : 'Smart compression reduces size by up to 85% while keeping visual fidelity'}
          </p>
        </div>

        {/* Compression Presets */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">
            {lang === 'ar' ? 'أنماط الضغط الجاهزة:' : 'Compression Presets:'}
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handlePresetChange('max')}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                preset === 'max'
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                  : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:text-white'
              }`}
            >
              <span className="text-xs font-bold block">{t.presetMaxSaving}</span>
              <span className="text-[10px] text-slate-400">{lang === 'ar' ? 'توفير قصوي' : 'Max savings'}</span>
            </button>

            <button
              type="button"
              onClick={() => handlePresetChange('balanced')}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                preset === 'balanced'
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                  : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:text-white'
              }`}
            >
              <span className="text-xs font-bold block">{t.presetBalanced}</span>
              <span className="text-[10px] text-slate-400">{lang === 'ar' ? 'موصى به' : 'Recommended'}</span>
            </button>

            <button
              type="button"
              onClick={() => handlePresetChange('high')}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                preset === 'high'
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                  : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:text-white'
              }`}
            >
              <span className="text-xs font-bold block">{t.presetHighQuality}</span>
              <span className="text-[10px] text-slate-400">{lang === 'ar' ? 'جودة عالية' : 'High quality'}</span>
            </button>
          </div>
        </div>

        {/* Quality Fine Tuning */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-300">{t.compressionQuality}</span>
            <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold">
              {quality}%
            </span>
          </div>
          <input
            type="range"
            min={10}
            max={100}
            step={1}
            value={quality}
            onChange={(e) => {
              setQuality(Number(e.target.value));
              setPreset('custom');
            }}
            className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />
        </div>

        {/* Output Format for Compressor */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <label className="text-xs font-semibold text-slate-300 block">
            {lang === 'ar' ? 'صيغة الضغط الموصى بها:' : 'Compression Output Format:'}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'image/webp', name: 'WebP (الأفضل)' },
              { id: 'image/jpeg', name: 'JPG' },
              { id: 'image/avif', name: 'AVIF' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFormat(f.id as SupportedFormat)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  format === f.id
                    ? 'border-brand-500 bg-brand-500/20 text-brand-300'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:text-white'
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>

        {/* Dimension Scale */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-300">{t.scaleDimensions}</span>
            <span className="text-slate-400 font-bold">
              {scale}% ({Math.round(imageItem.width * (scale / 100))} × {Math.round(imageItem.height * (scale / 100))} px)
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[25, 50, 75, 100].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setScale(s);
                  setPreset('custom');
                }}
                className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  scale === s
                    ? 'bg-emerald-600 border-emerald-500 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {s}%
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleCompress}
            disabled={isProcessing}
            className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{t.processing}</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>{t.compressBtn}</span>
              </>
            )}
          </button>

          {imageItem.resultUrl && (
            <button
              type="button"
              onClick={handleDownload}
              className="py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
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
