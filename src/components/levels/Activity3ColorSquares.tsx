import React, { useState } from 'react';
import {
  HelpCircle,
  RotateCcw,
  Check,
  Sparkles,
  Eraser,
  Play,
  ArrowRight,
  Palette,
  AlertCircle,
  Table,
} from 'lucide-react';
import { soundEffects } from '../../utils/audio.ts';

interface Activity3Props {
  soundEnabled: boolean;
  onComplete: (stars: number, score: number) => void;
  onSoundToggle: () => void;
}

export type PaletteColor =
  | 'red'
  | 'blue'
  | 'yellow'
  | 'green'
  | 'purple'
  | 'orange'
  | 'white';

export interface ColorDef {
  key: PaletteColor;
  name: string;
  hex: string;
  emoji: string;
  textColor: string;
}

export const PALETTE: ColorDef[] = [
  { key: 'red', name: 'Kırmızı', hex: '#ef4444', emoji: '🔴', textColor: '#ffffff' },
  { key: 'blue', name: 'Mavi', hex: '#3b82f6', emoji: '🔵', textColor: '#ffffff' },
  { key: 'yellow', name: 'Sarı', hex: '#eab308', emoji: '🟡', textColor: '#854d0e' },
  { key: 'green', name: 'Yeşil', hex: '#22c55e', emoji: '🟢', textColor: '#ffffff' },
  { key: 'purple', name: 'Mor', hex: '#a855f7', emoji: '🟣', textColor: '#ffffff' },
  { key: 'orange', name: 'Turuncu', hex: '#f97316', emoji: '🟠', textColor: '#ffffff' },
  { key: 'white', name: 'Silgi (Beyaz)', hex: '#ffffff', emoji: '⬜', textColor: '#475569' },
];

export interface PatternLevel {
  levelNum: number;
  size: 2 | 3 | 4;
  title: string;
  subtitle: string;
  badgeLabel: string;
  instructionText: string;
  activeColors: PaletteColor[];
  grid: PaletteColor[];
}

export const COL_LETTERS = ['A', 'B', 'C', 'D'];
export const ROW_NUMBERS = ['1', '2', '3', '4'];

