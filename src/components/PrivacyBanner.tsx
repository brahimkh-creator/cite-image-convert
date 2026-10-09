import React from 'react';
import { Shield, Zap, WifiOff, Infinity as InfinityIcon, ArrowRight, Lock } from 'lucide-react';
import { translations } from '../translations';

interface PrivacyBannerProps {
  lang: 'ar' | 'en';
  onOpenPrivacyModal: () => void;
  localOperationsCount: number;
}

export const PrivacyBanner: React.FC<PrivacyBannerProps> = ({
  lang,
  onOpenPrivacyModal,
  localOperationsCount
}) => {
  const t = translations[lang];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900/90 to-purple-950/40 border border-brand-500/20 shadow-2xl p-6 sm:p-8 backdrop-blur-md">
      
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Left Side: Headline & Consumer Pitch */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-4">
            <Lock className="w-3.5 h-3.5" />
            <span>{t.privacyBadge}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
            {lang === 'ar' ? (
              <>
                تحويل، ضغط، وتعديل ذكي <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">بدون رفع صورك لأي خادم إطلاقاً!</span>
              </>
            ) : (
              <>
                Convert, Compress & Edit with AI <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">Without Uploading Any Photo to Servers!</span>
              </>
            )}
          </h2>

          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
            {lang === 'ar' 
              ? 'نستخدم معالج حاسوبك (WebAssembly & HTML5 Canvas) لتنفيذ جميع العمليات فورياً على جهازك. أمان بنسبة 100%، بدون انتظار الرفع، وبلا انتهاك لخصوصيتك.'
              : 'Powered by in-browser WebAssembly & HTML5 Canvas. Every single pixel is processed directly on your hardware. Zero uploads, zero delays, 100% privacy.'}
          </p>

          {/* Quick Pillars */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-semibold text-slate-200">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{lang === 'ar' ? 'خصوصية مطلقة' : '100% Private'}</span>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-semibold text-slate-200">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{lang === 'ar' ? 'سرعة فائقة وفورية' : 'Instant & Fast'}</span>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-semibold text-slate-200">
              <WifiOff className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{lang === 'ar' ? 'يعمل بدون إنترنت' : 'Offline Capable'}</span>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-semibold text-slate-200">
              <InfinityIcon className="w-4 h-4 text-purple-400 shrink-0" />
              <span>{lang === 'ar' ? 'بلا حدود أو قيود' : 'Unlimited & Free'}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Trust verification CTA */}
        <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center items-start lg:items-end">
          <button
            onClick={onOpenPrivacyModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-brand-500/20 hover:shadow-brand-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>{t.learnMore}</span>
            <ArrowRight className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
          </button>

          <div className="px-4 py-2 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-400 text-center">
            {lang === 'ar' ? (
              <span>✨ تم إنجاز <strong>{localOperationsCount}</strong> عملية محلية على جهازك بأمان</span>
            ) : (
              <span>✨ <strong>{localOperationsCount}</strong> local operations executed securely</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
