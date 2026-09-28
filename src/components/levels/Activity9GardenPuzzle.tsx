import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  HelpCircle,
  Trophy,
  Check,
  Sparkles,
  ChevronRight,
  Play,
  X,
  Target,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEffects, speakTurkishText } from '../../utils/audio.ts';

export interface Activity9Props {
  soundEnabled: boolean;
  onComplete: (stars: number, score: number) => void;
  onSoundToggle: () => void;
}

export type GameLevel = 1 | 2 | 3;

// ----------------------------------------------------------------------
// 1. LEVEL 1: GERÇEK RENKLİ HEDİYE KUTULARI (METİNSİZ, BÜYÜK BOYUT)
// ----------------------------------------------------------------------
const ColoredGiftBox: React.FC<{ colorHex: string; size?: number }> = ({ colorHex, size = 68 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-md">
      {/* Box Shadow */}
      <ellipse cx="50" cy="92" rx="34" ry="6" fill="#000000" opacity="0.14" />
      {/* Box Body */}
      <rect x="20" y="44" width="60" height="46" rx="6" fill={colorHex} stroke="#1e293b" strokeWidth="2.5" />
      {/* Box Lid */}
      <rect x="15" y="32" width="70" height="15" rx="4" fill={colorHex} stroke="#1e293b" strokeWidth="2.5" />
      {/* Lid Highlight */}
      <rect x="18" y="34" width="64" height="4" rx="2" fill="#ffffff" opacity="0.3" />
      {/* Vertical Ribbon */}
      <rect x="44" y="32" width="12" height="58" fill="#ffffff" opacity="0.9" />
      <rect x="46" y="32" width="8" height="58" fill="#fef08a" />
      {/* Horizontal Ribbon */}
      <rect x="20" y="58" width="60" height="12" fill="#ffffff" opacity="0.9" />
      <rect x="20" y="60" width="60" height="8" fill="#fef08a" />
      {/* Ribbon Bow Left */}
      <path
        d="M50 32 C40 18, 24 20, 32 30 C38 36, 48 34, 50 32 Z"
        fill="#fef08a"
        stroke="#1e293b"
        strokeWidth="2"
      />
      {/* Ribbon Bow Right */}
      <path
        d="M50 32 C60 18, 76 20, 68 30 C62 36, 52 34, 50 32 Z"
        fill="#fef08a"
        stroke="#1e293b"
        strokeWidth="2"
      />
      {/* Center Ribbon Knot */}
      <circle cx="50" cy="32" r="5" fill="#facc15" stroke="#1e293b" strokeWidth="2" />
    </svg>
  );
};

// Pure Color Swatch Card for Level 1 (Textless, Large)
const ColoredSwatch: React.FC<{ colorHex: string; size?: number }> = ({ colorHex, size = 68 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-md">
      <ellipse cx="50" cy="90" rx="32" ry="6" fill="#000000" opacity="0.12" />
      {/* Rounded Color Card */}
      <rect x="14" y="14" width="72" height="72" rx="20" fill={colorHex} stroke="#ffffff" strokeWidth="4" />
      {/* Inner Soft Highlight */}
      <path d="M22 24 Q50 16 78 24 Q50 34 22 24 Z" fill="#ffffff" opacity="0.35" />
      {/* Center Shiny Core */}
      <circle cx="50" cy="50" r="14" fill="#ffffff" opacity="0.25" />
      <circle cx="50" cy="50" r="7" fill="#ffffff" opacity="0.5" />
    </svg>
  );
};

// ----------------------------------------------------------------------
// 2. LEVEL 2: RENKLİ ARABALAR (MEYVE YERİNE, AYNI RENKLER EŞLEŞİR)
// ----------------------------------------------------------------------
const ColoredCar: React.FC<{
  colorHex: string;
  width?: number;
  height?: number;
  faceLeft?: boolean;
}> = ({ colorHex, width = 84, height = 54, faceLeft = false }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 120 80"
      className="drop-shadow-md"
      style={{ transform: faceLeft ? 'scaleX(-1)' : 'none' }}
    >
      {/* Car Ground Shadow */}
      <ellipse cx="60" cy="74" rx="50" ry="5" fill="#000000" opacity="0.15" />

      {/* Car Cabin Roof & Windows */}
      <path d="M30 42 L42 20 L82 20 L94 42 Z" fill={colorHex} stroke="#1e293b" strokeWidth="3" />
      {/* Windows (Glass) */}
      <path d="M44 24 L35 40 L56 40 L56 24 Z" fill="#bae6fd" stroke="#1e293b" strokeWidth="2" />
      <path d="M62 24 L62 40 L88 40 L79 24 Z" fill="#bae6fd" stroke="#1e293b" strokeWidth="2" />

      {/* Car Main Body */}
      <rect x="12" y="38" width="96" height="26" rx="8" fill={colorHex} stroke="#1e293b" strokeWidth="3" />

      {/* Body Gloss Highlight */}
      <rect x="20" y="42" width="76" height="4" rx="2" fill="#ffffff" opacity="0.35" />

      {/* Front Headlight */}
      <circle cx="104" cy="46" r="4.5" fill="#fef08a" stroke="#1e293b" strokeWidth="2" />
      {/* Rear Taillight */}
      <rect x="12" y="44" width="4" height="6" rx="2" fill="#ef4444" stroke="#1e293b" strokeWidth="1.5" />

      {/* Rear Wheel */}
      <circle cx="34" cy="64" r="12" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
      <circle cx="34" cy="64" r="6" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
      <circle cx="34" cy="64" r="2" fill="#1e293b" />

      {/* Front Wheel */}
      <circle cx="86" cy="64" r="12" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
      <circle cx="86" cy="64" r="6" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
      <circle cx="86" cy="64" r="2" fill="#1e293b" />
    </svg>
  );
};

