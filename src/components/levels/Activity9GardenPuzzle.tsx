import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, RotateCcw, Puzzle, Sparkles } from 'lucide-react';
import { soundEffects } from '../../utils/audio.ts';

interface Activity9Props {
  soundEnabled: boolean;
  onComplete: (stars: number, score: number) => void;
  onSoundToggle: () => void;
}

interface PuzzlePiece {
  id: number;
  row: number; // 0 or 1
  col: number; // 0 or 1
  emoji: string;
  bgGradient: string;
  accent: string;
  label: string;
}

interface PuzzleTheme {
  id: number;
  title: string;
  fullImageTitle: string;
  pieces: PuzzlePiece[];
}

const PUZZLE_THEMES: PuzzleTheme[] = [
  {
    id: 1,
    title: '1. Aşama: Sevimli Çiftlik Bahçesi (4 Parça)',
    fullImageTitle: 'Güneşli Çiftlik Bahçesi',
    pieces: [
      {
        id: 1,
        row: 0,
        col: 0,
        emoji: '☀️ ☁️',
        bgGradient: 'from-sky-300 to-sky-200',
        accent: 'Mavi Gökyüzü',
        label: 'Sol Üst',
      },
      {
        id: 2,
        row: 0,
        col: 1,
        emoji: '🌈 🦋',
        bgGradient: 'from-amber-200 to-pink-200',
        accent: 'Gökkuşağı',
        label: 'Sağ Üst',
      },
      {
        id: 3,
        row: 1,
        col: 0,
        emoji: '🐶 🏡',
        bgGradient: 'from-emerald-300 to-green-200',
        accent: 'Sevimli Köpek',
        label: 'Sol Alt',
      },
      {
        id: 4,
        row: 1,
        col: 1,
        emoji: '🌻 🌸',
        bgGradient: 'from-green-200 to-teal-200',
        accent: 'Çiçek Bahçesi',
        label: 'Sağ Alt',
      },
    ],
  },
  {
    id: 2,
    title: '2. Aşama: Masalsı Orman (4 Parça)',
    fullImageTitle: 'Orman Şenliği',
    pieces: [
      {
        id: 5,
        row: 0,
        col: 0,
        emoji: '🌳 🦉',
        bgGradient: 'from-emerald-400 to-green-300',
        accent: 'Bilge Baykuş',
        label: 'Sol Üst',
      },
      {
        id: 6,
        row: 0,
        col: 1,
        emoji: '🌙 ⭐',
        bgGradient: 'from-indigo-300 to-purple-200',
        accent: 'Yıldızlı Gece',
        label: 'Sağ Üst',
      },
      {
        id: 7,
        row: 1,
        col: 0,
        emoji: '🍄 🦔',
        bgGradient: 'from-amber-200 to-orange-200',
        accent: 'Minik Kirpi',
        label: 'Sol Alt',
      },
      {
        id: 8,
        row: 1,
        col: 1,
        emoji: '🦌 🌺',
        bgGradient: 'from-lime-200 to-emerald-200',
        accent: 'Zarif Geyik',
        label: 'Sağ Alt',
      },
    ],
  },
];

