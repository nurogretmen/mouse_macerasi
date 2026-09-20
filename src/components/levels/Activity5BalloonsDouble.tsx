import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, RotateCcw, Sparkles, CheckCircle2, Play, Zap } from 'lucide-react';
import { soundEffects } from '../../utils/audio.ts';

interface Activity5Props {
  soundEnabled: boolean;
  onComplete: (stars: number, score: number) => void;
  onSoundToggle: () => void;
}

type BalloonColor = 'yellow' | 'green' | 'red' | 'blue' | 'purple' | 'orange' | 'pink';

interface BalloonItem {
  id: number;
  lane: number;
  x: number;
  y: number;
  speed: number;
  color: BalloonColor;
  size: number;
  popped: boolean;
}

interface PopParticle {
  id: number;
  x: number;
  y: number;
  color: string;
}

interface RoundConfig {
  roundNum: number;
  title: string;
  targetColors: BalloonColor[];
  goalsByColor: Partial<Record<BalloonColor, number>>;
  totalGoal: number;
  instructionText: string;
  baseSpeed: number;
}

const ALL_BALLOON_COLORS: BalloonColor[] = [
  'yellow',
  'green',
  'red',
  'blue',
  'purple',
  'orange',
  'pink',
];

// Balonların asla çakışmaması ve üst üste gelmemesi için 6 bağımsız koridor (Lane)
const LANES: number[] = [12, 27, 42, 57, 72, 87];

const ROUNDS: RoundConfig[] = [
  {
    roundNum: 1,
    title: '1. Seviye: Serbest Isınma (Çift Tık)',
    targetColors: ALL_BALLOON_COLORS,
    goalsByColor: {},
    totalGoal: 10,
    instructionText: 'Alttan yükselen herhangi bir balona hızlıca İKİ KEZ (Çift Tık) bas ve 10 balon patlat!',
    baseSpeed: 0.22,
  },
  {
    roundNum: 2,
    title: '2. Seviye: Sadece Sarı Balonlar',
    targetColors: ['yellow'],
    goalsByColor: { yellow: 10 },
    totalGoal: 10,
    instructionText: 'Sadece SARI 🟡 balonları bul ve hızlıca İKİ KEZ ÇİFT TIKLA! (Hedef: 10 Sarı Balon)',
    baseSpeed: 0.22,
  },
  {
    roundNum: 3,
    title: '3. Seviye: Sadece Yeşil Balonlar',
    targetColors: ['green'],
    goalsByColor: { green: 10 },
    totalGoal: 10,
    instructionText: 'Sadece YEŞİL 🟢 balonları bul ve hızlıca İKİ KEZ ÇİFT TIKLA! (Hedef: 10 Yeşil Balon)',
    baseSpeed: 0.23,
  },
  {
    roundNum: 4,
    title: '4. Seviye: Sadece Mavi Balonlar',
    targetColors: ['blue'],
    goalsByColor: { blue: 10 },
    totalGoal: 10,
    instructionText: 'Sadece MAVİ 🔵 balonları yakala ve hızlıca İKİ KEZ ÇİFT TIKLA! (Hedef: 10 Mavi Balon)',
    baseSpeed: 0.23,
  },
  {
    roundNum: 5,
    title: '5. Seviye: Sarı ve Kırmızı Balonlar',
    targetColors: ['yellow', 'red'],
    goalsByColor: { yellow: 6, red: 6 },
    totalGoal: 12,
    instructionText: '6 SARI 🟡 ve 6 KIRMIZI 🔴 balona ÇİFT TIKLAYARAK patlat! (Toplam 12 Balon)',
    baseSpeed: 0.24,
  },
  {
    roundNum: 6,
    title: '6. Seviye: Yeşil ve Mor Balonlar',
    targetColors: ['green', 'purple'],
    goalsByColor: { green: 6, purple: 6 },
    totalGoal: 12,
    instructionText: '6 YEŞİL 🟢 ve 6 MOR 🟣 balona ÇİFT TIKLAYARAK patlat! (Toplam 12 Balon)',
    baseSpeed: 0.24,
  },
  {
    roundNum: 7,
    title: '7. Seviye: Mavi, Turuncu ve Pembe Balonlar',
    targetColors: ['blue', 'orange', 'pink'],
    goalsByColor: { blue: 6, orange: 6, pink: 6 },
    totalGoal: 18,
    instructionText: '6 MAVİ 🔵, 6 TURUNCU 🟠 ve 6 PEMBE 🌸 balona ÇİFT TIKLA! (Toplam 18 Balon)',
    baseSpeed: 0.25,
  },
  {
    roundNum: 8,
    title: '8. Seviye: Şampiyonluk Avı (Kırmızı, Yeşil ve Sarı)',
    targetColors: ['red', 'green', 'yellow'],
    goalsByColor: { red: 8, green: 8, yellow: 8 },
    totalGoal: 24,
    instructionText: 'Şampiyonluk Seviyesi! 8 KIRMIZI 🔴, 8 YEŞİL 🟢 ve 8 SARI 🟡 balona ÇİFT TIKLA! (Toplam 24 Balon)',
    baseSpeed: 0.26,
  },
];

