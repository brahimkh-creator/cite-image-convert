import React, { useState } from 'react';
import { 
  FolderArchive, 
  Download, 
  Trash2, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { ImageFileItem, SupportedFormat } from '../types';
import { formatBytes, processImage, createZipArchive } from '../services/imageProcessor';
import { translations } from '../translations';

interface BatchQueueProps {
  items: ImageFileItem[];
  onUpdateItems: (items: ImageFileItem[]) => void;
  onSelectItem: (item: ImageFileItem) => void;
  onClearAll: () => void;
  lang: 'ar' | 'en';
  onOperationCompleted: () => void;
}

export const BatchQueue: React.FC<BatchQueueProps> = ({
  items,
  onUpdateItems,
  onSelectItem,
  onClearAll,
  lang,
  onOperationCompleted
}) => {
  const t = translations[lang];
  const [globalFormat, setGlobalFormat] = useState<SupportedFormat>('image/webp');
  const [globalQuality, setGlobalQuality] = useState<number>(85);
  const [isProcessingAll, setIsProcessingAll] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  const handleApplyGlobalSettings = () => {
    const updated = items.map((item) => ({
      ...item,
      targetFormat: globalFormat,
      quality: globalQuality,
      status: 'idle' as const
    }));
    onUpdateItems(updated);
  };

  const handleProcessAll = async () => {
    setIsProcessingAll(true);
    setProgressPercent(0);

    const updatedList = [...items];

    for (let i = 0; i < updatedList.length; i++) {
      const item = updatedList[i];
      try {
        const result = await processImage(item, globalFormat, globalQuality);
        const savings = item.originalSize > 0 
          ? Math.round(((item.originalSize - result.size) / item.originalSize) * 100)
          : 0;

        updatedList[i] = {
          ...item,
          targetFormat: globalFormat,
          quality: globalQuality,
          resultBlob: result.blob,
          resultUrl: result.url,
          resultSize: result.size,
          resultWidth: result.width,
          resultHeight: result.height,
          timeTakenMs: result.timeMs,
          savingsPercent: savings,
          status: 'done'
        };
        onUpdateItems([...updatedList]);
      } catch (err: any) {
        updatedList[i] = {
          ...item,
          status: 'error',
          errorMessage: err.message || 'Failed'
        };
        onUpdateItems([...updatedList]);
      }

      setProgressPercent(Math.round(((i + 1) / updatedList.length) * 100));
      onOperationCompleted();
    }

    setIsProcessingAll(false);
  };

  const handleDownloadZip = async () => {
    const processed = items.filter((it) => it.status === 'done' && it.resultBlob);
    if (processed.length === 0) return;

    setIsZipping(true);
    try {
      const zipBlob = await createZipArchive(processed);
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pixelforge_batch_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('ZIP generation failed', err);
    } finally {
      setIsZipping(false);
    }
  };

  const handleRemoveItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateItems(items.filter((it) => it.id !== id));
  };

  const doneCount = items.filter((it) => it.status === 'done').length;

  return (
    <div className="flex flex-col gap-6">
      
      {/* Global Batch Controls Bar */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Bulk Format & Quality Selection */}
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">
              {lang === 'ar' ? 'صيغة كل الصور:' : 'Bulk Format:'}
            </label>
            <select
              value={globalFormat}
              onChange={(e) => setGlobalFormat(e.target.value as SupportedFormat)}
              className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-brand-500"
            >
              <option value="image/webp">WebP (موصى به)</option>
              <option value="image/png">PNG</option>
              <option value="image/jpeg">JPG / JPEG</option>
              <option value="image/avif">AVIF</option>
              <option value="image/x-icon">ICO Favicon</option>
              <option value="image/bmp">BMP</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1.5">
              <span>{t.compressionQuality}</span>
              <span className="text-brand-400 font-bold ml-2">{globalQuality}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              value={globalQuality}
              onChange={(e) => setGlobalQuality(Number(e.target.value))}
              className="w-32 accent-brand-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>

          <button
            type="button"
            onClick={handleApplyGlobalSettings}
            className="self-end px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all"
          >
            {lang === 'ar' ? 'تطبيق على الكل' : 'Apply to All'}
          </button>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleProcessAll}
            disabled={isProcessingAll || items.length === 0}
            className="py-3 px-5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-xl shadow-brand-500/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {isProcessingAll ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>
              {isProcessingAll
                ? `${t.processing} (${progressPercent}%)`
                : `${lang === 'ar' ? 'معالجة الكل محلياً' : 'Process All Locally'} (${items.length})`}
            </span>
          </button>

          {doneCount > 0 && (
            <button
              type="button"
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xl shadow-emerald-500/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {isZipping ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FolderArchive className="w-4 h-4" />}
              <span>{t.downloadAllBtn} ({doneCount})</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClearAll}
            className="p-3 rounded-2xl bg-slate-800/80 hover:bg-red-500/20 hover:text-red-400 border border-slate-700/80 text-slate-400 transition-all"
            title={t.clearAllBtn}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Progress Bar when processing */}
      {isProcessingAll && (
        <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-brand-500 to-emerald-500 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Items Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectItem(item)}
            className="group relative overflow-hidden rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-brand-500/50 p-4 transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            {/* Top thumbnail */}
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-950/80 border border-slate-800/80 mb-3 flex items-center justify-center">
              <img
                src={item.resultUrl || item.previewUrl}
                alt={item.name}
                className="max-h-full max-w-full object-contain"
              />

              {/* Status Badge */}
              <div className="absolute top-2 right-2">
                {item.status === 'done' && (
                  <span className="p-1 rounded-full bg-emerald-500/90 text-white shadow-md flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                )}
                {item.status === 'processing' && (
                  <span className="p-1 rounded-full bg-brand-500/90 text-white shadow-md flex items-center justify-center animate-spin">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </span>
                )}
                {item.status === 'error' && (
                  <span className="p-1 rounded-full bg-red-500/90 text-white shadow-md flex items-center justify-center">
                    <AlertCircle className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>

              {/* Delete single button */}
              <button
                type="button"
                onClick={(e) => handleRemoveItem(item.id, e)}
                className="absolute top-2 left-2 p-1.5 rounded-lg bg-slate-950/70 hover:bg-red-500 text-slate-400 hover:text-white transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Meta details */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-white truncate" title={item.name}>
                {item.name}
              </h4>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{formatBytes(item.originalSize)}</span>
                {item.resultSize && (
                  <span className="font-bold text-brand-400">
                    ➔ {formatBytes(item.resultSize)}
                  </span>
                )}
              </div>

              {item.savingsPercent !== undefined && item.status === 'done' && (
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px]">
                  <span className="text-slate-400">{t.savings}</span>
                  <span className={`font-bold ${item.savingsPercent > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {item.savingsPercent > 0 ? `-${item.savingsPercent}%` : '0%'}
                  </span>
                </div>
              )}
            </div>

            {/* Individual Download if ready */}
            {item.status === 'done' && item.resultUrl && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const a = document.createElement('a');
                  a.href = item.resultUrl!;
                  a.download = `converted_${item.name}`;
                  a.click();
                }}
                className="mt-3 w-full py-2 rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t.downloadBtn}</span>
              </button>
            )}

          </div>
        ))}
      </div>

    </div>
  );
};
