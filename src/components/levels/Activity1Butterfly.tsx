import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, HelpCircle, RotateCcw } from 'lucide-react';
import { soundEffects } from '../../utils/audio.ts';

interface Activity1ButterflyProps {
  soundEnabled: boolean;
  onComplete: (stars: number, score: number) => void;
  onSoundToggle: () => void;
}

interface FlowerStop {
  id: number;
  x: number; // percentage
  y: number; // percentage
  flowerColor: string;
  flowerEmoji: string;
  butterflyColor: string;
  title: string;
}

const FLOWER_STOPS: FlowerStop[] = [
  { id: 1, x: 20, y: 35, flowerColor: '#f43f5e', flowerEmoji: '🌹', butterflyColor: '#38bdf8', title: 'Kırmızı Gül' },
  { id: 2, x: 75, y: 25, flowerColor: '#eab308', flowerEmoji: '🌻', butterflyColor: '#ec4899', title: 'Sarı Ayçiçeği' },
  { id: 3, x: 45, y: 65, flowerColor: '#a855f7', flowerEmoji: '🪻', butterflyColor: '#facc15', title: 'Mor Lavanta' },
  { id: 4, x: 15, y: 70, flowerColor: '#ec4899', flowerEmoji: '🌸', butterflyColor: '#a78bfa', title: 'Pembe Papatya' },
  { id: 5, x: 80, y: 70, flowerColor: '#06b6d4', flowerEmoji: '🪷', butterflyColor: '#34d399', title: 'Mavi Nilüfer' },
  { id: 6, x: 50, y: 30, flowerColor: '#f97316', flowerEmoji: '🌺', butterflyColor: '#f87171', title: 'Turuncu Lale' },
  { id: 7, x: 30, y: 20, flowerColor: '#3b82f6', flowerEmoji: '🪻', butterflyColor: '#60a5fa', title: 'Mavi Sümbül' },
  { id: 8, x: 70, y: 45, flowerColor: '#10b981', flowerEmoji: '🍀', butterflyColor: '#fb923c', title: 'Yonca Tepesi' },
  { id: 9, x: 35, y: 80, flowerColor: '#e11d48', flowerEmoji: '🌷', butterflyColor: '#c084fc', title: 'Kırmızı Lale' },
  { id: 10, x: 85, y: 35, flowerColor: '#8b5cf6', flowerEmoji: '🌸', butterflyColor: '#f472b6', title: 'Orkide Köşesi' },
  { id: 11, x: 20, y: 50, flowerColor: '#eab308', flowerEmoji: '🌼', butterflyColor: '#38bdf8', title: 'Sarı Papatya' },
  { id: 12, x: 55, y: 50, flowerColor: '#ec4899', flowerEmoji: '🌺', butterflyColor: '#fbbf24', title: 'Büyük Çiçek Bahçesi' },
];

