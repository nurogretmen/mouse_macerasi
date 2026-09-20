import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, RotateCcw, Sparkles, CheckCircle2, Play, Star, Timer, Zap } from 'lucide-react';
import { soundEffects } from '../../utils/audio.ts';

interface Activity11Props {
  soundEnabled: boolean;
  onComplete: (stars: number, score: number) => void;
  onSoundToggle: () => void;
}

export type StarColor = 'yellow' | 'blue' | 'red' | 'green' | 'purple' | 'orange' | 'pink';

export interface FloatingStar {
  id: number;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  vx: number;
  vy: number;
  color: StarColor;
  size: number;
  rotation: number;
  rotSpeed: number;
  lastColorChangeTime: number;
  isShiftingColor?: boolean;
}

interface StarParticle {
  id: number;
  x: number;
  y: number;
  color: string;
}

interface StarColorInfo {
  name: string;
  emoji: string;
  hex: string;
  bgClass: string;
}

export const STAR_COLOR_STYLES: Record<StarColor, StarColorInfo> = {
  yellow: {
    name: 'Sarı',
    emoji: '🟡',
    hex: '#facc15',
    bgClass: 'bg-amber-400',
  },
  blue: {
    name: 'Mavi',
    emoji: '🔵',
    hex: '#38bdf8',
    bgClass: 'bg-sky-400',
  },
  red: {
    name: 'Kırmızı',
    emoji: '🔴',
    hex: '#ef4444',
    bgClass: 'bg-rose-500',
  },
  green: {
    name: 'Yeşil',
    emoji: '🟢',
    hex: '#22c55e',
    bgClass: 'bg-emerald-500',
  },
  purple: {
    name: 'Mor',
    emoji: '🟣',
    hex: '#a855f7',
    bgClass: 'bg-purple-500',
  },
  orange: {
    name: 'Turuncu',
    emoji: '🟠',
    hex: '#f97316',
    bgClass: 'bg-orange-500',
  },
  pink: {
    name: 'Pembe',
    emoji: '🌸',
    hex: '#ec4899',
    bgClass: 'bg-pink-500',
  },
};

const ALL_STAR_COLORS: StarColor[] = [
  'yellow',
  'blue',
  'red',
  'green',
  'purple',
  'orange',
  'pink',
];

interface RoundConfig {
  roundNum: number;
  title: string;
  subtitle: string;
  targetColors: StarColor[];
  goalsByColor: Partial<Record<StarColor, number>>;
  totalGoal: number;
  instructionText: string;
  baseSpeed: number;
  starCountOnScreen: number;
  colorShiftIntervalMs?: number; // e.g. 2000ms for 2 seconds
}

