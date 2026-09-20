import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  HelpCircle,
  RotateCcw,
  Star,
  Sparkles,
  Volume2,
  VolumeX,
  Pause,
  Play,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Trophy,
  ArrowUp,
  MousePointer,
} from 'lucide-react';
import { soundEffects } from '../../utils/audio.ts';

interface ActivityProps {
  soundEnabled: boolean;
  onComplete: (stars: number, earnedScore: number) => void;
  onSoundToggle: () => void;
}

interface Satellite {
  id: number;
  atStep: number; // patrolling across this step's height
  xPercent: number; // 0..100
  speed: number; // velocity per frame in percent
  minX: number;
  maxX: number;
  direction: 1 | -1;
}

interface StepData {
  index: number;
  xPercent: number; // center x of the platform (0..100)
  yOffsetPx: number; // vertical distance from bottom
  widthPercent: number; // width in percent
  hasStar: boolean;
  starCollected: boolean;
}

interface LevelConfig {
  levelNum: number;
  name: string;
  badge: string;
  totalSteps: number;
  requiredStars: number;
  stepWidthPercent: number;
  alignmentTolerancePercent: number;
  stepYGapPx: number;
  satellites: Array<{
    atStep: number;
    speed: number;
    minX: number;
    maxX: number;
    initialX: number;
  }>;
}

const LEVEL_CONFIGS: LevelConfig[] = [
  {
    levelNum: 1,
    name: 'Kolay Seviye',
    badge: '1. Seviye – Temel Hareket & Tık',
    totalSteps: 5,
    requiredStars: 3,
    stepWidthPercent: 28,
    alignmentTolerancePercent: 12,
    stepYGapPx: 85,
    satellites: [], // No satellites in Easy
  },
  {
    levelNum: 2,
    name: 'Orta Seviye',
    badge: '2. Seviye – Uydu Engelleri & Dikkat',
    totalSteps: 8,
    requiredStars: 5,
    stepWidthPercent: 22,
    alignmentTolerancePercent: 8.5,
    stepYGapPx: 80,
    satellites: [
      {
        atStep: 3,
        speed: 0.55,
        minX: 20,
        maxX: 80,
        initialX: 30,
      },
      {
        atStep: 6,
        speed: 0.65,
        minX: 25,
        maxX: 75,
        initialX: 70,
      },
    ],
  },
  {
    levelNum: 3,
    name: 'Zor Seviye',
    badge: '3. Seviye – Usta Tırmanıcı',
    totalSteps: 12,
    requiredStars: 8,
    stepWidthPercent: 18,
    alignmentTolerancePercent: 6.5,
    stepYGapPx: 75,
    satellites: [
      {
        atStep: 3,
        speed: 0.6,
        minX: 18,
        maxX: 82,
        initialX: 25,
      },
      {
        atStep: 7,
        speed: 0.85,
        minX: 15,
        maxX: 85,
        initialX: 75,
      },
      {
        atStep: 10,
        speed: 1.05,
        minX: 20,
        maxX: 80,
        initialX: 45,
      },
    ],
  },
];

