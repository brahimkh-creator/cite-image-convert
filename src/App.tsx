import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowLeftRight, 
  Minimize2, 
  Wand2, 
  Layers, 
  ShieldCheck, 
  Plus, 
  Trash2,
  Lock,
  Heart
} from 'lucide-react';
import { Header } from './components/Header';
import { PrivacyBanner } from './components/PrivacyBanner';
import { DropZone } from './components/DropZone';
import { FormatConverter } from './components/FormatConverter';
import { ImageCompressor } from './components/ImageCompressor';
import { AIEnhancer } from './components/AIEnhancer';
import { BatchQueue } from './components/BatchQueue';
import { PrivacyModal } from './components/PrivacyModal';
import { ImageFileItem, TabType, NetworkStat } from './types';
import { translations } from './translations';
import { privacyAuditor } from './services/privacyTracker';
import { loadImageElement } from './services/imageProcessor';

export const App: React.FC = () => {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [isDark, setIsDark] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabType>('convert');
  const [images, setImages] = useState<ImageFileItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);
  const [networkStat, setNetworkStat] = useState<NetworkStat>(privacyAuditor.getStat());

  const t = translations[lang];

  // Subscribe to privacy auditor
  useEffect(() => {
    const unsub = privacyAuditor.subscribe(setNetworkStat);
    return unsub;
  }, []);

  // Update HTML dir and lang
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  // Update dark mode class
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Handle files selected from DropZone or Paste
  const handleFilesSelected = async (files: File[]) => {
    const newItems: ImageFileItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const previewUrl = URL.createObjectURL(file);
      
      try {
        const img = await loadImageElement(previewUrl);
        const item: ImageFileItem = {
          id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          file,
          name: file.name,
          originalSize: file.size,
          previewUrl,
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height,
          targetFormat: 'image/webp',
          quality: 85,
          scalePercent: 100,
          status: 'idle'
        };
        newItems.push(item);
      } catch (err) {
        console.error('Error loading image', err);
      }
    }

    if (newItems.length > 0) {
      setImages((prev) => [...prev, ...newItems]);
      if (!selectedId) {
        setSelectedId(newItems[0].id);
      }
      // If multiple images are dropped at once, automatically switch to batch queue
      if (newItems.length > 1 && images.length === 0) {
        setActiveTab('batch');
      }
    }
  };

  const selectedImage = images.find((it) => it.id === selectedId) || images[0] || null;

  const handleUpdateItem = (updated: ImageFileItem) => {
    setImages((prev) => prev.map((it) => (it.id === updated.id ? updated : it)));
  };

  const handleClearAll = () => {
    images.forEach((it) => {
      URL.revokeObjectURL(it.previewUrl);
      if (it.resultUrl) URL.revokeObjectURL(it.resultUrl);
    });
    setImages([]);
    setSelectedId(null);
  };

  const handleOperationCompleted = () => {
    privacyAuditor.recordLocalOperation();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans transition-colors duration-300">
      
      {/* Top Navigation & Privacy Status */}
      <Header
        lang={lang}
        setLang={setLang}
        isDark={isDark}
        setIsDark={setIsDark}
        onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
        networkStat={networkStat}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        
        {/* Consumer Trust & Privacy Hero Banner */}
        <PrivacyBanner
          lang={lang}
          onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
          localOperationsCount={networkStat.localOperationsCount}
        />

        {/* Drop Zone Area (Always accessible or collapsible) */}
        <DropZone
          lang={lang}
          onFilesSelected={handleFilesSelected}
        />

        {/* If there are images, show the Studio Controls */}
        {images.length > 0 && selectedImage ? (
          <div className="flex flex-col gap-6">
            
            {/* Tool Tabs Bar & Image Carousel Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
              
              {/* Main Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('convert')}
                  className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    activeTab === 'convert'
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>{t.tabConvert}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('compress')}
                  className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    activeTab === 'compress'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Minimize2 className="w-4 h-4" />
                  <span>{t.tabCompress}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('ai-studio')}
                  className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    activeTab === 'ai-studio'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Wand2 className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>{t.tabAI}</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-amber-400/20 text-amber-300 text-[10px] font-bold">
                    AI
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('batch')}
                  className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    activeTab === 'batch'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>{t.tabBatch} ({images.length})</span>
                </button>
              </div>

              {/* Thumbnails switcher for loaded images */}
              <div className="flex items-center gap-2 overflow-x-auto p-1 max-w-full sm:max-w-xs">
                {images.map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setSelectedId(img.id)}
                    className={`relative w-10 h-10 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      selectedImage.id === img.id
                        ? 'border-brand-500 ring-2 ring-brand-500/40 scale-105'
                        : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img.previewUrl}
                      alt={img.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}

                <button
                  type="button"
                  onClick={handleClearAll}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-red-500/20 hover:text-red-400 text-slate-400 transition-colors"
                  title={t.clearAllBtn}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Active Workspace View */}
            <div className="transition-all duration-300">
              {activeTab === 'convert' && (
                <FormatConverter
                  imageItem={selectedImage}
                  onUpdateItem={handleUpdateItem}
                  lang={lang}
                  onOperationCompleted={handleOperationCompleted}
                />
              )}

              {activeTab === 'compress' && (
                <ImageCompressor
                  imageItem={selectedImage}
                  onUpdateItem={handleUpdateItem}
                  lang={lang}
                  onOperationCompleted={handleOperationCompleted}
                />
              )}

              {activeTab === 'ai-studio' && (
                <AIEnhancer
                  imageItem={selectedImage}
                  onUpdateItem={handleUpdateItem}
                  lang={lang}
                  onOperationCompleted={handleOperationCompleted}
                />
              )}

              {activeTab === 'batch' && (
                <BatchQueue
                  items={images}
                  onUpdateItems={setImages}
                  onSelectItem={(item) => {
                    setSelectedId(item.id);
                    setActiveTab('convert');
                  }}
                  onClearAll={handleClearAll}
                  lang={lang}
                  onOperationCompleted={handleOperationCompleted}
                />
              )}
            </div>

          </div>
        ) : (
          /* Empty State prompt */
          <div className="p-8 rounded-3xl bg-slate-900/30 border border-slate-900 text-center">
            <p className="text-sm text-slate-400">
              {t.addImagesToStart}
            </p>
          </div>
        )}

      </main>

      {/* Footer with consumer reassurance */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>
              {lang === 'ar' 
                ? 'PixelForge AI - جميع الحقوق محفوظة. معالجة محلية 100% داخل المتصفح.' 
                : 'PixelForge AI - All rights reserved. 100% On-device local browser processing.'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsPrivacyModalOpen(true)}
              className="text-slate-300 hover:text-white transition-colors"
            >
              {t.learnMore}
            </button>
            <span className="text-slate-700">•</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {lang === 'ar' ? 'آمن ومحمي بالكامل' : 'Zero Uploads Verified'}
            </span>
          </div>

        </div>
      </footer>

      {/* Reassurance Privacy Modal */}
      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        lang={lang}
        networkStat={networkStat}
      />

    </div>
  );
};
