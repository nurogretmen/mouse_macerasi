import React, { useState } from 'react';
import { HelpCircle, RotateCcw, Rocket, CheckCircle2, Sparkles } from 'lucide-react';
import { soundEffects } from '../../utils/audio.ts';

interface Activity4Props {
  soundEnabled: boolean;
  onComplete: (stars: number, score: number) => void;
  onSoundToggle: () => void;
}

interface SpaceTask {
  id: number;
  type: 'hover' | 'click';
  instruction: string;
  badge: string;
  targetKey: string;
}

const SPACE_TASKS: SpaceTask[] = [
  {
    id: 1,
    type: 'hover',
    instruction: 'İmleci BÜYÜK SARI YILDIZIN üzerine getir (Tıklama yapma!)',
    badge: 'Yalnızca Üzerine Gel',
    targetKey: 'big-yellow-star',
  },
  {
    id: 2,
    type: 'hover',
    instruction: 'İmleci KÜÇÜK PARLAYAN MAVİ YILDIZIN üzerine götür!',
    badge: 'Yalnızca Üzerine Gel',
    targetKey: 'small-blue-star',
  },
  {
    id: 3,
    type: 'click',
    instruction: 'MAVİ GEZEGENİ bul ve sol tuşla bir kez tıkla!',
    badge: 'Sol Tuşla Tıkla',
    targetKey: 'blue-planet',
  },
  {
    id: 4,
    type: 'click',
    instruction: 'KIRMIZI GEZEGENE sol tuşla bir kez tıkla!',
    badge: 'Sol Tuşla Tıkla',
    targetKey: 'red-planet',
  },
  {
    id: 5,
    type: 'hover',
    instruction: 'İmleci UZAY GEMİSİNİN üzerine getir ve yakıt ikmali yap!',
    badge: 'Yalnızca Üzerine Gel',
    targetKey: 'spaceship',
  },
  {
    id: 6,
    type: 'click',
    instruction: 'YEŞİL HALKALI GEZEGENİ sol tuşla seç ve keşfet!',
    badge: 'Sol Tuşla Tıkla',
    targetKey: 'green-planet',
  },
];