// ----------------------------------------------------------------------
// 3. LEVEL 3: FARKLI RENKTEKİ GEOMETRİK ŞEKİLLER (METİNSİZ, BÜYÜK BOYUT)
// ----------------------------------------------------------------------
const ColoredShapeSvg: React.FC<{ shapeId: string; colorHex: string; size?: number }> = ({
  shapeId,
  colorHex,
  size = 68,
}) => {
  switch (shapeId) {
    case 'square':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-md">
          <ellipse cx="50" cy="92" rx="38" ry="6" fill="#000000" opacity="0.12" />
          <rect x="14" y="14" width="72" height="72" rx="14" fill={colorHex} stroke="#1e293b" strokeWidth="3.5" />
          <rect x="20" y="20" width="60" height="8" rx="4" fill="#ffffff" opacity="0.3" />
        </svg>
      );
    case 'circle':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-md">
          <ellipse cx="50" cy="92" rx="36" ry="6" fill="#000000" opacity="0.12" />
          <circle cx="50" cy="48" r="38" fill={colorHex} stroke="#1e293b" strokeWidth="3.5" />
          <ellipse cx="42" cy="26" rx="14" ry="6" fill="#ffffff" opacity="0.35" transform="rotate(-25 42 26)" />
        </svg>
      );
    case 'triangle':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-md">
          <ellipse cx="50" cy="92" rx="38" ry="6" fill="#000000" opacity="0.12" />
          <polygon
            points="50,12 90,84 10,84"
            fill={colorHex}
            stroke="#1e293b"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <polygon points="50,22 80,80 20,80" fill="#ffffff" opacity="0.15" />
        </svg>
      );
    case 'rectangle':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-md">
          <ellipse cx="50" cy="92" rx="42" ry="6" fill="#000000" opacity="0.12" />
          <rect x="8" y="22" width="84" height="56" rx="12" fill={colorHex} stroke="#1e293b" strokeWidth="3.5" />
          <rect x="14" y="26" width="72" height="6" rx="3" fill="#ffffff" opacity="0.3" />
        </svg>
      );
    case 'star':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-md">
          <ellipse cx="50" cy="92" rx="36" ry="6" fill="#000000" opacity="0.12" />
          <polygon
            points="50,8 63,36 94,36 69,55 79,85 50,66 21,85 31,55 6,36 37,36"
            fill={colorHex}
            stroke="#1e293b"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle cx="50" cy="46" r="10" fill="#ffffff" opacity="0.25" />
        </svg>
      );
    case 'heart':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-md">
          <ellipse cx="50" cy="92" rx="34" ry="6" fill="#000000" opacity="0.12" />
          <path
            d="M50,86 C50,86 14,58 14,34 C14,18 26,10 38,10 C45,10 49,14 50,18 C51,14 55,10 62,10 C74,10 86,18 86,34 C86,58 50,86 50,86 Z"
            fill={colorHex}
            stroke="#1e293b"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <ellipse cx="32" cy="24" rx="8" ry="4" fill="#ffffff" opacity="0.4" transform="rotate(-30 32 24)" />
        </svg>
      );
    default:
      return null;
  }
};

// ----------------------------------------------------------------------
// PALETTES & DATA SOURCES
// ----------------------------------------------------------------------
interface ColorItemDef {
  id: string;
  name: string;
  hex: string;
}

const COLOR_DATABASE: ColorItemDef[] = [
  { id: 'red', name: 'Kırmızı', hex: '#ef4444' },
  { id: 'blue', name: 'Mavi', hex: '#3b82f6' },
  { id: 'yellow', name: 'Sarı', hex: '#eab308' },
  { id: 'green', name: 'Yeşil', hex: '#22c55e' },
  { id: 'orange', name: 'Turuncu', hex: '#f97316' },
  { id: 'purple', name: 'Mor', hex: '#a855f7' },
];

const SHAPE_DEFINITIONS = [
  { shapeId: 'square', name: 'Kare' },
  { shapeId: 'circle', name: 'Daire' },
  { shapeId: 'triangle', name: 'Üçgen' },
  { shapeId: 'rectangle', name: 'Dikdörtgen' },
  { shapeId: 'star', name: 'Yıldız' },
  { shapeId: 'heart', name: 'Kalp' },
];

interface ActivePairItem {
  id: string; // matching identifier
  colorHex?: string;
  visual: React.ReactNode;
}

