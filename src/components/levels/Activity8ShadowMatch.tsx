import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, RotateCcw, Sparkles } from 'lucide-react';
import { soundEffects } from '../../utils/audio.ts';

interface Activity8Props {
  soundEnabled: boolean;
  onComplete: (stars: number, score: number) => void;
  onSoundToggle: () => void;
}

interface ShadowItem {
  id: string;
  name: string;
  emoji: string;
}

const ALL_ITEMS: ShadowItem[] = [
  // Round 1 (1 animal)
  { id: 'lion', name: 'Aslan', emoji: '🦁' },
  // Round 2 (2 animals)
  { id: 'elephant', name: 'Fil', emoji: '🐘' },
  { id: 'giraffe', name: 'Zürafa', emoji: '🦒' },
  // Round 3 (3 animals)
  { id: 'panda', name: 'Panda', emoji: '🐼' },
  { id: 'monkey', name: 'Maymun', emoji: '🐵' },
  { id: 'rabbit', name: 'Tavşan', emoji: '🐰' },
  // Round 4 (4 animals)
  { id: 'tiger', name: 'Kaplan', emoji: '🐯' },
  { id: 'frog', name: 'Kurbağa', emoji: '🐸' },
  { id: 'bear', name: 'Ayı', emoji: '🐻' },
  { id: 'fox', name: 'Tilki', emoji: '🦊' },
];

const ROUNDS_CONFIG = [
  { roundNum: 1, items: ['lion'], title: '1. Aşama (1 Hayvan)' },
  { roundNum: 2, items: ['elephant', 'giraffe'], title: '2. Aşama (2 Hayvan)' },
  { roundNum: 3, items: ['panda', 'monkey', 'rabbit'], title: '3. Aşama (3 Hayvan)' },
  { roundNum: 4, items: ['tiger', 'frog', 'bear', 'fox'], title: '4. Aşama (4 Hayvan)' },
];

