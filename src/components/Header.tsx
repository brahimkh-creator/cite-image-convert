import React from 'react';
import { ShieldCheck, Sparkles, Moon, Sun, Globe, ShieldAlert } from 'lucide-react';
import { translations } from '../translations';
import { NetworkStat } from '../types';

interface HeaderProps {
  lang: 'ar' | 'en';
  setLang: (lang: 'ar' | 'en') => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  onOpenPrivacyModal: () => void;
  networkStat: NetworkStat;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  setLang,
  isDark,
  setIsDark,
  onOpenPrivacyModal,
  networkStat
}) => {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/80 dark:bg-slate-950/80 border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-purple-500 p-[2px] shadow-lg shadow-brand-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-brand-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                {t.appTitle}
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-brand-500/10 text-brand-400 border border-brand-500/30 rounded-full">
                100% Local AI
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Live Security & Zero-Upload Badge */}
        <button
          onClick={onOpenPrivacyModal}
          className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all group shadow-sm hover:shadow-emerald-500/10"
          title={t.learnMore}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span>{t.zeroBytesUploaded}</span>
          <span className="text-[10px] text-emerald-500/70 border-r border-emerald-500/30 pr-2 mr-1">
            {t.learnMore}
          </span>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Privacy Button Mobile */}
          <button
            onClick={onOpenPrivacyModal}
            className="md:hidden p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
            title={t.learnMore}
          >
            <ShieldCheck className="w-5 h-5" />
          </button>

          {/* Language Switch */}
          <button
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-bold transition-all"
            title="تبديل اللغة / Change Language"
          >
            <Globe className="w-4 h-4 text-brand-400" />
            <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
            title="تبديل المظهر"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>
        </div>

      </div>
    </header>
  );
};
