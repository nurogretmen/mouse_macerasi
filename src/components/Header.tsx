import React from 'react';
import { Volume2, VolumeX, BookOpen, Sparkles } from 'lucide-react';
import { InteractiveMouseWidget } from './InteractiveMouseWidget.tsx';

interface HeaderProps {
  soundEnabled: boolean;
  onSoundToggle: () => void;
  onGoHome: () => void;
  onOpenGuide: () => void;
  activeActivityTitle?: string;
  isGameActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  soundEnabled,
  onSoundToggle,
  onGoHome,
  onOpenGuide,
  activeActivityTitle,
  isGameActive,
}) => {
  return (
    <header className="w-full bg-white/95 backdrop-blur-xs border-b border-slate-200 py-2.5 px-3 sm:px-6 select-none z-30 sticky top-0 shadow-2xs">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo and App Title */}
        <div
          onClick={onGoHome}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none group shrink-0"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 border border-blue-600 shadow-xs flex items-center justify-center text-white text-lg sm:text-xl group-hover:scale-105 transition-transform">
            🖱️
          </div>
          <div>
            <h1 className="font-black text-sm sm:text-lg text-slate-800 leading-none group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
              <span>Mouse Macerası</span>
              <span className="hidden sm:inline-block text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                Nur Öğretmen
              </span>
            </h1>
            <p className="text-[10px] sm:text-xs font-semibold text-slate-500 mt-0.5 max-w-[180px] sm:max-w-none truncate">
              {isGameActive && activeActivityTitle
                ? activeActivityTitle
                : 'İlkokul Çocukları İçin Eğlenceli Fare Eğitimi'}
            </p>
          </div>
        </div>

        {/* Right Section: Canlı Mouse Simge Algılayıcı + Uygulama Rehberi + Ses Butonu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Canlı Mouse Tuş Algılayıcı Simgesi */}
          <InteractiveMouseWidget />

          {/* Uygulama / Tuş Rehberi Butonu */}
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 cursor-pointer font-extrabold text-xs transition-colors shadow-2xs"
            title="Mouse Tutuşu ve Tuş Rehberini Görüntüle"
          >
            <BookOpen className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="hidden md:inline">Uygulama Rehberi</span>
            <span className="md:hidden">Rehber</span>
          </button>

          {/* Ses Aç / Kapat Butonu */}
          <button
            onClick={onSoundToggle}
            className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer transition-colors flex items-center gap-1.5 text-xs font-bold shrink-0 shadow-2xs"
            title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-emerald-600" />
                <span className="hidden lg:inline text-slate-600">Ses Açık</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-rose-500" />
                <span className="hidden lg:inline text-slate-400">Ses Kapalı</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
