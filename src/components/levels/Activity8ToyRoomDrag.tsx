import React, { useState, useRef } from 'react';
import { HelpCircle, RotateCcw, Package, Sparkles } from 'lucide-react';
import { soundEffects } from '../../utils/audio.ts';

interface Activity8Props {
  soundEnabled: boolean;
  onComplete: (stars: number, score: number) => void;
  onSoundToggle: () => void;
}

type ToyCategory = 'car' | 'ball' | 'doll' | 'block';

interface ToyItem {
  id: number;
  name: string;
  category: ToyCategory;
  emoji: string;
  isSorted: boolean;
}

interface BoxTarget {
  category: ToyCategory;
  title: string;
  boxColor: string;
  boxBorder: string;
  boxShadow: string;
  emoji: string;
}

const INITIAL_TOYS: ToyItem[] = [
  { id: 1, name: 'Kırmızı Yarış Arabası', category: 'car', emoji: '🏎️', isSorted: false },
  { id: 2, name: 'Futbol Topu', category: 'ball', emoji: '⚽', isSorted: false },
  { id: 3, name: 'Pelüş Ayıcık', category: 'doll', emoji: '🧸', isSorted: false },
  { id: 4, name: 'Renkli Lego Bloğu', category: 'block', emoji: '🧱', isSorted: false },
  { id: 5, name: 'Mavi Kamyon', category: 'car', emoji: '🚛', isSorted: false },
  { id: 6, name: 'Basketbol Topu', category: 'ball', emoji: '🏀', isSorted: false },
  { id: 7, name: 'Sevimli Bebek', category: 'doll', emoji: '🪆', isSorted: false },
  { id: 8, name: 'Geometrik Blok', category: 'block', emoji: '🧩', isSorted: false },
];

const BOXES: BoxTarget[] = [
  { category: 'car', title: 'Araba Kutusu', boxColor: '#fee2e2', boxBorder: '#ef4444', boxShadow: '#b91c1c', emoji: '🚗' },
  { category: 'ball', title: 'Top Sepeti', boxColor: '#fef3c7', boxBorder: '#f59e0b', boxShadow: '#b45309', emoji: '⚽' },
  { category: 'doll', title: 'Oyuncak Beşiği', boxColor: '#fce7f3', boxBorder: '#ec4899', boxShadow: '#be185d', emoji: '🧸' },
  { category: 'block', title: 'Blok Sandığı', boxColor: '#e0e7ff', boxBorder: '#6366f1', boxShadow: '#4338ca', emoji: '🧱' },
];

