import React, { useState, useRef } from 'react';
import { HelpCircle, RotateCcw, Award, CheckCircle2, AlertCircle, Sparkles, Menu } from 'lucide-react';
import { soundEffects } from '../../utils/audio.ts';

interface Activity10Props {
  soundEnabled: boolean;
  onComplete: (stars: number, score: number) => void;
  onSoundToggle: () => void;
}

type RequiredAction = 'single-click' | 'double-click' | 'right-click' | 'drag-drop';

interface MasterTask {
  id: number;
  instruction: string;
  expectedAction: RequiredAction;
  targetEmoji: string;
  targetLabel: string;
  destLabel?: string;
}

const MASTER_TASKS: MasterTask[] = [
  {
    id: 1,
    instruction: 'Kapıyı açmak için sol tuşla BİR KEZ tıkla.',
    expectedAction: 'single-click',
    targetEmoji: '🚪',
    targetLabel: 'Ahşap Kapı',
  },
  {
    id: 2,
    instruction: 'Yıldızlı kutuyu açmak için hızlıca ÇİFT TIKLA.',
    expectedAction: 'double-click',
    targetEmoji: '⭐',
    targetLabel: 'Yıldızlı Kutu',
  },
  {
    id: 3,
    instruction: 'Gizli seçenekleri görmek için farenin SAĞ TUŞUNA bas.',
    expectedAction: 'right-click',
    targetEmoji: '🔮',
    targetLabel: 'Sihirli Küre',
  },
  {
    id: 4,
    instruction: 'Altın anahtarı kilit yuvasına SÜRÜKLE ve bırak.',
    expectedAction: 'drag-drop',
    targetEmoji: '🔑',
    targetLabel: 'Altın Anahtar',
    destLabel: 'Kilit Yuvası 🔒',
  },
  {
    id: 5,
    instruction: 'Lambayı yakmak için sol tuşla BİR KEZ tıkla.',
    expectedAction: 'single-click',
    targetEmoji: '💡',
    targetLabel: 'Sihirli Lamba',
  },
  {
    id: 6,
    instruction: 'Hazine sandığını uyandırmak için ÇİFT TIKLA.',
    expectedAction: 'double-click',
    targetEmoji: '🧰',
    targetLabel: 'Hazine Sandığı',
  },
  {
    id: 7,
    instruction: 'Gizli menüden eşyayı incelemek için SAĞ TIKLA.',
    expectedAction: 'right-click',
    targetEmoji: '📜',
    targetLabel: 'Eski Parşömen',
  },
  {
    id: 8,
    instruction: 'Yıldızı bayrak direğine SÜRÜKLE ve bırak.',
    expectedAction: 'drag-drop',
    targetEmoji: '🌟',
    targetLabel: 'Zafer Yıldızı',
    destLabel: 'Bayrak Direği 🚩',
  },
];

