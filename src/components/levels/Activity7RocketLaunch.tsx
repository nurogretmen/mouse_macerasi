import React, { useState } from 'react';
import {
  HelpCircle,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Play,
  Rocket,
  Gift,
  Sprout,
  Apple,
  Search,
} from 'lucide-react';
import { soundEffects } from '../../utils/audio.ts';

interface Activity7Props {
  soundEnabled: boolean;
  onComplete: (stars: number, score: number) => void;
  onSoundToggle: () => void;
}

// ----------------------------------------------------
// LEVEL 1 DATA: ROCKETS
// ----------------------------------------------------
interface RocketItem {
  id: number;
  name: string;
  color: string;
  emoji: string;
  isDone: boolean;
}

const INITIAL_ROCKETS: RocketItem[] = [
  { id: 1, name: 'Kırmızı Roket', color: '#ef4444', emoji: '🚀', isDone: false },
  { id: 2, name: 'Mavi Roket', color: '#3b82f6', emoji: '🚀', isDone: false },
  { id: 3, name: 'Sarı Roket', color: '#eab308', emoji: '🚀', isDone: false },
  { id: 4, name: 'Yeşil Roket', color: '#22c55e', emoji: '🚀', isDone: false },
];

// ----------------------------------------------------
// LEVEL 2 DATA: TREASURE CHESTS
// ----------------------------------------------------
interface ChestItem {
  id: number;
  name: string;
  treasureEmoji: string;
  treasureName: string;
  isDone: boolean;
}

const INITIAL_CHESTS: ChestItem[] = [
  { id: 1, name: '1. Sandık', treasureEmoji: '💎', treasureName: 'Elmas', isDone: false },
  { id: 2, name: '2. Sandık', treasureEmoji: '👑', treasureName: 'Altın Taç', isDone: false },
  { id: 3, name: '3. Sandık', treasureEmoji: '⭐', treasureName: 'Yıldız', isDone: false },
  { id: 4, name: '4. Sandık', treasureEmoji: '🏆', treasureName: 'Altın Kupa', isDone: false },
];

// ----------------------------------------------------
// LEVEL 3 DATA: FLOWER SOIL MOUNDS
// ----------------------------------------------------
interface FlowerItem {
  id: number;
  name: string;
  flowerEmoji: string;
  flowerName: string;
  isDone: boolean;
}

const INITIAL_FLOWERS: FlowerItem[] = [
  { id: 1, name: '1. Toprak', flowerEmoji: '🌸', flowerName: 'Gül', isDone: false },
  { id: 2, name: '2. Toprak', flowerEmoji: '🌻', flowerName: 'Ayçiçeği', isDone: false },
  { id: 3, name: '3. Toprak', flowerEmoji: '🌷', flowerName: 'Lale', isDone: false },
  { id: 4, name: '4. Toprak', flowerEmoji: '🌼', flowerName: 'Papatya', isDone: false },
  { id: 5, name: '5. Toprak', flowerEmoji: '🌺', flowerName: 'Nilüfer', isDone: false },
];

// ----------------------------------------------------
// LEVEL 4 DATA: APPLES ON TREE
// ----------------------------------------------------
interface AppleItem {
  id: number;
  label: string;
  x: number; // percentage in tree
  y: number; // percentage in tree
  isDone: boolean;
}

const INITIAL_APPLES: AppleItem[] = [
  { id: 1, label: 'Elma 1', x: 26, y: 28, isDone: false },
  { id: 2, label: 'Elma 2', x: 44, y: 16, isDone: false },
  { id: 3, label: 'Elma 3', x: 68, y: 24, isDone: false },
  { id: 4, label: 'Elma 4', x: 36, y: 44, isDone: false },
  { id: 5, label: 'Elma 5', x: 58, y: 42, isDone: false },
];

// ----------------------------------------------------
// LEVEL 5 DATA: SPOT THE DIFFERENCE
// ----------------------------------------------------
interface DiffItem {
  id: number;
  title: string;
  leftDesc: string;
  rightDesc: string;
  icon: string;
  topPct: number;
  leftPct: number;
  isDone: boolean;
}