export const Activity8ToyRoomDrag: React.FC<Activity8Props> = ({
  soundEnabled,
  onComplete,
}) => {
  const [toys, setToys] = useState<ToyItem[]>(INITIAL_TOYS);
  const [draggingToyId, setDraggingToyId] = useState<number | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [feedback, setFeedback] = useState('Sol tuşa basılı tutarak oyuncağı sürükle ve doğru kutuya bırak!');
  const [showGuide, setShowGuide] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const boxRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const sortedCount = toys.filter((t) => t.isSorted).length;

  const handleMouseDown = (toyId: number, e: React.MouseEvent) => {
    e.preventDefault();
    soundEffects.playPop(soundEnabled);
    setDraggingToyId(toyId);

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDragPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }

    setFeedback('Harika! Şimdi basılı tutarak ilgili kutunun üzerine taşı...');
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingToyId || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setDragPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!draggingToyId) return;

    const toy = toys.find((t) => t.id === draggingToyId);
    if (!toy) {
      setDraggingToyId(null);
      return;
    }

    // Check which box the mouse is over
    let targetBoxCategory: ToyCategory | null = null;

    Object.entries(boxRefs.current).forEach(([category, el]) => {
      if (el) {
        const boxRect = el.getBoundingClientRect();
        if (
          e.clientX >= boxRect.left &&
          e.clientX <= boxRect.right &&
          e.clientY >= boxRect.top &&
          e.clientY <= boxRect.bottom
        ) {
          targetBoxCategory = category as ToyCategory;
        }
      }
    });

    if (targetBoxCategory && targetBoxCategory === toy.category) {
      // Correct box!
      soundEffects.playDropSuccess(soundEnabled);
      soundEffects.playStar(soundEnabled);

      const updatedToys = toys.map((t) =>
        t.id === toy.id ? { ...t, isSorted: true } : t
      );
      setToys(updatedToys);
      setFeedback(`Aferin! ${toy.name} doğru kutuya yerleşti! 🎉`);

      const newSortedCount = updatedToys.filter((t) => t.isSorted).length;
      if (newSortedCount >= toys.length) {
        soundEffects.playFanfare(soundEnabled);
        onComplete(3, 160);
      }
    } else if (targetBoxCategory && targetBoxCategory !== toy.category) {
      // Wrong box
      soundEffects.playGentleBoing(soundEnabled);
      setFeedback('Tekrar dene! Oyuncağı doğru kutuya sürüklemeyi unutma.');
    } else {
      // Dropped nowhere
      soundEffects.playPop(soundEnabled);
      setFeedback('Oyuncağı kutunun tam içine sürükleyip sol tuşu bırakmalısın!');
    }

    setDraggingToyId(null);
  };

  const handleRestart = () => {
    setToys(INITIAL_TOYS);
    setDraggingToyId(null);
    setFeedback('Sol tuşa basılı tutarak oyuncağı sürükle ve doğru kutuya bırak!');
    soundEffects.playPop(soundEnabled);
  };

  const draggingToy = toys.find((t) => t.id === draggingToyId);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="w-full max-w-5xl bg-white rounded-3xl border-4 border-purple-200 shadow-xl overflow-hidden flex flex-col select-none cursor-default"
    >
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-purple-100 to-indigo-200 px-5 py-3.5 border-b-2 border-purple-300 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="px-3 py-1 rounded-full bg-purple-600 text-white font-black text-xs shadow-xs">
            Etkinlik 8
          </span>
          <div>
            <h2 className="text-base sm:text-lg font-black text-purple-950">
              Sürükle ve Bırak – Oyuncak Odası
            </h2>
            <p className="text-xs font-semibold text-purple-800 hidden sm:block">
              Sol tuşa basılı tutarak oyuncakları doğru kutulara taşı!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white/90 border border-purple-300 px-3 py-1 rounded-full text-xs font-black text-purple-900 shadow-2xs">
            {sortedCount} / {toys.length} Oyuncak
          </div>

          <button
            onClick={() => setShowGuide(!showGuide)}
            className="p-1.5 rounded-xl bg-white/80 hover:bg-white text-purple-800 border border-purple-300 cursor-pointer"
            title="Yönergeyi Göster"
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
            <span className="text-lg">🧸</span>
            <span>
              <strong>Yönerge:</strong> Mouse'un sol tuşuna basılı tut, oyuncağı doğru kutuya götür ve tuşu bırak!
            </span>
          </div>
          <button
            onClick={() => setShowGuide(false)}
            className="text-xs text-purple-700 underline font-extrabold hover:text-purple-900 cursor-pointer ml-2"
          >
            Kapat
          </button>
        </div>
      )}

      {/* Playroom Canvas */}
      <div className="relative w-full min-h-[420px] sm:min-h-[460px] bg-gradient-to-b from-purple-50 via-slate-50 to-indigo-50 p-6 flex flex-col justify-between">
        {/* Dynamic Prompt Pill */}
        <div className="mx-auto mb-4 bg-white border-2 border-purple-300 px-5 py-2 rounded-full shadow-md text-xs sm:text-sm font-black text-purple-900 animate-bounce">
          💡 {feedback}
        </div>

        {/* 4 Toy Boxes on Top */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto w-full mb-6">
          {BOXES.map((box) => {
            const countInBox = toys.filter((t) => t.category === box.category && t.isSorted).length;

            return (
              <div
                key={box.category}
                ref={(el) => {
                  boxRefs.current[box.category] = el;
                }}
                style={{
                  backgroundColor: box.boxColor,
                  borderColor: box.boxBorder,
                  boxShadow: `0 6px 0 ${box.boxShadow}`,
                }}
                className="rounded-2xl border-3 p-3 flex flex-col items-center justify-center text-center transition-transform hover:scale-102"
              >
                <span className="text-3xl sm:text-4xl mb-1">{box.emoji}</span>
                <span className="text-xs font-black text-slate-800 leading-tight">
                  {box.title}
                </span>
                <div className="mt-1 bg-white/80 border border-slate-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full text-slate-700">
                  {countInBox} / 2 Yerleşti
                </div>
              </div>
            );
          })}
        </div>

        {/* Scattered Toys Area on Bottom Floor */}
        <div className="bg-white/60 border-2 border-dashed border-purple-300 rounded-3xl p-4 min-h-[140px] flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {toys.map((toy) => {
            if (toy.isSorted) return null;
            const isBeingDragged = draggingToyId === toy.id;

            return (
              <div
                key={toy.id}
                onMouseDown={(e) => handleMouseDown(toy.id, e)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white border-2 border-purple-300 shadow-[0_4px_0_#c084fc] cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${
                  isBeingDragged ? 'opacity-30' : 'opacity-100'
                }`}
              >
                <span className="text-2xl">{toy.emoji}</span>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-slate-800">
                    {toy.name}
                  </span>
                  <span className="text-[10px] font-bold text-purple-600">
                    Basılı Tut & Taşı
                  </span>
                </div>
              </div>
            );
          })}

          {sortedCount === toys.length && (
            <div className="text-center text-emerald-600 font-black text-base animate-bounce">
              🎉 Harika! Tüm oyuncaklar odada kutularına yerleşti!
            </div>
          )}
        </div>

        {/* Dragging Floating Element */}
        {draggingToy && (
          <div
            style={{
              left: `${dragPos.x}px`,
              top: `${dragPos.y}px`,
              transform: 'translate(-50%, -50%)',
            }}
            className="pointer-events-none fixed z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border-3 border-purple-500 shadow-2xl scale-110"
          >
            <span className="text-3xl">{draggingToy.emoji}</span>
            <span className="text-xs font-black text-purple-900">
              {draggingToy.name}
            </span>
          </div>
        )}
      </div>

      {/* Progress Footer */}
      <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs font-bold text-slate-600">
        <div className="flex items-center gap-2">
          <span>İlerleme:</span>
          <div className="w-36 sm:w-48 bg-slate-200 h-3 rounded-full overflow-hidden">
            <div
              className="bg-purple-600 h-full transition-all duration-300"
              style={{ width: `${(sortedCount / toys.length) * 100}%` }}
            />
          </div>
          <span>{sortedCount} / {toys.length}</span>
        </div>

        <div className="text-purple-700 font-extrabold flex items-center gap-1">
          <Package className="w-3.5 h-3.5" />
          <span>Basılı Tut & Kutuya Bırak</span>
        </div>
      </div>
    </div>
  );
};