export const Activity10MouseMaster: React.FC<Activity10Props> = ({
  soundEnabled,
  onComplete,
}) => {
  const [taskIdx, setTaskIdx] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | null>(null);
  const [showGuide, setShowGuide] = useState(true);
  const [score, setScore] = useState(0);
  const [activeMenu, setActiveMenu] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [isActionSuccess, setIsActionSuccess] = useState(false);
  const lastClickRef = useRef<number>(0);
  const targetAreaRef = useRef<HTMLDivElement>(null);

  const currentTask = MASTER_TASKS[taskIdx] || MASTER_TASKS[MASTER_TASKS.length - 1];

  const handleTaskSuccess = (customMsg?: string) => {
    soundEffects.playStar(soundEnabled);
    setIsActionSuccess(true);
    setFeedback(customMsg || 'Mükemmel! Doğru mouse hareketini yaptın! 🎯');
    setFeedbackType('success');
    setScore((prev) => prev + 25);

    setTimeout(() => {
      setIsActionSuccess(false);
      setFeedback(null);
      setFeedbackType(null);
      setActiveMenu(null);

      const next = taskIdx + 1;
      if (next >= MASTER_TASKS.length) {
        soundEffects.playFanfare(soundEnabled);
        onComplete(3, score + 25);
      } else {
        setTaskIdx(next);
      }
    }, 700);
  };

  const handleLeftClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = Date.now();
    const delta = now - lastClickRef.current;
    lastClickRef.current = now;

    // If task requires double click
    if (currentTask.expectedAction === 'double-click') {
      if (delta > 50 && delta < 450) {
        soundEffects.playDoubleTap(soundEnabled);
        handleTaskSuccess('Tebrikler! Hızlıca çift tıkladın!');
      } else {
        soundEffects.playPop(soundEnabled);
        setFeedback('İki kere hızlıca basmalısın! Bu görev ÇİFT TIKLAMA istiyor.');
        setFeedbackType('error');
      }
      return;
    }

    // If task requires single click
    if (currentTask.expectedAction === 'single-click') {
      soundEffects.playPop(soundEnabled);
      handleTaskSuccess('Doğru! Sol tuşla bir kez tıkladın.');
      return;
    }

    // If task requires right click
    if (currentTask.expectedAction === 'right-click') {
      soundEffects.playGentleBoing(soundEnabled);
      setFeedback('Farenin SAĞ tuşunu dene! Sol tuşla değil.');
      setFeedbackType('error');
      return;
    }

    // If task requires drag drop
    if (currentTask.expectedAction === 'drag-drop') {
      soundEffects.playGentleBoing(soundEnabled);
      setFeedback('Tıklamak yetmez! Sol tuşu basılı tutup hedef alana sürüklemelisin.');
      setFeedbackType('error');
    }
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (currentTask.expectedAction === 'right-click') {
      soundEffects.playMagicChime(soundEnabled);
      const rect = e.currentTarget.getBoundingClientRect();
      setActiveMenu({ x: rect.left + 20, y: rect.top + 20 });
      handleTaskSuccess('Harika! Sağ tuşla gizli menüyü açtın!');
    } else {
      soundEffects.playGentleBoing(soundEnabled);
      setFeedback('Bu görevde sağ tuş değil, sol tuşu kullanmalısın!');
      setFeedbackType('error');
    }
  };

  const handleDragStart = (e: React.MouseEvent) => {
    if (currentTask.expectedAction !== 'drag-drop') return;
    e.preventDefault();
    soundEffects.playPop(soundEnabled);
    setIsDragging(true);
    setDragPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setDragPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setIsDragging(false);

    if (targetAreaRef.current) {
      const rect = targetAreaRef.current.getBoundingClientRect();
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        soundEffects.playDropSuccess(soundEnabled);
        handleTaskSuccess('Harika! Nesneyi başarıyla sürükleyip bıraktın!');
        return;
      }
    }

    soundEffects.playGentleBoing(soundEnabled);
    setFeedback('Hedef yuvanın içine kadar sürükleyip bırakmalısın!');
    setFeedbackType('error');
  };

  const handleRestart = () => {
    setTaskIdx(0);
    setFeedback(null);
    setFeedbackType(null);
    setActiveMenu(null);
    setIsDragging(false);
    setScore(0);
    soundEffects.playPop(soundEnabled);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="w-full max-w-5xl bg-white rounded-3xl border-4 border-indigo-200 shadow-xl overflow-hidden flex flex-col select-none cursor-default"
    >
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-indigo-100 to-purple-200 px-5 py-3.5 border-b-2 border-indigo-300 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="px-3 py-1 rounded-full bg-indigo-600 text-white font-black text-xs shadow-xs">
            Etkinlik 10
          </span>
          <div>
            <h2 className="text-base sm:text-lg font-black text-indigo-950">
              Mouse Ustası – Doğru Tıklamayı Seç
            </h2>
            <p className="text-xs font-semibold text-indigo-800 hidden sm:block">
              Tek tık, çift tık, sağ tık ve sürükleme arasından doğru olanı uygula!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white/90 border border-indigo-300 px-3 py-1 rounded-full text-xs font-black text-indigo-900 shadow-2xs">
            Görev {taskIdx + 1} / {MASTER_TASKS.length}
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
            <span className="text-lg">🎯</span>
            <span>
              <strong>Yönerge:</strong> Görev kartını dikkatlice oku! Tek tık, çift tık, sağ tık veya sürükleme hareketlerinden hangisi isteniyorsa onu yap.
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

      {/* Arena Canvas */}
      <div className="relative w-full min-h-[400px] sm:min-h-[440px] bg-gradient-to-b from-indigo-50/70 via-white to-purple-50 p-6 flex flex-col items-center justify-center">
        {/* Mission Card Box */}
        <div className="w-full max-w-lg bg-white border-3 border-indigo-400 rounded-3xl p-5 shadow-lg flex flex-col items-center text-center mb-6">
          <span className="text-[11px] font-black uppercase text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 mb-2">
            Görev {taskIdx + 1}
          </span>
          <h3 className="text-base sm:text-xl font-black text-slate-800">
            {currentTask.instruction}
          </h3>

          {feedback && (
            <div
              className={`mt-3 px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 animate-bounce ${
                feedbackType === 'success'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}
            >
              {feedbackType === 'success' ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span>{feedback}</span>
            </div>
          )}
        </div>

        {/* Target Interaction Stage */}
        <div className="flex items-center justify-center gap-8 sm:gap-14 w-full max-w-md">
          {/* Target Element */}
          <div
            onClick={handleLeftClick}
            onContextMenu={handleRightClick}
            onMouseDown={handleDragStart}
            className={`w-32 h-32 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-tr from-white to-indigo-50 border-4 border-indigo-400 shadow-[0_8px_0_#4338ca] flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-105 active:translate-y-2 select-none ${
              isActionSuccess ? 'scale-115 rotate-6' : ''
            } ${isDragging ? 'opacity-30' : 'opacity-100'}`}
          >
            <span className="text-5xl sm:text-6xl mb-1 filter drop-shadow-sm">
              {currentTask.targetEmoji}
            </span>
            <span className="text-xs font-black text-slate-700">
              {currentTask.targetLabel}
            </span>
          </div>

          {/* Destination Slot (if drag-drop task) */}
          {currentTask.expectedAction === 'drag-drop' && (
            <div
              ref={targetAreaRef}
              className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl border-4 border-dashed border-indigo-400 bg-indigo-50/50 flex flex-col items-center justify-center text-center p-2"
            >
              <span className="text-xs font-black text-indigo-900">
                {currentTask.destLabel}
              </span>
              <span className="text-[10px] text-indigo-600 font-bold mt-1">
                Buraya Bırak
              </span>
            </div>
          )}
        </div>

        {/* Floating drag preview */}
        {isDragging && (
          <div
            style={{
              left: `${dragPos.x}px`,
              top: `${dragPos.y}px`,
              transform: 'translate(-50%, -50%)',
            }}
            className="pointer-events-none fixed z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border-3 border-indigo-500 shadow-2xl scale-110"
          >
            <span className="text-3xl">{currentTask.targetEmoji}</span>
            <span className="text-xs font-black text-indigo-900">
              {currentTask.targetLabel}
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
              className="bg-indigo-600 h-full transition-all duration-300"
              style={{ width: `${(taskIdx / MASTER_TASKS.length) * 100}%` }}
            />
          </div>
          <span>{taskIdx} / {MASTER_TASKS.length}</span>
        </div>

        <div className="text-indigo-700 font-extrabold flex items-center gap-1">
          <Award className="w-3.5 h-3.5" />
          <span>Doğru Mouse Hareketi</span>
        </div>
      </div>
    </div>
  );
};