interface MatchedConnection {
  leftId: string;
  rightId: string;
  color: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------
export const Activity9GardenPuzzle: React.FC<Activity9Props> = ({
  soundEnabled,
  onComplete,
  onSoundToggle,
}) => {
  // Navigation & Progress State
  const [hasStarted, setHasStarted] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<GameLevel>(1);
  const [currentRound, setCurrentRound] = useState<number>(1); // 1, 2, or 3
  const [score, setScore] = useState<number>(0);

  // Active items for current round
  const [leftItems, setLeftItems] = useState<ActivePairItem[]>([]);
  const [rightItems, setRightItems] = useState<ActivePairItem[]>([]);

  // Selection & Match Tracking
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [animatingMatchId, setAnimatingMatchId] = useState<string | null>(null);

  // SVG Connection Lines
  const [connections, setConnections] = useState<MatchedConnection[]>([]);

  // Feedback Messages & Modals
  const [feedbackMessage, setFeedbackMessage] = useState<{
    text: string;
    type: 'success' | 'warning' | 'info';
  } | null>(null);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [isLevelFinishedModal, setIsLevelFinishedModal] = useState<boolean>(false);
  const [isGameFinishedModal, setIsGameFinishedModal] = useState<boolean>(false);

  // DOM Refs for dynamic SVG line coordinates
  const boardContainerRef = useRef<HTMLDivElement | null>(null);
  const leftDotRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const rightDotRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // ----------------------------------------------------------------------
  // ROUND GENERATOR: 3 ROUNDS PER LEVEL (Tur 1: 3, Tur 2: 4, Tur 3: 5)
  // ----------------------------------------------------------------------
  const generateRound = useCallback((level: GameLevel, round: number) => {
    const itemCount = round === 1 ? 3 : round === 2 ? 4 : 5;
    setSelectedLeftId(null);
    setMatchedIds([]);
    setConnections([]);
    setAnimatingMatchId(null);

    if (level === 1) {
      // 🎁 LEVEL 1: Gerçek Renkli Hediye Kutusu ↔️ Aynı Renk Kartı (Metinsiz, Büyük Boyut)
      const shuffled = [...COLOR_DATABASE].sort(() => Math.random() - 0.5);
      const chosen = shuffled.slice(0, itemCount);
      const boxSize = itemCount === 3 ? 84 : itemCount === 4 ? 76 : 70;

      // Left items: Large, truly colored gift boxes (NO text)
      const leftList: ActivePairItem[] = chosen.map((c) => ({
        id: c.id,
        colorHex: c.hex,
        visual: (
          <div className="flex items-center justify-center p-1 sm:p-2">
            <ColoredGiftBox colorHex={c.hex} size={boxSize} />
          </div>
        ),
      }));

      // Right items: Large pure color cards (shuffled, NO text)
      let rightListItems = [...chosen].sort(() => Math.random() - 0.5);
      if (rightListItems.length > 1 && rightListItems[0].id === leftList[0].id) {
        rightListItems = [...rightListItems.slice(1), rightListItems[0]];
      }

      const rightList: ActivePairItem[] = rightListItems.map((c) => ({
        id: c.id,
        colorHex: c.hex,
        visual: (
          <div className="flex items-center justify-center p-1 sm:p-2">
            <ColoredSwatch colorHex={c.hex} size={boxSize} />
          </div>
        ),
      }));

      setLeftItems(leftList);
      setRightItems(rightList);
      setFeedbackMessage({
        text: '🎁 Renkli hediye kutusunun yanındaki noktaya, ardından aynı renkteki kartın noktasına tıkla.',
        type: 'info',
      });
    } else if (level === 2) {
      // 🚗 LEVEL 2: Renkli Arabalar ↔️ Aynı Renkli Arabalar (Meyve yerine Araba, Metinsiz, Büyük Boyut)
      const shuffled = [...COLOR_DATABASE].sort(() => Math.random() - 0.5);
      const chosen = shuffled.slice(0, itemCount);
      const carWidth = itemCount === 3 ? 104 : itemCount === 4 ? 92 : 84;
      const carHeight = itemCount === 3 ? 66 : itemCount === 4 ? 58 : 52;

      // Left items: Colored cars facing right (NO text)
      const leftList: ActivePairItem[] = chosen.map((c) => ({
        id: c.id,
        colorHex: c.hex,
        visual: (
          <div className="flex items-center justify-center p-1 sm:p-2">
            <ColoredCar colorHex={c.hex} width={carWidth} height={carHeight} faceLeft={false} />
          </div>
        ),
      }));

      // Right items: Same colored cars facing left (shuffled, NO text)
      let rightListItems = [...chosen].sort(() => Math.random() - 0.5);
      if (rightListItems.length > 1 && rightListItems[0].id === leftList[0].id) {
        rightListItems = [...rightListItems.slice(1), rightListItems[0]];
      }

      const rightList: ActivePairItem[] = rightListItems.map((c) => ({
        id: c.id,
        colorHex: c.hex,
        visual: (
          <div className="flex items-center justify-center p-1 sm:p-2">
            <ColoredCar colorHex={c.hex} width={carWidth} height={carHeight} faceLeft={true} />
          </div>
        ),
      }));

      setLeftItems(leftList);
      setRightItems(rightList);
      setFeedbackMessage({
        text: '🚗 Aynı renkteki arabaların yanındaki hedef noktaları birbiriyle eşleştir.',
        type: 'info',
      });
    } else {
      // 📐 LEVEL 3: Farklı Renkteki Geometrik Şekiller (ŞEKLE GÖRE EŞLEŞTİR, Metinsiz, Büyük Boyut)
      const shuffledShapes = [...SHAPE_DEFINITIONS].sort(() => Math.random() - 0.5);
      const chosenShapes = shuffledShapes.slice(0, itemCount);
      const shapeSize = itemCount === 3 ? 84 : itemCount === 4 ? 76 : 70;

      // Two distinct randomized color palettes for left and right
      const leftColors = [...COLOR_DATABASE].sort(() => Math.random() - 0.5);
      const rightColors = [...COLOR_DATABASE].sort(() => Math.random() - 0.5);

      const leftList: ActivePairItem[] = chosenShapes.map((s, idx) => {
        const c = leftColors[idx % leftColors.length];
        return {
          id: s.shapeId,
          colorHex: c.hex,
          visual: (
            <div className="flex items-center justify-center p-1 sm:p-2">
              <ColoredShapeSvg shapeId={s.shapeId} colorHex={c.hex} size={shapeSize} />
            </div>
          ),
        };
      });

      // Right items: SAME SHAPES, but guaranteed DIFFERENT COLORS, and shuffled order!
      let rightListItems = [...chosenShapes].sort(() => Math.random() - 0.5);
      if (rightListItems.length > 1 && rightListItems[0].shapeId === leftList[0].id) {
        rightListItems = [...rightListItems.slice(1), rightListItems[0]];
      }

      const rightList: ActivePairItem[] = rightListItems.map((s, idx) => {
        const leftPair = leftList.find((l) => l.id === s.shapeId);
        const leftHex = leftPair ? leftPair.colorHex : '';
        const allowedColors = rightColors.filter((rc) => rc.hex !== leftHex);
        const chosenColor =
          allowedColors.length > 0
            ? allowedColors[idx % allowedColors.length]
            : rightColors[(idx + 1) % rightColors.length];

        return {
          id: s.shapeId,
          colorHex: chosenColor.hex,
          visual: (
            <div className="flex items-center justify-center p-1 sm:p-2">
              <ColoredShapeSvg shapeId={s.shapeId} colorHex={chosenColor.hex} size={shapeSize} />
            </div>
          ),
        };
      });

      setLeftItems(leftList);
      setRightItems(rightList);
      setFeedbackMessage({
        text: '⭐ Dikkat: Renkler farklı! Şekilleri rengine göre değil, ŞEKLİNE GÖRE eşleştir.',
        type: 'info',
      });
    }
  }, []);

  // Update round on start, level, or round change
  useEffect(() => {
    if (hasStarted) {
      generateRound(currentLevel, currentRound);
    }
  }, [hasStarted, currentLevel, currentRound, generateRound]);

  // Recalculate SVG line coordinates dynamically
  const updateConnectionLines = useCallback(() => {
    if (!boardContainerRef.current) return;
    const boardRect = boardContainerRef.current.getBoundingClientRect();

    setConnections((prev) =>
      prev.map((conn) => {
        const leftEl = leftDotRefs.current[conn.leftId];
        const rightEl = rightDotRefs.current[conn.rightId];
        if (!leftEl || !rightEl) return conn;

        const leftRect = leftEl.getBoundingClientRect();
        const rightRect = rightEl.getBoundingClientRect();

        return {
          ...conn,
          x1: leftRect.left + leftRect.width / 2 - boardRect.left,
          y1: leftRect.top + leftRect.height / 2 - boardRect.top,
          x2: rightRect.left + rightRect.width / 2 - boardRect.left,
          y2: rightRect.top + rightRect.height / 2 - boardRect.top,
        };
      })
    );
  }, []);

  // Window resize listener to keep SVG lines aligned
  useEffect(() => {
    window.addEventListener('resize', updateConnectionLines);
    return () => window.removeEventListener('resize', updateConnectionLines);
  }, [updateConnectionLines]);

  // ----------------------------------------------------------------------
  // HEDEF NOKTA TIKLAMA SİSTEMİ (TARGET POINT CLICK SYSTEM)
  // ----------------------------------------------------------------------

  // Left Target Dot Click
  const handleLeftDotClick = (leftId: string) => {
    if (matchedIds.includes(leftId)) return; // Already matched
    soundEffects.playPop(soundEnabled);

    if (selectedLeftId === leftId) {
      setSelectedLeftId(null);
    } else {
      setSelectedLeftId(leftId);
      setFeedbackMessage({
        text: '🔵 Soldaki hedef nokta seçildi! Şimdi sağdaki doğru eşinin noktasına tıkla.',
        type: 'info',
      });
    }
  };

  // Right Target Dot Click
  const handleRightDotClick = (rightId: string) => {
    if (matchedIds.includes(rightId)) return; // Already matched

    if (!selectedLeftId) {
      soundEffects.playGentleBoing(soundEnabled);
      speakTurkishText('Önce sol taraftaki nesnenin yanındaki noktaya tıkla!');
      setFeedbackMessage({
        text: '👆 Önce soldaki nesnenin yanındaki hedef noktaya tıklamalısın!',
        type: 'warning',
      });
      return;
    }

    // CHECK MATCH
    if (selectedLeftId === rightId) {
      // SUCCESS MATCH!
      soundEffects.playStar(soundEnabled);
      setScore((s) => s + 25);
      const matchedKey = selectedLeftId;
      const leftItem = leftItems.find((l) => l.id === matchedKey);
      const color = leftItem?.colorHex || '#10b981';

      // Visual scale animation
      setAnimatingMatchId(matchedKey);
      setTimeout(() => setAnimatingMatchId(null), 600);

      // Create line coordinates
      if (boardContainerRef.current) {
        const boardRect = boardContainerRef.current.getBoundingClientRect();
        const leftEl = leftDotRefs.current[matchedKey];
        const rightEl = rightDotRefs.current[rightId];

        if (leftEl && rightEl) {
          const lRect = leftEl.getBoundingClientRect();
          const rRect = rightEl.getBoundingClientRect();

          const newConn: MatchedConnection = {
            leftId: matchedKey,
            rightId: rightId,
            color,
            x1: lRect.left + lRect.width / 2 - boardRect.left,
            y1: lRect.top + lRect.height / 2 - boardRect.top,
            x2: rRect.left + rRect.width / 2 - boardRect.left,
            y2: rRect.top + rRect.height / 2 - boardRect.top,
          };
          setConnections((prev) => [...prev, newConn]);
        }
      }

      const nextMatched = [...matchedIds, matchedKey];
      setMatchedIds(nextMatched);
      setSelectedLeftId(null);

      confetti({
        particleCount: 20,
        spread: 40,
        origin: { y: 0.65 },
      });

      // Check if all items in current round are matched
      if (nextMatched.length === leftItems.length) {
        soundEffects.playDropSuccess(soundEnabled);

        setTimeout(() => {
          if (currentRound < 3) {
            setCurrentRound((r) => r + 1);
          } else {
            handleLevelComplete();
          }
        }, 1100);
      }
    } else {
      // WRONG MATCH
      soundEffects.playGentleBoing(soundEnabled);

      const supportiveMessages = [
        'Tekrar deneyelim.',
        'Bir kez daha dikkatlice bakalım.',
        'Şekli ve rengi tekrar kontrol et.',
      ];
      const randomMsg =
        supportiveMessages[Math.floor(Math.random() * supportiveMessages.length)];

      speakTurkishText(randomMsg);
      setFeedbackMessage({
        text: `🔍 ${randomMsg} Hedef noktaları tekrar kontrol et.`,
        type: 'warning',
      });

      // Reset selection without penalty
      setSelectedLeftId(null);
    }
  };

  // Level Completion Logic
  const handleLevelComplete = () => {
    if (currentLevel < 3) {
      setTimeout(() => {
        setIsLevelFinishedModal(true);
        soundEffects.playFanfare(soundEnabled);
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
        });
      }, 500);
    } else {
      // GRAND FINALE: ALL 3 LEVELS COMPLETED
      setTimeout(() => {
        setIsGameFinishedModal(true);
        soundEffects.playFanfare(soundEnabled);
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
        });
        onComplete(3, score + 100);
      }, 500);
    }
  };

  const handleNextLevel = () => {
    soundEffects.playPop(soundEnabled);
    setIsLevelFinishedModal(false);
    setCurrentLevel((lvl) => (lvl + 1) as GameLevel);
    setCurrentRound(1);
  };

  const handleRestartRound = () => {
    soundEffects.playPop(soundEnabled);
    generateRound(currentLevel, currentRound);
  };

  const handleResetEntireGame = () => {
    soundEffects.playPop(soundEnabled);
    setIsGameFinishedModal(false);
    setIsLevelFinishedModal(false);
    setCurrentLevel(1);
    setCurrentRound(1);
    setScore(0);
    generateRound(1, 1);
  };

  // ----------------------------------------------------------------------
  // 1. WELCOME SCREEN
  // ----------------------------------------------------------------------
  if (!hasStarted) {
    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center py-6 px-4 select-none">
        <div className="w-full bg-gradient-to-b from-teal-500 via-emerald-600 to-cyan-800 rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden flex flex-col items-center text-center border-4 border-teal-300">
          <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
            <div className="w-20 h-20 rounded-full bg-white absolute top-6 left-10 animate-pulse" />
            <div className="w-28 h-28 rounded-full bg-white absolute bottom-10 right-14 animate-pulse" />
          </div>

          <div className="relative mb-4">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/20 backdrop-blur-md border-3 border-teal-200 flex items-center justify-center text-5xl sm:text-6xl shadow-xl relative animate-pulse">
              🎯
              <div className="absolute -bottom-2 -right-2 bg-amber-400 text-amber-950 p-1.5 rounded-full border-2 border-white shadow-md text-base font-black">
                3L
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 bg-teal-400/30 text-teal-100 border border-teal-200/50 px-4 py-1.5 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-300" />
              3 Seviyeli Renk & Şekil Eşleştirme
            </span>
            <span className="inline-flex items-center gap-1.5 bg-amber-400 text-amber-950 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider shadow-sm">
              <Target className="w-4 h-4" />
              Hedef Noktaları Birleştir
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-2 drop-shadow-sm">
            RENK VE ŞEKİL EŞLEŞTİRME 🎨📐
          </h1>

          <p className="text-base sm:text-xl font-bold text-teal-100 mb-6 italic max-w-2xl">
            "Büyük ve renkli görsellerin yanındaki hedef noktalara tıkla, doğru eşleri birleştir!"
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-3xl w-full text-left mb-8">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
              <span className="text-2xl mb-1 block">🎁 1. Seviye</span>
              <h4 className="font-black text-sm text-amber-300">Renkli Hediye Kutuları</h4>
              <p className="text-xs text-teal-100 font-medium mt-1">
                Renkli hediye kutusunu aynı renkteki renk kartıyla eşleştir.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
              <span className="text-2xl mb-1 block">🚗 2. Seviye</span>
              <h4 className="font-black text-sm text-amber-300">Renkli Arabalar</h4>
              <p className="text-xs text-teal-100 font-medium mt-1">
                Aynı renkteki sevimli arabaları hedef noktalardan birleştir.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
              <span className="text-2xl mb-1 block">📐 3. Seviye</span>
              <h4 className="font-black text-sm text-amber-300">Geometrik Şekiller</h4>
              <p className="text-xs text-teal-100 font-medium mt-1">
                Renkler farklı! Şekilleri rengine göre değil, şekline göre eşleştir.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEffects.playPop(soundEnabled);
              setHasStarted(true);
            }}
            className="px-9 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black text-base sm:text-lg shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer border-3 border-emerald-300 flex items-center gap-2"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>OYUNA BAŞLA 🚀</span>
          </button>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // 2. ACTIVE GAME SCREEN
  // ----------------------------------------------------------------------
  return (
    <div
      className="w-full max-w-5xl mx-auto flex flex-col items-center py-2 sm:py-4 px-2 sm:px-4 select-none relative"
      onDragStart={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* TOP HEADER CONTROLS */}
      <div className="w-full bg-white rounded-3xl border-3 border-teal-200 shadow-md p-4 sm:p-5 mb-3 sm:mb-4 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-3">
          {/* Title & Stage */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center text-2xl shadow-xs font-black">
              {currentLevel === 1 ? '🎁' : currentLevel === 2 ? '🚗' : '📐'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-xl font-black text-slate-800 tracking-tight">
                  Renk ve Şekil Eşleştirme
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-teal-100 text-teal-900 border border-teal-300">
                  {currentLevel === 1
                    ? '1. Seviye: Renkli Hediye Kutuları'
                    : currentLevel === 2
                    ? '2. Seviye: Renkli Arabalar'
                    : '3. Seviye: Geometrik Şekiller (Şekle Göre Eşle)'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                  Tur: {currentRound} / 3
                </span>
              </div>
              <p className="text-xs font-bold text-slate-500">
                {currentLevel === 1
                  ? 'Kutunun yanındaki noktaya, ardından aynı renkteki kartın noktasına tıkla.'
                  : currentLevel === 2
                  ? 'Aynı renkteki arabaları yanlarındaki hedef noktalara tıklayarak birleştir.'
                  : 'Renkler farklı! Şekilleri rengine göre değil, şekline göre eşleştir.'}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() =>
                speakTurkishText(
                  currentLevel === 1
                    ? '1. Seviye: Hediye kutularını renkleriyle eşleştir. Yanındaki hedef noktalara tıkla.'
                    : currentLevel === 2
                    ? '2. Seviye: Aynı renkteki arabaları hedef noktalardan eşleştir.'
                    : '3. Seviye: Şekilleri rengine göre değil, şekline göre eşleştir!'
                )
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200 text-xs font-black transition-colors cursor-pointer"
              title="Görevi Sesli Dinle"
            >
              <Volume2 className="w-4 h-4 text-teal-700" />
              <span className="hidden sm:inline">Sesli Dinle</span>
            </button>

            <button
              onClick={handleRestartRound}
              className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 text-xs font-bold transition-colors cursor-pointer"
              title="Bu Turu Yeniden Başlat"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

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

            <button
              onClick={() => setShowHelpModal(true)}
              className="p-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold transition-colors cursor-pointer"
              title="Nasıl Oynanır?"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* STATUS BAR: Level, Round, Puan */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-teal-900 bg-teal-50 border border-teal-200 px-3 py-1 rounded-xl shadow-xs">
              Seviye {currentLevel} / 3
            </span>
            <span className="text-xs font-black text-amber-900 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl shadow-xs">
              🎯 Tur {currentRound} / 3 ({leftItems.length} Eşleştirme)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-xs">
              <Trophy className="w-4 h-4 text-amber-600" />
              <div className="text-xs">
                <span className="text-amber-500 font-bold block text-[10px]">Toplam Puan</span>
                <span className="font-black text-amber-900 text-sm">{score}</span>
              </div>
            </div>
          </div>
        </div>

        {/* FEEDBACK BANNER MESSAGE */}
        {feedbackMessage && (
          <div
            className={`mt-2.5 py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between transition-all ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                : feedbackMessage.type === 'warning'
                ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                : 'bg-teal-50 text-teal-900 border border-teal-200'
            }`}
          >
            <span>{feedbackMessage.text}</span>
          </div>
        )}
      </div>

      {/* 3. MAIN MATCHING BOARD WITH HEDEF NOKTA SİSTEMİ & SVG LINES */}
      <div
        ref={boardContainerRef}
        className="w-full bg-gradient-to-b from-slate-50 to-blue-50/40 rounded-3xl border-3 border-teal-200 shadow-xl p-4 sm:p-7 min-h-[480px] relative overflow-hidden flex flex-col justify-between"
      >
        {/* SVG Overlay for Connection Lines */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          style={{ overflow: 'visible' }}
        >
          {connections.map((conn, idx) => (
            <g key={`conn_${conn.leftId}_${idx}`}>
              {/* Outer Glow Line */}
              <line
                x1={conn.x1}
                y1={conn.y1}
                x2={conn.x2}
                y2={conn.y2}
                stroke={conn.color}
                strokeWidth={9}
                strokeOpacity={0.25}
                strokeLinecap="round"
              />
              {/* Main Solid Line */}
              <line
                x1={conn.x1}
                y1={conn.y1}
                x2={conn.x2}
                y2={conn.y2}
                stroke={conn.color}
                strokeWidth={5}
                strokeLinecap="round"
                className="animate-pulse"
              />
              {/* Endpoint Circles */}
              <circle cx={conn.x1} cy={conn.y1} r={7} fill={conn.color} stroke="#ffffff" strokeWidth={2.5} />
              <circle cx={conn.x2} cy={conn.y2} r={7} fill={conn.color} stroke="#ffffff" strokeWidth={2.5} />
            </g>
          ))}
        </svg>

        {/* Board Header instruction */}
        <div className="relative z-20 flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
          <span className="text-xs sm:text-sm font-black text-slate-700 flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-teal-500 inline-block shadow-xs" />
            Önce soldaki hedef noktaya (●), sonra sağdaki eşinin noktasına tıkla!
          </span>
          <span className="text-xs font-black text-slate-500">
            {matchedIds.length} / {leftItems.length} Eşleşti
          </span>
        </div>

        {/* Two Columns Grid: Left Objects & Right Objects (CLEAN, NO TEXT LABELS, LARGE VISUALS) */}
        <div className="grid grid-cols-2 gap-4 sm:gap-12 relative z-20 my-auto">
          {/* LEFT COLUMN: Objects with Target Dot on their RIGHT side */}
          <div className="flex flex-col gap-3.5 sm:gap-4.5">
            <span className="text-[11px] font-black uppercase text-teal-800 tracking-wider mb-1 block">
              1. Nesne (Sol Noktayı Seç)
            </span>

            {leftItems.map((item) => {
              const isMatched = matchedIds.includes(item.id);
              const isSelected = selectedLeftId === item.id;
              const isAnimating = animatingMatchId === item.id;

              return (
                <div
                  key={`left_${item.id}`}
                  className={`flex items-center justify-between p-3 sm:p-4 rounded-2xl border-3 transition-all duration-200 bg-white ${
                    isMatched
                      ? 'border-emerald-300 bg-emerald-50/50 opacity-90'
                      : isSelected
                      ? 'border-amber-400 shadow-lg ring-4 ring-amber-200 bg-amber-50/50'
                      : 'border-slate-200 hover:border-teal-300 shadow-xs'
                  } ${isAnimating ? 'scale-105' : ''}`}
                  onClick={() => {
                    if (!isMatched) {
                      handleLeftDotClick(item.id);
                    }
                  }}
                >
                  {/* Left Object Visual Content (BÜYÜK BOYUT, METİNSİZ) */}
                  <div className="flex-1 flex items-center justify-center cursor-pointer select-none">
                    {item.visual}
                  </div>

                  {/* PROMINENT TARGET POINT (HEDEF NOKTA) */}
                  <button
                    ref={(el) => {
                      leftDotRefs.current[item.id] = el;
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLeftDotClick(item.id);
                    }}
                    disabled={isMatched}
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 border-3 transition-all cursor-pointer shadow-sm ml-2 ${
                      isMatched
                        ? 'bg-emerald-500 border-white text-white cursor-default'
                        : isSelected
                        ? 'bg-amber-400 border-white text-amber-950 scale-125 ring-4 ring-amber-300 animate-pulse'
                        : 'bg-white border-teal-500 hover:scale-115 hover:border-teal-600 text-teal-700'
                    }`}
                    title="Hedef Noktası"
                  >
                    {isMatched ? (
                      <Check className="w-6 h-6 stroke-[3]" />
                    ) : (
                      <span
                        className={`w-4 h-4 rounded-full block transition-transform ${
                          isSelected ? 'bg-amber-950 scale-125' : 'bg-teal-600'
                        }`}
                      />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* RIGHT COLUMN: Corresponding Targets with Target Dot on their LEFT side */}
          <div className="flex flex-col gap-3.5 sm:gap-4.5">
            <span className="text-[11px] font-black uppercase text-cyan-800 tracking-wider mb-1 block">
              2. Karşılık (Sağ Noktaya Eşle)
            </span>

            {rightItems.map((item) => {
              const isMatched = matchedIds.includes(item.id);
              const isAnimating = animatingMatchId === item.id;

              return (
                <div
                  key={`right_${item.id}`}
                  className={`flex items-center justify-between p-3 sm:p-4 rounded-2xl border-3 transition-all duration-200 bg-white ${
                    isMatched
                      ? 'border-emerald-300 bg-emerald-50/50 opacity-90'
                      : selectedLeftId
                      ? 'border-slate-200 hover:border-cyan-400 shadow-md cursor-pointer'
                      : 'border-slate-200 shadow-xs'
                  } ${isAnimating ? 'scale-105' : ''}`}
                  onClick={() => {
                    if (!isMatched) {
                      handleRightDotClick(item.id);
                    }
                  }}
                >
                  {/* PROMINENT TARGET POINT (HEDEF NOKTA on left side of right card) */}
                  <button
                    ref={(el) => {
                      rightDotRefs.current[item.id] = el;
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRightDotClick(item.id);
                    }}
                    disabled={isMatched}
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 border-3 transition-all cursor-pointer shadow-sm mr-2 ${
                      isMatched
                        ? 'bg-emerald-500 border-white text-white cursor-default'
                        : selectedLeftId
                        ? 'bg-white border-cyan-500 hover:scale-125 hover:border-cyan-600 text-cyan-700 animate-pulse'
                        : 'bg-white border-slate-300 text-slate-400'
                    }`}
                    title="Hedef Noktası"
                  >
                    {isMatched ? (
                      <Check className="w-6 h-6 stroke-[3]" />
                    ) : (
                      <span
                        className={`w-4 h-4 rounded-full block ${
                          selectedLeftId ? 'bg-cyan-600' : 'bg-slate-400'
                        }`}
                      />
                    )}
                  </button>

                  {/* Right Object Visual Content (BÜYÜK BOYUT, METİNSİZ) */}
                  <div className="flex-1 flex items-center justify-center cursor-pointer select-none">
                    {item.visual}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Help Tip */}
        <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-bold">
          <span>💡 İpucu: Nesnenin üzerine değil, yanındaki yuvarlak hedef noktasına tıkla!</span>
          <span>Sol Tuş Tıklama</span>
        </div>
      </div>

      {/* MODAL 1: HELP MODAL */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border-4 border-teal-400 p-6 sm:p-8 shadow-2xl relative animate-scale-in">
            <button
              onClick={() => setShowHelpModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center text-2xl font-black shrink-0">
                🎯
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800">
                  Renk ve Şekil Eşleştirme – Nasıl Oynanır?
                </h3>
                <p className="text-xs font-bold text-teal-600">
                  Hedef Nokta Sistemi & Görsel Eşleştirme
                </p>
              </div>
            </div>

            <div className="space-y-3 text-slate-700 text-xs sm:text-sm font-medium mb-6">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-300">
                <strong>● HEDEF NOKTA KURALI:</strong> Nesnelerin kendisine değil, yanlarındaki renkli <strong>HEDEF NOKTALARA</strong> tıklamalısın!
              </div>
              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200">
                <strong>1. Önce Soldaki Noktaya Tıkla:</strong> Soldaki nesnenin yanındaki noktaya sol tıkla (nokta parlar ve seçilir).
              </div>
              <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-200">
                <strong>2. Sağdaki Eşinin Noktasına Tıkla:</strong> Ardından sağdaki doğru karşılığın yanındaki noktaya tıkla. Doğruysa renkli bağlantı çizgisi oluşur!
              </div>
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
                <strong>3. 3. Seviye Şekil Kuralı:</strong> 3. seviyede renkler farklıdır! Eşleştirmeyi renge göre değil, <strong>şeklin kendisine</strong> göre yapmalısın.
              </div>
              <div className="p-3 rounded-xl bg-slate-100 border border-slate-300">
                <strong>4. Yanlış Cevap:</strong> Yanlış yaptığında puan kaybetmezsin, nazikçe tekrar deneyebilirsin.
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-sm transition-colors cursor-pointer shadow-md"
            >
              Anladım, Oyuna Dön!
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
              Seviye {currentLevel} Başarıyla Tamamlandı!
            </span>

            <h3 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2">
              🎉 Harika! Tüm eşleştirmeleri tamamladın!
            </h3>

            <p className="text-sm font-bold text-emerald-700 mb-6">
              Hedef noktaları başarıyla birleştirdin ve bu seviyedeki 3 turu da tamamladın!
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

      {/* MODAL 3: GRAND FINALE GAME COMPLETED (ALL 3 LEVELS DONE) */}
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
              🎉 Tebrikler! Tüm eşleştirme görevlerini tamamladın!
            </h3>

            <p className="text-sm sm:text-base font-bold text-slate-600 mb-4">
              Hediye kutularını renkleriyle, arabaları renkleriyle ve geometrik şekilleri şekillerine göre hatasız birleştirdin!
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

            <div className="bg-teal-50 rounded-2xl p-3 border border-teal-200 mb-6 flex items-center justify-center gap-3">
              <span className="text-3xl">🎨</span>
              <div className="text-left">
                <span className="text-[10px] font-bold text-teal-600 uppercase block">Kazanılan Rozet:</span>
                <span className="text-sm font-black text-teal-950">Renk ve Şekil Dedektifi</span>
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
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-black text-sm transition-all cursor-pointer shadow-md"
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

// Also export as Activity9ColorShapeMatch for clean naming
export const Activity9ColorShapeMatch = Activity9GardenPuzzle;