export const Activity1Butterfly: React.FC<Activity1ButterflyProps> = ({
  soundEnabled,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [hoverProgress, setHoverProgress] = useState(0); // 0 to 100
  const [isHovering, setIsHovering] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [score, setScore] = useState(0);
  const hoverTimerRef = useRef<any>(null);

  const targetCount = FLOWER_STOPS.length;
  const currentStop = FLOWER_STOPS[currentStep] || FLOWER_STOPS[targetCount - 1];

  // Progressive hover fill (requires ~0.7s steady hover to fly)
  useEffect(() => {
    if (isHovering && !isFlying) {
      hoverTimerRef.current = setInterval(() => {
        setHoverProgress((prev) => {
          if (prev >= 100) {
            clearInterval(hoverTimerRef.current);
            triggerFlyNext();
            return 100;
          }
          return prev + 12;
        });
      }, 70);
    } else {
      if (hoverTimerRef.current) clearInterval(hoverTimerRef.current);
      setHoverProgress(0);
    }

    return () => {
      if (hoverTimerRef.current) clearInterval(hoverTimerRef.current);
    };
  }, [isHovering, isFlying]);

  const triggerFlyNext = () => {
    setIsFlying(true);
    soundEffects.playStar(soundEnabled);
    setScore((prev) => prev + 25);

    const nextIdx = currentStep + 1;

    setTimeout(() => {
      if (nextIdx >= targetCount) {
        soundEffects.playFanfare(soundEnabled);
        onComplete(3, score + 50);
      } else {
        setCurrentStep(nextIdx);
        setIsFlying(false);
        setIsHovering(false);
        setHoverProgress(0);
      }
    }, 750);
  };

  const handleMouseEnter = () => {
    if (!isFlying) {
      setIsHovering(true);
      soundEffects.playPop(soundEnabled);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setHoverProgress(0);
    setIsHovering(false);
    setIsFlying(false);
    setScore(0);
    soundEffects.playPop(soundEnabled);
  };

  return (
    <div className="w-full max-w-5xl bg-white rounded-3xl border-4 border-sky-200 shadow-xl overflow-hidden flex flex-col select-none">
      {/* Level Header Bar */}
      <div className="bg-gradient-to-r from-sky-100 to-sky-200 px-5 py-3.5 border-b-2 border-sky-300 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="px-3 py-1 rounded-full bg-sky-600 text-white font-black text-xs shadow-xs">
            Etkinlik 1
          </span>
          <div>
            <h2 className="text-base sm:text-lg font-black text-sky-950">
              Kelebeği Yakala – Çiçek Bahçesi
            </h2>
            <p className="text-xs font-semibold text-sky-800 hidden sm:block">
              Tıklama yapmana gerek yok! Sadece imleci kelebeğin üzerinde biraz tut.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white/90 border border-sky-300 px-3.5 py-1 rounded-full text-xs font-black text-sky-900 shadow-2xs flex items-center gap-1.5">
            <span>🦋</span>
            <span>{currentStep} / {targetCount} Çiçek</span>
          </div>

          <button
            onClick={() => setShowGuide(!showGuide)}
            className="p-1.5 rounded-xl bg-white/80 hover:bg-white text-sky-800 border border-sky-300 cursor-pointer transition-colors"
            title="Nasıl Oynanır?"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={handleRestart}
            className="p-1.5 rounded-xl bg-white/80 hover:bg-white text-sky-800 border border-sky-300 cursor-pointer transition-colors"
            title="Yeniden Başlat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Visual Instruction Banner */}
      {showGuide && (
        <div className="bg-sky-50 border-b border-sky-200 px-5 py-2.5 flex items-center justify-between text-xs sm:text-sm text-sky-900 font-bold">
          <div className="flex items-center gap-2">
            <span className="text-xl">🖱️</span>
            <span>
              <strong>Nasıl Yapılır?</strong> Mouse imlecini çiçeğin üzerindeki kelebeğe doğru kaydır ve üzerinde bekle. Tıklamadan kelebek sevilir ve diğer çiçeğe uçar!
            </span>
          </div>
          <button
            onClick={() => setShowGuide(false)}
            className="text-xs text-sky-700 underline font-extrabold hover:text-sky-900 cursor-pointer ml-2 shrink-0"
          >
            Anladım
          </button>
        </div>
      )}

      {/* Garden Canvas */}
      <div className="relative w-full h-[460px] sm:h-[520px] bg-gradient-to-b from-[#e0f2fe] via-[#ecfccb] to-[#bbf7d0] overflow-hidden">
        {/* Soft Garden Clouds & Grass decor */}
        <div className="absolute top-4 left-10 text-4xl opacity-50 select-none pointer-events-none">☁️</div>
        <div className="absolute top-8 right-20 text-3xl opacity-40 select-none pointer-events-none">☁️</div>
        <div className="absolute top-2 right-8 text-5xl opacity-80 select-none pointer-events-none">☀️</div>

        {/* All flowers background */}
        {FLOWER_STOPS.map((stop, idx) => {
          const isCurrent = idx === currentStep;
          const isVisited = idx < currentStep;

          return (
            <div
              key={stop.id}
              style={{ left: `${stop.x}%`, top: `${stop.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none transition-all duration-300"
            >
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-3xl sm:text-4xl shadow-md transition-all ${
                  isCurrent
                    ? 'scale-125 ring-4 ring-amber-400 bg-white shadow-xl animate-pulse'
                    : isVisited
                    ? 'bg-emerald-100/90 border-2 border-emerald-400 opacity-90'
                    : 'bg-white/70 border-2 border-white/80 opacity-60'
                }`}
              >
                <span>{stop.flowerEmoji}</span>
              </div>
              {isCurrent && (
                <span className="mt-1 bg-amber-400 text-amber-950 font-black text-[11px] px-2 py-0.5 rounded-full shadow-xs whitespace-nowrap animate-bounce">
                  Buraya Gel! 🌸
                </span>
              )}
            </div>
          );
        })}

        {/* The Active Butterfly on Current Flower */}
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            left: `${currentStop.x}%`,
            top: `${currentStop.y}%`,
            transition: 'left 0.7s ease-in-out, top 0.7s ease-in-out, transform 0.2s ease',
          }}
          className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer p-4 select-none ${
            isFlying ? 'scale-150 rotate-12' : isHovering ? 'scale-125' : 'animate-bounce'
          }`}
        >
          {/* Circular Progress Ring when Hovered */}
          <div className="relative w-20 h-20 flex items-center justify-center">
            {isHovering && (
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  stroke="#cbd5e1"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  stroke="#38bdf8"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 34}
                  strokeDashoffset={2 * Math.PI * 34 * (1 - hoverProgress / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-75"
                />
              </svg>
            )}

            {/* Glowing Butterfly */}
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center text-4xl shadow-xl transition-all ${
                isHovering ? 'bg-sky-400 text-white ring-4 ring-sky-300 scale-110' : 'bg-white/90 ring-2 ring-sky-400'
              }`}
            >
              🦋
            </div>

            {/* Sparkle particles */}
            {isHovering && (
              <span className="absolute -top-2 -right-1 text-xl animate-spin">
                ✨
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Level Bottom Progress Bar */}
      <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs font-bold text-slate-600">
        <div className="flex items-center gap-2">
          <span>İlerleme:</span>
          <div className="w-36 sm:w-60 bg-slate-200 h-3 rounded-full overflow-hidden">
            <div
              className="bg-sky-500 h-full transition-all duration-300"
              style={{ width: `${(currentStep / targetCount) * 100}%` }}
            />
          </div>
          <span>%{Math.round((currentStep / targetCount) * 100)}</span>
        </div>

        <div className="text-sky-700 font-extrabold flex items-center gap-1">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>{currentStep === targetCount ? 'Bahçe Tamamlandı!' : 'İmleci kelebeğe doğru kaydır'}</span>
        </div>
      </div>
    </div>
  );
};