const ROUNDS: RoundConfig[] = [
  {
    roundNum: 1,
    title: '1. Seviye: Serbest Isınma Avı',
    subtitle: 'Herhangi 6 Yıldızı Yakala',
    targetColors: ALL_STAR_COLORS,
    goalsByColor: {},
    totalGoal: 6,
    instructionText:
      'Yıldız Avcısı serüvenine hoş geldin! Gece gökyüzünde süzülen rengarenk yıldızlardan istediğin herhangi 6 tanesini sol tıkla yakala!',
    baseSpeed: 0.28,
    starCountOnScreen: 8,
  },
  {
    roundNum: 2,
    title: '2. Seviye: Parlayan Sarı Yıldızlar',
    subtitle: 'Sadece 5 Sarı Yıldız (Diğer Renkler Arasından Bul)',
    targetColors: ['yellow'],
    goalsByColor: { yellow: 5 },
    totalGoal: 5,
    instructionText:
      'Dikkatini topla! Gökyüzünde farklı renklerde süzülen yıldızların arasından yalnızca SARI 🟡 parlayan yıldızları ara, bul ve sol tıkla!',
    baseSpeed: 0.32,
    starCountOnScreen: 8,
  },
  {
    roundNum: 3,
    title: '3. Seviye: Mavi Gökyüzü Yıldızları',
    subtitle: 'Sadece 5 Mavi Yıldız',
    targetColors: ['blue'],
    goalsByColor: { blue: 5 },
    totalGoal: 5,
    instructionText:
      'Harika gidiyorsun! Renkli yıldızlar arasında yalnızca MAVİ 🔵 parıldayan yıldızları takip et ve sol tuşla yakala!',
    baseSpeed: 0.35,
    starCountOnScreen: 8,
  },
  {
    roundNum: 4,
    title: '4. Seviye: İki Renk Avı + Renk Değişimi',
    subtitle: '4 Kırmızı + 4 Yeşil = 8 Yıldız (3 sn Renk Değişimi)',
    targetColors: ['red', 'green'],
    goalsByColor: { red: 4, green: 4 },
    totalGoal: 8,
    instructionText:
      'Görev zorlaşıyor! Yıldızlar gökyüzünde yaklaşık 3 saniyede bir renk değiştiriyor! Hem KIRMIZI 🔴 hem de YEŞİL 🟢 yıldızları takip et; hedef renge dönüştüklerinde sol tıkla yakala!',
    baseSpeed: 0.38,
    starCountOnScreen: 9,
    colorShiftIntervalMs: 3000,
  },
  {
    roundNum: 5,
    title: '5. Seviye: 2 Saniyede Renk Değişimi',
    subtitle: '3 Sarı + 3 Mavi + 3 Mor = 9 Yıldız (2 sn Renk Değişimi)',
    targetColors: ['yellow', 'blue', 'purple'],
    goalsByColor: { yellow: 3, blue: 3, purple: 3 },
    totalGoal: 9,
    instructionText:
      'Yıldızlar sihirli bir şekilde her 2 saniyede bir renk değiştiriyor! SARI 🟡, MAVİ 🔵 veya MOR 🟣 renge dönüştükleri anı yakala ve hemen tıkla!',
    baseSpeed: 0.44,
    starCountOnScreen: 9,
    colorShiftIntervalMs: 2000,
  },
  {
    roundNum: 6,
    title: '6. Seviye: Büyük Şampiyona Finali',
    subtitle: 'Kırmızı, Turuncu, Pembe (Hızlı & 2 sn Renk Değişimi)',
    targetColors: ['red', 'orange', 'pink'],
    goalsByColor: { red: 4, orange: 4, pink: 4 },
    totalGoal: 12,
    instructionText:
      'Büyük Şampiyonluk Finali! Hızlı hareket eden ve her 2 saniyede bir renk değiştiren yıldızlar! KIRMIZI 🔴, TURUNCU 🟠 veya PEMBE 🌸 olduklarında süper reflekslerinle yakala ve şampiyon ol!',
    baseSpeed: 0.50,
    starCountOnScreen: 10,
    colorShiftIntervalMs: 2000,
  },
];

