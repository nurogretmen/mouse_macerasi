import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, RotateCcw, Target, Sparkles } from 'lucide-react';
import { soundEffects } from '../../utils/audio.ts';

interface Activity10Props {
  soundEnabled: boolean;
  onComplete: (stars: number, score: number) => void;
  onSoundToggle: () => void;
}

interface MoleHole {
  id: number;
  active: boolean;
  hit: boolean;
  isGolden: boolean;
}

interface RoundConfig {
  roundNum: number;
  title: string;
  speedMs: number;
  targetCount: number;
}

const ROUNDS: RoundConfig[] = [
  { roundNum: 1, title: '1. Aşama: Sakin Bahçe', speedMs: 2400, targetCount: 5 },
  { roundNum: 2, title: '2. Aşama: Neşeli Bahçe', speedMs: 1800, targetCount: 6 },
  { roundNum: 3, title: '3. Aşama: Altın Köstebekler', speedMs: 1400, targetCount: 7 },
];

export const Activity10MoleReflex: React.FC<Activity10Props> = ({
  soundEnabled,
  onComplete,
}) => {
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [caughtCount, setCaughtCount] = useState(0);
  const [holes, setHoles] = useState<MoleHole[]>([
    { id: 1, active: false, hit: false, isGolden: false },
    { id: 2, active: false, hit: false, isGolden: false },
    { id: 3, active: false, hit: false, isGolden: false },
    { id: 4, active: false, hit: false, isGolden: false },
    { id: 5, active: false, hit: false, isGolden: false },
    { id: 6, active: false, hit: false, isGolden: false },
  ]);
  const [showGuide, setShowGuide] = useState(true);
  const [score, setScore] = useState(0);

  const currentRound = ROUNDS[currentRoundIdx];
  const timerRef = useRef<any>(null);

  // Mole popup loop
  useEffect(() => {
    const popNextMole = () => {
      // Pick random hole
      const randomIdx = Math.floor(Math.random() * 6);
      const isGold = currentRoundIdx === 2 || Math.random() < 0.25;

      setHoles((prev) =>
        prev.map((h, i) =>
          i === randomIdx
            ? { ...h, active: true, hit: false, isGolden: isGold }
            : { ...h, active: false, hit: false }
        )
      );

      // Mole retreats after round speed
      timerRef.current = setTimeout(() => {
        setHoles((prev) =>
          prev.map((h) => ({ ...h, active: false, hit: false }))
        );
      }, currentRound.speedMs - 200);
    };

    popNextMole();
    const interval = setInterval(popNextMole, currentRound.speedMs);

    return () => {
      clearInterval(interval);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentRoundIdx, currentRound]);

  const handleMoleClick = (holeId: number) => {
    const targetHole = holes.find((h) => h.id === holeId);
    if (!targetHole || !targetHole.active || targetHole.hit) return;

    soundEffects.playPop(soundEnabled);
    soundEffects.playStar(soundEnabled);

    setHoles((prev) =>
      prev.map((h) => (h.id === holeId ? { ...h, hit: true } : h))
    );

    const nextCount = caughtCount + 1;
    setCaughtCount(nextCount);
    setScore((s) => s + (targetHole.isGolden ? 40 : 25));

    // Check round complete
    if (nextCount >= currentRound.targetCount) {
      soundEffects.playFanfare(soundEnabled);

      if (currentRoundIdx + 1 < ROUNDS.length) {
        setTimeout(() => {
          setCurrentRoundIdx((r) => r + 1);
          setCaughtCount(0);
        }, 1000);
      } else {
        setTimeout(() => {
          onComplete(3, score + 120);
        }, 1000);
      }
    }
  };

  const handleRestart = () => {
    setCurrentRoundIdx(0);
    setCaughtCount(0);
    setScore(0);
    soundEffects.playPop(soundEnabled);
  };

  return (
    <div className="w-full max-w-5xl bg-white rounded-3xl border-4 border-indigo-200 shadow-xl overflow-hidden flex flex-col select-none">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-indigo-100 to-sky-100 px-5 py-3.5 border-b-2 border-indigo-300 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="px-3 py-1 rounded-full bg-indigo-600 text-white font-black text-xs shadow-xs">
            Etkinlik 10
          </span>
          <div>
            <h2 className="text-base sm:text-lg font-black text-indigo-950">
              Sevimli Köstebek – Refleks ve Tıklama ({currentRound.title})
            </h2>
            <p className="text-xs font-semibold text-indigo-800 hidden sm:block">
              Deliklerden çıkan sevimli köstebekleri sol tuşla bir kez tıklayarak yakala!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white/90 border border-indigo-300 px-3.5 py-1 rounded-full text-xs font-black text-indigo-900 shadow-2xs flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-indigo-600" />
            <span>{caughtCount} / {currentRound.targetCount} Köstebek</span>
          </div>

          <button
            onClick={() => setShowGuide(!showGuide)}
            className="p-1.5 rounded-xl bg-white/80 hover:bg-white text-indigo-800 border border-indigo-300 cursor-pointer"
            title="Nasıl Oynanır?"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={handleRestart}
            className="p-1.5 rounded-xl bg-white/80 hover:bg-white text-indigo-800 border border-indigo-300 cursor-pointer"
            title="Yeniden Başlat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Guide Banner */}
      {showGuide && (
        <div className="bg-indigo-50 border-b border-indigo-200 px-5 py-2.5 flex items-center justify-between text-xs sm:text-sm text-indigo-900 font-bold">
          <div className="flex items-center gap-2">
            <span className="text-xl">🦔</span>
            <span>
              <strong>Nasıl Yapılır?</strong> Çimlerin arasından kafasını çıkaran köstebekleri gör ve hızlıca sol tuşla tıkla!
            </span>
          </div>
          <button
            onClick={() => setShowGuide(false)}
            className="text-xs text-indigo-700 underline font-extrabold hover:text-indigo-900 cursor-pointer ml-2 shrink-0"
          >
            Anladım
          </button>
        </div>
      )}

      {/* Garden Ground with 6 Mole Hills */}
      <div className="relative w-full h-[460px] sm:h-[520px] bg-gradient-to-b from-[#86efac] via-[#4ade80] to-[#22c55e] p-6 sm:p-10 flex flex-col justify-center items-center overflow-hidden">
        {/* Sky / Garden Accents */}
        <div className="absolute top-3 left-8 text-3xl opacity-60">🌼</div>
        <div className="absolute top-5 right-12 text-3xl opacity-60">🌸</div>
        <div className="absolute bottom-4 left-16 text-3xl opacity-60">🍀</div>
        <div className="absolute bottom-6 right-20 text-3xl opacity-60">🍄</div>

        {/* 6 Mole Holes (2 rows of 3) */}
        <div className="grid grid-cols-3 gap-6 sm:gap-12 w-full max-w-2xl z-10">
          {holes.map((hole) => {
            return (
              <div
                key={hole.id}
                onClick={() => handleMoleClick(hole.id)}
                className="flex flex-col items-center justify-end relative h-32 sm:h-36 cursor-pointer select-none group"
              >
                {/* The Mole popping out */}
                <div
                  style={{
                    transition: 'transform 0.25s cubic-bezier(0.17, 0.67, 0.83, 0.67), opacity 0.2s ease',
                    transform: hole.active ? 'translateY(-10px)' : 'translateY(55px)',
                    opacity: hole.active ? 1 : 0,
                  }}
                  className={`absolute z-10 flex flex-col items-center cursor-pointer transition-transform ${
                    hole.hit ? 'scale-125' : 'group-hover:scale-110'
                  }`}
                >
                  {/* Mole Emoji Avatar */}
                  <div
                    className={`w-20 h-20 sm:w-22 sm:h-22 rounded-full flex flex-col items-center justify-center text-5xl sm:text-6xl shadow-xl border-3 ${
                      hole.isGolden
                        ? 'bg-amber-100 border-amber-400 ring-4 ring-amber-300 animate-bounce'
                        : 'bg-stone-100 border-stone-400'
                    }`}
                  >
                    {hole.hit ? (
                      <span className="animate-spin text-4xl">⭐</span>
                    ) : hole.isGolden ? (
                      '🦔'
                    ) : (
                      '🦔'
                    )}
                  </div>

                  {/* Golden crown badge if golden */}
                  {hole.isGolden && !hole.hit && (
                    <span className="absolute -top-3 text-2xl animate-pulse">
                      👑
                    </span>
                  )}

                  {hole.hit && (
                    <span className="bg-amber-400 text-amber-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow-md mt-1 animate-bounce">
                      Yakalandı! ✨
                    </span>
                  )}
                </div>

                {/* Dirt Mound / Hole */}
                <div className="w-24 sm:w-28 h-10 sm:h-12 rounded-full bg-stone-900/60 border-4 border-amber-950/70 shadow-inner z-20 flex items-center justify-center relative overflow-hidden">
                  <div className="w-20 sm:w-24 h-6 rounded-full bg-stone-950/80 shadow-2xl" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Footer */}
      <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs font-bold text-slate-600">
        <div className="flex items-center gap-2">
          <span>İlerleme:</span>
          <div className="w-36 sm:w-60 bg-slate-200 h-3 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-300"
              style={{
                width: `${
                  ((currentRoundIdx * currentRound.targetCount + caughtCount) /
                    (ROUNDS.length * 6)) *
                  100
                }%`,
              }}
            />
          </div>
          <span>Seviye {currentRoundIdx + 1} / {ROUNDS.length}</span>
        </div>

        <div className="text-indigo-700 font-extrabold flex items-center gap-1">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Köstebek çıkınca sol tuşla tıkla</span>
        </div>
      </div>
    </div>
  );
};