export const Activity9GardenPuzzle: React.FC<Activity9Props> = ({
  soundEnabled,
  onComplete,
}) => {
  const [themeIdx, setThemeIdx] = useState(0);
  const [placedPieceIds, setPlacedPieceIds] = useState<number[]>([]);
  const [draggingPieceId, setDraggingPieceId] = useState<number | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showGuide, setShowGuide] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const slotsRef = useRef<Record<number, HTMLDivElement | null>>({});

  const currentTheme = PUZZLE_THEMES[themeIdx];
  const allPieces = currentTheme.pieces;
  const unplacedPieces = allPieces.filter((p) => !placedPieceIds.includes(p.id));

  // Mouse move / up handler for smooth drag & drop
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingPieceId || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setDragPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!draggingPieceId) return;

      const pieceId = draggingPieceId;
      setDraggingPieceId(null);

      // Check slot position
      const slotEl = slotsRef.current[pieceId];
      if (slotEl) {
        const slotRect = slotEl.getBoundingClientRect();
        const dropX = e.clientX;
        const dropY = e.clientY;

        // Snapping boundary
        if (
          dropX >= slotRect.left - 40 &&
          dropX <= slotRect.right + 40 &&
          dropY >= slotRect.top - 40 &&
          dropY <= slotRect.bottom + 40
        ) {
          soundEffects.playPop(soundEnabled);
          soundEffects.playStar(soundEnabled);

          const nextPlaced = [...placedPieceIds, pieceId];
          setPlacedPieceIds(nextPlaced);
          setScore((s) => s + 30);

          if (nextPlaced.length === allPieces.length) {
            // Puzzle Complete!
            setIsCompleted(true);
            soundEffects.playFanfare(soundEnabled);

            setTimeout(() => {
              if (themeIdx + 1 < PUZZLE_THEMES.length) {
                setThemeIdx((t) => t + 1);
                setPlacedPieceIds([]);
                setIsCompleted(false);
              } else {
                onComplete(3, score + 120);
              }
            }, 1800);
          }
          return;
        }
      }

      // Missed
      soundEffects.playBoing(soundEnabled);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingPieceId, placedPieceIds, allPieces, themeIdx, soundEnabled, score, onComplete]);

  const handleStartDrag = (pieceId: number, e: React.MouseEvent) => {
    if (placedPieceIds.includes(pieceId) || !containerRef.current) return;

    soundEffects.playPop(soundEnabled);
    const rect = containerRef.current.getBoundingClientRect();
    setDraggingPieceId(pieceId);
    setDragPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleRestart = () => {
    setThemeIdx(0);
    setPlacedPieceIds([]);
    setIsCompleted(false);
    setScore(0);
    soundEffects.playPop(soundEnabled);
  };

  const draggingPiece = allPieces.find((p) => p.id === draggingPieceId);

  return (
    <div className="w-full max-w-5xl bg-white rounded-3xl border-4 border-teal-200 shadow-xl overflow-hidden flex flex-col select-none">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-teal-100 to-emerald-100 px-5 py-3.5 border-b-2 border-teal-300 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="px-3 py-1 rounded-full bg-teal-600 text-white font-black text-xs shadow-xs">
            Etkinlik 9
          </span>
          <div>
            <h2 className="text-base sm:text-lg font-black text-teal-950">
              Puzzle Bahçesi – Gerçek Parçaları Birleştir ({currentTheme.title})
            </h2>
            <p className="text-xs font-semibold text-teal-800 hidden sm:block">
              Yapboz parçalarını sol tuşla tut, çerçevedeki doğru yuvasına sürükleyip birleştir!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white/90 border border-teal-300 px-3.5 py-1 rounded-full text-xs font-black text-teal-900 shadow-2xs">
            {placedPieceIds.length} / {allPieces.length} Parça Takıldı
          </div>

          <button
            onClick={() => setShowGuide(!showGuide)}
            className="p-1.5 rounded-xl bg-white/80 hover:bg-white text-teal-800 border border-teal-300 cursor-pointer"
            title="Nasıl Oynanır?"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={handleRestart}
            className="p-1.5 rounded-xl bg-white/80 hover:bg-white text-teal-800 border border-teal-300 cursor-pointer"
            title="Yeniden Başlat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Guide Bar */}
      {showGuide && (
        <div className="bg-teal-50 border-b border-teal-200 px-5 py-2.5 flex items-center justify-between text-xs sm:text-sm text-teal-900 font-bold">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧩</span>
            <span>
              <strong>Nasıl Yapılır?</strong> Sağdaki yapboz parçalarını sol tıkla basılı tutarak sol taraftaki çerçevede resmin ait olduğu yere taşı ve bırak!
            </span>
          </div>
          <button
            onClick={() => setShowGuide(false)}
            className="text-xs text-teal-700 underline font-extrabold hover:text-teal-900 cursor-pointer ml-2 shrink-0"
          >
            Anladım
          </button>
        </div>
      )}

      {/* Main Workspace */}
      <div
        ref={containerRef}
        className="relative w-full min-h-[480px] sm:min-h-[520px] bg-gradient-to-b from-[#f0fdfa] via-[#e6fffa] to-[#ccfbf1] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-center gap-8 sm:gap-12 overflow-hidden"
      >
        {/* LEFT: The Wooden Jigsaw Frame (2x2) */}
        <div className="flex flex-col items-center">
          <span className="text-xs sm:text-sm font-black text-teal-900 mb-2 bg-white/90 px-4 py-1 rounded-full border border-teal-200 shadow-2xs">
            🖼️ Yapboz Çerçevesi (Buraya Yerleştir)
          </span>

          <div
            className={`w-[260px] h-[260px] sm:w-[300px] sm:h-[300px] bg-amber-900/10 p-3 rounded-3xl border-6 border-amber-800 shadow-xl grid grid-cols-2 grid-rows-2 gap-1 relative ${
              isCompleted ? 'ring-6 ring-amber-400 animate-pulse' : ''
            }`}
          >
            {allPieces.map((piece) => {
              const isPlaced = placedPieceIds.includes(piece.id);

              return (
                <div
                  key={piece.id}
                  ref={(el) => { slotsRef.current[piece.id] = el; }}
                  className={`w-full h-full rounded-2xl flex flex-col items-center justify-center relative transition-all overflow-hidden ${
                    isPlaced
                      ? `bg-gradient-to-br ${piece.bgGradient} border-2 border-white/60 shadow-md animate-in zoom-in-75`
                      : 'bg-white/60 border-2 border-dashed border-teal-400/80 hover:bg-white/80'
                  }`}
                >
                  {isPlaced ? (
                    <>
                      <span className="text-4xl sm:text-5xl filter drop-shadow-xs">
                        {piece.emoji}
                      </span>
                      <span className="text-[11px] font-black text-slate-800 mt-1">
                        {piece.accent}
                      </span>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-teal-600/70 p-2 text-center">
                      <span className="text-2xl opacity-50">🧩</span>
                      <span className="text-[10px] font-black uppercase tracking-wider mt-1">
                        {piece.label}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Victory Glow upon completion */}
            {isCompleted && (
              <div className="absolute inset-0 bg-emerald-500/90 rounded-2xl flex flex-col items-center justify-center text-white z-20 animate-in zoom-in-90 duration-300">
                <span className="text-6xl animate-bounce mb-1">🎉</span>
                <span className="text-xl sm:text-2xl font-black text-center">
                  Harika! Resmi Tamamladın!
                </span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: The Pieces Tray */}
        <div className="flex flex-col items-center">
          <span className="text-xs sm:text-sm font-black text-teal-900 mb-2 bg-white/90 px-4 py-1 rounded-full border border-teal-200 shadow-2xs">
            🧩 Yapboz Parçaları (Tut ve Sürükle)
          </span>

          <div className="w-[260px] min-h-[260px] sm:w-[280px] bg-white/90 p-4 rounded-3xl border-3 border-teal-300 shadow-md flex flex-wrap items-center justify-center gap-3">
            {unplacedPieces.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-teal-700 py-10">
                <span className="text-5xl animate-bounce">⭐</span>
                <span className="text-sm font-black mt-2">Bütün parçalar takıldı!</span>
              </div>
            ) : (
              unplacedPieces.map((piece) => {
                const isBeingDragged = draggingPieceId === piece.id;

                return (
                  <div
                    key={piece.id}
                    onMouseDown={(e) => handleStartDrag(piece.id, e)}
                    className={`w-28 h-28 rounded-2xl bg-gradient-to-br ${piece.bgGradient} border-3 border-teal-400 flex flex-col items-center justify-center select-none shadow-md cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${
                      isBeingDragged ? 'opacity-20 scale-95 border-dashed' : ''
                    }`}
                  >
                    <span className="text-4xl filter drop-shadow-xs">
                      {piece.emoji}
                    </span>
                    <span className="text-[11px] font-black text-slate-800 mt-1">
                      {piece.accent}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Dragging Floating Element */}
        {draggingPieceId && draggingPiece && (
          <div
            style={{
              left: `${dragPos.x}px`,
              top: `${dragPos.y}px`,
            }}
            className={`fixed pointer-events-none -translate-x-1/2 -translate-y-1/2 z-50 w-28 h-28 rounded-2xl bg-gradient-to-br ${draggingPiece.bgGradient} border-4 border-amber-500 shadow-2xl flex flex-col items-center justify-center scale-115 rotate-2`}
          >
            <span className="text-4xl filter drop-shadow-xs">
              {draggingPiece.emoji}
            </span>
            <span className="text-[11px] font-black text-slate-800 mt-1">
              {draggingPiece.accent}
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
              className="bg-teal-600 h-full transition-all duration-300"
              style={{
                width: `${
                  ((themeIdx * 4 + placedPieceIds.length) / (PUZZLE_THEMES.length * 4)) *
                  100
                }%`,
              }}
            />
          </div>
          <span>Aşama {themeIdx + 1} / {PUZZLE_THEMES.length}</span>
        </div>

        <div className="text-teal-700 font-extrabold flex items-center gap-1">
          <Puzzle className="w-4 h-4 text-teal-600" />
          <span>Parçayı tut, çerçevedeki yerine bırak</span>
        </div>
      </div>
    </div>
  );
};
