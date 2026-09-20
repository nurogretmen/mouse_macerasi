import React, { useState, useEffect } from 'react';
import { HelpCircle, RotateCcw, Layers, Sparkles, CheckCircle2, Play } from 'lucide-react';
import { soundEffects } from '../../utils/audio.ts';

interface Activity6Props {
  soundEnabled: boolean;
  onComplete: (stars: number, score: number) => void;
  onSoundToggle: () => void;
}

interface CardItem {
  id: number;
  pairKey: string;
  icon: string;
  label: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface LevelThemeItem {
  key: string;
  icon: string;
  label: string;
}

interface LevelConfig {
  levelNum: number;
  title: string;
  subtitle: string;
  pairCount: number;
  gridColsClass: string;
  cardHeightClass: string;
  instructionText: string;
  items: LevelThemeItem[];
}

const LEVELS: LevelConfig[] = [
  {
    levelNum: 1,
    title: '1. Seviye: 1 e 1 Eşleştirme',
    subtitle: '1 Çift (Toplam 2 Kart)',
    pairCount: 1,
    gridColsClass: 'grid-cols-2 max-w-xs sm:max-w-sm',
    cardHeightClass: 'h-44 sm:h-52',
    instructionText: 'Hafıza Kartlarına hoş geldin! Kapalı duran 2 kartı sol tıkla aç ve eşleştirmeyi tamamla!',
    items: [{ key: 'cat', icon: '🐱', label: 'Kedi' }],
  },
  {
    levelNum: 2,
    title: '2. Seviye: 2 ye 2 Eşleştirme',
    subtitle: '2 Çift (Toplam 4 Kart - 2x2 Izgara)',
    pairCount: 2,
    gridColsClass: 'grid-cols-2 max-w-xs sm:max-w-md',
    cardHeightClass: 'h-40 sm:h-48',
    instructionText: 'Harika! 2x2 ızgaradaki 4 kapalı kartı aç, gizli çiftleri bul ve eşleştir!',
    items: [
      { key: 'apple', icon: '🍎', label: 'Elma' },
      { key: 'banana', icon: '🍌', label: 'Muz' },
    ],
  },
  {
    levelNum: 3,
    title: '3. Seviye: 3 Çift Eşleştirme',
    subtitle: '3 Çift (Toplam 6 Kart)',
    pairCount: 3,
    gridColsClass: 'grid-cols-3 max-w-md sm:max-w-xl',
    cardHeightClass: 'h-36 sm:h-44',
    instructionText: 'Şimdi kart sayısı 6 oldu! Kapalı kartları açarak hafızanı göster ve çiftleri bul!',
    items: [
      { key: 'dog', icon: '🐶', label: 'Köpek' },
      { key: 'rabbit', icon: '🐰', label: 'Tavşan' },
      { key: 'lion', icon: '🦁', label: 'Aslan' },
    ],
  },
  {
    levelNum: 4,
    title: '4. Seviye: 4 Çift Eşleştirme',
    subtitle: '4 Çift (Toplam 8 Kart - 2x4 Izgara)',
    pairCount: 4,
    gridColsClass: 'grid-cols-2 sm:grid-cols-4 max-w-lg sm:max-w-2xl',
    cardHeightClass: 'h-32 sm:h-40',
    instructionText: 'Yeni seviyede 8 kapalı kart seni bekliyor! Kartları dikkatlice açıp eşleştir!',
    items: [
      { key: 'strawberry', icon: '🍓', label: 'Çilek' },
      { key: 'orange', icon: '🍊', label: 'Portakal' },
      { key: 'grapes', icon: '🍇', label: 'Üzüm' },
      { key: 'watermelon', icon: '🍉', label: 'Karpuz' },
    ],
  },
  {
    levelNum: 5,
    title: '5. Seviye: 5 Çift Eşleştirme',
    subtitle: '5 Çift (Toplam 10 Kart)',
    pairCount: 5,
    gridColsClass: 'grid-cols-2 sm:grid-cols-5 max-w-xl sm:max-w-3xl',
    cardHeightClass: 'h-32 sm:h-38',
    instructionText: 'Büyük mücadele! 10 kapalı kart içindeki tüm gizli çiftleri bularak şampiyonluğa yaklaş!',
    items: [
      { key: 'panda', icon: '🐼', label: 'Panda' },
      { key: 'elephant', icon: '🐘', label: 'Fil' },
      { key: 'frog', icon: '🐸', label: 'Kurbağa' },
      { key: 'bear', icon: '🐻', label: 'Ayıcık' },
      { key: 'penguin', icon: '🐧', label: 'Penguen' },
    ],
  },
  {
    levelNum: 6,
    title: '6. Seviye: 6 Çift Şampiyonluk',
    subtitle: '6 Çift (Toplam 12 Kart - 3x4 Izgara)',
    pairCount: 6,
    gridColsClass: 'grid-cols-3 sm:grid-cols-4 max-w-xl sm:max-w-3xl',
    cardHeightClass: 'h-28 sm:h-36',
    instructionText: 'Büyük Final! 12 kapalı kartı tek tek aç, tüm gizli çiftleri eşleştirerek hafıza şampiyonu ol!',
    items: [
      { key: 'apple2', icon: '🍎', label: 'Elma' },
      { key: 'banana2', icon: '🍌', label: 'Muz' },
      { key: 'strawberry2', icon: '🍓', label: 'Çilek' },
      { key: 'watermelon2', icon: '🍉', label: 'Karpuz' },
      { key: 'pineapple', icon: '🍍', label: 'Ananas' },
      { key: 'cherry', icon: '🍒', label: 'Kiraz' },
    ],
  },
];

export const Activity6MemoryCards: React.FC<Activity6Props> = ({
  soundEnabled,
  onComplete,
}) => {
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [cards, setCards] = useState<CardItem[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [matchedPairsCount, setMatchedPairsCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [showLevelModal, setShowLevelModal] = useState(true);
  const [score, setScore] = useState(0);

  const currentLevel = LEVELS[currentLevelIdx];

  // Initialize deck for current level
  const initDeck = (levelIdx: number) => {
    const config = LEVELS[levelIdx];
    const deck: CardItem[] = [];

    config.items.forEach((item, idx) => {
      deck.push({
        id: idx * 2 + 1,
        pairKey: item.key,
        icon: item.icon,
        label: item.label,
        isFlipped: false,
        isMatched: false,
      });
      deck.push({
        id: idx * 2 + 2,
        pairKey: item.key,
        icon: item.icon,
        label: item.label,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle deck
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setSelectedCards([]);
    setMatchedPairsCount(0);
    setIsLocked(false);
  };

  useEffect(() => {
    initDeck(currentLevelIdx);
  }, [currentLevelIdx]);

  const handleCardClick = (id: number) => {
    if (isLocked || showLevelModal) return;

    const clickedCard = cards.find((c) => c.id === id);
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;

    soundEffects.playPop(soundEnabled);

    // Flip this card
    const updated = cards.map((c) => (c.id === id ? { ...c, isFlipped: true } : c));
    setCards(updated);

    const newSelected = [...selectedCards, id];
    setSelectedCards(newSelected);

    // If 2 cards are flipped
    if (newSelected.length === 2) {
      setIsLocked(true);
      const firstCard = updated.find((c) => c.id === newSelected[0])!;
      const secondCard = updated.find((c) => c.id === newSelected[1])!;

      if (firstCard.pairKey === secondCard.pairKey) {
        // MATCH FOUND!
        soundEffects.playStar(soundEnabled);
        setScore((s) => s + 40);

        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.pairKey === firstCard.pairKey
                ? { ...c, isMatched: true, isFlipped: true }
                : c
            )
          );
          setSelectedCards([]);
          setIsLocked(false);

          const newMatchCount = matchedPairsCount + 1;
          setMatchedPairsCount(newMatchCount);

          // Check if round is complete
          if (newMatchCount === currentLevel.pairCount) {
            soundEffects.playFanfare(soundEnabled);

            if (currentLevelIdx + 1 < LEVELS.length) {
              setTimeout(() => {
                setCurrentLevelIdx((idx) => idx + 1);
                setShowLevelModal(true);
              }, 700);
            } else {
              setTimeout(() => {
                onComplete(3, score + 200);
              }, 1200);
            }
          }
        }, 500);
      } else {
        // NO MATCH
        soundEffects.playBoing(soundEnabled);

        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              newSelected.includes(c.id) ? { ...c, isFlipped: false } : c
            )
          );
          setSelectedCards([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  const handleContinueLevel = () => {
    setShowLevelModal(false);
    soundEffects.playPop(soundEnabled);
    initDeck(currentLevelIdx);
  };

  const handleRestart = () => {
    setCurrentLevelIdx(0);
    setScore(0);
    setShowLevelModal(true);
    initDeck(0);
    soundEffects.playPop(soundEnabled);
  };

  return (
    <div className="w-full max-w-5xl bg-white rounded-3xl border-4 border-orange-300 shadow-xl overflow-hidden flex flex-col select-none relative">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-orange-100 via-amber-100 to-yellow-100 px-5 py-3 border-b-2 border-orange-300 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className="px-3 py-1 rounded-full bg-orange-600 text-white font-black text-xs shadow-xs flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Etkinlik 6</span>
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-orange-950">
                Hafıza Kartları – {currentLevel.title}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-orange-200 text-orange-900 text-[10px] sm:text-xs font-black">
                Seviye {currentLevel.levelNum} / {LEVELS.length}
              </span>
            </div>
            <p className="text-xs font-semibold text-orange-800 hidden sm:block">
              {currentLevel.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white/95 border-2 border-orange-300 px-3.5 py-1 rounded-full text-xs font-black text-orange-900 shadow-2xs">
            {matchedPairsCount} / {currentLevel.pairCount} Çift Eşleşti
          </div>

          <button
            onClick={() => setShowGuide(!showGuide)}
            className="p-1.5 rounded-xl bg-white/80 hover:bg-white text-orange-800 border border-orange-300 cursor-pointer"
            title="Nasıl Oynanır?"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={handleRestart}
            className="p-1.5 rounded-xl bg-white/80 hover:bg-white text-orange-800 border border-orange-300 cursor-pointer"
            title="Yeniden Başlat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Guide Bar */}
      {showGuide && (
        <div className="bg-orange-50 border-b border-orange-200 px-5 py-2.5 flex items-center justify-between text-xs sm:text-sm text-orange-950 font-bold animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🃏</span>
            <span>
              <strong>Nasıl Oynanır?</strong> Kapalı kartlara farenin sol tuşuyla 1 kez basarak aç. Aynı resmi taşıyan 2 kartı bul ve eşleştir!
            </span>
          </div>
          <button
            onClick={() => setShowGuide(false)}
            className="text-xs text-orange-800 underline font-black hover:text-orange-950 cursor-pointer ml-3 shrink-0"
          >
            Kapat
          </button>
        </div>
      )}

      {/* Play Area with BIGGER, beautiful visual cards */}
      <div className="p-4 sm:p-7 bg-[#fffaf5] flex flex-col items-center justify-center min-h-[460px] sm:min-h-[520px] relative">
        <div
          className={`grid gap-3 sm:gap-4 w-full justify-center ${currentLevel.gridColsClass}`}
        >
          {cards.map((card) => {
            const isFlipped = card.isFlipped || card.isMatched;

            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                disabled={card.isMatched || isLocked}
                className={`relative ${currentLevel.cardHeightClass} rounded-3xl border-3 transition-all duration-300 cursor-pointer transform active:scale-95 flex flex-col items-center justify-center select-none shadow-md ${
                  card.isMatched
                    ? 'bg-emerald-50 border-emerald-400 opacity-90 scale-95 ring-4 ring-emerald-300'
                    : isFlipped
                    ? 'bg-white border-orange-400 scale-105 ring-4 ring-amber-300'
                    : 'bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 border-orange-700 hover:scale-105 hover:shadow-lg'
                }`}
              >
                {isFlipped ? (
                  /* OPEN CARD: HUGE EMOJI + CLEAR LABEL */
                  <div className="flex flex-col items-center justify-center p-2 animate-in zoom-in-75 duration-200">
                    <span className="text-5xl sm:text-6xl filter drop-shadow-md mb-1">
                      {card.icon}
                    </span>
                    <span className="text-sm sm:text-base font-black text-slate-800 tracking-wide">
                      {card.label}
                    </span>
                    {card.isMatched && (
                      <span className="text-[11px] sm:text-xs font-black text-emerald-800 mt-1 bg-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Eşleşti</span>
                      </span>
                    )}
                  </div>
                ) : (
                  /* CLOSED CARD: HER ZAMAN SORU İŞARETİ VE TIKLA YAZISI */
                  <div className="flex flex-col items-center justify-center text-white">
                    <span className="text-4xl sm:text-5xl opacity-90 drop-shadow-sm">
                      ❓
                    </span>
                    <span className="text-xs font-black uppercase tracking-wider text-amber-100 mt-1">
                      Tıkla
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* LEVEL ATLAYINCA EKRANIN ORTASINDA BELİREN SEVİYE BİLGİLENDİRME MODALI */}
        {showLevelModal && (
          <div className="absolute inset-0 bg-slate-900/65 backdrop-blur-[2px] flex items-center justify-center z-40 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm sm:max-w-md w-full shadow-2xl border-4 border-orange-400 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
              {/* Level Crown / Emoji Icon */}
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-orange-400 to-amber-200 border-2 border-orange-400 shadow-md flex items-center justify-center text-3xl mb-3 animate-bounce">
                🃏
              </div>

              {/* Level Number Ribbon */}
              <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-orange-100 border border-orange-300 text-orange-900 font-black text-xs sm:text-sm uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4 text-orange-600" />
                <span>SEVİYE {currentLevel.levelNum} / {LEVELS.length}</span>
              </div>

              {/* Level Title */}
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 mb-1">
                {currentLevel.title.replace(/^\d+\.\s*Seviye:\s*/, '')}
              </h3>

              <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-black mb-3">
                <span>{currentLevel.subtitle}</span>
              </div>

              {/* Level Instruction - Kartların içinde ne olduğunu söylemez, gizemli ve sürpriz tutar */}
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mb-5 px-2 leading-relaxed">
                {currentLevel.instructionText}
              </p>

              {/* Devam Et Button */}
              <button
                onClick={handleContinueLevel}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-base sm:text-lg font-black shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer group"
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
              className="bg-orange-500 h-full transition-all duration-300"
              style={{
                width: `${
                  ((currentLevelIdx * 10 + (matchedPairsCount / currentLevel.pairCount) * 10) /
                    (LEVELS.length * 10)) *
                  100
                }%`,
              }}
            />
          </div>
          <span className="text-orange-900 font-extrabold">
            Seviye {currentLevelIdx + 1} / {LEVELS.length}
          </span>
        </div>

        <div className="text-orange-700 font-extrabold flex items-center gap-1">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Farenin sol tuşuna 1 kez basarak kartı aç</span>
        </div>
      </div>
    </div>
  );
};