const COLOR_STYLES: Record<
  BalloonColor,
  { bg: string; border: string; emoji: string; name: string }
> = {
  yellow: { bg: '#eab308', border: '#ca8a04', emoji: '🟡', name: 'Sarı' },
  green: { bg: '#22c55e', border: '#16a34a', emoji: '🟢', name: 'Yeşil' },
  red: { bg: '#ef4444', border: '#dc2626', emoji: '🔴', name: 'Kırmızı' },
  blue: { bg: '#3b82f6', border: '#1d4ed8', emoji: '🔵', name: 'Mavi' },
  purple: { bg: '#a855f7', border: '#7e22ce', emoji: '🟣', name: 'Mor' },
  orange: { bg: '#f97316', border: '#c2410c', emoji: '🟠', name: 'Turuncu' },
  pink: { bg: '#ec4899', border: '#be185d', emoji: '🌸', name: 'Pembe' },
};

export const Activity5BalloonsDouble: React.FC<Activity5Props> = ({
  soundEnabled,
  onComplete,
}) => {
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [poppedByColor, setPoppedByColor] = useState<Partial<Record<BalloonColor, number>>>({});
  const [totalRoundPopped, setTotalRoundPopped] = useState(0);
  const [balloons, setBalloons] = useState<BalloonItem[]>([]);
  const [poppedParticles, setPoppedParticles] = useState<PopParticle[]>([]);
  const [showGuide, setShowGuide] = useState(true);
  const [wrongNotice, setWrongNotice] = useState<string | null>(null);
  const [showLevelModal, setShowLevelModal] = useState(true);
  const [score, setScore] = useState(0);

  const nextIdRef = useRef(1);
  const lastClickRef = useRef<Record<number, number>>({});

  const currentRound = ROUNDS[currentRoundIdx];
  const currentRoundRef = useRef(currentRound);
  currentRoundRef.current = currentRound;

  const poppedByColorRef = useRef(poppedByColor);
  poppedByColorRef.current = poppedByColor;

  const showLevelModalRef = useRef(showLevelModal);
  showLevelModalRef.current = showLevelModal;

  // Doğal ve dengeli renk seçici
  const pickColorForRound = (
    round: RoundConfig,
    currentPoppedMap: Partial<Record<BalloonColor, number>>,
    activeList: BalloonItem[] = []
  ): BalloonColor => {
    const { targetColors, goalsByColor } = round;

    // 1. Seviye: Serbest aşama, tüm renkler dengeli dağıtılır
    if (targetColors.length >= ALL_BALLOON_COLORS.length) {
      return ALL_BALLOON_COLORS[Math.floor(Math.random() * ALL_BALLOON_COLORS.length)];
    }

    // Halen hedefine ulaşmamış hedef renkleri belirle
    const pendingTargetColors = targetColors.filter((col) => {
      const quota = goalsByColor[col] ?? 0;
      const done = currentPoppedMap[col] ?? 0;
      return done < quota;
    });

    const distractors = ALL_BALLOON_COLORS.filter((c) => !targetColors.includes(c));

    if (pendingTargetColors.length === 0) {
      return distractors[Math.floor(Math.random() * distractors.length)] || ALL_BALLOON_COLORS[0];
    }

    const activeTargets = activeList.filter(
      (b) => !b.popped && pendingTargetColors.includes(b.color)
    );

    // Tek Hedefli Seviyeler (2. Seviye Sarı, 3. Seviye Yeşil, 4. Seviye Mavi):
    if (pendingTargetColors.length === 1) {
      const targetCol = pendingTargetColors[0];
      const countOnScreen = activeTargets.filter((b) => b.color === targetCol).length;

      if (countOnScreen === 0) {
        if (Math.random() < 0.55) {
          return targetCol;
        }
        return distractors[Math.floor(Math.random() * distractors.length)];
      }

      if (countOnScreen === 1) {
        if (Math.random() < 0.20) {
          return targetCol;
        }
        return distractors[Math.floor(Math.random() * distractors.length)];
      }

      return distractors[Math.floor(Math.random() * distractors.length)];
    }

    // Çoklu Hedefli Seviyeler (5, 6, 7, 8. Seviyeler):
    const missingTargets = pendingTargetColors.filter(
      (col) => !activeTargets.some((b) => b.color === col)
    );

    if (missingTargets.length > 0 && Math.random() < 0.55) {
      const sortedNeeded = [...missingTargets].sort((a, b) => {
        const doneA = currentPoppedMap[a] ?? 0;
        const doneB = currentPoppedMap[b] ?? 0;
        return doneA - doneB;
      });
      return sortedNeeded[0];
    }

    if (Math.random() < 0.30) {
      return pendingTargetColors[Math.floor(Math.random() * pendingTargetColors.length)];
    }
    return distractors[Math.floor(Math.random() * distractors.length)];
  };

  // Balonları doğrudan havada belirmeyecek şekilde, ekranın altından kademeli ve 6 ayrı koridorda başlat
  const spawnNewSet = () => {
    const list: BalloonItem[] = [];
    const round = currentRoundRef.current;
    const baseSpeed = round.baseSpeed;
    const { targetColors } = round;

    const staggerOrder = [0, 1, 2, 3, 4, 5].sort(() => Math.random() - 0.5);

    let laneColors: BalloonColor[] = [];

    if (targetColors.length >= ALL_BALLOON_COLORS.length) {
      laneColors = [...ALL_BALLOON_COLORS].sort(() => Math.random() - 0.5).slice(0, 6);
    } else if (targetColors.length === 1) {
      const targetCol = targetColors[0];
      const distractors = ALL_BALLOON_COLORS.filter((c) => c !== targetCol).sort(
        () => Math.random() - 0.5
      );
      laneColors = [
        targetCol,
        distractors[0],
        distractors[1],
        targetCol,
        distractors[2],
        distractors[3],
      ].sort(() => Math.random() - 0.5);
    } else {
      const distractors = ALL_BALLOON_COLORS.filter((c) => !targetColors.includes(c)).sort(
        () => Math.random() - 0.5
      );
      const neededDistractors = 6 - targetColors.length;
      laneColors = [...targetColors, ...distractors.slice(0, neededDistractors)].sort(
        () => Math.random() - 0.5
      );
    }

    for (let lane = 0; lane < LANES.length; lane++) {
      const orderRank = staggerOrder.indexOf(lane);

      list.push({
        id: nextIdRef.current++,
        lane,
        x: LANES[lane],
        y: 106 + orderRank * 16 + Math.random() * 4,
        speed: baseSpeed + (Math.random() * 0.03 - 0.015),
        color: laneColors[lane] || ALL_BALLOON_COLORS[lane % ALL_BALLOON_COLORS.length],
        size: 72 + Math.random() * 6,
        popped: false,
      });
    }

    lastClickRef.current = {};
    setBalloons(list);
    setPoppedByColor({});
    setTotalRoundPopped(0);
  };

  useEffect(() => {
    spawnNewSet();
  }, [currentRoundIdx]);

  // Balonların yukarı doğru süzülme döngüsü
  useEffect(() => {
    const interval = setInterval(() => {
      if (showLevelModalRef.current) return;

      setBalloons((prev) => {
        const round = currentRoundRef.current;
        const currentPopped = poppedByColorRef.current;
        const baseSpeed = round.baseSpeed;

        return prev.map((b) => {
          if (b.popped) return b;
          const newY = b.y - b.speed;

          if (newY < -18) {
            return {
              ...b,
              y: 105 + Math.random() * 6,
              x: LANES[b.lane],
              speed: baseSpeed + (Math.random() * 0.03 - 0.015),
              color: pickColorForRound(round, currentPopped, prev),
            };
          }
          return { ...b, y: newY };
        });
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  // Balon Patlatma Mantığı - ÇİFT TIK KONTROLÜ
  const handleBalloonExecuteDouble = (balloon: BalloonItem) => {
    const round = currentRoundRef.current;
    const { targetColors, goalsByColor, totalGoal } = round;

    const isTarget = targetColors.includes(balloon.color);
    const colorQuota = goalsByColor[balloon.color];
    const currentForColor = poppedByColorRef.current[balloon.color] || 0;
    const isColorQuotaFilled = colorQuota !== undefined && currentForColor >= colorQuota;

    if (isTarget && !isColorQuotaFilled) {
      soundEffects.playPop(soundEnabled);
      soundEffects.playStar(soundEnabled);

      const particleId = Date.now() + Math.random();
      setPoppedParticles((prev) => [
        ...prev,
        { id: particleId, x: balloon.x, y: balloon.y, color: COLOR_STYLES[balloon.color].bg },
      ]);

      setTimeout(() => {
        setPoppedParticles((prev) => prev.filter((p) => p.id !== particleId));
      }, 400);

      const nextPoppedForColor = currentForColor + 1;
      const nextPoppedByColor = {
        ...poppedByColorRef.current,
        [balloon.color]: nextPoppedForColor,
      };
      setPoppedByColor(nextPoppedByColor);
      poppedByColorRef.current = nextPoppedByColor;

      const nextTotal = totalRoundPopped + 1;
      setTotalRoundPopped(nextTotal);
      setScore((s) => s + 25);
      setWrongNotice(null);

      // Balonu patlat
      setBalloons((prev) =>
        prev.map((b) => (b.id === balloon.id ? { ...b, popped: true } : b))
      );

      // Seviye tamamlandı mı?
      if (nextTotal >= totalGoal) {
        soundEffects.playFanfare(soundEnabled);

        if (currentRoundIdx + 1 < ROUNDS.length) {
          setTimeout(() => {
            setCurrentRoundIdx((r) => r + 1);
            setShowLevelModal(true);
          }, 500);
        } else {
          setTimeout(() => {
            onComplete(3, score + 250);
          }, 1200);
        }
      } else {
        // Patlayan balonun yerine kendi koridorundan alttan yükselen yeni balon gönder
        setTimeout(() => {
          setBalloons((prev) => [
            ...prev.filter((b) => b.id !== balloon.id),
            {
              id: nextIdRef.current++,
              lane: balloon.lane,
              x: LANES[balloon.lane],
              y: 108 + Math.random() * 5,
              speed: round.baseSpeed + (Math.random() * 0.03 - 0.015),
              color: pickColorForRound(round, poppedByColorRef.current, prev),
              size: 72 + Math.random() * 6,
              popped: false,
            },
          ]);
        }, 350);
      }
    } else if (isTarget && isColorQuotaFilled) {
      soundEffects.playBoing(soundEnabled);
      setWrongNotice(`${COLOR_STYLES[balloon.color].name} balon hedefini tamamladın! Şimdi diğer renkteki balona çift tıkla.`);
      setTimeout(() => setWrongNotice(null), 2000);
    } else {
      soundEffects.playWrong ? soundEffects.playWrong(soundEnabled) : soundEffects.playBoing(soundEnabled);
      setWrongNotice('Hedef rengi kontrol et! Yukarıda belirtilen renkteki balona sol tuşla ÇİFT TIKLA.');
      setTimeout(() => setWrongNotice(null), 1800);
    }
  };

  // Tıklama işleyicisi:
  // Bir kez tıklandığında patlamaz, hiçbir ses ve dönüt verilmez, sessizce ikinci tıklamayı bekler.
  // 550ms içinde 2. kez tıklanırsa çift tık tetiklenir ve balon patlar.
  const handleBalloonClick = (balloon: BalloonItem) => {
    if (balloon.popped || showLevelModal) return;

    const now = Date.now();
    const lastTime = lastClickRef.current[balloon.id] || 0;
    const diff = now - lastTime;
    lastClickRef.current[balloon.id] = now;

    if (diff > 0 && diff < 550) {
      // Başarılı çift tık
      lastClickRef.current[balloon.id] = 0;
      handleBalloonExecuteDouble(balloon);
    }
    // Tek tıkta hiçbir işlem yapılmaz, dönüt verilmez
  };

  // HTML5 dblclick yedeği (eğer tarayıcı doğrudan dblclick tetiklerse)
  const handleBalloonDoubleClick = (balloon: BalloonItem) => {
    if (balloon.popped || showLevelModal) return;
    lastClickRef.current[balloon.id] = 0;
    handleBalloonExecuteDouble(balloon);
  };

  const handleContinueLevel = () => {
    setShowLevelModal(false);
    soundEffects.playPop(soundEnabled);
    spawnNewSet();
  };

  const handleRestart = () => {
    setCurrentRoundIdx(0);
    setScore(0);
    setWrongNotice(null);
    setShowLevelModal(true);
    spawnNewSet();
    soundEffects.playPop(soundEnabled);
  };

  return (
    <div className="w-full max-w-5xl bg-white rounded-3xl border-4 border-amber-300 shadow-xl overflow-hidden flex flex-col select-none relative">
      {/* Level Header Bar */}
      <div className="bg-gradient-to-r from-amber-100 via-orange-100 to-yellow-200 px-5 py-3 border-b-2 border-amber-300 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className="px-3 py-1 rounded-full bg-amber-600 text-white font-black text-xs shadow-xs flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>Etkinlik 5</span>
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-amber-950">
                Balon Şenliği 2 – Çift Tıklama ({currentRound.title})
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] sm:text-xs font-black shadow-xs">
                Seviye {currentRound.roundNum} / {ROUNDS.length}
              </span>
            </div>
            <p className="text-xs font-semibold text-amber-800 hidden sm:block">
              {currentRound.instructionText}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Popped Target Badge */}
          <div className="bg-white/95 border-2 border-amber-300 px-3.5 py-1 rounded-full text-xs font-black text-amber-900 shadow-2xs flex items-center gap-1">
            <span>{totalRoundPopped} / {currentRound.totalGoal} Balon</span>
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

      {/* Target Color Banner with Visual Cues & Per-Color Counts */}
      <div className="bg-amber-50 border-b-2 border-amber-200 px-5 py-2.5 flex items-center justify-between flex-wrap gap-2 shadow-xs">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="text-xs sm:text-sm font-black text-amber-950 whitespace-nowrap">
            ÇİFT TIKLANACAK HEDEF BALONLAR:
          </span>

          {/* Color Badges with individual goal tracking */}
          <div className="flex items-center gap-2 flex-wrap">
            {currentRound.targetColors.length >= ALL_BALLOON_COLORS.length ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-black text-xs sm:text-sm shadow-md border-2 border-white">
                <span className="text-lg">🎈</span>
                <span>Herhangi Bir Balon: {totalRoundPopped} / {currentRound.totalGoal}</span>
              </div>
            ) : (
              currentRound.targetColors.map((color) => {
                const info = COLOR_STYLES[color];
                const goal = currentRound.goalsByColor[color] || 0;
                const poppedCount = poppedByColor[color] || 0;
                const isCompleted = poppedCount >= goal;

                return (
                  <div
                    key={color}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-2xl font-black text-xs sm:text-sm shadow-md border-2 transition-all ${
                      isCompleted
                        ? 'bg-emerald-500 text-white border-emerald-300 opacity-90'
                        : 'text-white border-white animate-pulse'
                    }`}
                    style={{ backgroundColor: isCompleted ? '#10b981' : info.bg }}
                  >
                    <span className="text-base">{info.emoji}</span>
                    <span>{info.name}:</span>
                    <span className="bg-black/20 px-1.5 py-0.5 rounded-md text-xs font-mono">
                      {poppedCount} / {goal}
                    </span>
                    {isCompleted && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Level Indicator Pill */}
        <span className="text-xs font-black text-amber-900 bg-white px-3 py-1 rounded-xl border border-amber-200 shadow-2xs whitespace-nowrap">
          Seviye {currentRoundIdx + 1} / {ROUNDS.length}
        </span>
      </div>

      {/* Guide Dropdown Bar */}
      {showGuide && (
        <div className="bg-amber-100/90 border-b border-amber-300 px-5 py-2.5 flex items-center justify-between text-xs sm:text-sm text-amber-950 font-bold animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💡</span>
            <span>
              <strong>Nasıl Oynanır?</strong> Bu sefer tek tık yetmez! Farenin sol tuşuna hedef balonun üzerindeyken <strong>hızlıca iki kez üst üste</strong> basmalısın (Çift Tık).
            </span>
          </div>
          <button
            onClick={() => setShowGuide(false)}
            className="text-xs text-amber-900 underline font-black hover:text-amber-950 cursor-pointer ml-3 shrink-0"
          >
            Kapat
          </button>
        </div>
      )}

      {/* Wrong Click Notification Banner (Sadece yanlış renge çift tıklandığında gösterilir) */}
      {wrongNotice && (
        <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 text-center text-xs sm:text-sm font-black text-rose-700 animate-bounce">
          ⚠️ {wrongNotice}
        </div>
      )}

      {/* Sky Canvas - Same rich visual look as Balon Şenliği 1 */}
      <div className="relative w-full h-[460px] sm:h-[520px] bg-gradient-to-b from-[#38bdf8] via-[#7dd3fc] to-[#bae6fd] overflow-hidden">
        {/* Soft Background Clouds */}
        <div className="absolute top-6 left-12 text-4xl opacity-70 pointer-events-none">☁️</div>
        <div className="absolute top-16 right-16 text-5xl opacity-60 pointer-events-none">☁️</div>
        <div className="absolute bottom-16 left-1/3 text-4xl opacity-50 pointer-events-none">☁️</div>

        {/* Floating Balloons in non-overlapping dedicated lanes */}
        {balloons.map((b) => {
          if (b.popped) return null;
          const isTarget = currentRound.targetColors.includes(b.color);
          const isNeeded =
            isTarget &&
            (!currentRound.goalsByColor[b.color] ||
              (poppedByColor[b.color] || 0) < (currentRound.goalsByColor[b.color] || 0));

          return (
            <div
              key={b.id}
              onClick={() => handleBalloonClick(b)}
              onDoubleClick={() => handleBalloonDoubleClick(b)}
              style={{
                left: `${b.x}%`,
                top: `${b.y}%`,
                width: `${b.size}px`,
                height: `${b.size * 1.25}px`,
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute cursor-pointer flex flex-col items-center justify-center transition-transform active:scale-90 select-none group hover:scale-105"
            >
              {/* Balloon Body - Tamamen sade ve temiz balon, üzerinde hiçbir simge/yönlendirme yok */}
              <div
                style={{
                  backgroundColor: COLOR_STYLES[b.color].bg,
                  boxShadow: `inset -6px -8px 0px rgba(0,0,0,0.18), 0 8px 16px rgba(0,0,0,0.15)`,
                }}
                className="w-full h-[85%] rounded-[50%_50%_50%_50%_/_40%_40%_60%_60%] relative flex items-center justify-center border-2 border-white/40"
              >
                {/* Light shine highlight */}
                <div className="absolute top-2 left-3 w-3 h-6 bg-white/50 rounded-full rotate-[-25deg]" />
              </div>

              {/* Balloon Knot & String */}
              <div
                style={{ backgroundColor: COLOR_STYLES[b.color].border }}
                className="w-3 h-2 rounded-xs -mt-0.5"
              />
              <div className="w-0.5 h-6 bg-slate-600/60" />
            </div>
          );
        })}

        {/* Burst particles - ONLY appear momentarily upon double-clicking a balloon */}
        {poppedParticles.map((p) => (
          <div
            key={p.id}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center"
          >
            <div
              className="w-16 h-16 rounded-full opacity-70 animate-ping"
              style={{ backgroundColor: p.color }}
            />
            <span className="absolute text-2xl animate-bounce">💥</span>
          </div>
        ))}

        {/* LEVEL ATLAYINCA EKRANIN ORTASINDA BELİREN SEVİYE KARTI (DEVAM ET BUTONLU) */}
        {showLevelModal && (
          <div className="absolute inset-0 bg-slate-900/65 backdrop-blur-[2px] flex items-center justify-center z-40 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm sm:max-w-md w-full shadow-2xl border-4 border-amber-400 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
              {/* Level Crown / Badge Icon */}
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-200 border-2 border-amber-400 shadow-md flex items-center justify-center text-3xl mb-3 animate-bounce">
                🎉
              </div>

              {/* Level Number Ribbon */}
              <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-black text-xs sm:text-sm uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>SEVİYE {currentRound.roundNum} / {ROUNDS.length}</span>
              </div>

              {/* Level Title */}
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 mb-1">
                {currentRound.title.replace(/^\d+\.\s*Seviye:\s*/, '')}
              </h3>

              <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-black mb-3">
                <span>Çift Tıklama (Hızlı 2 Tık)</span>
              </div>

              {/* Level Instruction & Target Explanation */}
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mb-4 px-2 leading-relaxed">
                {currentRound.instructionText}
              </p>

              {/* Target Preview Cards */}
              <div className="flex flex-wrap gap-2 justify-center mb-5 w-full">
                {currentRound.targetColors.length >= ALL_BALLOON_COLORS.length ? (
                  <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-black text-xs sm:text-sm shadow-md">
                    🎈 10 Balon Çift Tıkla
                  </div>
                ) : (
                  currentRound.targetColors.map((color) => {
                    const info = COLOR_STYLES[color];
                    const goal = currentRound.goalsByColor[color] || 0;
                    return (
                      <div
                        key={color}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-white font-black text-xs sm:text-sm shadow-md border-2 border-white"
                        style={{ backgroundColor: info.bg }}
                      >
                        <span className="text-base">{info.emoji}</span>
                        <span>{info.name}:</span>
                        <span className="bg-black/20 px-1.5 py-0.5 rounded-md text-xs font-mono">
                          {goal} Balon
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Devam Et Button */}
              <button
                onClick={handleContinueLevel}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-base sm:text-lg font-black shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer group"
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
          <span>İlerleme:</span>
          <div className="w-32 sm:w-56 bg-slate-200 h-3 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full transition-all duration-300"
              style={{
                width: `${
                  ((currentRoundIdx * currentRound.totalGoal + totalRoundPopped) /
                    ROUNDS.reduce((acc, r) => acc + r.totalGoal, 0)) *
                  100
                }%`,
              }}
            />
          </div>
          <span className="text-amber-900 font-extrabold">
            Seviye {currentRoundIdx + 1} / {ROUNDS.length}
          </span>
        </div>

        <div className="text-amber-700 font-extrabold flex items-center gap-1">
          <span>Farenin sol tuşuna hızlıca 2 kez üst üste bas (Çift Tık)</span>
        </div>
      </div>
    </div>
  );
};