export const COLOR_LEVELS: PatternLevel[] = [
  // ==========================================
  // İLK 3 SEVİYE: 2x2 KARELER (TEK RENK)
  // ==========================================
  {
    levelNum: 1,
    size: 2,
    title: '1. Seviye: 2x2 Kırmızı Desen',
    subtitle: 'Hedef Deseni Tablona Boya',
    badgeLabel: '2x2 • Kırmızı',
    instructionText:
      'Sol taraftaki hedef tabloya bak! Paletten kırmızı rengi seç ve aynı deseni kendi tablonda boya.',
    activeColors: ['red', 'white'],
    // Row 1: A1=red, B1=white | Row 2: A2=white, B2=red
    grid: ['red', 'white', 'white', 'red'],
  },
  {
    levelNum: 2,
    size: 2,
    title: '2. Seviye: 2x2 Mavi Köşe Deseni',
    subtitle: 'Hedef Deseni Tablona Boya',
    badgeLabel: '2x2 • Mavi',
    instructionText:
      'Sol taraftaki hedef tabloya bak! Paletten mavi rengi seç ve aynı deseni kendi tablonda boya.',
    activeColors: ['blue', 'white'],
    // Row 1: A1=blue, B1=blue | Row 2: A2=blue, B2=white
    grid: ['blue', 'blue', 'blue', 'white'],
  },
  {
    levelNum: 3,
    size: 2,
    title: '3. Seviye: 2x2 Sarı Çapraz Deseni',
    subtitle: 'Hedef Deseni Tablona Boya',
    badgeLabel: '2x2 • Sarı',
    instructionText:
      'Sol taraftaki hedef tabloya bak! Paletten sarı rengi seç ve çapraz deseni kendi tablonda boya.',
    activeColors: ['yellow', 'white'],
    // Row 1: A1=white, B1=yellow | Row 2: A2=yellow, B2=white
    grid: ['white', 'yellow', 'yellow', 'white'],
  },

  // ==========================================
  // SONRAKİ 3 SEVİYE: 3x3 KARELER (ÇOKLU RENK)
  // ==========================================
  {
    levelNum: 4,
    size: 3,
    title: '4. Seviye: 3x3 Mavi & Sarı Artı Deseni',
    subtitle: 'Hedef Deseni Tablona Boya',
    badgeLabel: '3x3 • İki Renk',
    instructionText:
      'Tablo 3x3 oldu! Sol taraftaki desene bakarak mavi ve sarı boyalarla aynı artı desenini oluştur.',
    activeColors: ['blue', 'yellow', 'white'],
    // Row 1: A1=w, B1=blue, C1=w
    // Row 2: A2=yellow, B2=blue, C2=yellow
    // Row 3: A3=w, B3=blue, C3=w
    grid: [
      'white', 'blue', 'white',
      'yellow', 'blue', 'yellow',
      'white', 'blue', 'white',
    ],
  },
  {
    levelNum: 5,
    size: 3,
    title: '5. Seviye: 3x3 Piksel Gülen Yüz',
    subtitle: 'Hedef Deseni Tablona Boya',
    badgeLabel: '3x3 • Üç Renk',
    instructionText:
      'Sol taraftaki sevimli gülen yüze bak! Yeşil, sarı ve kırmızı renkleri seçerek yüzü tamamla.',
    activeColors: ['green', 'yellow', 'red', 'white'],
    // Row 1: A1=green, B1=w, C1=green
    // Row 2: A2=w, B2=yellow, C2=w
    // Row 3: A3=red, B3=red, C3=red
    grid: [
      'green', 'white', 'green',
      'white', 'yellow', 'white',
      'red', 'red', 'red',
    ],
  },
  {
    levelNum: 6,
    size: 3,
    title: '6. Seviye: 3x3 Mor & Turuncu Geometri',
    subtitle: 'Hedef Deseni Tablona Boya',
    badgeLabel: '3x3 • Çok Renkli',
    instructionText:
      'Sol taraftaki desene dikkatle bak! Mor, turuncu ve mavi renkleri seçerek deseni kendi tablona boya.',
    activeColors: ['purple', 'orange', 'blue', 'white'],
    // Row 1: A1=purple, B1=orange, C1=purple
    // Row 2: A2=w, B2=orange, C2=w
    // Row 3: A3=w, B3=blue, C3=w
    grid: [
      'purple', 'orange', 'purple',
      'white', 'orange', 'white',
      'white', 'blue', 'white',
    ],
  },

  // ==========================================
  // SON 2 SEVİYE: 4x4 KARELER (BÜYÜK TABLO)
  // ==========================================
  {
    levelNum: 7,
    size: 4,
    title: '7. Seviye: 4x4 Piksel Elmas Deseni',
    subtitle: 'Hedef Deseni Tablona Boya',
    badgeLabel: '4x4 • Büyük Tablo',
    instructionText:
      '16 karelik büyük tablo! Sol taraftaki elmas desenine bakarak doğru kareleri renkleriyle boya.',
    activeColors: ['red', 'blue', 'yellow', 'white'],
    // Row 1: A1=w, B1=red, C1=red, D1=w
    // Row 2: A2=blue, B2=yellow, C2=yellow, D2=blue
    // Row 3: A3=blue, B3=w, C3=w, D3=blue
    // Row 4: A4=w, B4=red, C4=red, D4=w
    grid: [
      'white', 'red', 'red', 'white',
      'blue', 'yellow', 'yellow', 'blue',
      'blue', 'white', 'white', 'blue',
      'white', 'red', 'red', 'white',
    ],
  },
  {
    levelNum: 8,
    size: 4,
    title: '8. Seviye: 4x4 Şampiyonluk Uzay Roketi',
    subtitle: 'Büyük Final Deseni',
    badgeLabel: '4x4 • Şampiyonluk',
    instructionText:
      'Büyük Şampiyonluk Seviyesi! Sol taraftaki uzay roketine bak ve tüm renkleri eksiksiz yerleştir.',
    activeColors: ['yellow', 'purple', 'orange', 'green', 'red', 'white'],
    // Row 1: A1=w, B1=yellow, C1=yellow, D1=w
    // Row 2: A2=w, B2=purple, C2=purple, D2=w
    // Row 3: A3=orange, B3=green, C3=green, D3=orange
    // Row 4: A4=w, B4=red, C4=red, D4=w
    grid: [
      'white', 'yellow', 'yellow', 'white',
      'white', 'purple', 'purple', 'white',
      'orange', 'green', 'green', 'orange',
      'white', 'red', 'red', 'white',
    ],
  },
];

