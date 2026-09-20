import React, { useState } from 'react';
import { HelpCircle, RotateCcw, Menu, Eye, Unlock, X, Sparkles } from 'lucide-react';
import { soundEffects } from '../../utils/audio.ts';

interface Activity7Props {
  soundEnabled: boolean;
  onComplete: (stars: number, score: number) => void;
  onSoundToggle: () => void;
}

interface ChestItem {
  id: number;
  label: string;
  color: string;
  isOpened: boolean;
  isInspected: boolean;
  contentEmoji: string;
  rewardName: string;
}

const CHESTS: ChestItem[] = [
  { id: 1, label: 'Kırmızı Hazine Sandığı', color: '#ef4444', isOpened: false, isInspected: false, contentEmoji: '💎', rewardName: 'Elmas Kristali' },
  { id: 2, label: 'Mavi Sihir Sandığı', color: '#3b82f6', isOpened: false, isInspected: false, contentEmoji: '👑', rewardName: 'Altın Taç' },
  { id: 3, label: 'Zümrüt Doğa Sandığı', color: '#10b981', isOpened: false, isInspected: false, contentEmoji: '🌟', rewardName: 'Sihirli Yıldız' },
  { id: 4, label: 'Altın Kraliyet Sandığı', color: '#f59e0b', isOpened: false, isInspected: false, contentEmoji: '🏆', rewardName: 'Şampiyonluk Kupası' },
  { id: 5, label: 'Mor Kristal Sandık', color: '#8b5cf6', isOpened: false, isInspected: false, contentEmoji: '🔮', rewardName: 'Büyülü Küre' },
];