const INITIAL_DIFFS: DiffItem[] = [
  {
    id: 1,
    title: 'Gözlüklü Güneş',
    leftDesc: 'Normal Güneş',
    rightDesc: 'Güneş Gözlüğü Var!',
    icon: '😎',
    topPct: 14,
    leftPct: 78,
    isDone: false,
  },
  {
    id: 2,
    title: 'Uçan Kuş',
    leftDesc: 'Balon',
    rightDesc: 'Uçan Kuş Geldi!',
    icon: '🕊️',
    topPct: 36,
    leftPct: 24,
    isDone: false,
  },
  {
    id: 3,
    title: 'Parti Şapkalı Kedi',
    leftDesc: 'Sade Kedi',
    rightDesc: 'Parti Şapkası Var!',
    icon: '🥳',
    topPct: 68,
    leftPct: 62,
    isDone: false,
  },
];

export const Activity7RocketLaunch: React.FC<Activity7Props> = ({
  soundEnabled,
  onComplete,
}) => {
  // Current active level (1 to 5)
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [showGuide, setShowGuide] = useState<boolean>(true);
  const [leftClickNotice, setLeftClickNotice] = useState<boolean>(false);
  const [showLevelModal, setShowLevelModal] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  // States for each level
  const [rockets, setRockets] = useState<RocketItem[]>(INITIAL_ROCKETS);
  const [chests, setChests] = useState<ChestItem[]>(INITIAL_CHESTS);
  const [flowers, setFlowers] = useState<FlowerItem[]>(INITIAL_FLOWERS);
  const [apples, setApples] = useState<AppleItem[]>(INITIAL_APPLES);
  const [diffs, setDiffs] = useState<DiffItem[]>(INITIAL_DIFFS);

  // Trigger left-click warning if child clicks with left button
  const triggerLeftClickWarning = () => {
    soundEffects.playBoing(soundEnabled);
    setLeftClickNotice(true);
    setTimeout(() => setLeftClickNotice(false), 2400);
  };

  // Helper when a sub-item is successfully right-clicked
  const onSuccessfulRightClick = () => {
    soundEffects.playStar(soundEnabled);
    soundEffects.playPop(soundEnabled);
    setScore((s) => s + 25);
    setLeftClickNotice(false);
  };

  // Helper when an entire level is cleared
  const onLevelCleared = (nextLevel: number) => {
    soundEffects.playFanfare(soundEnabled);
    setTimeout(() => {
      if (nextLevel <= 5) {
        setShowLevelModal(true);
      } else {
        // Complete the whole activity
        onComplete(3, score + 150);
      }
    }, 700);
  };

  // ----------------------------------------------------
  // LEVEL 1: ROCKET HANDLERS
  // ----------------------------------------------------
  const handleRocketRightClick = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    const target = rockets.find((r) => r.id === id);
    if (!target || target.isDone) return;

    onSuccessfulRightClick();
    const updated = rockets.map((r) => (r.id === id ? { ...r, isDone: true } : r));
    setRockets(updated);

    if (updated.every((r) => r.isDone)) {
      onLevelCleared(2);
    }
  };

  // ----------------------------------------------------
  // LEVEL 2: CHEST HANDLERS
  // ----------------------------------------------------
  const handleChestRightClick = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    const target = chests.find((c) => c.id === id);
    if (!target || target.isDone) return;

    onSuccessfulRightClick();
    const updated = chests.map((c) => (c.id === id ? { ...c, isDone: true } : c));
    setChests(updated);

    if (updated.every((c) => c.isDone)) {
      onLevelCleared(3);
    }
  };

  // ----------------------------------------------------
  // LEVEL 3: FLOWER HANDLERS
  // ----------------------------------------------------
  const handleFlowerRightClick = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    const target = flowers.find((f) => f.id === id);
    if (!target || target.isDone) return;

    onSuccessfulRightClick();
    const updated = flowers.map((f) => (f.id === id ? { ...f, isDone: true } : f));
    setFlowers(updated);

    if (updated.every((f) => f.isDone)) {
      onLevelCleared(4);
    }
  };

  // ----------------------------------------------------
  // LEVEL 4: APPLE HANDLERS
  // ----------------------------------------------------
  const handleAppleRightClick = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    const target = apples.find((a) => a.id === id);
    if (!target || target.isDone) return;

    onSuccessfulRightClick();
    const updated = apples.map((a) => (a.id === id ? { ...a, isDone: true } : a));
    setApples(updated);

    if (updated.every((a) => a.isDone)) {
      onLevelCleared(5);
    }
  };

  // ----------------------------------------------------
  // LEVEL 5: DIFF HANDLERS
  // ----------------------------------------------------
  const handleDiffRightClick = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    const target = diffs.find((d) => d.id === id);
    if (!target || target.isDone) return;

    onSuccessfulRightClick();
    const updated = diffs.map((d) => (d.id === id ? { ...d, isDone: true } : d));
    setDiffs(updated);

    if (updated.every((d) => d.isDone)) {
      onLevelCleared(6);
    }
  };

  // Restart current level
  const handleRestartCurrentLevel = () => {
    soundEffects.playPop(soundEnabled);
    setLeftClickNotice(false);
    if (currentLevel === 1) setRockets(INITIAL_ROCKETS);
    if (currentLevel === 2) setChests(INITIAL_CHESTS);
    if (currentLevel === 3) setFlowers(INITIAL_FLOWERS);
    if (currentLevel === 4) setApples(INITIAL_APPLES);
    if (currentLevel === 5) setDiffs(INITIAL_DIFFS);
  };

  // Continue to next level modal
  const handleNextLevel = () => {
    setShowLevelModal(false);
    setCurrentLevel((lvl) => Math.min(lvl + 1, 5));
  };

  // Header level info
  const levelMeta = [
    {
      num: 1,
      name: '1. Seviye: Roket Fırlatma Üssü',
      task: 'Roketlerin üzerine gel ve farenin SAĞ TUŞUNA basarak onları uzaya fırlat!',
      progressText: `${rockets.filter((r) => r.isDone).length} / ${rockets.length} Roket`,
      icon: <Rocket className="w-4 h-4 text-rose-600" />,
    },
    {
      num: 2,
      name: '2. Seviye: Sihirli Hazine Sandıkları',
      task: 'Kapalı sandıkların üzerine gel ve farenin SAĞ TUŞUNA basarak içindeki sürprizleri aç!',
      progressText: `${chests.filter((c) => c.isDone).length} / ${chests.length} Sandık Açıldı`,
      icon: <Gift className="w-4 h-4 text-amber-600" />,
    },
    {
      num: 3,
      name: '3. Seviye: Çiçek Açtırma Bahçesi',
      task: 'Toprak tepeciklerine farenin SAĞ TUŞUYLA tıkla ve rengarenk çiçekleri açtır!',
      progressText: `${flowers.filter((f) => f.isDone).length} / ${flowers.length} Çiçek Açtı`,
      icon: <Sprout className="w-4 h-4 text-emerald-600" />,
    },
    {
      num: 4,
      name: '4. Seviye: Ağaçtan Elma Toplama',
      task: 'Ağaçtaki olgun kırmızı elmalara farenin SAĞ TUŞUYLA tıkla, sepete düşür!',
      progressText: `${apples.filter((a) => a.isDone).length} / ${apples.length} Elma Sepette`,
      icon: <Apple className="w-4 h-4 text-red-600" />,
    },
    {
      num: 5,
      name: '5. Seviye: Farkı Bul Dedektifi',
      task: 'İki resim arasındaki 3 gizli farkı bul ve üzerlerine farenin SAĞ TUŞUYLA tıkla!',
      progressText: `${diffs.filter((d) => d.isDone).length} / ${diffs.length} Fark Bulundu`,
      icon: <Search className="w-4 h-4 text-indigo-600" />,
    },
  ];

  const currentMeta = levelMeta[currentLevel - 1];

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      className="w-full max-w-5xl bg-white rounded-3xl border-4 border-rose-200 shadow-xl overflow-hidden flex flex-col select-none"
    >
      {/* Top Header Bar */}
      <div className="bg-gradient-to-r from-rose-100 via-pink-100 to-amber-100 px-5 py-3.5 border-b-2 border-rose-300 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className="px-3 py-1 rounded-full bg-rose-600 text-white font-black text-xs shadow-xs flex items-center gap-1">
            {currentMeta.icon}
            <span>Etkinlik 7</span>
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-rose-950">
                {currentMeta.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-200 text-rose-900 text-[10px] sm:text-xs font-black">
                Seviye {currentLevel} / 5
              </span>
            </div>
            <p className="text-xs font-semibold text-rose-800 hidden sm:block">
              {currentMeta.task}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white/95 border-2 border-rose-300 px-3.5 py-1 rounded-full text-xs font-black text-rose-900 shadow-2xs">
            {currentMeta.progressText}
          </div>

          <button
            onClick={() => setShowGuide(!showGuide)}
            className="p-1.5 rounded-xl bg-white/80 hover:bg-white text-rose-800 border border-rose-300 cursor-pointer"
            title="Nasıl Oynanır?"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={handleRestartCurrentLevel}
            className="p-1.5 rounded-xl bg-white/80 hover:bg-white text-rose-800 border border-rose-300 cursor-pointer"
            title="Yeniden Başlat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Visual Mouse Guide Banner */}
      <div className="bg-gradient-to-r from-amber-50 via-rose-50 to-amber-50 border-b-2 border-rose-200 px-5 py-2.5 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {/* Animated Mouse Indicator with Glowing Right Button */}
          <div className="w-10 h-14 rounded-2xl border-3 border-slate-700 bg-white relative flex flex-col items-center pt-1 shadow-md shrink-0">
            {/* Left Button */}
            <div className="absolute top-1 left-1 w-3.5 h-5 rounded-tl-lg bg-slate-200 border-r border-b border-slate-400" />
            {/* Right Button (GLOWING!) */}
            <div className="absolute top-1 right-1 w-3.5 h-5 rounded-tr-lg bg-rose-500 border-l border-b border-rose-700 animate-pulse ring-2 ring-rose-400" />
            {/* Scroll wheel */}
            <div className="w-1 h-3 rounded-full bg-slate-400 mt-1 z-10" />
          </div>

          <div>
            <span className="text-xs sm:text-sm font-black text-rose-950 flex items-center gap-1.5">
              <span>👉</span>
              <span>Farenin SAĞ TUŞUNA bas! (Sağ Tık)</span>
            </span>
            <p className="text-[11px] font-bold text-slate-600">
              Sol tuş değil, işaret parmağının yanındaki SAĞ TUŞA basmalısın.
            </p>
          </div>
        </div>

        {leftClickNotice && (
          <div className="bg-amber-300 text-amber-950 font-black text-xs px-3.5 py-1.5 rounded-xl border border-amber-400 animate-bounce shadow-md">
            ⚠️ Sol tık değil! Farenin SAĞ TUŞUNA bas!
          </div>
        )}
      </div>

      {/* Main Interactive Stage Container */}
      <div className="relative w-full min-h-[460px] sm:min-h-[520px] flex items-center justify-center overflow-hidden">
        {/* ==================================================== */}
        {/* LEVEL 1: ROCKET LAUNCH */}
        {/* ==================================================== */}
        {currentLevel === 1 && (
          <div className="relative w-full h-[460px] sm:h-[520px] bg-gradient-to-b from-[#090d16] via-[#111827] to-[#1e1b4b] flex items-end justify-center pb-8 px-4 sm:px-8">
            <div className="absolute top-6 left-12 text-3xl opacity-60 animate-pulse">✨</div>
            <div className="absolute top-10 right-16 text-4xl opacity-80">🌕</div>
            <div className="absolute top-20 left-1/3 text-2xl opacity-70">⭐</div>
            <div className="absolute top-8 right-1/3 text-2xl opacity-70">🪐</div>

            <div className="w-full max-w-3xl grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 z-10">
              {rockets.map((rocket) => (
                <div
                  key={rocket.id}
                  onContextMenu={(e) => handleRocketRightClick(rocket.id, e)}
                  onClick={triggerLeftClickWarning}
                  className="flex flex-col items-center select-none cursor-pointer group"
                >
                  <div className="relative h-44 sm:h-52 w-full flex flex-col items-center justify-end">
                    <div
                      style={{
                        transition: rocket.isDone
                          ? 'transform 1.2s cubic-bezier(0.1, 0.9, 0.2, 1), opacity 1.2s ease'
                          : 'transform 0.2s ease',
                        transform: rocket.isDone
                          ? 'translateY(-340px) scale(0.6)'
                          : 'translateY(0) scale(1)',
                        opacity: rocket.isDone ? 0 : 1,
                      }}
                      className="relative flex flex-col items-center cursor-pointer group-hover:scale-110"
                    >
                      {!rocket.isDone && (
                        <span className="bg-rose-500 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-md animate-bounce mb-1 whitespace-nowrap">
                          Sağ Tıkla 🚀
                        </span>
                      )}
                      <div
                        style={{ backgroundColor: rocket.color }}
                        className="w-16 h-24 sm:w-18 sm:h-28 rounded-t-full rounded-b-xl border-3 border-white shadow-xl flex flex-col items-center justify-center relative overflow-hidden"
                      >
                        <div className="w-6 h-6 rounded-full bg-sky-200 border-2 border-slate-700 shadow-inner flex items-center justify-center text-xs">
                          ⭐
                        </div>
                        <div className="absolute -bottom-1 -left-2 w-4 h-6 bg-slate-800 rounded-l-lg rotate-12" />
                        <div className="absolute -bottom-1 -right-2 w-4 h-6 bg-slate-800 rounded-r-lg -rotate-12" />
                      </div>
                      {rocket.isDone && (
                        <div className="text-4xl animate-bounce -mt-2">🔥💥</div>
                      )}
                    </div>
                  </div>

                  <div
                    className={`w-full py-2 px-1 rounded-2xl border-2 flex flex-col items-center text-center shadow-md transition-colors ${
                      rocket.isDone
                        ? 'bg-emerald-900/80 border-emerald-400 text-emerald-300'
                        : 'bg-slate-800/90 border-slate-600 text-slate-300 group-hover:border-rose-400 group-hover:bg-slate-700'
                    }`}
                  >
                    <span className="text-xs font-black">
                      {rocket.isDone ? '✓ Fırlatıldı!' : rocket.name}
                    </span>
                    <span className="text-[10px] font-bold opacity-80">
                      {rocket.isDone ? 'Uzayda ⭐' : 'Sağ Tıkla'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* LEVEL 2: TREASURE CHESTS */}
        {/* ==================================================== */}
        {currentLevel === 2 && (
          <div className="relative w-full h-[460px] sm:h-[520px] bg-gradient-to-b from-[#2e1065] via-[#3b0764] to-[#1e1b4b] flex flex-col items-center justify-center p-6">
            <div className="absolute top-4 text-center">
              <span className="px-4 py-1 rounded-full bg-amber-400/20 text-amber-200 text-xs font-black border border-amber-400/40">
                💎 Sandıklara Sağ Tıkla ve Gizemli Hediyeleri Aç!
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 w-full max-w-3xl mt-6">
              {chests.map((chest) => (
                <div
                  key={chest.id}
                  onContextMenu={(e) => handleChestRightClick(chest.id, e)}
                  onClick={triggerLeftClickWarning}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <div
                    className={`w-full h-44 sm:h-48 rounded-3xl border-3 flex flex-col items-center justify-center p-3 transition-all duration-300 shadow-lg ${
                      chest.isDone
                        ? 'bg-gradient-to-b from-amber-200 to-yellow-300 border-amber-400 scale-105 ring-4 ring-yellow-200'
                        : 'bg-gradient-to-b from-amber-700 via-yellow-800 to-amber-950 border-yellow-500 hover:scale-105 hover:border-amber-300'
                    }`}
                  >
                    {chest.isDone ? (
                      <div className="flex flex-col items-center animate-in zoom-in-75 duration-300">
                        <span className="text-5xl sm:text-6xl drop-shadow-md animate-bounce mb-2">
                          {chest.treasureEmoji}
                        </span>
                        <span className="text-sm font-black text-amber-950 bg-amber-100/90 px-3 py-0.5 rounded-full border border-amber-300">
                          {chest.treasureName}
                        </span>
                        <span className="text-[11px] font-black text-emerald-700 mt-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Açıldı!</span>
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className="text-5xl sm:text-6xl drop-shadow-lg group-hover:scale-110 transition-transform mb-2">
                          📦
                        </span>
                        <span className="bg-rose-500 text-white font-black text-[11px] px-2.5 py-0.5 rounded-full shadow-md animate-pulse">
                          Sağ Tıkla
                        </span>
                        <span className="text-xs font-bold text-amber-200 mt-1">
                          Kilitli Sandık 🔒
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* LEVEL 3: BLOOMING FLOWERS IN SOIL */}
        {/* ==================================================== */}
        {currentLevel === 3 && (
          <div className="relative w-full h-[460px] sm:h-[520px] bg-gradient-to-b from-sky-200 via-emerald-100 to-emerald-300 flex flex-col items-center justify-center p-6">
            <div className="absolute top-4 text-center">
              <span className="px-4 py-1 rounded-full bg-emerald-800 text-emerald-100 text-xs font-black shadow-xs">
                🌱 Toprak Tepeciklerine Sağ Tıkla, Çiçekler Açsın!
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 w-full max-w-3xl mt-6">
              {flowers.map((flower) => (
                <div
                  key={flower.id}
                  onContextMenu={(e) => handleFlowerRightClick(flower.id, e)}
                  onClick={triggerLeftClickWarning}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <div
                    className={`w-full h-44 sm:h-48 rounded-3xl border-3 flex flex-col items-center justify-center p-2 transition-all duration-300 shadow-md ${
                      flower.isDone
                        ? 'bg-gradient-to-b from-rose-50 via-pink-100 to-amber-100 border-pink-400 scale-105 ring-4 ring-pink-300'
                        : 'bg-gradient-to-b from-amber-800 to-amber-950 border-amber-900 hover:scale-105 hover:border-emerald-400'
                    }`}
                  >
                    {flower.isDone ? (
                      <div className="flex flex-col items-center animate-in zoom-in-75 duration-300">
                        <span className="text-5xl sm:text-6xl drop-shadow-md animate-bounce mb-1">
                          {flower.flowerEmoji}
                        </span>
                        <span className="text-sm font-black text-slate-800">
                          {flower.flowerName}
                        </span>
                        <span className="text-[10px] font-black text-pink-700 mt-1 bg-pink-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-pink-500" />
                          <span>Açtı!</span>
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className="text-4xl sm:text-5xl mb-1 group-hover:scale-110 transition-transform">
                          🌱
                        </span>
                        <div className="w-16 h-4 bg-amber-900 rounded-full shadow-inner border border-amber-700 mb-2" />
                        <span className="bg-rose-500 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-md animate-bounce">
                          Sağ Tıkla
                        </span>
                        <span className="text-[11px] font-bold text-amber-200 mt-1">
                          Toprak
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* LEVEL 4: APPLES IN TREE */}
        {/* ==================================================== */}
        {currentLevel === 4 && (
          <div className="relative w-full h-[460px] sm:h-[520px] bg-gradient-to-b from-sky-200 via-sky-100 to-emerald-200 overflow-hidden flex flex-col items-center justify-between p-4">
            <div className="text-center z-10">
              <span className="px-4 py-1 rounded-full bg-emerald-800 text-emerald-100 text-xs font-black shadow-xs">
                🍎 Ağaçtaki Elmalara Sağ Tıkla ve Sepete Düşür!
              </span>
            </div>

            {/* Tree Canopy & Apples */}
            <div className="relative w-full max-w-2xl h-[320px] flex items-center justify-center">
              {/* Tree Trunk */}
              <div className="absolute bottom-0 w-16 h-36 bg-amber-900 border-4 border-amber-950 rounded-t-xl z-0" />

              {/* Big Lush Tree Foliage */}
              <div className="absolute top-2 w-80 sm:w-96 h-64 bg-gradient-to-b from-emerald-500 to-green-700 rounded-full border-4 border-emerald-800 shadow-xl z-10 flex items-center justify-center" />
              <div className="absolute top-8 left-16 sm:left-24 w-44 h-44 bg-green-600 rounded-full border-3 border-emerald-800 shadow-md z-10" />
              <div className="absolute top-8 right-16 sm:right-24 w-44 h-44 bg-emerald-600 rounded-full border-3 border-emerald-800 shadow-md z-10" />

              {/* Apples placed on the tree */}
              {apples.map((apple) => (
                <div
                  key={apple.id}
                  style={{
                    top: `${apple.y}%`,
                    left: `${apple.x}%`,
                    transition: apple.isDone
                      ? 'transform 0.9s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.8s ease'
                      : 'transform 0.2s ease',
                    transform: apple.isDone
                      ? 'translateY(190px) scale(0.5)'
                      : 'translateY(0) scale(1)',
                    opacity: apple.isDone ? 0 : 1,
                  }}
                  onContextMenu={(e) => handleAppleRightClick(apple.id, e)}
                  onClick={triggerLeftClickWarning}
                  className="absolute z-20 cursor-pointer group flex flex-col items-center select-none"
                >
                  <span className="text-4xl sm:text-5xl filter drop-shadow-md group-hover:scale-125 transition-transform">
                    🍎
                  </span>
                  <span className="bg-rose-500 text-white font-black text-[9px] px-1.5 py-0.2 rounded-full shadow-xs -mt-1 group-hover:scale-110">
                    Sağ Tıkla
                  </span>
                </div>
              ))}

              {/* Apple Basket in the bottom corner */}
              <div className="absolute bottom-2 right-4 sm:right-12 z-20 flex flex-col items-center bg-amber-100/90 border-3 border-amber-700 rounded-3xl p-3 shadow-lg">
                <span className="text-4xl">🧺</span>
                <span className="text-xs font-black text-amber-950 mt-1">
                  Elma Sepeti
                </span>
                <span className="text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full mt-0.5">
                  {apples.filter((a) => a.isDone).length} / {apples.length} Toplandı
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* LEVEL 5: SPOT THE DIFFERENCE */}
        {/* ==================================================== */}
        {currentLevel === 5 && (
          <div className="relative w-full h-[460px] sm:h-[520px] bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 flex flex-col items-center justify-between p-4">
            <div className="text-center">
              <span className="px-4 py-1 rounded-full bg-indigo-900 text-indigo-100 text-xs font-black shadow-xs">
                🔍 Sağdaki Resimde 3 Fark Var! FARKIN ÜZERİNE SAĞ TIKLA!
              </span>
            </div>

            {/* Side-by-side pictures */}
            <div className="grid grid-cols-2 gap-3 sm:gap-6 w-full max-w-2xl h-[330px] mt-2">
              {/* Left Picture (Original) */}
              <div className="relative rounded-3xl border-3 border-indigo-300 bg-gradient-to-b from-sky-200 via-sky-100 to-emerald-200 p-3 overflow-hidden shadow-md flex flex-col justify-between select-none">
                <div className="absolute top-2 left-2 bg-indigo-700 text-white text-[10px] font-black px-2 py-0.5 rounded-full z-10">
                  Resim 1 (Orijinal)
                </div>

                {/* Left Scene Elements */}
                <div className="relative w-full h-full">
                  {/* Sun (Normal) */}
                  <div className="absolute top-4 right-4 text-4xl" title="Normal Güneş">
                    ☀️
                  </div>
                  {/* Cloud & Balloon */}
                  <div className="absolute top-12 left-4 text-3xl">☁️</div>
                  <div className="absolute top-16 left-10 text-3xl" title="Mavi Balon">
                    🎈
                  </div>
                  {/* Tree & Cat */}
                  <div className="absolute bottom-2 left-3 text-5xl">🌳</div>
                  <div className="absolute bottom-4 right-6 text-4xl" title="Normal Kedi">
                    🐱
                  </div>
                  <div className="absolute bottom-1 right-2 text-2xl">🌸</div>
                </div>
              </div>

              {/* Right Picture (Find Differences Here!) */}
              <div className="relative rounded-3xl border-3 border-rose-400 bg-gradient-to-b from-sky-200 via-sky-100 to-emerald-200 p-3 overflow-hidden shadow-md flex flex-col justify-between select-none">
                <div className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full z-10">
                  Resim 2 (Farkları SAĞ TIKLA Bul!)
                </div>

                {/* Right Scene Elements with clickable differences */}
                <div className="relative w-full h-full">
                  {/* Static Normal Cloud */}
                  <div className="absolute top-12 left-4 text-3xl">☁️</div>
                  <div className="absolute bottom-2 left-3 text-5xl">🌳</div>
                  <div className="absolute bottom-1 right-2 text-2xl">🌸</div>

                  {/* Difference 1: Sun with Sunglasses */}
                  <div
                    onContextMenu={(e) => handleDiffRightClick(1, e)}
                    onClick={triggerLeftClickWarning}
                    className="absolute top-4 right-4 cursor-pointer group flex flex-col items-center"
                  >
                    <span className="text-4xl filter drop-shadow-md group-hover:scale-125 transition-transform">
                      😎
                    </span>
                    {diffs.find((d) => d.id === 1)?.isDone ? (
                      <span className="bg-emerald-500 text-white font-black text-[9px] px-1.5 py-0.2 rounded-full mt-1 flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Fark 1
                      </span>
                    ) : (
                      <span className="bg-rose-500 text-white font-black text-[9px] px-1.5 py-0.2 rounded-full mt-1 animate-pulse">
                        Sağ Tıkla
                      </span>
                    )}
                  </div>

                  {/* Difference 2: Dove instead of Balloon */}
                  <div
                    onContextMenu={(e) => handleDiffRightClick(2, e)}
                    onClick={triggerLeftClickWarning}
                    className="absolute top-16 left-10 cursor-pointer group flex flex-col items-center"
                  >
                    <span className="text-3xl filter drop-shadow-md group-hover:scale-125 transition-transform">
                      🕊️
                    </span>
                    {diffs.find((d) => d.id === 2)?.isDone ? (
                      <span className="bg-emerald-500 text-white font-black text-[9px] px-1.5 py-0.2 rounded-full mt-1 flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Fark 2
                      </span>
                    ) : (
                      <span className="bg-rose-500 text-white font-black text-[9px] px-1.5 py-0.2 rounded-full mt-1 animate-pulse">
                        Sağ Tıkla
                      </span>
                    )}
                  </div>

                  {/* Difference 3: Cat with Party Hat */}
                  <div
                    onContextMenu={(e) => handleDiffRightClick(3, e)}
                    onClick={triggerLeftClickWarning}
                    className="absolute bottom-4 right-6 cursor-pointer group flex flex-col items-center"
                  >
                    <span className="text-4xl filter drop-shadow-md group-hover:scale-125 transition-transform">
                      🥳
                    </span>
                    {diffs.find((d) => d.id === 3)?.isDone ? (
                      <span className="bg-emerald-500 text-white font-black text-[9px] px-1.5 py-0.2 rounded-full mt-1 flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Fark 3
                      </span>
                    ) : (
                      <span className="bg-rose-500 text-white font-black text-[9px] px-1.5 py-0.2 rounded-full mt-1 animate-pulse">
                        Sağ Tıkla
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Level Completion Transition Modal */}
        {showLevelModal && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center z-40 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm sm:max-w-md w-full shadow-2xl border-4 border-rose-400 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-400 to-amber-200 border-2 border-rose-400 shadow-md flex items-center justify-center text-3xl mb-3 animate-bounce">
                🎉
              </div>

              <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-rose-100 border border-rose-300 text-rose-900 font-black text-xs sm:text-sm uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4 text-rose-600" />
                <span>SEVİYE {currentLevel} TAMAMLANDI!</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-800 mb-2">
                Harika İş Çıkardın! ⭐
              </h3>

              <p className="text-xs sm:text-sm font-semibold text-slate-600 mb-5 px-2 leading-relaxed">
                Farenin sağ tuşunu başarıyla kullanarak bu seviyeyi tamamladın. Şimdi sıradaki eğlenceli sağ tık görevine geçelim!
              </p>

              <button
                onClick={handleNextLevel}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-base sm:text-lg font-black shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>Sonraki Seviyeye Geç</span>
                <Play className="w-5 h-5 fill-white group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Progress Footer */}
      <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs font-bold text-slate-600 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span>Toplam İlerleme:</span>
          <div className="w-32 sm:w-56 bg-slate-200 h-3 rounded-full overflow-hidden">
            <div
              className="bg-rose-500 h-full transition-all duration-300"
              style={{ width: `${(currentLevel / 5) * 100}%` }}
            />
          </div>
          <span>Seviye {currentLevel} / 5</span>
        </div>

        <div className="text-rose-700 font-extrabold flex items-center gap-1.5">
          <Rocket className="w-4 h-4 text-rose-600" />
          <span>Farenin SAĞ TUŞUNA basmayı unutma!</span>
        </div>
      </div>
    </div>
  );
};