export const Activity4SpaceTarget: React.FC<Activity4Props> = ({
  soundEnabled,
  onComplete,
}) => {
  const [taskIndex, setTaskIndex] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showGuide, setShowGuide] = useState(true);
  const [highlightKey, setHighlightKey] = useState<string | null>(null);

  const currentTask = SPACE_TASKS[taskIndex] || SPACE_TASKS[SPACE_TASKS.length - 1];

  const handleAction = (key: string, actionType: 'hover' | 'click') => {
    if (key !== currentTask.targetKey) {
      if (actionType === 'click') {
        soundEffects.playGentleBoing(soundEnabled);
        setFeedback('Farklı bir hedefe tıkladın. Yönergedeki hedefi ara!');
      }
      return;
    }

    if (currentTask.type !== actionType) {
      if (currentTask.type === 'hover' && actionType === 'click') {
        // Did click instead of hover
        setFeedback('Tıklamana gerek yoktu, yalnızca üzerine gelmen yeterliydi!');
      } else if (currentTask.type === 'click' && actionType === 'hover') {
        // Just hovered when click needed
        setFeedback('Şimdi sol tuşa bir kez basmayı unutma!');
        return;
      }
    }

    // Success!
    soundEffects.playStar(soundEnabled);
    setHighlightKey(key);
    setFeedback('Harika! Uzay görevini başarıyla tamamladın! 🚀');
    setScore((prev) => prev + 25);

    setTimeout(() => {
      setHighlightKey(null);
      setFeedback(null);
      const next = taskIndex + 1;
      if (next >= SPACE_TASKS.length) {
        soundEffects.playFanfare(soundEnabled);
        onComplete(3, score + 25);
      } else {
        setTaskIndex(next);
      }
    }, 700);
  };

  const handleRestart = () => {
    setTaskIndex(0);
    setFeedback(null);
    setScore(0);
    soundEffects.playPop(soundEnabled);
  };

  return (
    <div className="w-full max-w-5xl bg-white rounded-3xl border-4 border-indigo-200 shadow-xl overflow-hidden flex flex-col select-none">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-indigo-100 to-purple-200 px-5 py-3.5 border-b-2 border-indigo-300 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="px-3 py-1 rounded-full bg-indigo-600 text-white font-black text-xs shadow-xs">
            Etkinlik 4
          </span>
          <div>
            <h2 className="text-base sm:text-lg font-black text-indigo-950">
              Uzay Yolculuğu – İmleci Hedefe Götür
            </h2>
            <p className="text-xs font-semibold text-indigo-800 hidden sm:block">
              Hedef takibi ile tek tıklama koordinasyonunu uzayda geliştir.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white/90 border border-indigo-300 px-3 py-1 rounded-full text-xs font-black text-indigo-900 shadow-2xs">
            Görev {taskIndex + 1} / {SPACE_TASKS.length}
          </div>

          <button
            onClick={() => setShowGuide(!showGuide)}
            className="p-1.5 rounded-xl bg-white/80 hover:bg-white text-indigo-800 border border-indigo-300 cursor-pointer"
            title="Yönergeyi Göster"
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
            <span className="text-lg">🚀</span>
            <span>
              <strong>Yönerge:</strong> Görev kutusundaki talimatı oku. Bazı görevlerde yalnızca üzerine gel, bazılarında ise sol tıkla!
            </span>
          </div>
          <button
            onClick={() => setShowGuide(false)}
            className="text-xs text-indigo-700 underline font-extrabold hover:text-indigo-900 cursor-pointer ml-2"
          >
            Kapat
          </button>
        </div>
      )}

      {/* Space Canvas */}
      <div className="relative w-full h-[400px] sm:h-[450px] bg-gradient-to-b from-[#0f172a] via-[#1e1b4b] to-[#090d16] overflow-hidden">
        {/* Background micro stars */}
        <div className="absolute top-10 left-16 text-xs text-yellow-100 opacity-60">✦</div>
        <div className="absolute top-28 left-48 text-[10px] text-blue-200 opacity-70">★</div>
        <div className="absolute top-16 right-24 text-xs text-purple-200 opacity-80">✦</div>
        <div className="absolute bottom-20 left-28 text-xs text-yellow-200 opacity-50">★</div>
        <div className="absolute bottom-32 right-40 text-xs text-pink-200 opacity-60">✦</div>

        {/* Current Mission Prompt Pill */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/90 border-2 border-indigo-400 px-5 py-2 rounded-2xl shadow-xl z-20 flex flex-col items-center text-center max-w-md">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                currentTask.type === 'hover'
                  ? 'bg-sky-500 text-white'
                  : 'bg-emerald-500 text-white'
              }`}
            >
              {currentTask.badge}
            </span>
            <span className="text-xs sm:text-sm font-black text-white">
              {currentTask.instruction}
            </span>
          </div>

          {feedback && (
            <p className="text-xs font-bold text-amber-300 mt-1 animate-pulse">
              {feedback}
            </p>
          )}
        </div>

        {/* 1. Big Yellow Star */}
        <div
          onMouseEnter={() => handleAction('big-yellow-star', 'hover')}
          onClick={() => handleAction('big-yellow-star', 'click')}
          className={`absolute top-24 left-16 cursor-pointer p-4 transition-all duration-300 ${
            highlightKey === 'big-yellow-star'
              ? 'scale-130 rotate-12'
              : 'hover:scale-115'
          } ${currentTask.targetKey === 'big-yellow-star' ? 'animate-pulse' : ''}`}
        >
          <div className="text-5xl filter drop-shadow-[0_0_12px_rgba(250,204,21,0.8)]">
            ⭐
          </div>
          <span className="text-[10px] font-bold text-amber-200 bg-slate-800/80 px-2 py-0.5 rounded-full mt-1 block text-center">
            Büyük Yıldız
          </span>
        </div>

        {/* 2. Small Blue Star */}
        <div
          onMouseEnter={() => handleAction('small-blue-star', 'hover')}
          onClick={() => handleAction('small-blue-star', 'click')}
          className={`absolute top-20 right-32 cursor-pointer p-3 transition-all duration-300 ${
            highlightKey === 'small-blue-star'
              ? 'scale-130 rotate-12'
              : 'hover:scale-115'
          } ${currentTask.targetKey === 'small-blue-star' ? 'animate-pulse' : ''}`}
        >
          <div className="text-3xl filter drop-shadow-[0_0_10px_rgba(56,189,248,0.9)]">
            ✨
          </div>
          <span className="text-[10px] font-bold text-sky-200 bg-slate-800/80 px-2 py-0.5 rounded-full mt-1 block text-center">
            Mavi Yıldız
          </span>
        </div>

        {/* 3. Blue Planet */}
        <div
          onMouseEnter={() => handleAction('blue-planet', 'hover')}
          onClick={() => handleAction('blue-planet', 'click')}
          className={`absolute bottom-28 left-40 cursor-pointer p-3 transition-all duration-300 ${
            highlightKey === 'blue-planet'
              ? 'scale-125'
              : 'hover:scale-110'
          } ${currentTask.targetKey === 'blue-planet' ? 'animate-bounce' : ''}`}
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-700 via-blue-500 to-sky-300 border-2 border-white/60 shadow-[0_0_20px_rgba(59,130,246,0.6)] flex items-center justify-center text-2xl">
            🌍
          </div>
          <span className="text-[10px] font-bold text-blue-200 bg-slate-800/80 px-2 py-0.5 rounded-full mt-1 block text-center">
            Mavi Gezegen
          </span>
        </div>

        {/* 4. Red Planet */}
        <div
          onMouseEnter={() => handleAction('red-planet', 'hover')}
          onClick={() => handleAction('red-planet', 'click')}
          className={`absolute bottom-16 right-28 cursor-pointer p-3 transition-all duration-300 ${
            highlightKey === 'red-planet'
              ? 'scale-125'
              : 'hover:scale-110'
          } ${currentTask.targetKey === 'red-planet' ? 'animate-bounce' : ''}`}
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-rose-800 via-rose-600 to-amber-500 border-2 border-white/60 shadow-[0_0_18px_rgba(244,63,94,0.6)] flex items-center justify-center text-xl">
            🔴
          </div>
          <span className="text-[10px] font-bold text-rose-200 bg-slate-800/80 px-2 py-0.5 rounded-full mt-1 block text-center">
            Kırmızı Gezegen
          </span>
        </div>

        {/* 5. Spaceship in Center */}
        <div
          onMouseEnter={() => handleAction('spaceship', 'hover')}
          onClick={() => handleAction('spaceship', 'click')}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer p-4 transition-all duration-300 ${
            highlightKey === 'spaceship'
              ? 'scale-130 rotate-12'
              : 'hover:scale-115'
          } ${currentTask.targetKey === 'spaceship' ? 'animate-pulse' : ''}`}
        >
          <div className="w-20 h-20 rounded-3xl bg-slate-800/80 border-2 border-indigo-400/80 shadow-[0_0_25px_rgba(99,102,241,0.5)] flex items-center justify-center text-4xl">
            🚀
          </div>
          <span className="text-[10px] font-bold text-indigo-200 bg-slate-900/90 px-2.5 py-0.5 rounded-full mt-1 block text-center">
            Uzay Gemisi
          </span>
        </div>

        {/* 6. Green Ringed Planet */}
        <div
          onMouseEnter={() => handleAction('green-planet', 'hover')}
          onClick={() => handleAction('green-planet', 'click')}
          className={`absolute top-28 left-1/2 ml-20 cursor-pointer p-3 transition-all duration-300 ${
            highlightKey === 'green-planet'
              ? 'scale-125'
              : 'hover:scale-110'
          } ${currentTask.targetKey === 'green-planet' ? 'animate-bounce' : ''}`}
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-800 via-teal-600 to-lime-300 border-2 border-white/60 shadow-[0_0_18px_rgba(20,184,166,0.6)] flex items-center justify-center text-xl">
            🪐
          </div>
          <span className="text-[10px] font-bold text-teal-200 bg-slate-800/80 px-2 py-0.5 rounded-full mt-1 block text-center">
            Yeşil Gezegen
          </span>
        </div>
      </div>

      {/* Progress Footer */}
      <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs font-bold text-slate-600">
        <div className="flex items-center gap-2">
          <span>İlerleme:</span>
          <div className="w-36 sm:w-48 bg-slate-200 h-3 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-300"
              style={{ width: `${(taskIndex / SPACE_TASKS.length) * 100}%` }}
            />
          </div>
          <span>{taskIndex} / {SPACE_TASKS.length}</span>
        </div>

        <div className="text-indigo-700 font-extrabold flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gezin & Tıkla</span>
        </div>
      </div>
    </div>
  );
};