export const Activity7RightClickChest: React.FC<Activity7Props> = ({
  soundEnabled,
  onComplete,
}) => {
  const [chestList, setChestList] = useState<ChestItem[]>(CHESTS);
  const [activeMenu, setActiveMenu] = useState<{
    chestId: number;
    x: number;
    y: number;
  } | null>(null);
  const [feedback, setFeedback] = useState('Sandığın üzerine gel ve farenin SAĞ TUŞUNA bas!');
  const [showGuide, setShowGuide] = useState(true);
  const [completedChestsCount, setCompletedChestsCount] = useState(0);

  const handleChestRightClick = (chestId: number, e: React.MouseEvent) => {
    e.preventDefault(); // suppress native context menu
    e.stopPropagation();

    soundEffects.playPop(soundEnabled);
    const rect = e.currentTarget.getBoundingClientRect();
    const parentRect = e.currentTarget.parentElement?.getBoundingClientRect() || rect;

    const clickX = e.clientX - parentRect.left;
    const clickY = e.clientY - parentRect.top;

    setActiveMenu({
      chestId,
      x: Math.min(Math.max(clickX, 10), parentRect.width - 180),
      y: Math.min(Math.max(clickY - 20, 10), parentRect.height - 150),
    });

    setFeedback('Gizli menü açıldı! Şimdi yapmak istediğin işleme SOL TIKLA.');
  };

  const handleChestLeftClick = (chestId: number) => {
    soundEffects.playGentleBoing(soundEnabled);
    setFeedback("Dikkat: Sol tuşla değil, SAĞ TUŞLA tıklayarak menüyü açmalısın!");
    setActiveMenu(null);
  };

  const handleMenuAction = (action: 'open' | 'inspect' | 'cancel') => {
    if (!activeMenu) return;
    const { chestId } = activeMenu;
    const chest = chestList.find((c) => c.id === chestId);

    if (action === 'cancel') {
      soundEffects.playPop(soundEnabled);
      setActiveMenu(null);
      setFeedback('İşlem iptal edildi. Başka bir sandıkta SAĞ TIKLAMAYI dene!');
      return;
    }

    if (action === 'open') {
      soundEffects.playMagicChime(soundEnabled);
      soundEffects.playStar(soundEnabled);

      setChestList((prev) =>
        prev.map((c) => (c.id === chestId ? { ...c, isOpened: true } : c))
      );

      const nextCount = completedChestsCount + 1;
      setCompletedChestsCount(nextCount);
      setFeedback(`Tebrikler! ${chest?.label} açıldı ve içinden ${chest?.rewardName} çıktı! ✨`);
      setActiveMenu(null);

      if (nextCount >= CHESTS.length) {
        soundEffects.playFanfare(soundEnabled);
        onComplete(3, nextCount * 30);
      }
    } else if (action === 'inspect') {
      soundEffects.playStar(soundEnabled);
      setChestList((prev) =>
        prev.map((c) => (c.id === chestId ? { ...c, isInspected: true } : c))
      );
      setFeedback(`İnceleme: Bu sandık antika kilitli ve içinde değerli ${chest?.rewardName} saklıyor!`);
      setActiveMenu(null);
    }
  };

  const handleRestart = () => {
    setChestList(CHESTS);
    setActiveMenu(null);
    setCompletedChestsCount(0);
    setFeedback('Sandığın üzerine gel ve farenin SAĞ TUŞUNA bas!');
    soundEffects.playPop(soundEnabled);
  };

  return (
    <div className="w-full max-w-5xl bg-white rounded-3xl border-4 border-rose-200 shadow-xl overflow-hidden flex flex-col select-none">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-rose-100 to-pink-200 px-5 py-3.5 border-b-2 border-rose-300 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="px-3 py-1 rounded-full bg-rose-600 text-white font-black text-xs shadow-xs">
            Etkinlik 7
          </span>
          <div>
            <h2 className="text-base sm:text-lg font-black text-rose-950">
              Sağ Tıklama Dünyası – Gizli Menü
            </h2>
            <p className="text-xs font-semibold text-rose-800 hidden sm:block">
              Farenin sağ tuşuyla menüyü aç, sol tuşla seçeneği seç!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white/90 border border-rose-300 px-3 py-1 rounded-full text-xs font-black text-rose-900 shadow-2xs">
            {completedChestsCount} / {CHESTS.length} Sandık
          </div>

          <button
            onClick={() => setShowGuide(!showGuide)}
            className="p-1.5 rounded-xl bg-white/80 hover:bg-white text-rose-800 border border-rose-300 cursor-pointer"
            title="Yönergeyi Göster"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={handleRestart}
            className="p-1.5 rounded-xl bg-white/80 hover:bg-white text-rose-800 border border-rose-300 cursor-pointer"
            title="Yeniden Başlat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Guide Banner */}
      {showGuide && (
        <div className="bg-rose-50 border-b border-rose-200 px-5 py-2.5 flex items-center justify-between text-xs sm:text-sm text-rose-900 font-bold">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎁</span>
            <span>
              <strong>Yönerge:</strong> Gizli menüyü açmak için sandığın üzerine gel ve mouse'un sağ tuşuna bas! Menü açılınca sol tuşla seçeneğe tıkla.
            </span>
          </div>
          <button
            onClick={() => setShowGuide(false)}
            className="text-xs text-rose-700 underline font-extrabold hover:text-rose-900 cursor-pointer ml-2"
          >
            Kapat
          </button>
        </div>
      )}

      {/* Game Courtyard Canvas */}
      <div
        onContextMenu={(e) => e.preventDefault()}
        onClick={() => setActiveMenu(null)}
        className="relative w-full min-h-[400px] sm:min-h-[440px] bg-gradient-to-b from-rose-50 via-amber-50/40 to-slate-100 p-6 flex flex-col items-center justify-center cursor-default"
      >
        {/* Dynamic Prompt Pill */}
        <div className="mb-6 bg-white border-2 border-rose-300 px-5 py-2 rounded-full shadow-md text-xs sm:text-sm font-black text-rose-900 animate-bounce">
          🎯 {feedback}
        </div>

        {/* Chests Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 justify-center items-center max-w-3xl">
          {chestList.map((chest) => (
            <div
              key={chest.id}
              onClick={() => handleChestLeftClick(chest.id)}
              onContextMenu={(e) => handleChestRightClick(chest.id, e)}
              className={`relative rounded-3xl p-4 cursor-pointer transition-all duration-300 transform flex flex-col items-center text-center select-none ${
                chest.isOpened
                  ? 'bg-amber-100 border-3 border-amber-400 shadow-sm'
                  : 'bg-white border-3 border-slate-300 hover:border-rose-400 hover:scale-105 shadow-md'
              }`}
            >
              {/* Chest visual */}
              <div className="text-4xl sm:text-5xl mb-1 filter drop-shadow-sm">
                {chest.isOpened ? chest.contentEmoji : '🧰'}
              </div>

              <span className="text-xs font-black text-slate-800 leading-tight">
                {chest.label.split(' ')[0]}
              </span>

              <span className="text-[10px] text-slate-500 font-semibold">
                {chest.isOpened ? chest.rewardName : 'Sağ Tıkla!'}
              </span>

              {chest.isInspected && !chest.isOpened && (
                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-xs">
                  İncelendi 🔍
                </span>
              )}

              <div className="mt-2 bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                SAĞ TIK
              </div>
            </div>
          ))}
        </div>

        {/* Custom In-Game Context Menu (Kid Friendly) */}
        {activeMenu && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ left: `${activeMenu.x}px`, top: `${activeMenu.y}px` }}
            className="absolute z-30 w-44 bg-white rounded-2xl border-3 border-rose-400 shadow-2xl p-2 flex flex-col gap-1.5 animate-in zoom-in-95 duration-150 select-none"
          >
            <div className="text-[10px] font-black uppercase text-rose-500 px-2 py-0.5 border-b border-rose-100 flex items-center gap-1">
              <Menu className="w-3 h-3" />
              <span>Gizli Menü (Sol Tıkla)</span>
            </div>

            <button
              onClick={() => handleMenuAction('open')}
              className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-xl text-xs font-black text-slate-800 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
            >
              <Unlock className="w-4 h-4 text-emerald-600" />
              <span>Sandığı Aç</span>
            </button>

            <button
              onClick={() => handleMenuAction('inspect')}
              className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-xl text-xs font-black text-slate-800 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4 text-blue-600" />
              <span>Sandığı İncele</span>
            </button>

            <button
              onClick={() => handleMenuAction('cancel')}
              className="flex items-center gap-2 w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer border-t border-slate-100"
            >
              <X className="w-3.5 h-3.5" />
              <span>Vazgeç</span>
            </button>
          </div>
        )}
      </div>

      {/* Progress Footer */}
      <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs font-bold text-slate-600">
        <div className="flex items-center gap-2">
          <span>İlerleme:</span>
          <div className="w-36 sm:w-48 bg-slate-200 h-3 rounded-full overflow-hidden">
            <div
              className="bg-rose-500 h-full transition-all duration-300"
              style={{ width: `${(completedChestsCount / CHESTS.length) * 100}%` }}
            />
          </div>
          <span>{completedChestsCount} / {CHESTS.length}</span>
        </div>

        <div className="text-rose-700 font-extrabold flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Sağ Tıkla Menüyü Aç</span>
        </div>
      </div>
    </div>
  );
};
