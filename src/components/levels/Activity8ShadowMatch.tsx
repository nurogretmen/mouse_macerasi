import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Trophy,
  HelpCircle,
  CheckCircle2,
  X,
  ChevronRight,
  Award,
  Hash,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEffects, speakTurkishText } from '../../utils/audio.ts';

interface Activity8Props {
  soundEnabled: boolean;
  onComplete: (stars: number, score: number) => void;
  onSoundToggle: () => void;
}

interface ObjectItem {
  id: string;
  count: number;
  emoji: string;
  name: string;
  color: string;
  borderHover: string;
}

interface MatchPair {
  leftId: string;
  rightNumber: number;
  lineColor: string;
}

interface LevelItemPreset {
  count: number;
  emoji: string;
  name: string;
  color: string;
  borderHover: string;
}

interface LevelConfig {
  levelNum: number;
  groupCount: number;
  title: string;
  subtitle: string;
  missionText: string;
  descriptionText: string;
  numbers: number[];
  items: LevelItemPreset[];
  difficultyLabel: string;
  difficultyColor: string;
}

// ----------------------------------------------------
// 9 PROGRESSIVE LEVELS CONFIGURATION (SAY VE EŞLEŞTİR)
// ----------------------------------------------------
const LEVELS_CONFIG: LevelConfig[] = [
  // SEVİYE 1: 2 NESNE
  {
    levelNum: 1,
    groupCount: 2,
    title: 'Seviye 1 – 2 Nesne',
    subtitle: 'En Kolay Başlangıç',
    missionText: 'Nesneleri say ve doğru sayıyla eşleştir!',
    descriptionText: 'Oyunun kuralı çok kolay! Sol taraftaki nesneleri say, kutunun yanındaki mavi noktaya tıkla, sonra sağ taraftaki doğru sayının noktasına tıkla!',
    numbers: [2, 5],
    items: [
      { count: 2, emoji: '🍎', name: 'Elma', color: '#ef4444', borderHover: 'border-red-400' },
      { count: 5, emoji: '⭐', name: 'Yıldız', color: '#eab308', borderHover: 'border-amber-400' },
    ],
    difficultyLabel: 'Çok Kolay',
    difficultyColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  // SEVİYE 2: 3 NESNE
  {
    levelNum: 2,
    groupCount: 3,
    title: 'Seviye 2 – 3 Nesne',
    subtitle: 'Sayılar Artıyor',
    missionText: '3 nesne grubunu doğru sayılarla eşleştir!',
    descriptionText: 'Harika! Şimdi 3 farklı nesne grubumuz var: elmalar, kurbağalar ve yıldızlar. Nesneleri dikkatle say ve doğru rakamla birleştir.',
    numbers: [3, 4, 6],
    items: [
      { count: 3, emoji: '🍎', name: 'Elma', color: '#ef4444', borderHover: 'border-red-400' },
      { count: 4, emoji: '🐸', name: 'Kurbağa', color: '#22c55e', borderHover: 'border-emerald-400' },
      { count: 6, emoji: '⭐', name: 'Yıldız', color: '#eab308', borderHover: 'border-amber-400' },
    ],
    difficultyLabel: 'Kolay',
    difficultyColor: 'bg-green-100 text-green-800 border-green-300',
  },
  // SEVİYE 3: 4 NESNE
  {
    levelNum: 3,
    groupCount: 4,
    title: 'Seviye 3 – 4 Nesne',
    subtitle: 'Dörtlü Eşleştirme',
    missionText: '4 nesne grubunu say ve eşleştir!',
    descriptionText: 'Gittikçe hızlanıyorsun! 4 farklı nesne grubunu (elma, araba, yıldız, kurbağa) tek tek sayarak sağdaki sayılarla eşleştir.',
    numbers: [2, 4, 5, 7],
    items: [
      { count: 5, emoji: '🍎', name: 'Elma', color: '#ef4444', borderHover: 'border-red-400' },
      { count: 2, emoji: '🚗', name: 'Araba', color: '#3b82f6', borderHover: 'border-blue-400' },
      { count: 7, emoji: '⭐', name: 'Yıldız', color: '#eab308', borderHover: 'border-amber-400' },
      { count: 4, emoji: '🐸', name: 'Kurbağa', color: '#22c55e', borderHover: 'border-emerald-400' },
    ],
    difficultyLabel: 'Orta',
    difficultyColor: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  // SEVİYE 4: 5 NESNE SABİTLENİYOR
  {
    levelNum: 4,
    groupCount: 5,
    title: 'Seviye 4 – 5 Nesne',
    subtitle: '5 Nesne Grubu Sabitlendi',
    missionText: '5 nesne grubunu doğru sayılarla eşleştir!',
    descriptionText: 'Artık her seviyede tam 5 nesne grubu olacak! Acele etmeden elma, yıldız, kurbağa, araba ve balonları say ve eşleştirmeleri tamamla.',
    numbers: [2, 3, 4, 5, 7],
    items: [
      { count: 4, emoji: '🍎', name: 'Elma', color: '#ef4444', borderHover: 'border-red-400' },
      { count: 7, emoji: '⭐', name: 'Yıldız', color: '#eab308', borderHover: 'border-amber-400' },
      { count: 2, emoji: '🐸', name: 'Kurbağa', color: '#22c55e', borderHover: 'border-emerald-400' },
      { count: 5, emoji: '🚗', name: 'Araba', color: '#3b82f6', borderHover: 'border-blue-400' },
      { count: 3, emoji: '🎈', name: 'Balon', color: '#ec4899', borderHover: 'border-pink-400' },
    ],
    difficultyLabel: 'Orta',
    difficultyColor: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  // SEVİYE 5: BÜYÜK SAYILARA GEÇİŞ (10 ve Üzeri)
  {
    levelNum: 5,
    groupCount: 5,
    title: 'Seviye 5 – 5 Nesne / Büyük Sayılara Geçiş',
    subtitle: '10 Sayısı ve Üzeri Gruplar',
    missionText: "10 ve üzerindeki nesneleri dikkatlice say ve eşleştir!",
    descriptionText: 'Sayılar büyümeye başladı! 10 elmayı ve diğer büyük grupları dikkatlice sayarak doğru sayılarla birleştir.',
    numbers: [4, 6, 7, 8, 10],
    items: [
      { count: 10, emoji: '🍎', name: 'Elma', color: '#ef4444', borderHover: 'border-red-400' },
      { count: 7, emoji: '⭐', name: 'Yıldız', color: '#eab308', borderHover: 'border-amber-400' },
      { count: 4, emoji: '🐸', name: 'Kurbağa', color: '#22c55e', borderHover: 'border-emerald-400' },
      { count: 8, emoji: '🚗', name: 'Araba', color: '#3b82f6', borderHover: 'border-blue-400' },
      { count: 6, emoji: '🎈', name: 'Balon', color: '#ec4899', borderHover: 'border-pink-400' },
    ],
    difficultyLabel: 'Büyük Sayılar',
    difficultyColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  },
  // SEVİYE 6: KARIŞIK SAYILAR
  {
    levelNum: 6,
    groupCount: 5,
    title: 'Seviye 6 – 5 Nesne / Karışık Sayılar',
    subtitle: '12 ve 10 Sayıları Arasında Seçim',
    missionText: "12'ye kadar olan nesneleri say ve eşleştir!",
    descriptionText: 'Gözlerin harika çalışıyor! 12 yıldız ve 10 balon gibi büyük grupları dikkatle say, birbirine karıştırma.',
    numbers: [5, 7, 9, 10, 12],
    items: [
      { count: 5, emoji: '🍎', name: 'Elma', color: '#ef4444', borderHover: 'border-red-400' },
      { count: 12, emoji: '⭐', name: 'Yıldız', color: '#eab308', borderHover: 'border-amber-400' },
      { count: 7, emoji: '🐸', name: 'Kurbağa', color: '#22c55e', borderHover: 'border-emerald-400' },
      { count: 9, emoji: '🚗', name: 'Araba', color: '#3b82f6', borderHover: 'border-blue-400' },
      { count: 10, emoji: '🎈', name: 'Balon', color: '#ec4899', borderHover: 'border-pink-400' },
    ],
    difficultyLabel: 'Görsel Dikkat',
    difficultyColor: 'bg-purple-100 text-purple-800 border-purple-300',
  },
  // SEVİYE 7: DAHA BÜYÜK RAKAMLAR
  {
    levelNum: 7,
    groupCount: 5,
    title: 'Seviye 7 – 5 Nesne / Daha Büyük Rakamlar',
    subtitle: '15 Sayısına Kadar Büyük Gruplar',
    missionText: "15'e kadar olan nesneleri dikkatle say ve eşleştir!",
    descriptionText: 'Harika bir matematik dedektifisin! 15 yıldıza ve 12 elmaya kadar olan grupları say ve birleştir.',
    numbers: [7, 9, 10, 12, 15],
    items: [
      { count: 12, emoji: '🍎', name: 'Elma', color: '#ef4444', borderHover: 'border-red-400' },
      { count: 15, emoji: '⭐', name: 'Yıldız', color: '#eab308', borderHover: 'border-amber-400' },
      { count: 9, emoji: '🐸', name: 'Kurbağa', color: '#22c55e', borderHover: 'border-emerald-400' },
      { count: 10, emoji: '🚗', name: 'Araba', color: '#3b82f6', borderHover: 'border-blue-400' },
      { count: 7, emoji: '🎈', name: 'Balon', color: '#ec4899', borderHover: 'border-pink-400' },
    ],
    difficultyLabel: 'Daha Büyük',
    difficultyColor: 'bg-rose-100 text-rose-800 border-rose-300',
  },
  // SEVİYE 8: ZOR EŞLEŞTİRME (Birbirine Yakın Sayılar)
  {
    levelNum: 8,
    groupCount: 5,
    title: 'Seviye 8 – 5 Nesne / Zor Eşleştirme',
    subtitle: '7, 8, 9, 10 ve 11 Sayılarını Ayırt Et',
    missionText: 'Birbirine çok yakın sayıları (7-8-9-10-11) dikkatle ayırt et!',
    descriptionText: 'Dikkatini topla! Bu seviyede sayılar birbirine çok yakın (7, 8, 9, 10, 11). Yanılmamak için nesneleri sırayla say.',
    numbers: [7, 8, 9, 10, 11],
    items: [
      { count: 8, emoji: '🍎', name: 'Elma', color: '#ef4444', borderHover: 'border-red-400' },
      { count: 9, emoji: '⭐', name: 'Yıldız', color: '#eab308', borderHover: 'border-amber-400' },
      { count: 7, emoji: '🐸', name: 'Kurbağa', color: '#22c55e', borderHover: 'border-emerald-400' },
      { count: 10, emoji: '🚗', name: 'Araba', color: '#3b82f6', borderHover: 'border-blue-400' },
      { count: 11, emoji: '🎈', name: 'Balon', color: '#ec4899', borderHover: 'border-pink-400' },
    ],
    difficultyLabel: 'Zor Eşleştirme',
    difficultyColor: 'bg-red-100 text-red-800 border-red-300',
  },
  // SEVİYE 9: EŞLEŞTİRME USTASI (Büyük Final)
  {
    levelNum: 9,
    groupCount: 5,
    title: 'Seviye 9 – Eşleştirme Ustası',
    subtitle: '6, 9, 12, 15 ve 18 Sayıları Finali',
    missionText: 'Büyük final! 18 nesneye kadar say ve Şampiyon ol!',
    descriptionText: 'İşte büyük final! 18 yıldıza kadar tüm grupları doğru sayarak eşleştirmeleri tamamla ve altın kupayı kazan!',
    numbers: [6, 9, 12, 15, 18],
    items: [
      { count: 6, emoji: '🍎', name: 'Elma', color: '#ef4444', borderHover: 'border-red-400' },
      { count: 18, emoji: '⭐', name: 'Yıldız', color: '#eab308', borderHover: 'border-amber-400' },
      { count: 9, emoji: '🐸', name: 'Kurbağa', color: '#22c55e', borderHover: 'border-emerald-400' },
      { count: 12, emoji: '🚗', name: 'Araba', color: '#3b82f6', borderHover: 'border-blue-400' },
      { count: 15, emoji: '🎈', name: 'Balon', color: '#ec4899', borderHover: 'border-pink-400' },
    ],
    difficultyLabel: 'Şampiyonluk',
    difficultyColor: 'bg-amber-200 text-amber-950 border-amber-400 font-black',
  },
];

const THEME_OPTIONS = [
  { emoji: '🍎', name: 'Elma', color: '#ef4444', borderHover: 'border-red-400' },
  { emoji: '⭐', name: 'Yıldız', color: '#eab308', borderHover: 'border-amber-400' },
  { emoji: '🐸', name: 'Kurbağa', color: '#22c55e', borderHover: 'border-emerald-400' },
  { emoji: '🚗', name: 'Araba', color: '#3b82f6', borderHover: 'border-blue-400' },
  { emoji: '🎈', name: 'Balon', color: '#ec4899', borderHover: 'border-pink-400' },
  { emoji: '🐱', name: 'Kedi', color: '#f97316', borderHover: 'border-orange-400' },
  { emoji: '🌸', name: 'Çiçek', color: '#a855f7', borderHover: 'border-purple-400' },
  { emoji: '🚀', name: 'Roket', color: '#6366f1', borderHover: 'border-indigo-400' },
];

const LINE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

const TURKISH_NUMBER_WORDS: Record<number, string> = {
  1: 'Bir',
  2: 'İki',
  3: 'Üç',
  4: 'Dört',
  5: 'Beş',
  6: 'Altı',
  7: 'Yedi',
  8: 'Sekiz',
  9: 'Dokuz',
  10: 'On',
  11: 'On bir',
  12: 'On iki',
  13: 'On üç',
  14: 'On dört',
  15: 'On beş',
  16: 'On altı',
  17: 'On yedi',
  18: 'On sekiz',
  19: 'On dokuz',
  20: 'Yirmi',
};

export const Activity8ShadowMatch: React.FC<Activity8Props> = ({
  soundEnabled,
  onComplete,
  onSoundToggle,
}) => {
  // Game State
  const [hasStarted, setHasStarted] = useState(false);
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [score, setScore] = useState(0);

  // Current Level Active Items
  const [leftItems, setLeftItems] = useState<ObjectItem[]>([]);
  const [rightNumbers, setRightNumbers] = useState<number[]>([]);
  const [matches, setMatches] = useState<MatchPair[]>([]);

  // Selection & Interactive Drag/Click Line
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  // Modals & Feedback
  const [bannerMessage, setBannerMessage] = useState<{ text: string; type: 'success' | 'warning' | 'info' } | null>(null);
  const [showLevelIntroModal, setShowLevelIntroModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [isLevelFinishedModal, setIsLevelFinishedModal] = useState(false);
  const [isGameFinishedModal, setIsGameFinishedModal] = useState(false);

  // Element positions for SVG lines
  const containerRef = useRef<HTMLDivElement>(null);
  const leftAnchorRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const rightAnchorRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [anchorCoords, setAnchorCoords] = useState<{
    left: Record<string, { x: number; y: number }>;
    right: Record<number, { x: number; y: number }>;
  }>({ left: {}, right: {} });

  const currentLevel = LEVELS_CONFIG[currentLevelIdx];

  // Update SVG line anchor positions
  const updateAnchorPositions = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();

    const leftCoords: Record<string, { x: number; y: number }> = {};
    Object.entries(leftAnchorRefs.current).forEach(([id, el]) => {
      if (el) {
        const rect = el.getBoundingClientRect();
        leftCoords[id] = {
          x: rect.left + rect.width / 2 - containerRect.left,
          y: rect.top + rect.height / 2 - containerRect.top,
        };
      }
    });

    const rightCoords: Record<number, { x: number; y: number }> = {};
    Object.entries(rightAnchorRefs.current).forEach(([numStr, el]) => {
      if (el) {
        const num = Number(numStr);
        const rect = el.getBoundingClientRect();
        rightCoords[num] = {
          x: rect.left + rect.width / 2 - containerRect.left,
          y: rect.top + rect.height / 2 - containerRect.top,
        };
      }
    });

    setAnchorCoords({ left: leftCoords, right: rightCoords });
  }, []);

  // Window resize observer for responsive lines
  useEffect(() => {
    window.addEventListener('resize', updateAnchorPositions);
    const timer = setTimeout(updateAnchorPositions, 100);
    return () => {
      window.removeEventListener('resize', updateAnchorPositions);
      clearTimeout(timer);
    };
  }, [updateAnchorPositions, leftItems, rightNumbers, matches]);

  // Setup Level Data
  const setupLevel = useCallback(() => {
    const lvl = LEVELS_CONFIG[currentLevelIdx];
    const shuffledNumbers = [...lvl.numbers].sort(() => Math.random() - 0.5);

    // Build left item cards from exact level presets
    const newLeftItems: ObjectItem[] = lvl.items.map((preset, i) => ({
      id: `left_${lvl.levelNum}_${preset.count}_${i}`,
      count: preset.count,
      emoji: preset.emoji,
      name: preset.name,
      color: preset.color,
      borderHover: preset.borderHover,
    }));

    // Shuffle left items order so they aren't parallel to right
    const shuffledLeft = [...newLeftItems].sort(() => Math.random() - 0.5);

    setLeftItems(shuffledLeft);
    setRightNumbers(shuffledNumbers);
    setMatches([]);
    setSelectedLeftId(null);
    setMousePos(null);

    setBannerMessage({
      text: `🔢 Görevin: ${lvl.missionText}`,
      type: 'info',
    });
  }, [currentLevelIdx]);

  useEffect(() => {
    if (hasStarted) {
      setupLevel();
      setShowLevelIntroModal(true);
    }
  }, [hasStarted, currentLevelIdx, setupLevel]);

  // Handle Left Item Selection
  const handleSelectLeft = (item: ObjectItem) => {
    // If already matched, skip
    if (matches.some((m) => m.leftId === item.id)) return;

    soundEffects.playPop(soundEnabled);
    if (selectedLeftId === item.id) {
      setSelectedLeftId(null); // toggle off
    } else {
      setSelectedLeftId(item.id);
      setBannerMessage({
        text: `👉 Şimdi sağ taraftan ${item.count} sayısını bul ve tıkla!`,
        type: 'info',
      });
    }
  };

  // Handle Right Number Selection
  const handleSelectRight = (num: number) => {
    // If already matched, skip
    if (matches.some((m) => m.rightNumber === num)) return;
    if (!selectedLeftId) {
      // Guide user to select left first & pronounce the clicked number
      soundEffects.playPop(soundEnabled);
      const turkishWord = TURKISH_NUMBER_WORDS[num] || String(num);
      speakTurkishText(turkishWord);
      setBannerMessage({
        text: `👉 Sayı: ${num}. Eşleştirmek için sol taraftaki nesnelerden birinin mavi noktasına tıkla!`,
        type: 'info',
      });
      return;
    }

    const currentItem = leftItems.find((item) => item.id === selectedLeftId);
    if (!currentItem) return;

    // Check Match
    if (currentItem.count === num) {
      // CORRECT MATCH!
      soundEffects.playStar(soundEnabled);
      const color = LINE_COLORS[matches.length % LINE_COLORS.length];
      const newMatches = [...matches, { leftId: currentItem.id, rightNumber: num, lineColor: color }];
      setMatches(newMatches);
      setSelectedLeftId(null);
      setScore((s) => s + 20);

      // Only speak the number (no "Harika!" feedback as requested)
      const turkishWord = TURKISH_NUMBER_WORDS[num] || String(num);
      speakTurkishText(turkishWord);

      // Check if all matched
      if (newMatches.length === currentLevel.groupCount) {
        handleLevelComplete();
      }
    } else {
      // WRONG MATCH!
      soundEffects.playGentleBoing(soundEnabled);
      const turkishWord = TURKISH_NUMBER_WORDS[num] || String(num);
      speakTurkishText(turkishWord);
      setBannerMessage({
        text: `🔍 Bu nesnelerin sayısı ${num} değil. Nesneleri tekrar saymayı dene!`,
        type: 'warning',
      });
      setSelectedLeftId(null);
    }
  };

  // Level Complete Logic
  const handleLevelComplete = () => {
    soundEffects.playDropSuccess(soundEnabled);

    if (currentLevelIdx + 1 < LEVELS_CONFIG.length) {
      setTimeout(() => {
        setIsLevelFinishedModal(true);
        soundEffects.playFanfare(soundEnabled);
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      }, 500);
    } else {
      // GRAND FINALE COMPLETED!
      setTimeout(() => {
        setIsGameFinishedModal(true);
        soundEffects.playFanfare(soundEnabled);
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
        onComplete(3, score + 100);
      }, 500);
    }
  };

  const handleNextLevel = () => {
    setIsLevelFinishedModal(false);
    setCurrentLevelIdx((prev) => prev + 1);
  };

  const handleRestartLevel = () => {
    setIsLevelFinishedModal(false);
    setupLevel();
  };

  const handleResetEntireGame = () => {
    setScore(0);
    setCurrentLevelIdx(0);
    setIsLevelFinishedModal(false);
    setIsGameFinishedModal(false);
    setupLevel();
    setShowLevelIntroModal(true);
  };

  // Mouse move inside container for floating connection preview line
  const handleContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedLeftId || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - containerRect.left,
      y: e.clientY - containerRect.top,
    });
  };

  // ----------------------------------------------------
  // 1. OPENING INTRO SCREEN
  // ----------------------------------------------------
  if (!hasStarted) {
    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center py-6 px-4 select-none">
        <div className="w-full bg-gradient-to-br from-indigo-700 via-purple-700 to-indigo-800 rounded-3xl p-6 sm:p-10 text-white shadow-2xl border-4 border-purple-400 relative overflow-hidden flex flex-col items-center text-center">
          {/* Subtle glow */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          {/* Icon Badge */}
          <div className="relative mb-5 flex items-center justify-center">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-white/20 backdrop-blur-md border-4 border-amber-300 flex items-center justify-center shadow-lg relative">
              <span className="text-5xl sm:text-6xl filter drop-shadow-md">🔢</span>
              <div className="absolute -bottom-2 -right-2 bg-amber-400 text-amber-950 p-2 rounded-full border-2 border-white shadow-md text-2xl animate-bounce">
                🍎
              </div>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 bg-amber-400/30 text-amber-200 border border-amber-300/50 px-4 py-1.5 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            9 Kademeli Sayma ve Eşleştirme Macerası
          </span>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-2 drop-shadow-sm">
            SAY VE EŞLEŞTİR 🔢🍎
          </h1>

          <p className="text-base sm:text-xl font-bold text-amber-300 mb-6 italic">
            "Nesneleri dikkatle say, doğru sayıyla eşleştir!"
          </p>

          {/* 3 Step Guide Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-2xl w-full text-left mb-8">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
              <span className="text-2xl mb-1 block">👀 1. Adım</span>
              <h4 className="font-black text-sm text-amber-200">Nesneleri Say</h4>
              <p className="text-xs text-purple-100 font-medium mt-1">
                Soldaki meyve, araba veya yıldızları dikkatlice parmağınla say.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
              <span className="text-2xl mb-1 block">🔵 2. Adım</span>
              <h4 className="font-black text-sm text-amber-200">Noktaya Tıkla</h4>
              <p className="text-xs text-purple-100 font-medium mt-1">
                Saydığın nesne kutusunun sağındaki mavi noktaya tek tıkla.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
              <span className="text-2xl mb-1 block">🎯 3. Adım</span>
              <h4 className="font-black text-sm text-amber-200">Sayıyla Birleştir</h4>
              <p className="text-xs text-purple-100 font-medium mt-1">
                Sağ taraftaki doğru sayının mavi noktasına tıkla ve çizgiyi çek!
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => {
                soundEffects.playPop(soundEnabled);
                setHasStarted(true);
              }}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black text-base sm:text-lg shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer border-3 border-emerald-300 flex items-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>EŞLEŞTİRMEYE BAŞLA 🚀</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // 2. MAIN ACTIVE GAME SCREEN
  // ----------------------------------------------------
  return (
    <div
      className="w-full max-w-5xl mx-auto flex flex-col items-center py-2 sm:py-4 px-2 sm:px-4 select-none relative"
      onDragStart={(e) => e.preventDefault()}
    >
      {/* TOP HEADER CONTROLS & STATUS */}
      <div className="w-full bg-white rounded-3xl border-3 border-purple-200 shadow-md p-4 sm:p-5 mb-3 sm:mb-4 relative overflow-hidden">
        {/* Soft background glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-100/50 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-3">
          {/* Title & Stage */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center text-xl shadow-xs font-black">
              🔢
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-black text-slate-800 tracking-tight">
                  Say ve Eşleştir
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-purple-100 text-purple-800 border border-purple-200">
                  {currentLevel.title}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${currentLevel.difficultyColor}`}>
                  {currentLevel.difficultyLabel}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-500">
                Nesneleri say, sol noktaya tıkla ve doğru sayıyla birleştir!
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Show Level Intro Button */}
            <button
              onClick={() => {
                soundEffects.playPop(soundEnabled);
                setShowLevelIntroModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs font-black transition-colors cursor-pointer"
              title="Görevi Ekranda Aç"
            >
              <span>📋 Görevi Oku</span>
            </button>

            {/* Restart Level */}
            <button
              onClick={handleRestartLevel}
              className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 text-xs font-bold transition-colors cursor-pointer"
              title="Seviyeyi Yeniden Başlat"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Sound Toggle */}
            <button
              onClick={onSoundToggle}
              className={`p-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                soundEnabled
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
              }`}
              title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Help */}
            <button
              onClick={() => setShowHelpModal(true)}
              className="p-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold transition-colors cursor-pointer"
              title="Nasıl Oynanır?"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* STATUS BAR: Eşleşen, Puan, Seviye */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-purple-800 bg-purple-50 border border-purple-200 px-3 py-1 rounded-xl">
              🎯 {currentLevel.groupCount} Eşleştirme Yapılacak
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Eşleşen */}
            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <div className="text-xs">
                <span className="text-slate-400 font-bold block text-[10px]">Tamamlanan</span>
                <span className="font-black text-slate-800 text-sm">
                  {matches.length} / {currentLevel.groupCount}
                </span>
              </div>
            </div>

            {/* Puan */}
            <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-600" />
              <div className="text-xs">
                <span className="text-amber-500 font-bold block text-[10px]">Toplam Puan</span>
                <span className="font-black text-amber-900 text-sm">{score}</span>
              </div>
            </div>
          </div>
        </div>

        {/* FEEDBACK BANNER MESSAGE */}
        {bannerMessage && (
          <div
            className={`mt-2.5 py-1.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between transition-all ${
              bannerMessage.type === 'success'
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                : bannerMessage.type === 'warning'
                ? 'bg-amber-100 text-amber-900 border border-amber-200 animate-pulse'
                : 'bg-slate-100 text-slate-800 border border-slate-200'
            }`}
          >
            <span>{bannerMessage.text}</span>
            <span className="text-[11px] font-medium opacity-75 hidden sm:inline">
              (Sol tıkla bağla)
            </span>
          </div>
        )}
      </div>

      {/* PROMINENT GÖREV PANOSU */}
      <div className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white rounded-3xl p-3.5 sm:p-4 mb-4 shadow-lg border-3 border-purple-300 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/95 border-3 border-amber-300 shadow-md flex items-center justify-center shrink-0 relative text-3xl font-black text-purple-700">
            {currentLevel.numbers[0]}
            <div className="absolute -top-2 -right-2 bg-amber-400 text-amber-950 text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-xs border border-white">
              GÖREV
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <span className="text-[11px] sm:text-xs font-black text-purple-200 uppercase tracking-wider block">
              ŞİMDİKİ GÖREVİN:
            </span>
            <h3 className="text-base sm:text-xl lg:text-2xl font-black text-white leading-tight drop-shadow-xs">
              "{currentLevel.missionText}"
            </h3>
          </div>
        </div>

        {/* Action Buttons: Speak & Show Details */}
        <div className="flex items-center gap-2 sm:gap-2.5 w-full md:w-auto justify-end">
          <button
            onClick={() => speakTurkishText(`${currentLevel.title}. ${currentLevel.descriptionText}`)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/20 hover:bg-white/30 text-white border border-white/30 text-xs sm:text-sm font-black transition-all cursor-pointer shadow-xs active:scale-95"
            title="Görevi Sesli Dinle"
          >
            <Volume2 className="w-4 h-4 text-amber-300" />
            <span>Sesli Dinle 🔊</span>
          </button>

          <button
            onClick={() => setShowLevelIntroModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs sm:text-sm font-black transition-all cursor-pointer shadow-xs active:scale-95"
            title="Görevin Resimli Açıklamasını Gör"
          >
            <span>📋 Açıklamayı Göster</span>
          </button>
        </div>
      </div>

      {/* 3. MAIN MATCHING PLAYFIELD (LEFT OBJECTS <---> RIGHT NUMBERS) */}
      <div
        ref={containerRef}
        onMouseMove={handleContainerMouseMove}
        className="w-full bg-slate-50/90 rounded-3xl border-3 border-slate-200 p-4 sm:p-7 min-h-[460px] relative shadow-inner overflow-hidden flex flex-col justify-center select-none"
      >
        {/* Subtle dot grid pattern */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#94a3b8 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* SVG Canvas for Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {/* Completed Confirmed Matches Lines */}
          {matches.map((m, idx) => {
            const start = anchorCoords.left[m.leftId];
            const end = anchorCoords.right[m.rightNumber];
            if (!start || !end) return null;

            // Smooth cubic bezier curve between anchors
            const dx = Math.abs(end.x - start.x) * 0.45;
            const pathData = `M ${start.x} ${start.y} C ${start.x + dx} ${start.y}, ${end.x - dx} ${end.y}, ${end.x} ${end.y}`;

            return (
              <g key={`match_${idx}`}>
                {/* Glow layer */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={m.lineColor}
                  strokeWidth="8"
                  strokeOpacity="0.3"
                  strokeLinecap="round"
                />
                {/* Main line */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={m.lineColor}
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="filter drop-shadow-sm"
                />
                {/* Midpoint Checkmark Pill */}
                <circle
                  cx={(start.x + end.x) / 2}
                  cy={(start.y + end.y) / 2}
                  r="12"
                  fill="#ffffff"
                  stroke={m.lineColor}
                  strokeWidth="3"
                />
                <text
                  x={(start.x + end.x) / 2}
                  y={(start.y + end.y) / 2 + 4}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="bold"
                  fill={m.lineColor}
                >
                  ✓
                </text>
              </g>
            );
          })}

          {/* Interactive In-Progress Tracking Line (Following Cursor) */}
          {selectedLeftId && mousePos && anchorCoords.left[selectedLeftId] && (
            <g>
              <path
                d={`M ${anchorCoords.left[selectedLeftId].x} ${anchorCoords.left[selectedLeftId].y} C ${
                  anchorCoords.left[selectedLeftId].x + 60
                } ${anchorCoords.left[selectedLeftId].y}, ${mousePos.x - 60} ${mousePos.y}, ${mousePos.x} ${mousePos.y}`}
                fill="none"
                stroke="#6366f1"
                strokeWidth="4"
                strokeDasharray="6 6"
                strokeLinecap="round"
                className="animate-pulse"
              />
              <circle cx={mousePos.x} cy={mousePos.y} r="6" fill="#6366f1" />
            </g>
          )}
        </svg>

        {/* Perfectly Aligned 2-Column Grid: Left (Groups) vs Right (Numbers) */}
        <div className="w-full grid grid-cols-2 gap-x-4 sm:gap-x-10 gap-y-3 sm:gap-y-3.5 relative z-20 items-stretch">
          {/* Column Header Left */}
          <div className="text-xs font-black text-slate-500 uppercase tracking-wider px-1 flex items-center">
            🍎 Nesne Grupları
          </div>

          {/* Column Header Right */}
          <div className="text-xs font-black text-slate-500 uppercase tracking-wider px-1 text-right sm:text-left flex items-center justify-end sm:justify-start">
            🔢 Doğru Rakamlar
          </div>

          {/* Symmetrical Aligned Rows: Row i has leftItems[i] and rightNumbers[i] side by side with identical height */}
          {leftItems.map((item, rowIdx) => {
            const num = rightNumbers[rowIdx];
            const isLeftMatched = matches.some((m) => m.leftId === item.id);
            const isLeftSelected = selectedLeftId === item.id;
            const isRightMatched = num !== undefined && matches.some((m) => m.rightNumber === num);

            return (
              <React.Fragment key={`match_row_${item.id}_${num ?? rowIdx}`}>
                {/* LEFT BOX */}
                <div
                  onClick={() => handleSelectLeft(item)}
                  className={`w-full min-h-[58px] sm:min-h-[66px] h-full bg-white rounded-2xl border-3 p-2.5 sm:p-3 flex items-center justify-between gap-2.5 transition-all duration-200 select-none shadow-xs relative ${
                    isLeftMatched
                      ? 'border-emerald-300 bg-emerald-50/50 opacity-60 pointer-events-none'
                      : isLeftSelected
                      ? 'border-indigo-500 shadow-md ring-4 ring-indigo-200 scale-101 cursor-pointer'
                      : 'border-slate-200 hover:border-indigo-400 hover:shadow-md cursor-pointer hover:scale-101'
                  }`}
                >
                  {/* Emoji Cluster Container */}
                  <div className="flex-1 flex flex-wrap items-center gap-1 sm:gap-1.5 py-1">
                    {Array.from({ length: item.count }).map((_, emojiIdx) => (
                      <span
                        key={emojiIdx}
                        className={`inline-block transition-transform transform hover:scale-125 select-none ${
                          item.count > 12 ? 'text-base sm:text-lg' : 'text-xl sm:text-2xl'
                        }`}
                        title={`${item.count} adet ${item.name}`}
                      >
                        {item.emoji}
                      </span>
                    ))}
                  </div>

                  {/* Right Connector Anchor Point (🔵) - Points ONLY, no 'Bağla' text */}
                  <div className="flex items-center shrink-0 pl-1 sm:pl-2">
                    <div
                      ref={(el) => {
                        leftAnchorRefs.current[item.id] = el;
                      }}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                        isLeftMatched
                          ? 'bg-emerald-500 border-white text-white text-xs font-black shadow-xs'
                          : isLeftSelected
                          ? 'bg-indigo-600 border-white text-white shadow-md scale-110 ring-4 ring-indigo-200'
                          : 'bg-blue-50 hover:bg-blue-600 border-blue-400 hover:border-white text-blue-600 hover:text-white'
                      }`}
                    >
                      {isLeftMatched ? (
                        <span className="text-white text-xs font-black">✓</span>
                      ) : (
                        <span
                          className={`w-3.5 h-3.5 rounded-full transition-colors ${
                            isLeftSelected ? 'bg-white' : 'bg-blue-500'
                          }`}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT BOX */}
                {num !== undefined && (
                  <div
                    onClick={() => handleSelectRight(num)}
                    className={`w-full min-h-[58px] sm:min-h-[66px] h-full bg-white rounded-2xl border-3 p-2.5 sm:p-3 flex items-center justify-between gap-2.5 transition-all duration-200 select-none shadow-xs relative ${
                      isRightMatched
                        ? 'border-emerald-300 bg-emerald-50/50 opacity-60 pointer-events-none'
                        : 'border-slate-200 hover:border-purple-400 hover:shadow-md cursor-pointer hover:scale-101'
                    }`}
                  >
                    {/* Left Connector Anchor Point (🔵) - Points ONLY, no 'Bağla' text */}
                    <div className="flex items-center shrink-0 pr-1 sm:pr-2">
                      <div
                        ref={(el) => {
                          rightAnchorRefs.current[num] = el;
                        }}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                          isRightMatched
                            ? 'bg-emerald-500 border-white text-white text-xs font-black shadow-xs'
                            : 'bg-blue-50 hover:bg-purple-600 border-blue-400 hover:border-white text-blue-600 hover:text-white'
                        }`}
                      >
                        {isRightMatched ? (
                          <span className="text-white text-xs font-black">✓</span>
                        ) : (
                          <span className="w-3.5 h-3.5 rounded-full bg-blue-500" />
                        )}
                      </div>
                    </div>

                    {/* Big Number Display */}
                    <div className="flex-1 flex items-center justify-center sm:justify-end sm:pr-3">
                      <span className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
                        {num}
                      </span>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 4. BOTTOM TIPS */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 mt-3 px-2 text-xs font-bold text-slate-500">
        <div className="flex items-center gap-1.5">
          <span>💡</span>
          <span>
            Önce soldaki nesneye, ardından sağdaki doğru sayıya sol tuşla tek tıkla!
          </span>
        </div>
        <div>
          <span className="text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200 font-extrabold">
            9 Seviyeli Sayı Macerası
          </span>
        </div>
      </div>

      {/* MODAL 0: LEVEL MISSION ANNOUNCEMENT MODAL */}
      {showLevelIntroModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border-4 border-purple-400 p-6 sm:p-7 shadow-2xl relative animate-scale-in text-center">
            {/* Close */}
            <button
              onClick={() => {
                soundEffects.playPop(soundEnabled);
                setShowLevelIntroModal(false);
              }}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Stage Badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-black uppercase tracking-wider mb-3 border border-purple-200">
              <span>🔢</span>
              <span>{currentLevel.title}</span>
            </div>

            {/* Target Display */}
            <div className="relative my-3 flex items-center justify-center">
              <div className="w-24 h-24 rounded-3xl bg-purple-50 border-3 border-purple-300 flex items-center justify-center shadow-lg relative text-5xl">
                🍎
                <div className="absolute -bottom-2 -right-2 bg-amber-400 text-amber-950 p-1.5 rounded-full border-2 border-white shadow-md text-base">
                  ⭐
                </div>
              </div>
            </div>

            <span className="text-[11px] font-black text-purple-600 uppercase tracking-widest block mb-1">
              GÖREVİN
            </span>

            {/* Big readable mission text */}
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 leading-snug">
              "{currentLevel.missionText}"
            </h3>

            {/* Clear kid-friendly description */}
            <div className="p-4 rounded-2xl bg-purple-50 border-2 border-purple-200 text-purple-950 font-bold text-sm sm:text-base leading-relaxed mb-4 text-center">
              {currentLevel.descriptionText}
            </div>

            {/* Quick Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
              <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-black border border-slate-200">
                🎯 {currentLevel.groupCount} Eşleştirme
              </span>
              <span className="px-3 py-1 rounded-xl bg-purple-100 text-purple-800 text-xs font-black border border-purple-200">
                🔵 Soldaki Nokta ➔ Sağdaki Nokta
              </span>
            </div>

            {/* Action Buttons: Listen & Start */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => speakTurkishText(`${currentLevel.title}. ${currentLevel.descriptionText}`)}
                className="w-full sm:w-auto flex-1 py-3 px-4 rounded-2xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-black text-sm border-2 border-purple-300 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                <Volume2 className="w-4 h-4 text-purple-700" />
                <span>Sesli Dinle 🔊</span>
              </button>

              <button
                onClick={() => {
                  soundEffects.playPop(soundEnabled);
                  setShowLevelIntroModal(false);
                }}
                className="w-full sm:w-auto flex-2 py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black text-base shadow-lg cursor-pointer transition-all border-2 border-emerald-300 flex items-center justify-center gap-2 active:scale-95"
              >
                <span>ANLADIM, BAŞLA! 🚀</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: HELP MODAL */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border-4 border-purple-400 p-6 sm:p-8 shadow-2xl relative animate-scale-in">
            <button
              onClick={() => setShowHelpModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-2xl font-black shrink-0">
                🔢
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800">
                  Say ve Eşleştir – Nasıl Oynanır?
                </h3>
                <p className="text-xs font-bold text-purple-600">
                  Sayma ve Mouse Koordinasyonu
                </p>
              </div>
            </div>

            <div className="space-y-3 text-slate-700 text-xs sm:text-sm font-medium mb-6">
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
                <strong>1. Nesneleri Say:</strong> Soldaki meyve, araba veya yıldızları sırayla tek tek say.
              </div>
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                <strong>2. Mavi Noktaya Tıkla:</strong> Kutunun sağındaki mavi noktaya (🔵) tıkla. Kutu parlayacaktır.
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <strong>3. Doğru Sayıyı Seç:</strong> Sağ taraftaki doğru sayının mavi noktasına tıklayarak çizgiyi tamamla.
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <strong>4. Korkmadan Dene:</strong> Yanlış sayıya tıklarsan puan silinmez! Tekrar sakin bir şekilde sayabilirsin.
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-sm transition-colors cursor-pointer shadow-md"
            >
              Harika, Oyuna Dön!
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: LEVEL COMPLETED MODAL */}
      {isLevelFinishedModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border-4 border-emerald-400 p-6 sm:p-8 shadow-2xl text-center relative animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
              ⭐
            </div>

            <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider mb-2">
              Seviye Başarıyla Tamamlandı!
            </span>

            <h3 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2">
              Tebrikler!
            </h3>

            <p className="text-sm font-bold text-emerald-700 mb-6">
              Tüm nesneleri doğru saydın ve kusursuz eşleştirdin!
            </p>

            <button
              onClick={handleNextLevel}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black text-base shadow-lg cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <span>Sonraki Seviyeye Geç</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: GRAND FINALE GAME COMPLETED MODAL */}
      {isGameFinishedModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border-4 border-amber-400 p-6 sm:p-8 shadow-2xl text-center relative animate-scale-in">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 flex items-center justify-center text-4xl mx-auto mb-3 shadow-lg border-2 border-white">
              🏆
            </div>

            <span className="inline-block px-3.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black uppercase tracking-wider mb-2">
              MEZUNİYET: EŞLEŞTİRME USTASI!
            </span>

            <h3 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2">
              9 SEVİYEYİ DE TAMAMLADIN! 🔢🎉
            </h3>

            <p className="text-sm sm:text-base font-bold text-slate-600 mb-4">
              En küçükten en büyüğe tüm nesneleri saydın, birbirine yakın sayıları ayırt ettin ve gerçek bir eşleştirme şampiyonu oldun!
            </p>

            {/* Score & Stars */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="bg-amber-50 px-4 py-2 rounded-2xl border border-amber-200">
                <span className="text-[10px] font-bold text-amber-600 block">TOPLAM PUAN</span>
                <span className="text-xl font-black text-amber-900">{score + 100}</span>
              </div>
              <div className="bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-600 block">YILDIZ DERECESİ</span>
                <span className="text-xl font-black text-emerald-900">⭐⭐⭐ (3/3)</span>
              </div>
            </div>

            <div className="bg-purple-50 rounded-2xl p-3 border border-purple-200 mb-6 flex items-center justify-center gap-3">
              <span className="text-3xl">🔢</span>
              <div className="text-left">
                <span className="text-[10px] font-bold text-purple-600 uppercase block">Kazanılan Rozet:</span>
                <span className="text-sm font-black text-purple-950">Eşleştirme Ustası</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleResetEntireGame}
                className="flex-1 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm transition-colors cursor-pointer"
              >
                Yeniden Oyna 🔄
              </button>

              <button
                onClick={() => {
                  setIsGameFinishedModal(false);
                  onComplete(3, score + 100);
                }}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-sm transition-all cursor-pointer shadow-md"
              >
                Ana Menüye Dön 🏠
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Also export as Activity8CountAndMatch for clean naming
export const Activity8CountAndMatch = Activity8ShadowMatch;
