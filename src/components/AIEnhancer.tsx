import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Eraser, 
  Scissors, 
  ZoomIn, 
  Wand2, 
  Sliders, 
  Palette, 
  Download, 
  RotateCcw, 
  RefreshCw, 
  CheckCircle2, 
  Paintbrush,
  Eye
} from 'lucide-react';
import { ImageFileItem, AIToolType } from '../types';
import { 
  removeBackground, 
  inpaintMagicEraser, 
  upscaleSuperResolution, 
  autoEnhanceImage, 
  applySmartFilter, 
  applyColorAdjustments 
} from '../services/aiEngine';
import { formatBytes } from '../services/imageProcessor';
import { translations } from '../translations';
import { ComparisonSlider } from './ComparisonSlider';

interface AIEnhancerProps {
  imageItem: ImageFileItem;
  onUpdateItem: (updated: ImageFileItem) => void;
  lang: 'ar' | 'en';
  onOperationCompleted: () => void;
}

export const AIEnhancer: React.FC<AIEnhancerProps> = ({
  imageItem,
  onUpdateItem,
  lang,
  onOperationCompleted
}) => {
  const t = translations[lang];
  const [activeTool, setActiveTool] = useState<AIToolType>('bg-remover');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [bgProgress, setBgProgress] = useState<{ message: string; percent: number } | null>(null);
  const [currentResultUrl, setCurrentResultUrl] = useState<string | null>(imageItem.resultUrl || null);
  const [historyUrls, setHistoryUrls] = useState<string[]>([]);

  // BG Remover state
  const [bgMode, setBgMode] = useState<'transparent' | 'color' | 'blur'>('transparent');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [bgSensitivity, setBgSensitivity] = useState<number>(45);

  // Magic Eraser State
  const [brushSize, setBrushSize] = useState<number>(20);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Super Resolution State
  const [scaleFactor, setScaleFactor] = useState<2 | 4>(2);
  const [sharpnessLevel, setSharpnessLevel] = useState<number>(3);

  // Color Adjustments State
  const [brightness, setBrightness] = useState<number>(0);
  const [contrast, setContrast] = useState<number>(0);
  const [saturation, setSaturation] = useState<number>(0);
  const [blur, setBlur] = useState<number>(0);

  // Init mask canvas when switching to eraser
  useEffect(() => {
    if (activeTool === 'magic-eraser' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d')!;
      
      // Load source image to mask canvas
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
        // Create offscreen mask canvas
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = img.naturalWidth;
        maskCanvas.height = img.naturalHeight;
        maskCanvasRef.current = maskCanvas;
      };
      img.src = currentResultUrl || imageItem.previewUrl;
    }
  }, [activeTool, currentResultUrl, imageItem.previewUrl]);

  // Drawing handlers for Magic Eraser
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    draw(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const handleMouseUp = () => setIsDrawing(false);

  const draw = (offsetX: number, offsetY: number) => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!canvas || !maskCanvas) return;

    const ctx = canvas.getContext('2d')!;
    const maskCtx = maskCanvas.getContext('2d')!;

    const scaleX = canvas.width / canvas.clientWidth;
    const scaleY = canvas.height / canvas.clientHeight;

    const x = offsetX * scaleX;
    const y = offsetY * scaleY;
    const radius = brushSize * scaleX;

    // Draw red overlay on visual canvas
    ctx.fillStyle = 'rgba(239, 68, 68, 0.45)'; // Semi-transparent red
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw on mask canvas
    maskCtx.fillStyle = 'rgba(255, 0, 0, 1.0)';
    maskCtx.beginPath();
    maskCtx.arc(x, y, radius, 0, Math.PI * 2);
    maskCtx.fill();
  };

  const clearMask = () => {
    if (canvasRef.current && maskCanvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')!;
      const maskCtx = maskCanvasRef.current.getContext('2d')!;
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      maskCtx.clearRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
    }
  };

  const updateResult = (blob: Blob, url: string, timeMs: number, w?: number, h?: number) => {
    if (currentResultUrl) {
      setHistoryUrls((prev) => [...prev, currentResultUrl]);
    }
    setCurrentResultUrl(url);

    const updated: ImageFileItem = {
      ...imageItem,
      resultBlob: blob,
      resultUrl: url,
      resultSize: blob.size,
      resultWidth: w || imageItem.width,
      resultHeight: h || imageItem.height,
      timeTakenMs: timeMs,
      status: 'done'
    };
    onUpdateItem(updated);
    onOperationCompleted();
  };

  // 1. Run Background Removal
  const handleRemoveBg = async () => {
    setIsProcessing(true);
    setBgProgress({
      message: lang === 'ar' ? 'جاري بدء عزل الخلفية بالذكاء الاصطناعي...' : 'Starting AI background removal...',
      percent: 10
    });
    try {
      const source = currentResultUrl || imageItem.previewUrl;
      const res = await removeBackground(source, {
        bgMode,
        bgColor,
        onProgress: (p) => setBgProgress(p)
      });
      updateResult(res.blob, res.url, res.timeMs);
    } catch (err) {
      console.error('BG removal failed', err);
    } finally {
      setIsProcessing(false);
      setBgProgress(null);
    }
  };

  // 2. Run Magic Eraser
  const handleMagicEraser = async () => {
    if (!maskCanvasRef.current) return;
    setIsProcessing(true);
    try {
      const source = currentResultUrl || imageItem.previewUrl;
      const res = await inpaintMagicEraser(source, maskCanvasRef.current, Math.round(brushSize / 2));
      updateResult(res.blob, res.url, res.timeMs);
      clearMask();
    } catch (err) {
      console.error('Inpainting failed', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. Run Super Resolution
  const handleSuperResolution = async () => {
    setIsProcessing(true);
    try {
      const source = currentResultUrl || imageItem.previewUrl;
      const res = await upscaleSuperResolution(source, scaleFactor, sharpnessLevel);
      updateResult(res.blob, res.url, res.timeMs, res.width, res.height);
    } catch (err) {
      console.error('Super-resolution failed', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. Run Auto Enhance
  const handleAutoEnhance = async () => {
    setIsProcessing(true);
    try {
      const source = currentResultUrl || imageItem.previewUrl;
      const res = await autoEnhanceImage(source);
      updateResult(res.blob, res.url, res.timeMs);
    } catch (err) {
      console.error('Auto enhance failed', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // 5. Run Smart Filters
  const handleFilter = async (preset: 'cyberpunk' | 'cinematic' | 'bw-pro' | 'golden-hour' | 'vintage' | 'vivid') => {
    setIsProcessing(true);
    try {
      const source = currentResultUrl || imageItem.previewUrl;
      const res = await applySmartFilter(source, preset);
      updateResult(res.blob, res.url, res.timeMs);
    } catch (err) {
      console.error('Filter failed', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // 6. Run Color Adjustments
  const handleColorAdjust = async () => {
    setIsProcessing(true);
    try {
      const source = currentResultUrl || imageItem.previewUrl;
      const res = await applyColorAdjustments(source, {
        brightness,
        contrast,
        saturation,
        blur
      });
      updateResult(res.blob, res.url, 15);
    } catch (err) {
      console.error('Color adjust failed', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Undo / Reset
  const handleReset = () => {
    setCurrentResultUrl(null);
    setHistoryUrls([]);
    onUpdateItem({
      ...imageItem,
      resultBlob: undefined,
      resultUrl: undefined,
      resultSize: undefined,
      status: 'idle'
    });
  };

  const handleDownload = () => {
    if (!currentResultUrl) return;
    const link = document.createElement('a');
    link.href = currentResultUrl;
    const base = imageItem.name.substring(0, imageItem.name.lastIndexOf('.')) || imageItem.name;
    link.download = `${base}_ai_enhanced.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Left Column: Visual Canvas / Comparison Slider */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        
        {activeTool === 'magic-eraser' ? (
          // Interactive drawing area for inpainting
          <div className="relative w-full aspect-[4/3] max-h-[520px] rounded-2xl overflow-hidden shadow-2xl border border-brand-500/30 bg-slate-900 select-none flex items-center justify-center">
            {/* Base Image */}
            <img
              src={currentResultUrl || imageItem.previewUrl}
              alt="Source"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />
            {/* Overlay Drawing Canvas */}
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="absolute inset-0 w-full h-full object-contain cursor-crosshair z-20"
            />
            <div className="absolute top-3 left-3 z-30 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700 text-xs font-bold text-white flex items-center gap-1.5">
              <Paintbrush className="w-3.5 h-3.5 text-red-400" />
              <span>{lang === 'ar' ? 'حدد بالفرشاة فوق ما تريد إزالته' : 'Paint over objects to erase'}</span>
            </div>
          </div>
        ) : currentResultUrl ? (
          <ComparisonSlider
            beforeUrl={imageItem.previewUrl}
            afterUrl={currentResultUrl}
            beforeLabel={lang === 'ar' ? 'الأصلية' : 'Original'}
            afterLabel={lang === 'ar' ? 'تعديل الذكاء الاصطناعي' : 'AI Enhanced'}
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

        {/* Action Controls underneath preview */}
        <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              disabled={!currentResultUrl}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-40"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.resetOriginal}</span>
            </button>
          </div>

          {currentResultUrl && (
            <button
              type="button"
              onClick={handleDownload}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all hover:scale-105"
            >
              <Download className="w-4 h-4" />
              <span>{t.downloadBtn}</span>
            </button>
          )}
        </div>
      </div>

      {/* Right Column: AI Tools Panel */}
      <div className="lg:col-span-5 flex flex-col gap-5 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm">
        
        <div>
          <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-400" />
            <span>{t.aiToolsTitle}</span>
          </h3>
          <p className="text-xs text-slate-400">
            {lang === 'ar'
              ? 'تعديلات متطورة بالذكاء الاصطناعي تتم 100% في حاسوبك بدون أي خوادم خارجية'
              : 'Cutting-edge AI transformations executed locally in your browser memory'}
          </p>
        </div>

        {/* AI Tools Selection Tabs */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'bg-remover', name: t.aiBgRemover, icon: Scissors },
            { id: 'magic-eraser', name: t.aiMagicEraser, icon: Eraser },
            { id: 'super-resolution', name: t.aiSuperRes, icon: ZoomIn },
            { id: 'auto-enhance', name: t.aiAutoEnhance, icon: Wand2 },
            { id: 'smart-filters', name: t.aiFilters, icon: Palette },
            { id: 'color-adjust', name: t.aiAdjust, icon: Sliders },
          ].map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => setActiveTool(tool.id as AIToolType)}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                  activeTool === tool.id
                    ? 'border-brand-500 bg-brand-500/15 text-brand-300 shadow-md shadow-brand-500/10'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="text-[11px] font-bold line-clamp-1">{tool.name}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Tool Controls */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col gap-4">
          
          {/* Tool 1: BG Remover */}
          {activeTool === 'bg-remover' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  {lang === 'ar' ? 'نوع الخلفية البديلة:' : 'Replacement Background:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBgMode('transparent')}
                    className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold transition-all ${
                      bgMode === 'transparent' ? 'border-brand-500 bg-brand-500/20 text-brand-300' : 'border-slate-800 text-slate-400'
                    }`}
                  >
                    {t.bgModeTransparent}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBgMode('color')}
                    className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold transition-all ${
                      bgMode === 'color' ? 'border-brand-500 bg-brand-500/20 text-brand-300' : 'border-slate-800 text-slate-400'
                    }`}
                  >
                    {t.bgModeColor}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBgMode('blur')}
                    className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold transition-all ${
                      bgMode === 'blur' ? 'border-brand-500 bg-brand-500/20 text-brand-300' : 'border-slate-800 text-slate-400'
                    }`}
                  >
                    {t.bgModeBlur}
                  </button>
                </div>
              </div>

              {bgMode === 'color' && (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-300">{lang === 'ar' ? 'اختر اللون:' : 'Color:'}</span>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-xs text-slate-400 font-mono">{bgColor}</span>
                </div>
              )}

              {/* Neural AI Feature Highlight */}
              <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs text-brand-300 leading-relaxed flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  {lang === 'ar'
                    ? 'يعتمد على نموذج الذكاء الاصطناعي العصبي (IS-Net) لفصل الشخصيات، الرسوم، والملابس بدقة عالية بدون مسح تفاصيل الجسم.'
                    : 'Powered by IS-Net neural network to segment anime characters, clothes, and people with fine hairline precision.'}
                </span>
              </div>

              {/* Live Progress Bar */}
              {isProcessing && bgProgress && (
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-900 border border-brand-500/30">
                  <div className="flex justify-between text-xs text-slate-300 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 text-brand-400 animate-spin" />
                      {bgProgress.message}
                    </span>
                    <span className="font-bold text-brand-400">{bgProgress.percent}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-brand-500 via-indigo-500 to-purple-500 h-full transition-all duration-300"
                      style={{ width: `${bgProgress.percent}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleRemoveBg}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-brand-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Scissors className="w-4 h-4" />}
                <span>
                  {isProcessing 
                    ? (lang === 'ar' ? 'جاري العزل بالذكاء الاصطناعي...' : 'Segmenting with AI...') 
                    : (lang === 'ar' ? 'عزل وإزالة الخلفية بالذكاء الاصطناعي' : 'Remove Background with AI')}
                </span>
              </button>
            </div>
          )}

          {/* Tool 2: Magic Eraser */}
          {activeTool === 'magic-eraser' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                {t.eraserHint}
              </p>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">{t.brushSize}</span>
                  <span className="text-brand-400 font-bold">{brushSize} px</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={60}
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-full accent-brand-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={clearMask}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
                >
                  {t.clearMask}
                </button>

                <button
                  type="button"
                  onClick={handleMagicEraser}
                  disabled={isProcessing}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-red-500/20 flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] disabled:opacity-50"
                >
                  {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Eraser className="w-4 h-4" />}
                  <span>{t.eraseAction}</span>
                </button>
              </div>
            </div>
          )}

          {/* Tool 3: Super Resolution */}
          {activeTool === 'super-resolution' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  {lang === 'ar' ? 'معامل التكبير الذكي:' : 'Upscale Factor:'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setScaleFactor(2)}
                    className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                      scaleFactor === 2 ? 'border-brand-500 bg-brand-500/20 text-brand-300' : 'border-slate-800 text-slate-400'
                    }`}
                  >
                    {t.upscale2x}
                  </button>
                  <button
                    type="button"
                    onClick={() => setScaleFactor(4)}
                    className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                      scaleFactor === 4 ? 'border-brand-500 bg-brand-500/20 text-brand-300' : 'border-slate-800 text-slate-400'
                    }`}
                  >
                    {t.upscale4x}
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">{lang === 'ar' ? 'حدة التفاصيل العصبية:' : 'Neural Sharpness:'}</span>
                  <span className="text-brand-400 font-bold">{sharpnessLevel} / 5</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={sharpnessLevel}
                  onChange={(e) => setSharpnessLevel(Number(e.target.value))}
                  className="w-full accent-brand-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
              </div>

              <button
                type="button"
                onClick={handleSuperResolution}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ZoomIn className="w-4 h-4" />}
                <span>{lang === 'ar' ? 'تكبير ومضاعفة الدقة الآن' : 'Upscale & Enhance Now'}</span>
              </button>
            </div>
          )}

          {/* Tool 4: Auto Enhance */}
          {activeTool === 'auto-enhance' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                {t.autoEnhanceHint}
              </p>

              <button
                type="button"
                onClick={handleAutoEnhance}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                <span>{lang === 'ar' ? 'تحسين الألوان والإضاءة تلقائياً' : 'Auto Enhance Now'}</span>
              </button>
            </div>
          )}

          {/* Tool 5: Smart Filters */}
          {activeTool === 'smart-filters' && (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300 block">
                {lang === 'ar' ? 'اختر النمط السينمائي:' : 'Select Cinematic Style:'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'cinematic', name: '🎬 سينمائي (Teal & Orange)' },
                  { id: 'cyberpunk', name: '🌆 سايبربانك (نيون)' },
                  { id: 'golden-hour', name: '🌅 الغروب الذهبي' },
                  { id: 'bw-pro', name: '🎞️ أبيض وأسود احترافي' },
                  { id: 'vivid', name: '🌈 ألوان فائقة الحيوية' },
                  { id: 'vintage', name: '📻 فينتاج عتيق' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleFilter(f.id as any)}
                    disabled={isProcessing}
                    className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-200 text-xs font-bold text-right transition-all hover:border-brand-500/40"
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tool 6: Color Adjust */}
          {activeTool === 'color-adjust' && (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">{lang === 'ar' ? 'السطوع:' : 'Brightness:'}</span>
                  <span className="text-brand-400">{brightness}</span>
                </div>
                <input
                  type="range"
                  min={-50}
                  max={50}
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-brand-500 h-2 bg-slate-800 rounded-lg"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">{lang === 'ar' ? 'التباين:' : 'Contrast:'}</span>
                  <span className="text-brand-400">{contrast}</span>
                </div>
                <input
                  type="range"
                  min={-50}
                  max={50}
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full accent-brand-500 h-2 bg-slate-800 rounded-lg"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">{lang === 'ar' ? 'التشبع:' : 'Saturation:'}</span>
                  <span className="text-brand-400">{saturation}</span>
                </div>
                <input
                  type="range"
                  min={-50}
                  max={50}
                  value={saturation}
                  onChange={(e) => setSaturation(Number(e.target.value))}
                  className="w-full accent-brand-500 h-2 bg-slate-800 rounded-lg"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">{lang === 'ar' ? 'التمويه (Blur):' : 'Blur:'}</span>
                  <span className="text-brand-400">{blur} px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={blur}
                  onChange={(e) => setBlur(Number(e.target.value))}
                  className="w-full accent-brand-500 h-2 bg-slate-800 rounded-lg"
                />
              </div>

              <button
                type="button"
                onClick={handleColorAdjust}
                disabled={isProcessing}
                className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg transition-all"
              >
                {t.applyChanges}
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