export const Activity11MovingStars: React.FC<Activity11Props> = ({
  soundEnabled,
  onComplete,
}) => {
  const [currentRoundIdx, setCurrentRoundIdx] = useState<number>(0);
  const [stars, setStars] = useState<FloatingStar[]>([]);
  const [particles, setParticles] = useState<StarParticle[]>([]);
  const [showGuide, setShowGuide] = useState<boolean>(true);
  const [showLevelModal, setShowLevelModal] = useState<boolean>(true);
  const [wrongNotice, setWrongNotice] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);

  // Per-color count for the current level
  const [collectedByColor, setCollectedByColor] = useState<Record<string, number>>({});
  const [totalCollectedInRound, setTotalCollectedInRound] = useState<number>(0);

  const nextStarId = useRef<number>(1);
  const nextParticleId = useRef<number>(1);
  const currentRound = ROUNDS[currentRoundIdx];

  // Helper to pick balanced color ensuring target is not too dense
  const pickBalancedColor = (
    targets: StarColor[],
    collectedMap: Record<string, number>,
    goals: Partial<Record<StarColor, number>>,
    existingStars: FloatingStar[]
  ): StarColor => {
    if (targets.length >= ALL_STAR_COLORS.length) {
      // Free level: equal probability across all colors
      return ALL_STAR_COLORS[Math.floor(Math.random() * ALL_STAR_COLORS.length)];
    }

    // Check which target colors still need collection
    const uncompletedTargets = targets.filter(
      (c) => (collectedMap[c] || 0) < (goals[c] || 0)
    );

    // Count how many stars currently have each target color
    const targetCountOnScreen = existingStars.filter((s) =>
      targets.includes(s.color)
    ).length;

    // As requested: "istenen renkler yoğunlukta olmasın hemen bulup işaretler, ara ara farklı renkte yıldızlar da çıkabilir"
    // Keep target stars to only 2 or 3 maximum on screen at any time!
    if (uncompletedTargets.length > 0 && targetCountOnScreen < 2) {
      // Provide at least 1-2 targets so user isn't starved
      return uncompletedTargets[Math.floor(Math.random() * uncompletedTargets.length)];
    }

    // Otherwise give distractor stars with 75% probability from other colors!
    const distractors = ALL_STAR_COLORS.filter((c) => !targets.includes(c));
    if (Math.random() < 0.75 && distractors.length > 0) {
      return distractors[Math.floor(Math.random() * distractors.length)];
    }

    // Rare target appearance
    if (uncompletedTargets.length > 0 && Math.random() < 0.5) {
      return uncompletedTargets[Math.floor(Math.random() * uncompletedTargets.length)];
    }

    return ALL_STAR_COLORS[Math.floor(Math.random() * ALL_STAR_COLORS.length)];
  };

  // Initialize stars on round start or round change
  useEffect(() => {
    const list: FloatingStar[] = [];
    const count = currentRound.starCountOnScreen;
    const speed = currentRound.baseSpeed;
    const now = Date.now();

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const vx = Math.cos(angle) * (speed * (0.8 + Math.random() * 0.4));
      const vy = Math.sin(angle) * (speed * (0.8 + Math.random() * 0.4));

      const chosenColor = pickBalancedColor(
        currentRound.targetColors,
        {},
        currentRound.goalsByColor,
        list
      );

      list.push({
        id: nextStarId.current++,
        x: 10 + Math.random() * 80,
        y: 12 + Math.random() * 74,
        vx,
        vy,
        color: chosenColor,
        size: 58 + Math.random() * 14,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 1.5,
        // Stagger initial color change times so they don't all flash together
        lastColorChangeTime: now - Math.random() * (currentRound.colorShiftIntervalMs || 2000),
      });
    }

    setStars(list);
    setCollectedByColor({});
    setTotalCollectedInRound(0);
  }, [currentRoundIdx]);

  // Motion physics loop
  useEffect(() => {
    if (showLevelModal) return; // Pause physics during intro/transition modal

    const interval = setInterval(() => {
      setStars((prev) =>
        prev.map((star) => {
          let nx = star.x + star.vx;
          let ny = star.y + star.vy;
          let nvx = star.vx;
          let nvy = star.vy;

          // Boundary bouncing with margin
          if (nx <= 6) {
            nx = 6;
            nvx = Math.abs(nvx);
          } else if (nx >= 94) {
            nx = 94;
            nvx = -Math.abs(nvx);
          }

          if (ny <= 8) {
            ny = 8;
            nvy = Math.abs(nvy);
          } else if (ny >= 92) {
            ny = 92;
            nvy = -Math.abs(nvy);
          }

          return {
            ...star,
            x: nx,
            y: ny,
            vx: nvx,
            vy: nvy,
            rotation: (star.rotation + star.rotSpeed) % 360,
          };
        })
      );
    }, 30);

    return () => clearInterval(interval);
  }, [showLevelModal]);

  // Dynamic Color Shift Loop ("2 sn de renk değiştirsin çocuk doğru renkte yakalamaya çalışsın")
  useEffect(() => {
    if (showLevelModal || !currentRound.colorShiftIntervalMs) return;

    const intervalMs = currentRound.colorShiftIntervalMs;

    // Check periodically (every 400ms) which stars need to shift their color
    const timer = setInterval(() => {
      const now = Date.now();

      setStars((prevStars) => {
        let changed = false;

        const updated = prevStars.map((star) => {
          // If this star has been this color longer than intervalMs (plus slight variation)
          if (now - star.lastColorChangeTime >= intervalMs) {
            changed = true;

            // Pick a new balanced color different from current
            const availableColors = ALL_STAR_COLORS.filter((c) => c !== star.color);
            const newColor = pickBalancedColor(
              currentRound.targetColors,
              collectedByColor,
              currentRound.goalsByColor,
              prevStars
            );

            return {
              ...star,
              color: newColor === star.color
                ? availableColors[Math.floor(Math.random() * availableColors.length)]
                : newColor,
              lastColorChangeTime: now,
              isShiftingColor: true,
            };
          }
          return star;
        });

        return changed ? updated : prevStars;
      });
    }, 400);

    return () => clearInterval(timer);
  }, [showLevelModal, currentRound.colorShiftIntervalMs, collectedByColor]);

  // Particle cleanup
  useEffect(() => {
    if (particles.length === 0) return;
    const timer = setTimeout(() => {
      setParticles([]);
    }, 600);
    return () => clearTimeout(timer);
  }, [particles]);

  // Create burst effect at star coordinate
  const triggerBurst = (x: number, y: number, colorHex: string) => {
    const burstId = nextParticleId.current++;
    setParticles((prev) => [...prev, { id: burstId, x, y, color: colorHex }]);
  };

  // Handle Star Click
  const handleStarClick = (star: FloatingStar) => {
    if (showLevelModal) return;

    const isFreeRound = currentRound.targetColors.length >= ALL_STAR_COLORS.length;
    const isTargetColor = currentRound.targetColors.includes(star.color);

    // In targeted rounds, check if this color's individual goal is already satisfied
    let colorGoalSatisfied = false;
    if (!isFreeRound) {
      const neededForColor = currentRound.goalsByColor[star.color] || 0;
      const currentForColor = collectedByColor[star.color] || 0;
      if (currentForColor >= neededForColor) {
        colorGoalSatisfied = true;
      }
    }

    if (isFreeRound || (isTargetColor && !colorGoalSatisfied)) {
      // SUCCESSFUL HIT
      soundEffects.playStar(soundEnabled);
      soundEffects.playPop(soundEnabled);
      triggerBurst(star.x, star.y, STAR_COLOR_STYLES[star.color].hex);

      setScore((s) => s + 25);
      setWrongNotice(null);

      const nextTotal = totalCollectedInRound + 1;
      setTotalCollectedInRound(nextTotal);

      const nextByColor = {
        ...collectedByColor,
        [star.color]: (collectedByColor[star.color] || 0) + 1,
      };
      setCollectedByColor(nextByColor);

      // Respawn hit star with fresh position and balanced color
      const speed = currentRound.baseSpeed;
      const angle = Math.random() * Math.PI * 2;
      const newColor = pickBalancedColor(
        currentRound.targetColors,
        nextByColor,
        currentRound.goalsByColor,
        stars.filter((s) => s.id !== star.id)
      );

      setStars((prev) =>
        prev.map((s) =>
          s.id === star.id
            ? {
                ...s,
                x: 10 + Math.random() * 80,
                y: 12 + Math.random() * 74,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: newColor,
                lastColorChangeTime: Date.now(),
              }
            : s
        )
      );

      // Check if Round is Complete
      let isRoundFinished = false;
      if (isFreeRound) {
        isRoundFinished = nextTotal >= currentRound.totalGoal;
      } else {
        isRoundFinished = currentRound.targetColors.every(
          (c) => (nextByColor[c] || 0) >= (currentRound.goalsByColor[c] || 0)
        );
      }

      if (isRoundFinished) {
        soundEffects.playFanfare(soundEnabled);
        setTimeout(() => {
          if (currentRoundIdx + 1 < ROUNDS.length) {
            setCurrentRoundIdx((r) => r + 1);
            setShowLevelModal(true);
          } else {
            onComplete(3, score + 180);
          }
        }, 500);
      }
    } else {
      // WRONG STAR CLICKED
      soundEffects.playBoing(soundEnabled);
      if (colorGoalSatisfied) {
        setWrongNotice(
          `${STAR_COLOR_STYLES[star.color].name} yıldızları tamamlandı! Kalan diğer hedef renkleri yakala.`
        );
      } else if (currentRound.colorShiftIntervalMs) {
        setWrongNotice(
          `Şu an ${STAR_COLOR_STYLES[star.color].name} renkte! Yıldızın hedef renge dönüşmesini bekle ve hemen tıkla!`
        );
      } else {
        setWrongNotice('Bu yıldız değil! Yukarıda belirtilen hedef renkteki yıldızı ara ve tıkla.');
      }
      setTimeout(() => setWrongNotice(null), 2400);
    }
  };

  const handleContinueLevel = () => {
    soundEffects.playPop(soundEnabled);
    setShowLevelModal(false);
  };

  const handleRestart = () => {
    soundEffects.playPop(soundEnabled);
    setCollectedByColor({});
    setTotalCollectedInRound(0);
    setWrongNotice(null);
    setShowLevelModal(true);
  };

  const isFreeRound = currentRound.targetColors.length >= ALL_STAR_COLORS.length;

  return (
    <div className="w-full max-w-5xl bg-white rounded-3xl border-4 border-amber-300 shadow-xl overflow-hidden flex flex-col select-none">
      {/* Top Header Bar */}
      <div className="bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 px-5 py-3 border-b-2 border-amber-300 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className="px-3 py-1 rounded-full bg-amber-600 text-white font-black text-xs shadow-xs flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-white text-white" />
            <span>Etkinlik 11</span>
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-amber-950">
                Yıldız Avcısı – {currentRound.title}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] sm:text-xs font-black">
                Seviye {currentRound.roundNum} / {ROUNDS.length}
              </span>
            </div>
            <p className="text-xs font-semibold text-amber-800 hidden sm:block">
              {currentRound.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentRound.colorShiftIntervalMs && (
            <div className="bg-purple-100 border border-purple-300 text-purple-900 px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1 animate-pulse">
              <Timer className="w-3.5 h-3.5 text-purple-600" />
              <span>{currentRound.colorShiftIntervalMs / 1000} sn Renk Değişimi!</span>
            </div>
          )}

          <div className="bg-white/95 border-2 border-amber-300 px-3 py-1 rounded-full text-xs font-black text-amber-900 shadow-2xs">
            {totalCollectedInRound} / {currentRound.totalGoal} Yıldız
          </div>

          <button
            onClick={() => setShowGuide(!showGuide)}
            className="p-1.5 rounded-xl bg-white/80 hover:bg-white text-amber-800 border border-amber-300 cursor-pointer"
            title="Nasıl Oynanır?"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={handleRestart}
            className="p-1.5 rounded-xl bg-white/80 hover:bg-white text-amber-800 border border-amber-300 cursor-pointer"
            title="Yeniden Başlat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Target Color Banner with Visual Goal Badges */}
      <div className="bg-slate-900 border-b-2 border-amber-400 px-5 py-2.5 flex items-center justify-between flex-wrap gap-2 shadow-xs">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="text-xs sm:text-sm font-black text-amber-300 whitespace-nowrap flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>HEDEF YILDIZLAR:</span>
          </span>

          <div className="flex items-center gap-2 flex-wrap">
            {isFreeRound ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 text-white font-black text-xs sm:text-sm shadow-md border border-white">
                <span className="text-base">⭐</span>
                <span>
                  Herhangi Bir Yıldız: {totalCollectedInRound} / {currentRound.totalGoal}
                </span>
              </div>
            ) : (
              currentRound.targetColors.map((color) => {
                const info = STAR_COLOR_STYLES[color];
                const goal = currentRound.goalsByColor[color] || 0;
                const count = collectedByColor[color] || 0;
                const isCompleted = count >= goal;

                return (
                  <div
                    key={color}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-2xl font-black text-xs sm:text-sm shadow-md border-2 transition-all ${
                      isCompleted
                        ? 'bg-emerald-600 text-white border-emerald-300 opacity-90'
                        : 'text-white border-white animate-pulse'
                    }`}
                    style={{ backgroundColor: isCompleted ? '#059669' : info.hex }}
                  >
                    <span className="text-base">{info.emoji}</span>
                    <span>{info.name}:</span>
                    <span className="bg-black/30 px-1.5 py-0.5 rounded-md text-xs font-mono">
                      {count} / {goal}
                    </span>
                    {isCompleted && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {currentRound.colorShiftIntervalMs && (
          <span className="text-[11px] sm:text-xs font-black text-amber-200 bg-amber-950/80 px-2.5 py-1 rounded-xl border border-amber-400/50 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Hedef renge döndüğünde yakala!</span>
          </span>
        )}
      </div>

      {/* Guide Bar */}
      {showGuide && (
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-2 flex items-center justify-between text-xs sm:text-sm text-amber-950 font-bold animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="text-xl">⭐</span>
            <span>
              <strong>Nasıl Oynanır?</strong> Gece gökyüzünde rengarenk yıldızlar süzülüyor. {currentRound.colorShiftIntervalMs ? 'Yıldızlar renk değiştirir; hedef renge dönüştükleri anı yakala!' : 'Farklı renkler arasından yukarıda istenen hedef renkteki yıldızı bul ve sol tıkla!'}
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

      {/* Notification Banner */}
      {wrongNotice && (
        <div className="bg-rose-100 border-b-2 border-rose-300 px-4 py-2 text-center text-xs sm:text-sm font-black text-rose-800 animate-bounce">
          ⚠️ {wrongNotice}
        </div>
      )}

      {/* Night Sky Canvas with Clean Floating Solid Stars */}
      <div className="relative w-full h-[460px] sm:h-[520px] bg-gradient-to-b from-[#060814] via-[#0d142b] to-[#1e1b4b] overflow-hidden cursor-crosshair select-none">
        {/* Decorative celestial background */}
        <div className="absolute top-5 left-10 text-3xl opacity-30 pointer-events-none">☁️</div>
        <div className="absolute top-12 right-16 text-4xl opacity-25 pointer-events-none">☁️</div>
        <div className="absolute top-8 right-1/3 text-2xl opacity-40 pointer-events-none">✨</div>
        <div className="absolute top-20 left-1/4 text-2xl opacity-40 pointer-events-none">🌕</div>
        <div className="absolute bottom-10 right-10 text-3xl opacity-30 pointer-events-none">🪐</div>

        {/* Floating Clean Solid Stars with Smooth Color Shifts */}
        {stars.map((star) => {
          const info = STAR_COLOR_STYLES[star.color];

          return (
            <div
              key={star.id}
              onClick={() => handleStarClick(star)}
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                transform: `translate(-50%, -50%) rotate(${star.rotation}deg)`,
                filter: `drop-shadow(0 0 14px ${info.hex})`,
                transition: 'filter 0.4s ease-in-out, transform 0.15s ease-out',
              }}
              className="absolute cursor-pointer select-none group flex items-center justify-center hover:scale-125 active:scale-95"
            >
              {/* Clean 5-point Solid Star with Smooth Fill Transition */}
              <svg
                viewBox="0 0 24 24"
                className="w-full h-full transition-colors duration-400 ease-in-out"
                style={{ fill: info.hex }}
              >
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  stroke="#ffffff"
                  strokeWidth="0.8"
                />
              </svg>
            </div>
          );
        })}

        {/* Sparkle Burst Particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 flex items-center justify-center"
          >
            <span className="text-3xl animate-ping">✨</span>
            <span className="absolute text-2xl animate-bounce">⭐</span>
          </div>
        ))}

        {/* LEVEL BAŞLANGIÇ AÇIKLAMA MODALI */}
        {showLevelModal && (
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] flex items-center justify-center z-40 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm sm:max-w-md w-full shadow-2xl border-4 border-amber-400 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
              {/* Star Crown Icon */}
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-200 border-2 border-amber-400 shadow-md flex items-center justify-center text-3xl mb-3 animate-bounce">
                ⭐
              </div>

              {/* Level Ribbon */}
              <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-black text-xs sm:text-sm uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>SEVİYE {currentRound.roundNum} / {ROUNDS.length}</span>
              </div>

              {/* Level Title */}
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 mb-1">
                {currentRound.title.replace(/^\d+\.\s*Seviye:\s*/, '')}
              </h3>

              <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 px-3 py-0.5 rounded-full text-xs font-black mb-3">
                <span>{currentRound.subtitle}</span>
              </div>

              {/* Level Mission Explanation */}
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mb-3 px-2 leading-relaxed">
                {currentRound.instructionText}
              </p>

              {/* Color Shift Hint Tag if applicable */}
              {currentRound.colorShiftIntervalMs && (
                <div className="w-full bg-purple-50 border border-purple-200 rounded-xl p-2 mb-3 text-xs font-extrabold text-purple-900 flex items-center justify-center gap-1.5">
                  <Timer className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Yıldızlar her {currentRound.colorShiftIntervalMs / 1000} saniyede renk değiştirir! Tam hedef renge döndüğünde sol tıkla!</span>
                </div>
              )}

              {/* Target Preview Badges */}
              <div className="flex flex-wrap gap-2 justify-center mb-5 w-full">
                {isFreeRound ? (
                  <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-white font-black text-xs sm:text-sm shadow-md">
                    ⭐ Herhangi 6 Yıldızı Yakala
                  </div>
                ) : (
                  currentRound.targetColors.map((color) => {
                    const info = STAR_COLOR_STYLES[color];
                    const goal = currentRound.goalsByColor[color] || 0;

                    return (
                      <div
                        key={color}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-white font-black text-xs sm:text-sm shadow-md border-2 border-white"
                        style={{ backgroundColor: info.hex }}
                      >
                        <span className="text-base">{info.emoji}</span>
                        <span>{info.name}:</span>
                        <span className="bg-black/25 px-1.5 py-0.5 rounded-md text-xs font-mono">
                          {goal} Yıldız
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Devam Et & Başla Button */}
              <button
                onClick={handleContinueLevel}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white text-base sm:text-lg font-black shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>Devam Et & Başla</span>
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
              className="bg-amber-500 h-full transition-all duration-300"
              style={{
                width: `${
                  ((currentRoundIdx * 10 +
                    (totalCollectedInRound / currentRound.totalGoal) * 10) /
                    (ROUNDS.length * 10)) *
                  100
                }%`,
              }}
            />
          </div>
          <span>Seviye {currentRound.roundNum} / {ROUNDS.length}</span>
        </div>

        <div className="text-amber-800 font-extrabold flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>
            {currentRound.colorShiftIntervalMs
              ? `Yıldızlar ${currentRound.colorShiftIntervalMs / 1000} sn'de renk değiştirir, hedef renge dönünce tıkla`
              : 'Farklı renkler arasından hedef yıldızı bul ve tıkla'}
          </span>
        </div>
      </div>
    </div>
  );
};
