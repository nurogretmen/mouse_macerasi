import React, { useState } from 'react';
import {
  HelpCircle,
  RotateCcw,
  Sparkles,
  Play,
  ArrowRight,
  Compass,
  Check,
} from 'lucide-react';
import { soundEffects } from '../../utils/audio.ts';

interface Activity4Props {
  soundEnabled: boolean;
  onComplete: (stars: number, score: number) => void;
  onSoundToggle: () => void;
}

export interface TrailLevel {
  levelNum: number;
  title: string;
  subtitle: string;
  stepBadge: string;
  themeEmoji: string;
  bgGradient: string;
  decorations: { emoji: string; x: number; y: number; sizeClass?: string }[];
  instruction: string;
  stones: { x: number; y: number; hasCarrot?: boolean }[];
}

export const TRAILS: TrailLevel[] = [
  // ==========================================
  // 1. SEVİYE: 6 ADIM - DÜZ YEŞİL YOL
  // ==========================================
  {
    levelNum: 1,
    title: '1. Seviye: Düz Yeşil Yol',
    subtitle: 'Hafif ve Düz Patika',
    stepBadge: '6 Adım • 2 Havuç',
    themeEmoji: '🌱',
    bgGradient: 'from-[#dbeafe] via-[#dcfce7] to-[#86efac]',
    decorations: [
      { emoji: '☀️', x: 88, y: 12, sizeClass: 'text-4xl' },
      { emoji: '☁️', x: 18, y: 14, sizeClass: 'text-3xl opacity-60' },
      { emoji: '☁️', x: 62, y: 18, sizeClass: 'text-4xl opacity-50' },
      { emoji: '🌼', x: 10, y: 78, sizeClass: 'text-3xl' },
      { emoji: '🌸', x: 82, y: 80, sizeClass: 'text-3xl' },
      { emoji: '🌳', x: 92, y: 76, sizeClass: 'text-4xl opacity-75' },
    ],
    instruction:
      'Tıklamana hiç gerek yok! Farenin imlecini parlayan taşların üzerinden sırayla kaydırarak tavşanı havuca ulaştır.',
    stones: [
      { x: 14, y: 50 },
      { x: 28, y: 50 },
      { x: 42, y: 50, hasCarrot: true },
      { x: 56, y: 50 },
      { x: 70, y: 50, hasCarrot: true },
      { x: 86, y: 50 },
    ],
  },

  // ==========================================
  // 2. SEVİYE: 7 ADIM - HAFİF EĞİMLİ PATİKA
  // ==========================================
  {
    levelNum: 2,
    title: '2. Seviye: Tepeye Tırmanan Patika',
    subtitle: 'Yukarı ve Aşağı Yumuşak Geçiş',
    stepBadge: '7 Adım • 2 Havuç',
    themeEmoji: '🌿',
    bgGradient: 'from-[#e0f2fe] via-[#ecfccb] to-[#a7f3d0]',
    decorations: [
      { emoji: '🌤️', x: 86, y: 14, sizeClass: 'text-4xl' },
      { emoji: '🦋', x: 28, y: 22, sizeClass: 'text-2xl animate-bounce' },
      { emoji: '☁️', x: 48, y: 14, sizeClass: 'text-3xl opacity-60' },
      { emoji: '🌷', x: 8, y: 84, sizeClass: 'text-3xl' },
      { emoji: '🌲', x: 92, y: 72, sizeClass: 'text-4xl opacity-80' },
    ],
    instruction:
      'Patika bu sefer hafifçe tepeye tırmanıyor! İmlecini sıradaki parlayan taşlara doğru dikkatlice kaydır.',
    stones: [
      { x: 12, y: 64 },
      { x: 24, y: 50 },
      { x: 37, y: 36, hasCarrot: true },
      { x: 50, y: 32 },
      { x: 63, y: 40, hasCarrot: true },
      { x: 75, y: 56 },
      { x: 88, y: 50 },
    ],
  },

  // ==========================================
  // 3. SEVİYE: 8 ADIM - DALGALI ÇİÇEK BAHÇESİ
  // ==========================================
  {
    levelNum: 3,
    title: '3. Seviye: Dalgalı Çiçek Bahçesi',
    subtitle: 'İki Dalgalı Sevimli Yol',
    stepBadge: '8 Adım • 3 Havuç',
    themeEmoji: '🌸',
    bgGradient: 'from-[#fae8ff] via-[#fbcfe8] to-[#bbf7d0]',
    decorations: [
      { emoji: '☀️', x: 85, y: 14, sizeClass: 'text-4xl' },
      { emoji: '🌺', x: 12, y: 20, sizeClass: 'text-3xl' },
      { emoji: '🐝', x: 50, y: 15, sizeClass: 'text-2xl animate-pulse' },
      { emoji: '🪻', x: 92, y: 80, sizeClass: 'text-3xl' },
      { emoji: '🌻', x: 38, y: 82, sizeClass: 'text-3xl' },
    ],
    instruction:
      'Çiçek bahçesinde dalgalar var! Taşların üzerinden bir yukarı bir aşağı yumuşakça süzül.',
    stones: [
      { x: 10, y: 40 },
      { x: 21, y: 62 },
      { x: 32, y: 72, hasCarrot: true },
      { x: 44, y: 50 },
      { x: 56, y: 28, hasCarrot: true },
      { x: 67, y: 42 },
      { x: 78, y: 68, hasCarrot: true },
      { x: 89, y: 46 },
    ],
  },

  // ==========================================
  // 4. SEVİYE: 9 ADIM - ZİKZAK DERE KENARI
  // ==========================================
  {
    levelNum: 4,
    title: '4. Seviye: Zikzak Dere Patikası',
    subtitle: 'Köşeleri Dikkatle Dön',
    stepBadge: '9 Adım • 3 Havuç',
    themeEmoji: '💧',
    bgGradient: 'from-[#cffafe] via-[#bae6fd] to-[#a7f3d0]',
    decorations: [
      { emoji: '🌊', x: 50, y: 88, sizeClass: 'text-3xl opacity-60' },
      { emoji: '🦆', x: 25, y: 82, sizeClass: 'text-2xl' },
      { emoji: '☁️', x: 14, y: 14, sizeClass: 'text-3xl opacity-70' },
      { emoji: '☀️', x: 86, y: 12, sizeClass: 'text-4xl' },
      { emoji: '🌾', x: 90, y: 74, sizeClass: 'text-3xl' },
    ],
    instruction:
      'Derenin kenarındaki zikzak taşları takip et! Farenin imlecini her dönüşte parlayan taşa doğru yönlendir.',
    stones: [
      { x: 10, y: 70 },
      { x: 19, y: 42, hasCarrot: true },
      { x: 30, y: 25 },
      { x: 41, y: 46 },
      { x: 51, y: 72, hasCarrot: true },
      { x: 62, y: 50 },
      { x: 72, y: 26, hasCarrot: true },
      { x: 81, y: 48 },
      { x: 90, y: 35 },
    ],
  },

  // ==========================================
  // 5. SEVİYE: 10 ADIM - SEVİMLİ ORMAN KÖPRÜSÜ
  // ==========================================
  {
    levelNum: 5,
    title: '5. Seviye: Sevimli Orman Köprüsü',
    subtitle: 'Köprüden Geçiş ve Havuçlar',
    stepBadge: '10 Adım • 3 Havuç',
    themeEmoji: '🌲',
    bgGradient: 'from-[#fef3c7] via-[#d9f99d] to-[#6ee7b7]',
    decorations: [
      { emoji: '🌲', x: 8, y: 25, sizeClass: 'text-4xl opacity-85' },
      { emoji: '🌳', x: 92, y: 24, sizeClass: 'text-4xl opacity-85' },
      { emoji: '🐿️', x: 36, y: 78, sizeClass: 'text-2xl' },
      { emoji: '🪵', x: 52, y: 80, sizeClass: 'text-3xl opacity-70' },
      { emoji: '🍄', x: 78, y: 84, sizeClass: 'text-3xl' },
    ],
    instruction:
      'Ormandaki köprüye ulaştın! 10 basamaklık bu harika patikada farenin imlecini sabit tutarak ilerle.',
    stones: [
      { x: 8, y: 74 },
      { x: 16, y: 58 },
      { x: 25, y: 42, hasCarrot: true },
      { x: 35, y: 30 },
      { x: 46, y: 25, hasCarrot: true },
      { x: 56, y: 25 },
      { x: 66, y: 34, hasCarrot: true },
      { x: 75, y: 50 },
      { x: 83, y: 68 },
      { x: 91, y: 52 },
    ],
  },

  // ==========================================
  // 6. SEVİYE: 11 ADIM - KIVRIMLI 'S' PATİKASI
  // ==========================================
  {
    levelNum: 6,
    title: "6. Seviye: Kıvrımlı 'S' Patikası",
    subtitle: 'Geniş Kavisli Büyük Tur',
    stepBadge: '11 Adım • 4 Havuç',
    themeEmoji: '🌀',
    bgGradient: 'from-[#fed7aa] via-[#fef08a] to-[#86efac]',
    decorations: [
      { emoji: '🍎', x: 12, y: 75, sizeClass: 'text-3xl' },
      { emoji: '🍐', x: 88, y: 80, sizeClass: 'text-3xl' },
      { emoji: '☁️', x: 45, y: 12, sizeClass: 'text-4xl opacity-60' },
      { emoji: '☀️', x: 86, y: 15, sizeClass: 'text-4xl' },
      { emoji: '🐞', x: 32, y: 68, sizeClass: 'text-2xl animate-pulse' },
    ],
    instruction:
      "Geniş ve kıvrımlı bir 'S' turu seni bekliyor! Bütün parlak taşların üzerinden sırayla geçerek lezzetli havuçları topla.",
    stones: [
      { x: 9, y: 25 },
      { x: 18, y: 22 },
      { x: 28, y: 28, hasCarrot: true },
      { x: 37, y: 42 },
      { x: 45, y: 58 },
      { x: 52, y: 74, hasCarrot: true },
      { x: 62, y: 76 },
      { x: 72, y: 68, hasCarrot: true },
      { x: 79, y: 50 },
      { x: 86, y: 34, hasCarrot: true },
      { x: 92, y: 46 },
    ],
  },

  // ==========================================
  // 7. SEVİYE: 12 ADIM - MACERALI BAHÇE LABİRENTİ
  // ==========================================
  {
    levelNum: 7,
    title: '7. Seviye: Maceralı Bahçe Labirenti',
    subtitle: '12 Adımlık Usta Patika',
    stepBadge: '12 Adım • 4 Havuç',
    themeEmoji: '🧭',
    bgGradient: 'from-[#e0e7ff] via-[#ddd6fe] to-[#a7f3d0]',
    decorations: [
      { emoji: '🏰', x: 92, y: 16, sizeClass: 'text-4xl opacity-80' },
      { emoji: '🌷', x: 8, y: 20, sizeClass: 'text-3xl' },
      { emoji: '🌼', x: 48, y: 84, sizeClass: 'text-3xl' },
      { emoji: '✨', x: 62, y: 24, sizeClass: 'text-2xl animate-spin' },
      { emoji: '🌈', x: 32, y: 12, sizeClass: 'text-3xl opacity-75' },
    ],
    instruction:
      '12 adımlık büyük bahçe labirenti! Tavşanı köşelerden ustalıkla geçirip büyük havuç sepetine ulaştır.',
    stones: [
      { x: 8, y: 75 },
      { x: 15, y: 56, hasCarrot: true },
      { x: 23, y: 38 },
      { x: 32, y: 24, hasCarrot: true },
      { x: 42, y: 26 },
      { x: 48, y: 48 },
      { x: 54, y: 70, hasCarrot: true },
      { x: 64, y: 74 },
      { x: 72, y: 56, hasCarrot: true },
      { x: 80, y: 36 },
      { x: 87, y: 24 },
      { x: 92, y: 45 },
    ],
  },

  // ==========================================
  // 8. SEVİYE: 14 ADIM - BÜYÜK ŞAMPİYONLUK HAVUÇ ŞÖLENİ
  // ==========================================
  {
    levelNum: 8,
    title: '8. Seviye: Büyük Şampiyonluk Havuç Şöleni',
    subtitle: '14 Adımlık Final Şampiyon Patikası',
    stepBadge: '14 Adım • 5 Havuç',
    themeEmoji: '👑',
    bgGradient: 'from-[#fef08a] via-[#fed7aa] to-[#86efac]',
    decorations: [
      { emoji: '👑', x: 92, y: 20, sizeClass: 'text-4xl animate-bounce' },
      { emoji: '🎈', x: 12, y: 16, sizeClass: 'text-3xl animate-pulse' },
      { emoji: '🎉', x: 84, y: 78, sizeClass: 'text-3xl' },
      { emoji: '☀️', x: 50, y: 12, sizeClass: 'text-4xl' },
      { emoji: '⭐', x: 30, y: 84, sizeClass: 'text-2xl animate-spin' },
    ],
    instruction:
      'Büyük Final Seviyesi! 14 adım boyunca tüm havuçları topla, dev altın havuç sepetine ulaş ve şampiyon ol!',
    stones: [
      { x: 7, y: 48 },
      { x: 13, y: 68 },
      { x: 20, y: 78, hasCarrot: true },
      { x: 27, y: 62 },
      { x: 34, y: 42 },
      { x: 41, y: 24, hasCarrot: true },
      { x: 48, y: 22 },
      { x: 55, y: 38 },
      { x: 62, y: 58, hasCarrot: true },
      { x: 69, y: 74 },
      { x: 76, y: 72, hasCarrot: true },
      { x: 82, y: 54 },
      { x: 88, y: 32, hasCarrot: true },
      { x: 93, y: 48 },
    ],
  },
];