export const Activity12StarLadder: React.FC<ActivityProps> = ({
  soundEnabled,
  onComplete,
  onSoundToggle,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Active level index (0 = Kolay, 1 = Orta, 2 = Zor)
  const [currentLevelIdx, setCurrentLevelIdx] = useState<number>(0);
  const currentConfig = LEVEL_CONFIGS[currentLevelIdx];

  // Game state
  const [astronautStep, setAstronautStep] = useState<number>(0);
  const [steps, setSteps] = useState<StepData[]>([]);
  const [ladderXPercent, setLadderXPercent] = useState<number>(50);
  const [satellites, setSatellites] = useState<Satellite[]>([]);

  // Scores and stats
  const [score, setScore] = useState<number>(0);
  const [collectedStarsCount, setCollectedStarsCount] = useState<number>(0);
  const [achievementStars, setAchievementStars] = useState<number>(0);

  // Status & notifications
  const [message, setMessage] = useState<string>(
    "Mouse'u sağa ve sola hareket ettirerek merdiveni astronotun altına getir, sonra tıkla!"
  );
  const [messageType, setMessageType] = useState<'info' | 'success' | 'warning'>('info');
  const [isClimbing, setIsClimbing] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(true);
  const [levelCompletedModal, setLevelCompletedModal] = useState<boolean>(false);
  const [allFinished, setAllFinished] = useState<boolean>(false);

  // Track if ladder is currently well-aligned for step transition
  const [isAligned, setIsAligned] = useState<boolean>(false);

  // Generate steps for a level
  const initLevelSteps = useCallback((config: LevelConfig) => {
    const generatedSteps: StepData[] = [];

    // Base ground platform (Step 0)
    generatedSteps.push({
      index: 0,
      xPercent: 50,
      yOffsetPx: 40,
      widthPercent: config.stepWidthPercent * 1.5,
      hasStar: false,
      starCollected: true,
    });

    // Patterns of X positions for steps (alternating and varying)
    const xPattern = [
      40, 65, 35, 70, 45, 28, 62, 38, 72, 48, 25, 75,
    ];

    // Determine which steps have stars so we reach requiredStars
    const starSteps = new Set<number>();
    if (config.levelNum === 1) {
      // 3 stars out of 5 steps
      starSteps.add(1);
      starSteps.add(3);
      starSteps.add(5);
    } else if (config.levelNum === 2) {
      // 5 stars out of 8 steps
      starSteps.add(1);
      starSteps.add(3);
      starSteps.add(5);
      starSteps.add(7);
      starSteps.add(8);
    } else {
      // 8 stars out of 12 steps
      starSteps.add(1);
      starSteps.add(2);
      starSteps.add(4);
      starSteps.add(6);
      starSteps.add(8);
      starSteps.add(9);
      starSteps.add(11);
      starSteps.add(12);
    }

    for (let i = 1; i <= config.totalSteps; i++) {
      const patternX = xPattern[(i - 1) % xPattern.length];
      generatedSteps.push({
        index: i,
        xPercent: patternX,
        yOffsetPx: 40 + i * config.stepYGapPx,
        widthPercent: config.stepWidthPercent,
        hasStar: starSteps.has(i),
        starCollected: false,
      });
    }

    return generatedSteps;
  }, []);

  // Initialize level
  const setupLevel = useCallback(
    (lvlIdx: number) => {
      const cfg = LEVEL_CONFIGS[lvlIdx];
      setCurrentLevelIdx(lvlIdx);
      setAstronautStep(0);
      setLadderXPercent(50);
      setIsClimbing(false);
      setLevelCompletedModal(false);
      setIsPaused(false);

      const generatedSteps = initLevelSteps(cfg);
      setSteps(generatedSteps);

      // Setup satellites
      const newSats: Satellite[] = cfg.satellites.map((s, idx) => ({
        id: idx + 1,
        atStep: s.atStep,
        xPercent: s.initialX,
        speed: s.speed,
        minX: s.minX,
        maxX: s.maxX,
        direction: 1,
      }));
      setSatellites(newSats);

      if (lvlIdx === 0) {
        setMessage("Mouse'u sağa ve sola kaydırarak merdiveni astronotun altına getir, sonra tıkla!");
      } else if (lvlIdx === 1) {
        setMessage('Dikkat! Dönen uydulara çarpmadan merdiveni yerleştir ve tıkla!');
      } else {
        setMessage('Zor Seviye! Merdiveni tam hizala, uyduları kolla ve yıldızları topla!');
      }
      setMessageType('info');
    },
    [initLevelSteps]
  );

  // Initial mount setup
  useEffect(() => {
    setupLevel(0);
  }, [setupLevel]);

  // Satellite animation loop
  useEffect(() => {
    if (isPaused || satellites.length === 0 || levelCompletedModal || allFinished) return;

    let animId: number;
    const updateSatellites = () => {
      setSatellites((prev) =>
        prev.map((sat) => {
          let nextX = sat.xPercent + sat.speed * sat.direction;
          let nextDir = sat.direction;

          if (nextX >= sat.maxX) {
            nextX = sat.maxX;
            nextDir = -1;
          } else if (nextX <= sat.minX) {
            nextX = sat.minX;
            nextDir = 1;
          }

          return {
            ...sat,
            xPercent: nextX,
            direction: nextDir,
          };
        })
      );
      animId = requestAnimationFrame(updateSatellites);
    };

    animId = requestAnimationFrame(updateSatellites);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, satellites.length, levelCompletedModal, allFinished]);

  // Target step astronaut needs to climb to
  const targetStepIndex = astronautStep < currentConfig.totalSteps ? astronautStep + 1 : currentConfig.totalSteps;
  const currentStepData = steps[astronautStep] || { xPercent: 50, yOffsetPx: 40, widthPercent: 30 };
  const nextStepData = steps[targetStepIndex] || currentStepData;

  // Check alignment: Is ladder aligned between current astronaut location and target step?
  // The ladder serves as the stepping bridge; its X coordinate should be close to next step's center
  useEffect(() => {
    if (astronautStep >= currentConfig.totalSteps) {
      setIsAligned(false);
      return;
    }

    const diff = Math.abs(ladderXPercent - nextStepData.xPercent);
    const tolerance = currentConfig.alignmentTolerancePercent;
    setIsAligned(diff <= tolerance);
  }, [ladderXPercent, nextStepData.xPercent, currentConfig.alignmentTolerancePercent, astronautStep, currentConfig.totalSteps]);

  // Handle Mouse Movement to position the ladder
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPaused || isClimbing || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const relX = clientX - rect.left;
    const percentX = (relX / rect.width) * 100;

    // Constrain ladder strictly within play canvas boundaries (5% to 95%)
    const clampedX = Math.max(8, Math.min(92, percentX));
    setLadderXPercent(clampedX);
  };

  // Handle Single Left Click to initiate jump/climb
  const handleStageClick = () => {
    if (isPaused || isClimbing || levelCompletedModal || allFinished) return;

    // Check if game already finished
    if (astronautStep >= currentConfig.totalSteps) return;

    // 1. Check Alignment
    const diff = Math.abs(ladderXPercent - nextStepData.xPercent);
    const tolerance = currentConfig.alignmentTolerancePercent;

    if (diff > tolerance) {
      // Not aligned! Friendly instructional message
      soundEffects.playGentleBoing(soundEnabled);
      setMessageType('warning');
      if (currentConfig.levelNum === 1) {
        setMessage('Bir daha dene! Önce merdiveni doğru yere getir.');
      } else {
        setMessage('Merdiveni astronotun altına getir ve yeniden dene!');
      }
      return;
    }

    // 2. Check Satellite Obstacle Collision (Levels 2 & 3)
    const blockingSat = satellites.find((sat) => {
      if (sat.atStep !== targetStepIndex) return false;
      // If satellite is currently over the ladder / step passage area
      const satDiff = Math.abs(sat.xPercent - nextStepData.xPercent);
      return satDiff < (currentConfig.stepWidthPercent / 2 + 5);
    });

    if (blockingSat) {
      // Hit satellite obstacle!
      soundEffects.playBoing(soundEnabled);
      setMessageType('warning');
      setMessage('Dikkat! Uydunun geçmesini bekle. 🛰️');

      // Fair fallback: Fall back 1 safe step if higher than 0
      if (astronautStep > 0) {
        setAstronautStep((prev) => Math.max(0, prev - 1));
      }
      return;
    }

    // 3. Successful Climb!
    setIsClimbing(true);
    soundEffects.playPop(soundEnabled);

    // Step Points: +10
    const pointsToAdd = 10;
    let starPoints = 0;

    // Collect star if present
    const stepHasStar = nextStepData.hasStar && !nextStepData.starCollected;
    if (stepHasStar) {
      starPoints = 5;
      soundEffects.playStar(soundEnabled);
      setCollectedStarsCount((prev) => prev + 1);
      setSteps((prev) =>
        prev.map((s) => (s.index === targetStepIndex ? { ...s, starCollected: true } : s))
      );
    }

    setScore((prev) => prev + pointsToAdd + starPoints);

    setTimeout(() => {
      const newStep = astronautStep + 1;
      setAstronautStep(newStep);
      setIsClimbing(false);

      if (newStep >= currentConfig.totalSteps) {
        // Level complete!
        soundEffects.playFanfare(soundEnabled);
        setAchievementStars((prev) => prev + 1);
        setLevelCompletedModal(true);
        setMessageType('success');
        setMessage('Tebrikler! Astronotu güvenli bir şekilde yukarı çıkardın! 🌟');
      } else {
        soundEffects.playStar(soundEnabled);
        setMessageType('success');
        setMessage('Harika! Astronot bir basamak yükseldi! 🚀');
      }
    }, 280);
  };

  // Next level handler
  const handleNextLevel = () => {
    if (currentLevelIdx < LEVEL_CONFIGS.length - 1) {
      setupLevel(currentLevelIdx + 1);
    } else {
      // All levels complete! Final Victory
      setAllFinished(true);
      onComplete(3, score + 50);
      soundEffects.playFanfare(soundEnabled);
    }
  };

  // Restart handler
  const handleRestart = () => {
    soundEffects.playPop(soundEnabled);
    setScore(0);
    setCollectedStarsCount(0);
    setAchievementStars(0);
    setAllFinished(false);
    setupLevel(0);
  };

  // Current camera vertical offset to keep astronaut visible in center-lower view
  const cameraOffsetY = Math.max(0, (astronautStep - 1) * currentConfig.stepYGapPx);

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      className="w-full max-w-5xl bg-white rounded-3xl border-4 border-indigo-200 shadow-xl overflow-hidden flex flex-col select-none relative"
    >
      {/* Top Application Header Bar */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 px-4 sm:px-6 py-3.5 text-white flex items-center justify-between gap-3 shadow-md flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-xl shadow-xs">
            🪜
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black leading-tight tracking-wide">
                Yıldız Merdiveni
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] sm:text-xs font-black shadow-xs">
                {currentConfig.badge}
              </span>
            </div>
            <p className="text-xs text-indigo-200 font-medium hidden sm:block">
              Mouse Hareketi ve Sol Tuşla Tıklama Oyunu
            </p>
          </div>
        </div>

        {/* Dashboard Counters & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Star Counter */}
          <div className="bg-amber-400/20 border border-amber-300/40 text-amber-200 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 shadow-2xs">
            <Star className="w-4 h-4 fill-amber-400 text-amber-300" />
            <span>
              {collectedStarsCount} / {currentConfig.requiredStars} Yıldız
            </span>
          </div>

          {/* Score Counter */}
          <div className="bg-white/10 border border-white/20 text-white px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 shadow-2xs">
            <Trophy className="w-3.5 h-3.5 text-yellow-300" />
            <span>{score} Puan</span>
          </div>

          {/* Pause / Resume Button */}
          <button
            onClick={() => {
              setIsPaused(!isPaused);
              soundEffects.playPop(soundEnabled);
            }}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors cursor-pointer"
            title={isPaused ? 'Devam Et' : 'Duraklat'}
          >
            {isPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4" />}
          </button>

          {/* Sound Toggle Button */}
          <button
            onClick={onSoundToggle}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors cursor-pointer"
            title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-300" /> : <VolumeX className="w-4 h-4 text-red-300" />}
          </button>

          {/* Restart Button */}
          <button
            onClick={handleRestart}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors cursor-pointer"
            title="Yeniden Başlat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Help Guide Button */}
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors cursor-pointer"
            title="Nasıl Oynanır?"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Instructional Feedback Notification Bar */}
      <div
        className={`px-4 py-2 border-b flex items-center justify-between text-xs sm:text-sm font-bold transition-colors duration-300 ${
          messageType === 'success'
            ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
            : messageType === 'warning'
            ? 'bg-amber-50 text-amber-950 border-amber-300'
            : 'bg-indigo-50 text-indigo-900 border-indigo-200'
        }`}
      >
        <div className="flex items-center gap-2">
          {messageType === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
          {messageType === 'warning' && <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 animate-bounce" />}
          {messageType === 'info' && <MousePointer className="w-4 h-4 text-indigo-600 shrink-0 animate-pulse" />}
          <span>{message}</span>
        </div>

        {/* Current Step Progress Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-white/80 border border-slate-300 text-slate-700">
            Basamak {astronautStep} / {currentConfig.totalSteps}
          </span>
        </div>
      </div>

      {/* Tutorial Banner (Dismissable) */}
      {showGuide && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-indigo-200 px-5 py-3 flex items-start justify-between text-xs sm:text-sm text-indigo-950 font-medium">
          <div className="flex items-start gap-2.5">
            <span className="text-2xl mt-0.5">🚀</span>
            <div>
              <strong className="font-black text-indigo-900 block mb-1">
                Nasıl Oynanır? (Yıldız Merdiveni Adımları):
              </strong>
              <ol className="list-decimal list-inside space-y-0.5 text-xs text-indigo-900/90 font-bold">
                <li>Mouse'unu sağa ve sola hareket ettir. (Merdiven imleci takip eder)</li>
                <li>Merdiveni astronotun ve bir sonraki basamağın altına hizala.</li>
                <li>Sol tuşa bir kez tıkla. (Astronot yukarı tırmanır)</li>
                <li>Yıldızları topla ve hareketli uydulara dikkat et!</li>
              </ol>
            </div>
          </div>
          <button
            onClick={() => setShowGuide(false)}
            className="text-xs text-indigo-700 underline font-extrabold hover:text-indigo-950 cursor-pointer ml-3 shrink-0"
          >
            Kapat
          </button>
        </div>
      )}

      {/* Cosmic Interactive Sky Canvas */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onClick={handleStageClick}
        className="relative w-full h-[460px] sm:h-[520px] bg-gradient-to-b from-[#050714] via-[#0b1028] to-[#1c1846] overflow-hidden cursor-crosshair select-none"
      >
        {/* Deep Space Atmosphere Decorations */}
        <div className="absolute top-4 left-10 text-3xl opacity-40 pointer-events-none animate-pulse">✨</div>
        <div className="absolute top-16 right-16 text-4xl opacity-50 pointer-events-none">🌕</div>
        <div className="absolute top-1/3 left-14 text-2xl opacity-40 pointer-events-none">🪐</div>
        <div className="absolute top-2/3 right-10 text-3xl opacity-30 pointer-events-none">✨</div>
        <div className="absolute bottom-1/4 left-1/4 text-2xl opacity-40 pointer-events-none">⭐</div>

        {/* Space Tower Background Pillars (Left and Right) */}
        <div className="absolute inset-y-0 left-3 w-4 bg-indigo-900/40 border-r border-indigo-500/20 pointer-events-none" />
        <div className="absolute inset-y-0 right-3 w-4 bg-indigo-900/40 border-l border-indigo-500/20 pointer-events-none" />

        {/* Scrolling World Container that moves with cameraOffsetY */}
        <div
          className="absolute inset-x-0 bottom-0 transition-transform duration-500 ease-out"
          style={{
            transform: `translateY(${cameraOffsetY}px)`,
          }}
        >
          {/* ==================================================== */}
          {/* STEP PLATFORMS */}
          {/* ==================================================== */}
          {steps.map((step) => {
            const isCurrent = step.index === astronautStep;
            const isTarget = step.index === targetStepIndex;
            const isTop = step.index === currentConfig.totalSteps;

            return (
              <div
                key={step.index}
                className="absolute flex flex-col items-center justify-start pointer-events-none transition-all duration-300"
                style={{
                  bottom: `${step.yOffsetPx}px`,
                  left: `${step.xPercent}%`,
                  width: `${step.widthPercent}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                {/* Star on the Step */}
                {step.hasStar && (
                  <div
                    className={`-mt-10 mb-1 flex items-center justify-center transition-all duration-300 ${
                      step.starCollected
                        ? 'opacity-20 scale-75'
                        : 'animate-bounce drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]'
                    }`}
                  >
                    <span className="text-3xl sm:text-4xl">⭐</span>
                  </div>
                )}

                {/* Platform Ledge */}
                <div
                  className={`w-full h-8 sm:h-9 rounded-2xl border-2 flex items-center justify-between px-3 shadow-lg transition-all duration-300 ${
                    isTop
                      ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 border-yellow-200 ring-4 ring-yellow-400/40 text-amber-950 font-black'
                      : isTarget
                      ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 border-indigo-300 ring-4 ring-indigo-400/40 text-white font-extrabold'
                      : isCurrent
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 border-emerald-300 text-white font-bold'
                      : 'bg-gradient-to-r from-slate-700 via-slate-800 to-slate-700 border-slate-600 text-slate-300'
                  }`}
                >
                  <span className="text-[10px] sm:text-xs font-black opacity-90">
                    {step.index === 0 ? '🚀 Başlangıç' : isTop ? '🏆 Zirve' : `${step.index}. Basamak`}
                  </span>
                  {isTarget && (
                    <span className="text-[9px] sm:text-[10px] bg-white text-indigo-950 font-black px-1.5 py-0.5 rounded-full animate-pulse">
                      Hedef
                    </span>
                  )}
                </div>

                {/* Soft glow under target platform */}
                {isTarget && (
                  <div className="w-full h-2 bg-indigo-400/40 blur-sm rounded-full -mt-1" />
                )}
              </div>
            );
          })}

          {/* ==================================================== */}
          {/* SATELLITE OBSTACLES (Moving Horizontally) */}
          {/* ==================================================== */}
          {satellites.map((sat) => {
            const stepData = steps[sat.atStep];
            if (!stepData) return null;

            // Height positioned between step Y and step Y - 1
            const satY = stepData.yOffsetPx - currentConfig.stepYGapPx * 0.45;

            return (
              <div
                key={sat.id}
                className="absolute z-20 pointer-events-none transition-transform duration-75 flex flex-col items-center"
                style={{
                  bottom: `${satY}px`,
                  left: `${sat.xPercent}%`,
                  transform: 'translate(-50%, 0)',
                }}
              >
                <div className="flex items-center gap-1 bg-purple-950/80 border border-purple-400/50 px-2 py-0.5 rounded-full shadow-md text-white text-[10px] font-black">
                  <span className="text-base sm:text-xl animate-spin-slow">🛰️</span>
                  <span>Uydu</span>
                </div>
                {/* Danger laser trail */}
                <div className="w-16 h-0.5 bg-red-400/60 blur-[1px] mt-0.5 animate-pulse" />
              </div>
            );
          })}

          {/* ==================================================== */}
          {/* THE LADDER (Controlled horizontally by Mouse) */}
          {/* ==================================================== */}
          {astronautStep < currentConfig.totalSteps && (
            <div
              className={`absolute z-30 pointer-events-none transition-colors duration-200 flex flex-col items-center ${
                isAligned ? 'opacity-100 scale-100' : 'opacity-85'
              }`}
              style={{
                bottom: `${currentStepData.yOffsetPx + 8}px`,
                left: `${ladderXPercent}%`,
                width: `${currentConfig.stepWidthPercent * 0.85}%`,
                height: `${currentConfig.stepYGapPx}px`,
                transform: 'translateX(-50%)',
              }}
            >
              {/* Alignment Status Beacon */}
              <div
                className={`-mt-6 mb-1 px-2.5 py-0.5 rounded-full text-[10px] font-black shadow-md flex items-center gap-1 transition-all ${
                  isAligned
                    ? 'bg-emerald-500 text-white ring-2 ring-emerald-300 animate-bounce'
                    : 'bg-amber-500/90 text-white'
                }`}
              >
                {isAligned ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-white" />
                    <span>Hizalandı! Tıkla 👇</span>
                  </>
                ) : (
                  <>
                    <ArrowUp className="w-3 h-3 text-white" />
                    <span>Basamağa Hizala</span>
                  </>
                )}
              </div>

              {/* Realistic High-Tech Neon Ladder Rungs */}
              <div
                className={`w-full h-full rounded-xl border-2 flex flex-col justify-between p-1 shadow-xl transition-all duration-200 ${
                  isAligned
                    ? 'bg-emerald-500/20 border-emerald-400 ring-4 ring-emerald-400/40'
                    : 'bg-cyan-500/15 border-cyan-400'
                }`}
              >
                {/* 5 Rungs */}
                {[0, 1, 2, 3, 4].map((rungIdx) => (
                  <div
                    key={rungIdx}
                    className={`w-full h-1.5 rounded-full transition-colors ${
                      isAligned ? 'bg-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-cyan-300/80'
                    }`}
                  />
                ))}
              </div>

              {/* Vertical Guide Beam to Next Step */}
              {isAligned && (
                <div className="absolute -top-10 w-0.5 h-10 border-l-2 border-dashed border-emerald-300/80 animate-pulse pointer-events-none" />
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* THE ASTRONAUT CHARACTER */}
          {/* ==================================================== */}
          <div
            className={`absolute z-40 pointer-events-none transition-all duration-300 flex flex-col items-center ${
              isClimbing ? '-translate-y-6 scale-110' : ''
            }`}
            style={{
              bottom: `${currentStepData.yOffsetPx + 32}px`,
              left: `${currentStepData.xPercent}%`,
              transform: 'translateX(-50%)',
            }}
          >
            {/* Thought bubble or action hint */}
            {!isClimbing && astronautStep < currentConfig.totalSteps && (
              <div className="mb-1 bg-white/95 border border-indigo-300 text-indigo-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow-md animate-pulse">
                {isAligned ? 'Tıkla ve Tırman!' : 'Merdiveni Bekliyorum'}
              </div>
            )}

            {/* Astronaut Avatar */}
            <div
              className={`text-5xl sm:text-6xl filter drop-shadow-xl transition-transform ${
                isClimbing ? 'rotate-6' : 'hover:scale-105'
              }`}
            >
              👨‍🚀
            </div>

            {/* Astronaut Jetpack Sparkles */}
            {isClimbing && (
              <div className="text-xl animate-bounce -mt-2">🔥✨</div>
            )}
          </div>
        </div>

        {/* Level 1 Helper Gesture Animation at the bottom center */}
        {currentConfig.levelNum === 1 && astronautStep === 0 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 border-2 border-indigo-400 px-4 py-2 rounded-2xl shadow-xl flex items-center gap-3 z-30 pointer-events-none animate-in fade-in zoom-in-90 duration-300">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 animate-pulse">
              <MousePointer className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-indigo-950">
                1. Mouse'u kaydırarak merdiveni basamağa getir
              </p>
              <p className="text-[11px] font-bold text-emerald-700">
                2. Yeşil olunca SOL TUŞLA BİR KEZ TIKLA!
              </p>
            </div>
          </div>
        )}

        {/* Paused Overlay */}
        {isPaused && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center text-white z-50 p-6">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4 border border-white/20">
              <Pause className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black mb-2">Oyun Duraklatıldı</h3>
            <p className="text-sm text-indigo-200 mb-6 font-medium">
              Hazır olduğunda devam et butonuna basarak tırmanışa devam edebilirsin.
            </p>
            <button
              onClick={() => {
                setIsPaused(false);
                soundEffects.playPop(soundEnabled);
              }}
              className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 font-black text-white shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Devam Et</span>
            </button>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* LEVEL COMPLETED MODAL */}
      {/* ==================================================== */}
      {levelCompletedModal && (
        <div className="absolute inset-0 bg-indigo-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-4 border-indigo-300 p-6 sm:p-8 max-w-md w-full shadow-2xl text-center animate-in zoom-in-90 duration-300">
            <div className="w-20 h-20 rounded-full bg-amber-100 border-4 border-amber-300 mx-auto flex items-center justify-center text-4xl mb-4 shadow-md">
              🚀
            </div>

            <h3 className="text-2xl font-black text-indigo-950 mb-1">
              Tebrikler Uzay Kâşifi!
            </h3>
            <p className="text-sm font-bold text-indigo-600 mb-4">
              {currentConfig.name} Başarıyla Tamamlandı!
            </p>

            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 mb-6 flex justify-around">
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-slate-500">Toplanan Yıldız</span>
                <span className="text-xl font-black text-amber-600 flex items-center gap-1 mt-0.5">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  {collectedStarsCount}
                </span>
              </div>
              <div className="w-px bg-indigo-200" />
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-slate-500">Kazanılan Puan</span>
                <span className="text-xl font-black text-indigo-900 mt-0.5">
                  {score}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleNextLevel}
                className="w-full py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>
                  {currentLevelIdx < LEVEL_CONFIGS.length - 1
                    ? 'Sonraki Seviyeye Geç'
                    : 'Büyük Şampiyonluğu Tamamla! 🏆'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setupLevel(currentLevelIdx)}
                className="w-full py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Bu Seviyeyi Tekrar Oyna
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* FINAL VICTORY MODAL (All 3 Levels Finished) */}
      {/* ==================================================== */}
      {allFinished && (
        <div className="absolute inset-0 bg-indigo-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-4 border-amber-300 p-6 sm:p-8 max-w-lg w-full shadow-2xl text-center animate-in zoom-in-95 duration-300">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-300 via-yellow-200 to-amber-400 border-4 border-amber-400 mx-auto flex items-center justify-center text-5xl mb-4 shadow-xl">
              🏆
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Nur Öğretmen Şampiyonluk Rozeti</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-indigo-950 mb-2">
              Yıldız Merdiveni Zirvesi Feth Edildi!
            </h3>

            <p className="text-sm text-slate-600 mb-5 font-medium leading-relaxed">
              Tebrikler! Mouse'u sağa sola kaydırma ve sol tuşla tek tıklama becerilerini kusursuz
              kullanarak astronotu kuleye çıkardın ve uzaydaki tüm yıldızları topladın!
            </p>

            <div className="bg-gradient-to-r from-amber-50 to-indigo-50 border border-amber-200 rounded-2xl p-4 mb-6 flex justify-around">
              <div className="text-center">
                <span className="text-xs font-bold text-slate-500">Başarı Yıldızları</span>
                <div className="text-lg font-black text-amber-500 flex items-center justify-center gap-0.5 mt-0.5">
                  ⭐⭐⭐
                </div>
              </div>
              <div className="w-px bg-amber-200" />
              <div className="text-center">
                <span className="text-xs font-bold text-slate-500">Toplam Puan</span>
                <div className="text-xl font-black text-indigo-900 mt-0.5">
                  {score + 50}
                </div>
              </div>
            </div>

            <button
              onClick={handleRestart}
              className="w-full py-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Yeniden Başla ve Tekrar Oyna</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Activity12StarLadder;