export const Activity8ShadowMatch: React.FC<Activity8Props> = ({
  soundEnabled,
  onComplete,
}) => {
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [showGuide, setShowGuide] = useState(true);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [score, setScore] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const shadowTargetsRef = useRef<Record<string, HTMLDivElement | null>>({});

  const currentRound = ROUNDS_CONFIG[currentRoundIdx];
  const roundAnimals = ALL_ITEMS.filter((item) =>
    currentRound.items.includes(item.id)
  );

  // Mouse drag listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingId || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setDragPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!draggingId) return;

      // Check drop target
      const droppedId = draggingId;
      setDraggingId(null);

      const targetEl = shadowTargetsRef.current[droppedId];
      if (targetEl) {
        const targetRect = targetEl.getBoundingClientRect();
        const dropX = e.clientX;
        const dropY = e.clientY;

        // Tolerant drop boundary
        if (
          dropX >= targetRect.left - 30 &&
          dropX <= targetRect.right + 30 &&
          dropY >= targetRect.top - 30 &&
          dropY <= targetRect.bottom + 30
        ) {
          // Successful match!
          soundEffects.playStar(soundEnabled);
          soundEffects.playPop(soundEnabled);

          const nextMatched = [...matchedIds, droppedId];
          setMatchedIds(nextMatched);
          setScore((s) => s + 25);

          // Check if round complete
          if (nextMatched.length === currentRound.items.length) {
            soundEffects.playFanfare(soundEnabled);

            if (currentRoundIdx + 1 < ROUNDS_CONFIG.length) {
              setTimeout(() => {
                setCurrentRoundIdx((idx) => idx + 1);
                setMatchedIds([]);
              }, 1200);
            } else {
              setTimeout(() => {
                onComplete(3, score + 120);
              }, 1200);
            }
          }
          return;
        }
      }

      // Missed drop
      soundEffects.playBoing(soundEnabled);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingId, matchedIds, currentRound, currentRoundIdx, soundEnabled, score, onComplete]);

  const handleStartDrag = (id: string, e: React.MouseEvent) => {
    if (matchedIds.includes(id) || !containerRef.current) return;

    soundEffects.playPop(soundEnabled);
    const rect = containerRef.current.getBoundingClientRect();
    setDraggingId(id);
    setDragPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleRestart = () => {
    setCurrentRoundIdx(0);
    setMatchedIds([]);
    setDraggingId(null);
    setScore(0);
    soundEffects.playPop(soundEnabled);
  };

  const activeDraggingItem = ALL_ITEMS.find((a) => a.id === draggingId);

  return (
    <div className="w-full max-w-5xl bg-white rounded-3xl border-4 border-purple-200 shadow-xl overflow-hidden flex flex-col select-none">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-purple-100 to-indigo-100 px-5 py-3.5 border-b-2 border-purple-300 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="px-3 py-1 rounded-full bg-purple-600 text-white font-black text-xs shadow-xs">
            Etkinlik 8
          </span>
          <div>
            <h2 className="text-base sm:text-lg font-black text-purple-950">
              Gölgelerle Eşleştirme – Sürükle ve Bırak ({currentRound.title})
            </h2>
            <p className="text-xs font-semibold text-purple-800 hidden sm:block">
              Sol tuşla basılı tutarak hayvanı sürükle, doğru gölgesinin üzerine bırak!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white/90 border border-purple-300 px-3.5 py-1 rounded-full text-xs font-black text-purple-900 shadow-2xs">
            {matchedIds.length} / {currentRound.items.length} Eşleşti
          </div>

          <button
            onClick={() => setShowGuide(!showGuide)}
            className="p-1.5 rounded-xl bg-white/80 hover:bg-white text-purple-800 border border-purple-300 cursor-pointer"
            title="Nasıl Oynanır?"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={handleRestart}
            className="p-1.5 rounded-xl bg-white/80 hover:bg-white text-purple-800 border border-purple-300 cursor-pointer"
            title="Yeniden Başlat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Guide Banner */}
      {showGuide && (
        <div className="bg-purple-50 border-b border-purple-200 px-5 py-2.5 flex items-center justify-between text-xs sm:text-sm text-purple-900 font-bold">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐾</span>
            <span>
              <strong>Nasıl Yapılır?</strong> Hayvanın üzerine gel, sol tuşa basılı tutarak sürükle. Alttaki siyah gölgenin üzerine gelince parmağını tuştan çek!
            </span>
          </div>
          <button
            onClick={() => setShowGuide(false)}
            className="text-xs text-purple-700 underline font-extrabold hover:text-purple-900 cursor-pointer ml-2 shrink-0"
          >
            Anladım
          </button>
        </div>
      )}

      {/* Play Area */}
      <div
        ref={containerRef}
        className="relative w-full min-h-[480px] sm:min-h-[520px] bg-gradient-to-b from-[#faf5ff] via-[#f3e8ff] to-[#e9d5ff] p-6 sm:p-8 flex flex-col justify-between overflow-hidden"
      >
        {/* TOP ROW: Draggable Animal Tokens */}
        <div className="flex flex-col items-center">
          <span className="text-xs sm:text-sm font-black text-purple-900 mb-3 bg-white/80 px-4 py-1 rounded-full border border-purple-200 shadow-2xs">
            1. Hayvanı Tut ve Sürükle 👇
          </span>

          <div className="flex items-center justify-center gap-4 sm:gap-8 flex-wrap">
            {roundAnimals.map((animal) => {
              const isMatched = matchedIds.includes(animal.id);
              const isBeingDragged = draggingId === animal.id;

              return (
                <div
                  key={animal.id}
                  onMouseDown={(e) => handleStartDrag(animal.id, e)}
                  className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-3 flex flex-col items-center justify-center select-none transition-all shadow-md ${
                    isMatched
                      ? 'bg-emerald-100 border-emerald-400 opacity-40 scale-90 cursor-default'
                      : isBeingDragged
                      ? 'opacity-30 scale-95 border-dashed border-purple-400'
                      : 'bg-white border-purple-400 hover:scale-105 hover:shadow-lg cursor-grab active:cursor-grabbing ring-2 ring-purple-300'
                  }`}
                >
                  <span className="text-5xl sm:text-6xl drop-shadow-xs">
                    {animal.emoji}
                  </span>
                  <span className="text-xs font-black text-slate-700 mt-1">
                    {isMatched ? '✓ Tamam' : animal.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTTOM ROW: Silhouette Shadows */}
        <div className="flex flex-col items-center mt-6">
          <span className="text-xs sm:text-sm font-black text-purple-950 mb-3 bg-white/80 px-4 py-1 rounded-full border border-purple-200 shadow-2xs">
            2. Doğru Gölgenin Üzerine Bırak 👇
          </span>

          <div className="flex items-center justify-center gap-4 sm:gap-8 flex-wrap">
            {roundAnimals.map((animal) => {
              const isMatched = matchedIds.includes(animal.id);

              return (
                <div
                  key={animal.id}
                  ref={(el) => { shadowTargetsRef.current[animal.id] = el; }}
                  className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-3 flex flex-col items-center justify-center select-none transition-all shadow-md ${
                    isMatched
                      ? 'bg-emerald-100 border-emerald-400 ring-4 ring-emerald-300 scale-105 animate-in zoom-in-90'
                      : 'bg-slate-900 border-slate-700 border-dashed hover:border-purple-500'
                  }`}
                >
                  {isMatched ? (
                    <>
                      <span className="text-5xl sm:text-6xl animate-bounce">
                        {animal.emoji}
                      </span>
                      <span className="text-xs font-black text-emerald-800 mt-1 bg-emerald-200 px-2 py-0.5 rounded-full">
                        ✓ Eşleşti!
                      </span>
                    </>
                  ) : (
                    <>
                      {/* Black Silhouette with dark filter */}
                      <span
                        className="text-5xl sm:text-6xl filter brightness-0 opacity-40 select-none pointer-events-none"
                      >
                        {animal.emoji}
                      </span>
                      <span className="text-[10px] font-black text-slate-400 mt-1">
                        Gölge
                      </span>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating Item Following Cursor while Dragging */}
        {draggingId && activeDraggingItem && (
          <div
            style={{
              left: `${dragPos.x}px`,
              top: `${dragPos.y}px`,
            }}
            className="fixed pointer-events-none -translate-x-1/2 -translate-y-1/2 z-50 w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/95 border-4 border-purple-500 shadow-2xl flex flex-col items-center justify-center scale-115 rotate-3"
          >
            <span className="text-5xl sm:text-6xl">
              {activeDraggingItem.emoji}
            </span>
            <span className="text-xs font-black text-purple-900">
              {activeDraggingItem.name}
            </span>
          </div>
        )}
      </div>

      {/* Progress Footer */}
      <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs font-bold text-slate-600">
        <div className="flex items-center gap-2">
          <span>İlerleme:</span>
          <div className="w-36 sm:w-60 bg-slate-200 h-3 rounded-full overflow-hidden">
            <div
              className="bg-purple-600 h-full transition-all duration-300"
              style={{
                width: `${
                  ((currentRoundIdx * 3 + matchedIds.length) / 10) * 100
                }%`,
              }}
            />
          </div>
          <span>Aşama {currentRoundIdx + 1} / {ROUNDS_CONFIG.length}</span>
        </div>

        <div className="text-purple-700 font-extrabold flex items-center gap-1">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Basılı tutarak gölgesine taşı</span>
        </div>
      </div>
    </div>
  );
};