export const Activity3ColorSquares: React.FC<Activity3Props> = ({
  soundEnabled,
  onComplete,
}) => {
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const currentLevel = COLOR_LEVELS[currentLevelIdx];

  // Öğrenci rengi kendisi seçmeli; başlangıçta direkt seçili renk YOKTUR (null)
  const [activeColor, setActiveColor] = useState<PaletteColor | null>(null);
  const [userGrid, setUserGrid] = useState<PaletteColor[]>(() =>
    Array(currentLevel.size * currentLevel.size).fill('white')
  );

  const [showGuide, setShowGuide] = useState(false);
  const [showIntroModal, setShowIntroModal] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [noColorWarning, setNoColorWarning] = useState(false);
  const [wrongCellIdx, setWrongCellIdx] = useState<number | null>(null);
  const [wrongFeedback, setWrongFeedback] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const getColorHex = (key: PaletteColor) => {
    return PALETTE.find((p) => p.key === key)?.hex || '#ffffff';
  };

  // Seviye değiştiğinde tabloyu sıfırla ve rengi null yap (öğrenci seçsin)
  const setupLevel = (levelIdx: number) => {
    const lvl = COLOR_LEVELS[levelIdx];
    setCurrentLevelIdx(levelIdx);
    setUserGrid(Array(lvl.size * lvl.size).fill('white'));
    setActiveColor(null); // Rengi boşaltıyoruz
    setShowSuccessModal(false);
    setShowIntroModal(true);
    setNoColorWarning(false);
    setWrongCellIdx(null);
    setWrongFeedback(null);
  };

  // Kareye sol tıkla boyama
  // KURAL: Yanlış seçenek tıklandığında KABUL ETMESİN!
  const handleCellClick = (cellIndex: number) => {
    if (showIntroModal || showSuccessModal) return;

    // 1. Eğer henüz paletten bir renk seçilmediyse uyar
    if (!activeColor) {
      soundEffects.playBoing(soundEnabled);
      setNoColorWarning(true);
      setTimeout(() => setNoColorWarning(false), 2500);
      return;
    }

    setNoColorWarning(false);
    const targetColor = currentLevel.grid[cellIndex];

    // 2. Tıklanan renk hedef renkle eşleşiyor mu?
    if (activeColor !== targetColor) {
      // YANLIŞ SEÇENEK: KABUL ETME!
      soundEffects.playWrong(soundEnabled);
      setWrongCellIdx(cellIndex);
      setWrongFeedback('Bu kare için doğru renk değil! Sol taraftaki hedef tabloya tekrar bak.');
      
      setTimeout(() => {
        setWrongCellIdx(null);
      }, 500);

      setTimeout(() => {
        setWrongFeedback(null);
      }, 2500);

      // Hücreyi boyamıyoruz, hemen geri dönüyoruz!
      return;
    }

    // 3. DOĞRU SEÇENEK: Kabul et ve boya!
    // Eğer zaten doğru renkle boyanmışsa tekrar boyamaya gerek yok
    if (userGrid[cellIndex] === targetColor) {
      soundEffects.playPop(soundEnabled);
      return;
    }

    setWrongFeedback(null);
    soundEffects.playPop(soundEnabled);

    const newGrid = [...userGrid];
    newGrid[cellIndex] = activeColor;
    setUserGrid(newGrid);

    // Hedef desenle birebir tamamlandı mı kontrol et
    const matches = newGrid.every(
      (color, idx) => color === currentLevel.grid[idx]
    );

    if (matches) {
      soundEffects.playStar(soundEnabled);
      soundEffects.playFanfare(soundEnabled);
      setScore((s) => s + 25);
      setShowSuccessModal(true);
    }
  };

  // Sıradaki seviyeye geçiş
  const handleNextLevel = () => {
    soundEffects.playPop(soundEnabled);
    if (currentLevelIdx + 1 < COLOR_LEVELS.length) {
      setupLevel(currentLevelIdx + 1);
    } else {
      onComplete(3, score + 100);
    }
  };

  // Bu seviyeyi tekrarla
  const handleReplayCurrentLevel = () => {
    soundEffects.playPop(soundEnabled);
    setUserGrid(Array(currentLevel.size * currentLevel.size).fill('white'));
    setActiveColor(null);
    setShowSuccessModal(false);
  };

  // Hepsini temizle (beyaza çevir)
  const handleClearGrid = () => {
    setUserGrid(Array(currentLevel.size * currentLevel.size).fill('white'));
    soundEffects.playPop(soundEnabled);
  };

  // Tüm etkinliği en baştan başlat
  const handleRestartAll = () => {
    setupLevel(0);
    setScore(0);
    soundEffects.playPop(soundEnabled);
  };

  // Hücre boyut sınıfları (A, B, C, D ve 1, 2, 3, 4 başlıklarıyla birebir aynı genişlikte)
  const getCellSizeClass = (size: 2 | 3 | 4) => {
    if (size === 2) return 'w-20 h-20 sm:w-28 sm:h-28';
    if (size === 3) return 'w-14 h-14 sm:w-20 sm:h-20';
    return 'w-11 h-11 sm:w-16 sm:h-16';
  };

  const getColHeaderWidthClass = (size: 2 | 3 | 4) => {
    if (size === 2) return 'w-20 sm:w-28';
    if (size === 3) return 'w-14 sm:w-20';
    return 'w-11 sm:w-16';
  };

  const getRowHeaderHeightClass = (size: 2 | 3 | 4) => {
    if (size === 2) return 'h-20 sm:h-28 w-7 sm:w-9';
    if (size === 3) return 'h-14 sm:h-20 w-6 sm:w-8';
    return 'h-11 sm:h-16 w-5 sm:w-7';
  };

  // Modaldaki mini önizleme boyutları
  const getMiniCellSizeClass = (size: 2 | 3 | 4) => {
    if (size === 2) return 'w-10 h-10';
    if (size === 3) return 'w-8 h-8';
    return 'w-6 h-6';
  };

  return (
    <div className="w-full max-w-5xl bg-white rounded-3xl border-4 border-emerald-200 shadow-xl overflow-hidden flex flex-col select-none relative">
      {/* Top Application Header Bar */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-4 sm:px-6 py-3.5 text-white flex items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-xl shadow-xs">
            🎨
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black leading-tight">
                Renkli Kareler
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] sm:text-xs font-black shadow-xs">
                Seviye {currentLevel.levelNum} / 8
              </span>
            </div>
            <p className="text-xs text-emerald-100 font-semibold hidden sm:block">
              {currentLevel.title} • {currentLevel.size}x{currentLevel.size} Tablo
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          <div className="bg-white/20 border border-white/30 px-3 py-1 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 shadow-2xs">
            <Table className="w-3.5 h-3.5 text-amber-300" />
            <span>{currentLevel.size}x{currentLevel.size} Tablo</span>
          </div>

          <button
            onClick={() => setShowGuide(!showGuide)}
            className="p-2 rounded-2xl bg-white/15 hover:bg-white/25 text-white border border-white/30 cursor-pointer transition-colors shadow-2xs"
            title="Nasıl Oynanır?"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={handleRestartAll}
            className="p-2 rounded-2xl bg-white/15 hover:bg-white/25 text-white border border-white/30 cursor-pointer transition-colors shadow-2xs"
            title="1. Seviyeden Yeniden Başlat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Guide Dropdown Bar */}
      {showGuide && (
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-3 flex items-center justify-between text-xs sm:text-sm text-amber-900 font-bold animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💡</span>
            <span>
              <strong>Nasıl Oynanır?</strong> Sol taraftaki hedef tabloya bak! Paletten uygun rengi seç ve sağdaki tablonda aynı deseni boya. Yanlış renk seçtiğinde tablo boyanmaz, doğru rengi bulana kadar tekrar deneyebilirsin!
            </span>
          </div>
          <button
            onClick={() => setShowGuide(false)}
            className="text-xs text-amber-800 underline font-black hover:text-amber-950 cursor-pointer ml-3 shrink-0"
          >
            Kapat
          </button>
        </div>
      )}

      {/* Warning Toast: "Lütfen önce renk seçin!" */}
      {noColorWarning && (
        <div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-center gap-2 text-xs sm:text-sm font-black shadow-md animate-bounce">
          <AlertCircle className="w-4 h-4" />
          <span>Lütfen önce aşağıdaki paletten bir boya rengi seç! 🎨</span>
        </div>
      )}

      {/* Feedback Toast: "Yanlış seçenek! Kabul edilmedi." */}
      {wrongFeedback && (
        <div className="bg-rose-500 text-white px-4 py-2 flex items-center justify-center gap-2 text-xs sm:text-sm font-black shadow-md animate-shake">
          <AlertCircle className="w-4 h-4" />
          <span>{wrongFeedback}</span>
        </div>
      )}

      {/* Color Palette Strip - Student picks color manually */}
      <div
        className={`border-b-2 px-4 py-3 sm:py-3.5 flex items-center justify-center flex-wrap gap-2.5 sm:gap-3 transition-colors ${
          !activeColor ? 'bg-amber-50/90 border-amber-300' : 'bg-slate-100/90 border-slate-200'
        }`}
      >
        <div className="flex items-center gap-1.5 mr-1">
          <Palette className="w-4 h-4 text-emerald-600" />
          <span className="text-xs sm:text-sm font-black text-slate-800">
            {!activeColor ? (
              <span className="text-amber-800 bg-amber-200/80 px-2.5 py-1 rounded-xl animate-pulse">
                👉 Önce Boya Rengini Seç:
              </span>
            ) : (
              <span>Seçilen Boya:</span>
            )}
          </span>
        </div>

        {PALETTE.map((p) => {
          const isSelected = activeColor === p.key;
          const isRecommended = currentLevel.activeColors.includes(p.key);

          return (
            <button
              key={p.key}
              onClick={() => {
                setActiveColor(p.key);
                setNoColorWarning(false);
                setWrongFeedback(null);
                soundEffects.playPop(soundEnabled);
              }}
              style={{
                backgroundColor: p.hex,
                color: p.textColor,
                borderColor: isSelected ? '#0f172a' : '#cbd5e1',
              }}
              className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl font-black text-xs sm:text-sm cursor-pointer shadow-xs transition-all active:scale-90 border-2 ${
                isSelected
                  ? 'ring-4 ring-blue-500 scale-105 shadow-md font-extrabold'
                  : isRecommended
                  ? 'hover:scale-105'
                  : 'opacity-65 hover:opacity-100 hover:scale-100'
              }`}
              title={`${p.name} rengini seç`}
            >
              <span className="text-sm sm:text-base">{p.emoji}</span>
              <span className="hidden md:inline">{p.name}</span>
              {isSelected && <Check className="w-4 h-4 ml-0.5" />}
            </button>
          );
        })}

        <button
          onClick={handleClearGrid}
          className="ml-auto text-xs font-black text-slate-600 hover:text-rose-600 bg-white border border-slate-300 hover:border-rose-300 hover:bg-rose-50 px-3 py-2 rounded-2xl cursor-pointer flex items-center gap-1.5 shadow-2xs transition-colors"
          title="Tüm kareleri temizle"
        >
          <Eraser className="w-4 h-4 text-slate-500" />
          <span>Temizle</span>
        </button>
      </div>

      {/* Main Interactive Workspace: Target Table (Left) vs Player Table (Right) */}
      {/* Şekillerin üstünde tablo gibi A, B, C, D ve 1, 2, 3, 4 etiketleri yer alır. Kutucukların içinde yazı YOKTUR. */}
      <div className="p-4 sm:p-7 bg-[#f8fafc] flex flex-col items-center justify-center flex-1">
        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start justify-center">
          
          {/* ========================================================= */}
          {/* LEFT: Target Table (Örnek Hedef) */}
          {/* ========================================================= */}
          <div className="flex flex-col items-center bg-white p-4 sm:p-6 rounded-3xl border-3 border-slate-300 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🎯</span>
              <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider">
                Örnek Hedef Tablo
              </h3>
            </div>

            {/* Target Coordinate Table with Row/Col Headers */}
            <div className="flex flex-col items-center">
              {/* Column Letter Headers (A, B, C, D) - Tablo Sütun Başlığı */}
              <div className="flex items-center mb-2 pl-8 sm:pl-10">
                {Array.from({ length: currentLevel.size }).map((_, cIdx) => (
                  <div
                    key={cIdx}
                    className={`${getColHeaderWidthClass(
                      currentLevel.size
                    )} text-center font-black text-xs sm:text-sm text-slate-700 mx-1 bg-slate-200/90 rounded-lg py-1 border border-slate-300 shadow-2xs`}
                  >
                    {COL_LETTERS[cIdx]}
                  </div>
                ))}
              </div>

              {/* Rows with Row Number Header (1, 2, 3, 4) - Tablo Satır Başlığı */}
              <div className="flex flex-col gap-2">
                {Array.from({ length: currentLevel.size }).map((_, rIdx) => (
                  <div key={rIdx} className="flex items-center gap-2">
                    {/* Row Number Badge */}
                    <div
                      className={`${getRowHeaderHeightClass(
                        currentLevel.size
                      )} flex items-center justify-center font-black text-xs sm:text-sm text-slate-700 bg-slate-200/90 rounded-lg border border-slate-300 shadow-2xs`}
                    >
                      {ROW_NUMBERS[rIdx]}
                    </div>

                    {/* Row Cells - Kutucukların içinde hiçbir yazı yoktur, temiz görsel renk bloklarıdır */}
                    <div className="flex items-center gap-2">
                      {Array.from({ length: currentLevel.size }).map((_, cIdx) => {
                        const cellIdx = rIdx * currentLevel.size + cIdx;
                        const cellColor = currentLevel.grid[cellIdx];
                        const isWhite = cellColor === 'white';

                        return (
                          <div
                            key={cIdx}
                            style={{
                              backgroundColor: getColorHex(cellColor),
                            }}
                            className={`${getCellSizeClass(
                              currentLevel.size
                            )} rounded-2xl border-2 ${
                              isWhite
                                ? 'border-slate-200 bg-white'
                                : 'border-black/15 shadow-xs'
                            } flex items-center justify-center select-none transition-transform`}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[11px] sm:text-xs font-bold text-slate-500 mt-4 text-center">
              Sol taraftaki tabloya bakarak aynı renkleri sağdaki tablona uygula!
            </p>
          </div>

          {/* ========================================================= */}
          {/* RIGHT: User Interactive Table (Senin Tablon) */}
          {/* ========================================================= */}
          <div className="flex flex-col items-center bg-white p-4 sm:p-6 rounded-3xl border-3 border-emerald-400 shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🖌️</span>
              <h3 className="text-xs sm:text-sm font-black text-emerald-950 uppercase tracking-wider">
                Senin Boyama Tablon
              </h3>
            </div>

            {/* User Coordinate Table with Row/Col Headers */}
            <div className="flex flex-col items-center">
              {/* Column Letter Headers (A, B, C, D) */}
              <div className="flex items-center mb-2 pl-8 sm:pl-10">
                {Array.from({ length: currentLevel.size }).map((_, cIdx) => (
                  <div
                    key={cIdx}
                    className={`${getColHeaderWidthClass(
                      currentLevel.size
                    )} text-center font-black text-xs sm:text-sm text-emerald-900 mx-1 bg-emerald-100 rounded-lg py-1 border border-emerald-300 shadow-2xs`}
                  >
                    {COL_LETTERS[cIdx]}
                  </div>
                ))}
              </div>

              {/* Rows with Row Number Header (1, 2, 3, 4) */}
              <div className="flex flex-col gap-2">
                {Array.from({ length: currentLevel.size }).map((_, rIdx) => (
                  <div key={rIdx} className="flex items-center gap-2">
                    {/* Row Number Badge */}
                    <div
                      className={`${getRowHeaderHeightClass(
                        currentLevel.size
                      )} flex items-center justify-center font-black text-xs sm:text-sm text-emerald-900 bg-emerald-100 rounded-lg border border-emerald-300 shadow-2xs`}
                    >
                      {ROW_NUMBERS[rIdx]}
                    </div>

                    {/* Interactive Clickable Cells - Kutucukların içinde yazı YOKTUR */}
                    <div className="flex items-center gap-2">
                      {Array.from({ length: currentLevel.size }).map((_, cIdx) => {
                        const cellIdx = rIdx * currentLevel.size + cIdx;
                        const cellColor = userGrid[cellIdx];
                        const isWhite = cellColor === 'white';
                        const isWrongClicked = wrongCellIdx === cellIdx;

                        return (
                          <button
                            key={cIdx}
                            onClick={() => handleCellClick(cellIdx)}
                            style={{
                              backgroundColor: isWrongClicked
                                ? '#fee2e2'
                                : getColorHex(cellColor),
                            }}
                            className={`${getCellSizeClass(
                              currentLevel.size
                            )} rounded-2xl border-3 cursor-pointer shadow-xs transition-all duration-150 transform active:scale-95 flex items-center justify-center relative select-none ${
                              isWrongClicked
                                ? 'shake-cell border-rose-500 ring-4 ring-rose-400/50'
                                : isWhite
                                ? 'border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/40'
                                : 'border-emerald-500 shadow-md ring-2 ring-emerald-300'
                            }`}
                            title="Boyamak için tıkla"
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[11px] sm:text-xs font-bold text-emerald-800 mt-4 text-center">
              Önce yukarıdan bir renk seç, sonra boyamak istediğin kareye tıkla!
            </p>
          </div>
        </div>
      </div>

      {/* Progress Footer */}
      <div className="bg-slate-50 border-t border-slate-200 px-5 sm:px-8 py-3.5 flex items-center justify-between text-xs font-bold text-slate-600 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-slate-700">İlerleme:</span>
          <div className="w-36 sm:w-60 bg-slate-200 h-3 rounded-full overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-500 rounded-full"
              style={{
                width: `${((currentLevelIdx + 1) / COLOR_LEVELS.length) * 100}%`,
              }}
            />
          </div>
          <span className="font-black text-emerald-700">
            {currentLevelIdx + 1} / {COLOR_LEVELS.length}
          </span>
        </div>

        <div className="text-emerald-800 font-extrabold flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>{currentLevel.badgeLabel}</span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. HER LEVEL GİRİŞİNDE GÖSTERİLEN AÇIKLAMA MODALI (DEVAM ET BUTONLU) */}
      {/* ------------------------------------------------------------- */}
      {showIntroModal && (
        <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm sm:max-w-md w-full shadow-2xl border-4 border-emerald-300 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            {/* Palette Icon */}
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-400 to-teal-200 border-2 border-emerald-400 shadow-md flex items-center justify-center text-3xl mb-3 animate-bounce">
              🎨
            </div>

            {/* Level Badge */}
            <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 font-black text-xs sm:text-sm uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>SEVİYE {currentLevel.levelNum} / 8</span>
            </div>

            {/* Title */}
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 mb-1">
              {currentLevel.title.replace(/^\d+\.\s*Seviye:\s*/, '')}
            </h3>
            <span className="text-xs font-extrabold text-emerald-700 mb-3 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              📐 {currentLevel.size}x{currentLevel.size} Tablo
            </span>

            {/* Simple Clean Instruction without any A1, B1 text */}
            <p className="text-xs sm:text-sm font-semibold text-slate-600 mb-4 px-2 leading-relaxed">
              {currentLevel.instructionText}
            </p>

            {/* Target Pattern Mini Preview (Clean preview without text inside boxes) */}
            <div className="bg-slate-100 p-4 rounded-2xl border-2 border-slate-200 mb-5 flex flex-col items-center shadow-inner">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 mb-2.5">
                Hedef Desen:
              </span>
              <div
                className="grid gap-1.5"
                style={{
                  gridTemplateColumns: `repeat(${currentLevel.size}, minmax(0, 1fr))`,
                }}
              >
                {currentLevel.grid.map((cellColor, idx) => (
                  <div
                    key={idx}
                    style={{ backgroundColor: getColorHex(cellColor) }}
                    className={`${getMiniCellSizeClass(
                      currentLevel.size
                    )} rounded-xl border border-black/15 shadow-2xs`}
                  />
                ))}
              </div>
            </div>

            {/* DEVAM ET / BAŞLA BUTTON */}
            <button
              onClick={() => {
                setShowIntroModal(false);
                soundEffects.playPop(soundEnabled);
              }}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-base sm:text-lg font-black shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>Devam Et & Başla</span>
              <Play className="w-5 h-5 fill-white group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. LEVEL TAMAMLANINCA GÖSTERİLEN TEBRİK MODALI (DEVAM ET BUTONLU) */}
      {/* ------------------------------------------------------------- */}
      {showSuccessModal && (
        <div className="absolute inset-0 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm sm:max-w-md w-full shadow-2xl border-4 border-amber-300 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            {/* Celebration Icon */}
            <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-200 border-2 border-amber-400 shadow-md flex items-center justify-center text-4xl mb-3 animate-bounce">
              🎉
            </div>

            {/* Level Complete Ribbon */}
            <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-black text-xs sm:text-sm uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>SEVİYE {currentLevel.levelNum} TAMAMLANDI!</span>
            </div>

            {/* Title */}
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 mb-2">
              Harika Başardın! 🌟
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 mb-4 px-2">
              {currentLevel.title} görevindeki deseni eksiksiz ve doğru şekilde tamamladın!
            </p>

            {/* Action Buttons */}
            <div className="w-full flex flex-col gap-2.5">
              {/* DEVAM ET BUTTON */}
              <button
                onClick={handleNextLevel}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-base sm:text-lg font-black shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>
                  {currentLevelIdx + 1 < COLOR_LEVELS.length
                    ? `Devam Et (Seviye ${currentLevelIdx + 2}'ye Geç)`
                    : 'Tüm Seviyeleri Bitir & Sonucu Gör'}
                </span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* TEKRAR OYNA BUTTON */}
              <button
                onClick={handleReplayCurrentLevel}
                className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer border border-slate-200"
              >
                Bu Seviyeyi Tekrar Boya
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