export const Activity4RabbitPath: React.FC<Activity4Props> = ({
  soundEnabled,
  onComplete,
}) => {
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [reachedIndex, setReachedIndex] = useState(0);
  const [showGuide, setShowGuide] = useState(false);
  const [showIntroModal, setShowIntroModal] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [score, setScore] = useState(0);

  const trail = TRAILS[currentLevelIdx];
  const stones = trail.stones;
  const currentBunnyPos = stones[reachedIndex] || stones[0];
  const isLastLevel = currentLevelIdx + 1 === TRAILS.length;

  const handleStoneHover = (idx: number) => {
    if (showIntroModal || showSuccessModal) return;

    // Must be next sequential stone to guide hand-eye coordination
    if (idx === reachedIndex + 1) {
      setReachedIndex(idx);
      soundEffects.playPop(soundEnabled);

      if (stones[idx].hasCarrot) {
        soundEffects.playStar(soundEnabled);
        setScore((s) => s + 15);
      }

      // Reached the final basket
      if (idx === stones.length - 1) {
        soundEffects.playFanfare(soundEnabled);
        setScore((s) => s + 50);
        setShowSuccessModal(true);
      }
    }
  };

  const setupLevel = (levelIdx: number) => {
    setCurrentLevelIdx(levelIdx);
    setReachedIndex(0);
    setShowSuccessModal(false);
    setShowIntroModal(true);
  };

  const handleNextLevel = () => {
    soundEffects.playPop(soundEnabled);
    if (currentLevelIdx + 1 < TRAILS.length) {
      setupLevel(currentLevelIdx + 1);
    } else {
      onComplete(3, score + 100);
    }
  };

  const handleReplayCurrentLevel = () => {
    soundEffects.playPop(soundEnabled);
    setReachedIndex(0);
    setShowSuccessModal(false);
  };

  const handleRestartAll = () => {
    setupLevel(0);
    setScore(0);
    soundEffects.playPop(soundEnabled);
  };

  return (
    <div className="w-full max-w-5xl bg-white rounded-3xl border-4 border-indigo-200 shadow-xl overflow-hidden flex flex-col select-none relative">
      {/* Top Application Header Bar */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 px-4 sm:px-6 py-3.5 text-white flex items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-xl shadow-xs">
            🐰
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black leading-tight">
                Sevimli Tavşan
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] sm:text-xs font-black shadow-xs">
                Seviye {trail.levelNum} / {TRAILS.length}
              </span>
            </div>
            <p className="text-xs text-indigo-100 font-semibold hidden sm:block">
              {trail.title} • {trail.stepBadge}
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          <div className="bg-white/20 border border-white/30 px-3 py-1 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 shadow-2xs">
            <Compass className="w-3.5 h-3.5 text-amber-300" />
            <span>Taş {reachedIndex + 1} / {stones.length}</span>
          </div>

          <button
            onClick={() => setShowGuide(!showGuide)}
            className="p-2 rounded-2xl bg-white/15 hover:bg-white/25 text-white border border-white/30 cursor-pointer transition-colors shadow-2xs"
            title="Nasıl Oynanır?"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={handleRestartAll}
            className="p-2 rounded-2xl bg-white/15 hover:bg-white/25 text-white border border-white/30 cursor-pointer transition-colors shadow-2xs"
            title="1. Seviyeden Yeniden Başlat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Guide Dropdown Bar */}
      {showGuide && (
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-3 flex items-center justify-between text-xs sm:text-sm text-amber-900 font-bold animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💡</span>
            <span>
              <strong>Nasıl Oynanır?</strong> Tıklamana gerek yok! Farenin imlecini sıradaki sarı parlayan taşın üzerine getir. Tavşan senin peşinden zıplayarak havuçları toplasın ve sepete ulaşsın!
            </span>
          </div>
          <button
            onClick={() => setShowGuide(false)}
            className="text-xs text-amber-800 underline font-black hover:text-amber-950 cursor-pointer ml-3 shrink-0"
          >
            Kapat
          </button>
        </div>
      )}

      {/* Current Level Objective Banner */}
      <div className="bg-indigo-50/80 border-b border-indigo-100 px-4 py-2 flex items-center justify-between text-xs text-indigo-900 font-bold">
        <div className="flex items-center gap-2">
          <span className="text-lg">{trail.themeEmoji}</span>
          <span>
            <strong>{trail.subtitle}:</strong> Farenin imlecini parlayan taşlar boyunca kaydır!
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-800 font-black bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-300">
          <span>🥕 {stones.filter((s) => s.hasCarrot).length} Havuç</span>
          <span className="text-slate-400">•</span>
          <span>🐾 {stones.length} Taş</span>
        </div>
      </div>

      {/* Playground Canvas with Responsive Stones & SVG Trail */}
      <div
        className={`relative w-full h-[460px] sm:h-[520px] bg-gradient-to-b ${trail.bgGradient} overflow-hidden`}
      >
        {/* Scenery Decorations */}
        {trail.decorations.map((d, dIdx) => (
          <div
            key={dIdx}
            style={{ left: `${d.x}%`, top: `${d.y}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none ${
              d.sizeClass || 'text-3xl'
            }`}
          >
            {d.emoji}
          </div>
        ))}

        {/* Trail SVG Connector Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {stones.map((st, i) => {
            if (i === 0) return null;
            const prev = stones[i - 1];
            const isCompleted = i <= reachedIndex;
            return (
              <line
                key={i}
                x1={`${prev.x}%`}
                y1={`${prev.y}%`}
                x2={`${st.x}%`}
                y2={`${st.y}%`}
                stroke={isCompleted ? '#f59e0b' : '#94a3b8'}
                strokeWidth={isCompleted ? '9' : '6'}
                strokeDasharray={isCompleted ? undefined : '8,6'}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            );
          })}
        </svg>

        {/* Stepping Stones along the Path */}
        {stones.map((st, idx) => {
          const isPassed = idx <= reachedIndex;
          const isNext = idx === reachedIndex + 1;
          const isLast = idx === stones.length - 1;

          return (
            <div
              key={idx}
              onMouseEnter={() => handleStoneHover(idx)}
              style={{
                left: `${st.x}%`,
                top: `${st.y}%`,
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center justify-center cursor-pointer transition-all ${
                isNext
                  ? 'scale-125 ring-4 ring-amber-400 bg-amber-100 shadow-xl animate-pulse z-20'
                  : isPassed
                  ? 'bg-amber-200 border-amber-500 scale-100 shadow-sm'
                  : 'bg-white/85 border-slate-300 hover:scale-110 shadow-md'
              } w-13 h-13 sm:w-16 sm:h-16 rounded-full border-3`}
            >
              {/* Carrot pickup if present */}
              {st.hasCarrot && !isPassed && (
                <span className="text-xl sm:text-2xl animate-bounce">🥕</span>
              )}

              {/* Final goal: Carrot Basket */}
              {isLast ? (
                <div className="flex flex-col items-center select-none">
                  <span className="text-2xl sm:text-3xl animate-bounce">🧺🥕</span>
                </div>
              ) : !st.hasCarrot && (
                <span
                  className={`text-xs sm:text-sm font-black ${
                    isPassed ? 'text-amber-900' : 'text-slate-600'
                  }`}
                >
                  {isPassed ? <Check className="w-4 h-4 text-emerald-700 inline" /> : idx + 1}
                </span>
              )}

              {/* "Buraya Gel! ✨" pulse indicator on the next sequential stone */}
              {isNext && (
                <span className="absolute -top-7 bg-amber-400 text-amber-950 font-black text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full shadow-md whitespace-nowrap animate-bounce border border-amber-300">
                  Buraya Gel! ✨
                </span>
              )}
            </div>
          );
        })}

        {/* The Animated Bunny Character */}
        <div
          style={{
            left: `${currentBunnyPos.x}%`,
            top: `${currentBunnyPos.y}%`,
            transition: 'left 0.35s ease, top 0.35s ease',
          }}
          className={`absolute -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none transition-transform select-none ${
            showSuccessModal ? 'scale-150 animate-bounce' : 'scale-110 sm:scale-125'
          }`}
        >
          <div className="relative flex flex-col items-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/95 border-2 border-pink-300 shadow-xl flex items-center justify-center text-3xl sm:text-4xl">
              🐰
            </div>
            {showSuccessModal && (
              <span className="text-xl absolute -top-4 -right-2 animate-spin">
                🥕✨
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress Footer */}
      <div className="bg-slate-50 border-t border-slate-200 px-5 sm:px-8 py-3.5 flex items-center justify-between text-xs font-bold text-slate-600 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-slate-700">Toplam İlerleme:</span>
          <div className="w-36 sm:w-60 bg-slate-200 h-3 rounded-full overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full transition-all duration-500 rounded-full"
              style={{
                width: `${((currentLevelIdx + 1) / TRAILS.length) * 100}%`,
              }}
            />
          </div>
          <span className="font-black text-indigo-700">
            Seviye {currentLevelIdx + 1} / {TRAILS.length}
          </span>
        </div>

        <div className="text-indigo-800 font-extrabold flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Farenin imlecini patikada gezdir</span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. HER LEVEL BAŞI AÇIKLAMA MODALI (DEVAM ET & BAŞLA BUTONU) */}
      {/* ------------------------------------------------------------- */}
      {showIntroModal && (
        <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm sm:max-w-md w-full shadow-2xl border-4 border-indigo-300 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            {/* Bunny Icon */}
            <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-indigo-400 to-purple-200 border-2 border-indigo-300 shadow-md flex items-center justify-center text-4xl mb-3 animate-bounce">
              🐰
            </div>

            {/* Level Badge */}
            <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-indigo-100 border border-indigo-300 text-indigo-900 font-black text-xs sm:text-sm uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>SEVİYE {trail.levelNum} / {TRAILS.length}</span>
            </div>

            {/* Title */}
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 mb-1">
              {trail.title.replace(/^\d+\.\s*Seviye:\s*/, '')}
            </h3>
            <span className="text-xs font-extrabold text-indigo-700 mb-3 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              🐾 {trail.stepBadge}
            </span>

            {/* Instruction */}
            <p className="text-xs sm:text-sm font-semibold text-slate-600 mb-5 px-2 leading-relaxed">
              {trail.instruction}
            </p>

            {/* DEVAM ET / BAŞLA BUTTON */}
            <button
              onClick={() => {
                setShowIntroModal(false);
                soundEffects.playPop(soundEnabled);
              }}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-base sm:text-lg font-black shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>Devam Et & Başla</span>
              <Play className="w-5 h-5 fill-white group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. HER LEVEL BİTİŞİ TEBRİK MODALI (DEVAM ET BUTONLU) */}
      {/* ------------------------------------------------------------- */}
      {showSuccessModal && (
        <div className="absolute inset-0 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm sm:max-w-md w-full shadow-2xl border-4 border-amber-300 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            {/* Celebration Icon */}
            <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-200 border-2 border-amber-400 shadow-md flex items-center justify-center text-4xl mb-3 animate-bounce">
              🥕🎉
            </div>

            {/* Level Complete Ribbon */}
            <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-black text-xs sm:text-sm uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>
                {isLastLevel
                  ? 'BÜYÜK ŞAMPİYONLUK TAMAMLANDI!'
                  : `SEVİYE ${trail.levelNum} TAMAMLANDI!`}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 mb-2">
              Afiyet Olsun! Havuca Ulaştın! 🌟
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 mb-5 px-2">
              {isLastLevel
                ? 'Tüm 8 seviyeyi başarıyla bitirdin! Harika el-göz koordinasyonu ve fare kontrolü sergiledin.'
                : `${trail.stepBadge} patikasını başarıyla tamamladın ve tavşanı havuca ulaştırdın!`}
            </p>

            {/* Action Buttons */}
            <div className="w-full flex flex-col gap-2.5">
              {/* DEVAM ET BUTTON */}
              <button
                onClick={handleNextLevel}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-base sm:text-lg font-black shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>
                  {currentLevelIdx + 1 < TRAILS.length
                    ? `Devam Et (Seviye ${currentLevelIdx + 2}'ye Geç)`
                    : 'Tüm Seviyeleri Bitir & Sonucu Gör'}
                </span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* TEKRAR OYNA BUTTON */}
              <button
                onClick={handleReplayCurrentLevel}
                className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer border border-slate-200"
              >
                Bu Seviyeyi Tekrar Oyna
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
