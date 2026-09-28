import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Trophy,
  HelpCircle,
  X,
  ChevronRight,
  RefreshCw,
  MousePointer2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEffects, speakTurkishText } from '../../utils/audio.ts';

interface Activity7Props {
  soundEnabled: boolean;
  onComplete: (stars: number, score: number) => void;
  onSoundToggle: () => void;
}

// ----------------------------------------------------
// STRICT MAXIMUM RULE: NEVER MORE THAN 12 FISH
// ----------------------------------------------------
export const ABSOLUTE_MIN_FISH = 1;
export const ABSOLUTE_MAX_FISH = 12;

export const clampFishCount = (val: number): number => {
  return Math.max(ABSOLUTE_MIN_FISH, Math.min(ABSOLUTE_MAX_FISH, Math.round(val)));
};

// Turkish spoken number words for clear TTS
const TURKISH_NUMBERS: Record<number, string> = {
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
};

// ----------------------------------------------------
// CUTE, CLEAN, NATURAL SINGLE-COLORED FISH (NO OCTOPUS, NO WEIRD COLOR FILTERS)
// ----------------------------------------------------
export interface FishSpecies {
  id: string;
  name: string;
  emoji: string;
  colorName: string;
  scale?: number;
}

const FISH_SPECIES: FishSpecies[] = [
  {
    id: 'orange_fish',
    name: 'Turuncu Balık',
    emoji: '🐠',
    colorName: 'Turuncu',
    scale: 1.05,
  },
  {
    id: 'blue_fish',
    name: 'Mavi Balık',
    emoji: '🐟',
    colorName: 'Mavi',
    scale: 1.0,
  },
  {
    id: 'yellow_puffer',
    name: 'Sarı Balık',
    emoji: '🐡',
    colorName: 'Sarı',
    scale: 1.05,
  },
];

export interface FishItem {
  id: string;
  index: number;
  species: FishSpecies;
  initialX: number; // percentage (0-100)
  initialY: number; // percentage (0-100)
  direction: 1 | -1; // 1: facing right, -1: facing left
  speed: number;
  isMarked: boolean;
  markedNumber?: number;
}

// Internal runtime physics tracker for 60fps swimming
interface FishPhysics {
  id: string;
  x: number; // 8 to 88%
  y: number; // 14 to 80%
  baseY: number; // Anchor Y position to prevent vertical drift
  vx: number; // speed (% per second)
  direction: 1 | -1; // 1 = moving right, -1 = moving left
  bobPhase: number;
  bobSpeed: number;
}

// ----------------------------------------------------
// 15 PROGRESSIVE CHAPTERS (BASİTTEN ZORA, RİTMİK OLMAYAN KARMA SIRA, MAKS: 12)
// ----------------------------------------------------
export interface AquariumChapter {
  chapterNum: number; // 1 to 15
  fishCount: number;
  title: string;
  badgeBg: string;
  badgeText: string;
  hintText: string;
}

export const AQUARIUM_CHAPTERS: AquariumChapter[] = [
  // 1-3 balık aşaması (karma: 2 -> 1 -> 3)
  {
    chapterNum: 1,
    fishCount: 2,
    title: 'Bölüm 1',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    badgeText: '🟢 Bölüm 1',
    hintText: 'Akvaryumdaki 2 balığı say ve doğru sayıya SAĞ TIKLA!',
  },
  {
    chapterNum: 2,
    fishCount: 1,
    title: 'Bölüm 2',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    badgeText: '🟢 Bölüm 2',
    hintText: 'Yavaşça süzülen balığı say ve doğru sayıya SAĞ TIKLA!',
  },
  {
    chapterNum: 3,
    fishCount: 3,
    title: 'Bölüm 3',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    badgeText: '🟢 Bölüm 3',
    hintText: 'Renkli 3 balığı say ve doğru sayıya SAĞ TIKLA!',
  },

  // 3-6 balık aşaması (karma: 5 -> 3 -> 6 -> 4)
  {
    chapterNum: 4,
    fishCount: 5,
    title: 'Bölüm 4',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
    badgeText: '🟡 Bölüm 4',
    hintText: 'Akvaryum hareketleniyor! Balıkları say ve SAĞ TUŞLA seç.',
  },
  {
    chapterNum: 5,
    fishCount: 3,
    title: 'Bölüm 5',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
    badgeText: '🟡 Bölüm 5',
    hintText: 'Balıkları dikkatle say. İstersen balıklara da SAĞ TIKLAYIP işaretleyebilirsin.',
  },
  {
    chapterNum: 6,
    fishCount: 6,
    title: 'Bölüm 6',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
    badgeText: '🟡 Bölüm 6',
    hintText: 'Balıklar ekrandan çıkmadan yavaşça süzülüyor. Sayıyı bul ve SAĞ TIKLA!',
  },
  {
    chapterNum: 7,
    fishCount: 4,
    title: 'Bölüm 7',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
    badgeText: '🟡 Bölüm 7',
    hintText: 'Gözlerin çok keskin! Balıkları dikkatlice say ve SAĞ TIKLA.',
  },

  // 5-8 balık aşaması (karma: 7 -> 5 -> 8 -> 7)
  {
    chapterNum: 8,
    fishCount: 7,
    title: 'Bölüm 8',
    badgeBg: 'bg-orange-100 text-orange-800 border-orange-300',
    badgeText: '🟠 Bölüm 8',
    hintText: 'Balık sürüsü büyüyor! Sakin sakin say ve doğru sayıya SAĞ TIKLA.',
  },
  {
    chapterNum: 9,
    fishCount: 5,
    title: 'Bölüm 9',
    badgeBg: 'bg-orange-100 text-orange-800 border-orange-300',
    badgeText: '🟠 Bölüm 9',
    hintText: 'Akvaryumdaki balıkları tek tek say ve doğru kutucuğa SAĞ TIKLA!',
  },
  {
    chapterNum: 10,
    fishCount: 8,
    title: 'Bölüm 10',
    badgeBg: 'bg-orange-100 text-orange-800 border-orange-300',
    badgeText: '🟠 Bölüm 10',
    hintText: 'Harika bir tempo! 10. bölüme ulaştın, balıkları say.',
  },
  {
    chapterNum: 11,
    fishCount: 7,
    title: 'Bölüm 11',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
    badgeText: '🔵 Bölüm 11',
    hintText: 'Balıkları karıştırmamak için üzerlerine SAĞ TIKLAYIP numaralandırabilirsin.',
  },

  // 9-12 balık aşaması (karma: 10 -> 9 -> 11 -> 12)
  {
    chapterNum: 12,
    fishCount: 10,
    title: 'Bölüm 12',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
    badgeText: '🔵 Bölüm 12',
    hintText: 'Büyük balık sürüsü! Sayarken dikkatini topla ve SAĞ TIKLA.',
  },
  {
    chapterNum: 13,
    fishCount: 9,
    title: 'Bölüm 13',
    badgeBg: 'bg-purple-100 text-purple-800 border-purple-300',
    badgeText: '🟣 Bölüm 13',
    hintText: 'Final adımlarına yaklaşıyorsun! Balıkları eksiksiz say.',
  },
  {
    chapterNum: 14,
    fishCount: 11,
    title: 'Bölüm 14',
    badgeBg: 'bg-purple-100 text-purple-800 border-purple-300',
    badgeText: '🟣 Bölüm 14',
    hintText: 'Büyük finale bir adım kaldı! 11 balığı sakin sakin say.',
  },
  {
    chapterNum: 15,
    fishCount: 12,
    title: 'Bölüm 15 – Büyük Final (Maks. 12)',
    badgeBg: 'bg-cyan-100 text-cyan-900 border-cyan-400',
    badgeText: '🏆 Bölüm 15 (Final)',
    hintText: 'İşte 15. Bölüm Büyük Final! En fazla 12 balığı say ve şampiyon ol!',
  },
];

// Helper to generate a fresh, randomized non-rhythmic fish count sequence for all 15 chapters
export function generateRandomChapterFishCounts(): number[] {
  // Tier 1: Bölüm 1-3 (Counts 1 to 3, non-rhythmic)
  const tier1Candidates = [
    [2, 1, 3],
    [3, 1, 2],
    [2, 3, 1],
    [1, 3, 2],
  ];
  const t1 = tier1Candidates[Math.floor(Math.random() * tier1Candidates.length)];

  // Tier 2: Bölüm 4-7 (Counts 3 to 6, non-rhythmic)
  const tier2Candidates = [
    [5, 3, 6, 4],
    [4, 6, 3, 5],
    [6, 4, 5, 3],
    [3, 5, 4, 6],
    [5, 4, 6, 3],
    [4, 3, 6, 5],
  ];
  const t2 = tier2Candidates[Math.floor(Math.random() * tier2Candidates.length)];

  // Tier 3: Bölüm 8-11 (Counts 5 to 8, non-rhythmic)
  const tier3Candidates = [
    [7, 5, 8, 6],
    [6, 8, 5, 7],
    [8, 6, 7, 5],
    [5, 7, 6, 8],
    [7, 6, 8, 5],
    [6, 7, 5, 8],
  ];
  const t3 = tier3Candidates[Math.floor(Math.random() * tier3Candidates.length)];

  // Tier 4: Bölüm 12-14 (Counts 8 to 11, non-rhythmic)
  const tier4Candidates = [
    [10, 8, 11],
    [9, 11, 8],
    [11, 9, 10],
    [8, 11, 9],
    [10, 9, 11],
    [9, 10, 8],
  ];
  const t4 = tier4Candidates[Math.floor(Math.random() * tier4Candidates.length)];

  // Tier 5: Bölüm 15 (Grand Finale: always 12, strict max 12)
  const t5 = [12];

  return [...t1, ...t2, ...t3, ...t4, ...t5];
}

// Backward-compatible export
export const AQUARIUM_LEVELS = AQUARIUM_CHAPTERS;
export type AquariumLevel = AquariumChapter;

// Helper to generate 3 close options including the correct answer
function generateOptions(correctCount: number): number[] {
  const correct = clampFishCount(correctCount);
  let distractors: number[] = [];

  if (correct === 1) {
    distractors = [2, 3];
  } else if (correct === 2) {
    distractors = Math.random() < 0.5 ? [1, 3] : [3, 4];
  } else if (correct === 12) {
    // Exactly as in prompt example for 12: 🔵 10   🔵 11   🔵 12
    distractors = [10, 11];
  } else if (correct === 11) {
    distractors = [10, 12];
  } else if (correct === 10) {
    // As in prompt example for 10: 🔵 9 🔵 10 🔵 11 or 🔵 8 🔵 10 🔵 12
    distractors = Math.random() < 0.5 ? [9, 11] : [8, 12];
  } else {
    // General case: pick adjacent numbers [correct-1, correct+1] or [correct-2, correct+2]
    const variant = Math.random();
    if (variant < 0.65) {
      distractors = [correct - 1, correct + 1];
    } else if (variant < 0.85 && correct - 2 >= 1) {
      distractors = [correct - 2, correct + 2];
    } else if (correct - 2 >= 1) {
      distractors = [correct - 2, correct - 1];
    } else {
      distractors = [correct + 1, correct + 2];
    }
  }

  // Ensure unique distractors, distinct from correct
  const uniqueDistractors = Array.from(new Set(distractors.filter((d) => d !== correct && d >= 1)));
  while (uniqueDistractors.length < 2) {
    const candidate = Math.max(1, correct + (uniqueDistractors.length === 0 ? 1 : -1));
    if (!uniqueDistractors.includes(candidate) && candidate !== correct) {
      uniqueDistractors.push(candidate);
    } else {
      uniqueDistractors.push(candidate + 2);
    }
  }

  const options = [correct, uniqueDistractors[0], uniqueDistractors[1]];
  return options.sort(() => Math.random() - 0.5);
}

// 12 Spatial Aquarium Grid Sectors (4 columns x 3 rows) for balanced distribution
const AQUARIUM_SECTORS = [
  { x: 14, y: 22 },
  { x: 38, y: 20 },
  { x: 62, y: 24 },
  { x: 86, y: 21 },

  { x: 18, y: 48 },
  { x: 42, y: 50 },
  { x: 66, y: 46 },
  { x: 84, y: 52 },

  { x: 15, y: 74 },
  { x: 36, y: 72 },
  { x: 60, y: 76 },
  { x: 82, y: 70 },
];

export const Activity7RocketLaunch: React.FC<Activity7Props> = ({
  soundEnabled,
  onComplete,
  onSoundToggle,
}) => {
  // Game Navigation State: 15 Chapters with dynamically randomized non-rhythmic counts
  const [hasStarted, setHasStarted] = useState(false);
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const [chapterCounts, setChapterCounts] = useState<number[]>(() => generateRandomChapterFishCounts());
  const chapterCountsRef = useRef<number[]>(chapterCounts);
  chapterCountsRef.current = chapterCounts;

  const [score, setScore] = useState(0);

  // Active Question Data
  const [targetCount, setTargetCount] = useState<number>(2);
  const [fishList, setFishList] = useState<FishItem[]>([]);
  const [options, setOptions] = useState<number[]>([1, 2, 3]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answerStatus, setAnswerStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

  // Modals & Feedback
  const [bannerMessage, setBannerMessage] = useState<{
    text: string;
    type: 'success' | 'warning' | 'info';
  } | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [isGameFinishedModal, setIsGameFinishedModal] = useState(false);
  const [showRightClickHint, setShowRightClickHint] = useState(false);

  // DOM Refs for 60fps direct transforms (Smooth Swimming)
  const fishDomRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const fishBodyRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const fishPhysicsRef = useRef<FishPhysics[]>([]);

  const currentChapter = AQUARIUM_CHAPTERS[currentChapterIdx] || AQUARIUM_CHAPTERS[0];

  // ----------------------------------------------------
  // QUESTION GENERATOR (15 BÖLÜM - BASİTTEN ZORA HER GİRİŞTE RASTGELE KARMA SIRA, MAKS: 12)
  // ----------------------------------------------------
  const generateNewQuestion = useCallback((chapterIdx: number, customSequence?: number[]) => {
    const safeIdx = Math.max(0, Math.min(AQUARIUM_CHAPTERS.length - 1, chapterIdx));
    const ch = AQUARIUM_CHAPTERS[safeIdx];
    const seq = customSequence || chapterCountsRef.current;
    const target = seq[safeIdx] !== undefined ? seq[safeIdx] : ch.fishCount;
    const count = clampFishCount(target);

    // Shuffle 12 sectors to pick `count` distinct sectors
    const shuffledSectors = [...AQUARIUM_SECTORS].sort(() => Math.random() - 0.5);
    const pickedSectors = shuffledSectors.slice(0, count);

    // Shuffle distinct species so each fish has vibrant colors
    const shuffledSpecies = [...FISH_SPECIES].sort(() => Math.random() - 0.5);

    // Generate fish items with organic variations and serene, slow swimming speed
    const newFishList: FishItem[] = pickedSectors.map((sector, i) => {
      const species = shuffledSpecies[i % shuffledSpecies.length];
      const direction: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
      const speed = 0.55 + Math.random() * 0.35; // 0.55% to 0.90% width per second (extra slow, serene, very easy for students to count)

      // Jitter start positions slightly
      const jitterX = (Math.random() - 0.5) * 6;
      const jitterY = (Math.random() - 0.5) * 5;

      const initX = Math.max(10, Math.min(86, sector.x + jitterX));
      const initY = Math.max(18, Math.min(78, sector.y + jitterY));

      return {
        id: `fish_${safeIdx}_${i}_${Date.now()}`,
        index: i + 1,
        species,
        initialX: initX,
        initialY: initY,
        direction,
        speed,
        isMarked: false,
      };
    });

    // Populate physics ref for animation loop
    fishPhysicsRef.current = newFishList.map((f) => ({
      id: f.id,
      x: f.initialX,
      y: f.initialY,
      baseY: f.initialY,
      vx: f.speed,
      direction: f.direction,
      bobPhase: Math.random() * Math.PI * 2,
      bobSpeed: 0.45 + Math.random() * 0.25,
    }));

    // Generate 3 options (including correct)
    const newOptions = generateOptions(count);

    setTargetCount(count);
    setFishList(newFishList);
    setOptions(newOptions);
    setSelectedOption(null);
    setAnswerStatus('idle');

    setBannerMessage({
      text: `🖱️ Bölüm ${ch.chapterNum}: Balıkları say! Doğru sayıya mouse'unun SAĞ TUŞUYLA (sağ tık) tıkla.`,
      type: 'info',
    });
  }, []);

  // Initialize on game start with fresh randomized sequence
  useEffect(() => {
    if (hasStarted) {
      const freshSequence = generateRandomChapterFishCounts();
      setChapterCounts(freshSequence);
      chapterCountsRef.current = freshSequence;
      setCurrentChapterIdx(0);
      generateNewQuestion(0, freshSequence);
    }
  }, [hasStarted, generateNewQuestion]);

  // ----------------------------------------------------
  // CONTINUOUS 60FPS SWIMMING LOOP (EKRANDAN ÇIKMADAN SAĞA SOLA YÜZME)
  // ----------------------------------------------------
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      fishPhysicsRef.current.forEach((fish) => {
        // Advance horizontal position slowly
        fish.x += fish.direction * fish.vx * dt;

        // Gentle sine-wave vertical bobbing without cumulative drift
        fish.bobPhase += dt * fish.bobSpeed;
        const bobOffset = Math.sin(fish.bobPhase) * 1.5;
        fish.y = Math.max(16, Math.min(78, fish.baseY + bobOffset));

        // Smooth turnaround at boundaries so fish never leaves screen!
        if (fish.direction === 1 && fish.x >= 88) {
          fish.direction = -1;
        } else if (fish.direction === -1 && fish.x <= 8) {
          fish.direction = 1;
        }

        // Direct DOM update for buttery 60fps performance
        const el = fishDomRefs.current[fish.id];
        if (el) {
          el.style.left = `${fish.x}%`;
          el.style.top = `${fish.y}%`;
        }

        const bodyEl = fishBodyRefs.current[fish.id];
        if (bodyEl) {
          // Standard fish emoji faces LEFT.
          // When moving right (direction === 1), scaleX(-1) makes it face right.
          // When moving left (direction === -1), scaleX(1) makes it face left.
          bodyEl.style.transform = `scaleX(${fish.direction === 1 ? -1 : 1})`;
        }
      });

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [fishList]);

  // Warning when student left-clicks instead of right-clicking
  const handleLeftClickWarning = useCallback(() => {
    soundEffects.playGentleBoing(soundEnabled);
    speakTurkishText('Mouse un sağ tuşuna tıkla!');
    setBannerMessage({
      text: "🖱️ Dikkat: Bu oyunda SAĞ TUŞ (sağ tık) kullanmalısın! Sol tık çalışmaz.",
      type: 'warning',
    });
    setShowRightClickHint(true);
    setTimeout(() => setShowRightClickHint(false), 2200);
  }, [soundEnabled]);

  // Right-click on a fish in the aquarium to mark/count it
  const handleToggleFishMark = (fishId: string) => {
    soundEffects.playPop(soundEnabled);
    setFishList((prev) => {
      const targetFish = prev.find((f) => f.id === fishId);
      if (!targetFish) return prev;

      if (targetFish.isMarked) {
        return prev.map((f) => (f.id === fishId ? { ...f, isMarked: false, markedNumber: undefined } : f));
      } else {
        const markedCount = prev.filter((f) => f.isMarked).length;
        const nextNum = markedCount + 1;
        return prev.map((f) => (f.id === fishId ? { ...f, isMarked: true, markedNumber: nextNum } : f));
      }
    });
  };

  // Reset all counting marks on fish
  const handleResetMarks = () => {
    soundEffects.playPop(soundEnabled);
    setFishList((prev) => prev.map((f) => ({ ...f, isMarked: false, markedNumber: undefined })));
  };

  // Right-click to Select Answer Option
  const handleSelectOption = (chosenNum: number) => {
    if (answerStatus === 'correct') return;

    setSelectedOption(chosenNum);

    // Speak only the number as requested
    const turkishWord = TURKISH_NUMBERS[chosenNum] || String(chosenNum);
    speakTurkishText(turkishWord);

    if (chosenNum === targetCount) {
      // CORRECT ANSWER!
      setAnswerStatus('correct');
      soundEffects.playStar(soundEnabled);
      setScore((s) => s + 20);

      const nextChapterIdx = currentChapterIdx + 1;
      const isFinished = nextChapterIdx >= AQUARIUM_CHAPTERS.length;

      setBannerMessage({
        text: isFinished
          ? `🏆 Harika! 15. Bölümü de bildin! Muhteşemsin!`
          : `⭐ Doğru! Akvaryumda tam ${targetCount} (${turkishWord}) balık var! Bölüm ${currentChapter.chapterNum + 1}'e geçiliyor...`,
        type: 'success',
      });

      confetti({
        particleCount: isFinished ? 120 : 40,
        spread: isFinished ? 90 : 60,
        origin: { y: 0.7 },
      });

      setTimeout(() => {
        if (!isFinished) {
          setCurrentChapterIdx(nextChapterIdx);
          generateNewQuestion(nextChapterIdx);
        } else {
          handleAllChaptersComplete();
        }
      }, 1300);
    } else {
      // WRONG ANSWER
      setAnswerStatus('wrong');
      soundEffects.playGentleBoing(soundEnabled);

      setBannerMessage({
        text: `🔍 Akvaryumda ${chosenNum} balık yok. Balıkları tekrar sayıp SAĞ TUŞLA dene!`,
        type: 'warning',
      });

      setTimeout(() => {
        setAnswerStatus('idle');
        setSelectedOption(null);
      }, 1500);
    }
  };

  // 15 Chapters Completed
  const handleAllChaptersComplete = () => {
    soundEffects.playDropSuccess(soundEnabled);
    setTimeout(() => {
      setIsGameFinishedModal(true);
      soundEffects.playFanfare(soundEnabled);
      confetti({
        particleCount: 160,
        spread: 100,
        origin: { y: 0.6 },
      });
      onComplete(3, score + 100);
    }, 400);
  };

  const handleRestartCurrentChapter = () => {
    soundEffects.playPop(soundEnabled);
    generateNewQuestion(currentChapterIdx);
  };

  const handleResetEntireGame = () => {
    soundEffects.playPop(soundEnabled);
    setIsGameFinishedModal(false);
    const freshSequence = generateRandomChapterFishCounts();
    setChapterCounts(freshSequence);
    chapterCountsRef.current = freshSequence;
    setCurrentChapterIdx(0);
    setScore(0);
    generateNewQuestion(0, freshSequence);
  };

  // ----------------------------------------------------
  // 1. WELCOME SCREEN
  // ----------------------------------------------------
  if (!hasStarted) {
    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center py-6 px-4 select-none">
        <div className="w-full bg-gradient-to-b from-sky-500 via-cyan-600 to-blue-800 rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden flex flex-col items-center text-center border-4 border-cyan-300">
          {/* Animated decorative water bubbles */}
          <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-white absolute top-10 left-12 animate-bounce" />
            <div className="w-12 h-12 rounded-full bg-white absolute bottom-16 right-20 animate-pulse" />
            <div className="w-6 h-6 rounded-full bg-white absolute top-1/2 right-1/4 animate-bounce" />
          </div>

          {/* Aquarium Icon Badge */}
          <div className="relative mb-4">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/20 backdrop-blur-md border-3 border-cyan-200 flex items-center justify-center text-5xl sm:text-6xl shadow-xl relative animate-pulse">
              🐠
              <div className="absolute -bottom-2 -right-2 bg-amber-400 text-amber-950 p-1.5 rounded-full border-2 border-white shadow-md text-base font-black">
                12
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 bg-cyan-400/30 text-cyan-100 border border-cyan-200/50 px-4 py-1.5 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-cyan-200" />
              15 Bölümlü Akvaryum (Basitten Zora, Maks. 12 Balık)
            </span>
            <span className="inline-flex items-center gap-1.5 bg-amber-400 text-amber-950 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider shadow-sm">
              <MousePointer2 className="w-4 h-4" />
              SAĞ TIK (Right-Click) İle Çalışır
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-2 drop-shadow-sm">
            AKVARYUMDA BALIK SAYMA 🐠🫧
          </h1>

          <p className="text-base sm:text-xl font-bold text-cyan-100 mb-6 italic">
            "1. bölümden 15. bölüme kadar akvaryumda yüzen sevimli balıkları say, SAĞ TUŞLA doğru sayıyı seç!"
          </p>

          {/* 3 Step Guide Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-2xl w-full text-left mb-8">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
              <span className="text-2xl mb-1 block">👀 1. Adım</span>
              <h4 className="font-black text-sm text-amber-300">15 Bölüm Boyunca Say</h4>
              <p className="text-xs text-cyan-100 font-medium mt-1">
                Basitten zora doğru 15 farklı bölümde balıkları dikkatle say.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
              <span className="text-2xl mb-1 block">🖱️ 2. Adım</span>
              <h4 className="font-black text-sm text-amber-300">SAĞ TUŞ Kuralı</h4>
              <p className="text-xs text-cyan-100 font-medium mt-1">
                Sol tık çalışmaz! Seçeneklere ve balıklara mouse’un SAĞ tuşuyla tıkla.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
              <span className="text-2xl mb-1 block">🎯 3. Adım</span>
              <h4 className="font-black text-sm text-amber-300">15. Bölüm Şampiyonluğu</h4>
              <p className="text-xs text-cyan-100 font-medium mt-1">
                Tüm bölümleri tamamla ve Sağ Tık & Balık Dedektifi Şampiyonu ol!
              </p>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={() => {
              soundEffects.playPop(soundEnabled);
              setHasStarted(true);
            }}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black text-base sm:text-lg shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer border-3 border-emerald-300 flex items-center gap-2"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>AKVARYUMA GİRİŞ YAP 🚀</span>
          </button>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // 2. ACTIVE GAME SCREEN
  // ----------------------------------------------------
  return (
    <div
      className="w-full max-w-5xl mx-auto flex flex-col items-center py-2 sm:py-4 px-2 sm:px-4 select-none relative"
      onDragStart={(e) => e.preventDefault()}
      onContextMenu={(e) => {
        // Prevent default browser context menu globally in game playfield
        e.preventDefault();
      }}
    >
      {/* TOP HEADER CONTROLS */}
      <div className="w-full bg-white rounded-3xl border-3 border-cyan-200 shadow-md p-4 sm:p-5 mb-3 sm:mb-4 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-3">
          {/* Title & Stage */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-600 text-white flex items-center justify-center text-2xl shadow-xs font-black">
              🐠
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-xl font-black text-slate-800 tracking-tight">
                  Akvaryumda Balık Sayma
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border ${currentChapter.badgeBg}`}>
                  {currentChapter.badgeText}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                  🖱️ SAĞ TIKLA
                </span>
              </div>
              <p className="text-xs font-bold text-slate-500">
                Akvaryumdaki balıkları say, doğru sayı seçeneğine mouse'unun <strong>SAĞ TUŞUYLA</strong> tıkla!
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => speakTurkishText(`Bölüm ${currentChapter.chapterNum}. ${currentChapter.hintText}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-50 text-cyan-800 hover:bg-cyan-100 border border-cyan-200 text-xs font-black transition-colors cursor-pointer"
              title="Bölüm İpucunu Sesli Dinle"
            >
              <Volume2 className="w-4 h-4 text-cyan-700" />
              <span className="hidden sm:inline">Sesli İpucu</span>
            </button>

            <button
              onClick={handleRestartCurrentChapter}
              className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 text-xs font-bold transition-colors cursor-pointer"
              title="Bu Bölümü Yeniden Başlat"
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

        {/* STATUS BAR: Chapter Progress & Score */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-cyan-900 bg-cyan-50 border border-cyan-200 px-3 py-1 rounded-xl shadow-xs">
              🎯 Bölüm: {currentChapter.chapterNum} / 15
            </span>
            <span className={`text-xs font-black px-3 py-1 rounded-xl border shadow-xs ${currentChapter.badgeBg}`}>
              {currentChapter.badgeText}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* 15 Bölüm Progress Bar */}
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-[10px] font-black text-slate-500 uppercase">İlerleme:</span>
              <div className="w-24 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300"
                  style={{ width: `${Math.round(((currentChapterIdx + 1) / AQUARIUM_CHAPTERS.length) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] font-black text-cyan-700 ml-1">
                %{Math.round(((currentChapterIdx + 1) / AQUARIUM_CHAPTERS.length) * 100)}
              </span>
            </div>

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
        {bannerMessage && (
          <div
            className={`mt-2.5 py-1.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between transition-all ${
              bannerMessage.type === 'success'
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                : bannerMessage.type === 'warning'
                ? 'bg-amber-100 text-amber-900 border border-amber-200 animate-pulse'
                : 'bg-cyan-50 text-cyan-900 border border-cyan-200'
            }`}
          >
            <span>{bannerMessage.text}</span>
            <button
              onClick={() => speakTurkishText(`Akvaryumda kaç tane balık var? Say ve SAĞ TUŞLA doğru sayıyı seç!`)}
              className="text-[11px] font-bold text-cyan-700 hover:text-cyan-900 flex items-center gap-1 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Soruyu Dinle</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. MAIN AQUARIUM PLAYFIELD (BALIKLAR EKRANDAN ÇIKMADAN SAĞA SOLA YÜZÜYOR) */}
      <div className="w-full relative bg-gradient-to-b from-sky-400 via-cyan-600 to-blue-900 rounded-3xl border-4 border-cyan-300 shadow-2xl p-4 sm:p-6 min-h-[380px] sm:min-h-[440px] overflow-hidden flex flex-col justify-between select-none">
        {/* Aquarium Glass Highlight / Sun Rays */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/15 pointer-events-none" />

        {/* Water Surface Ripples / Light Beams */}
        <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />

        {/* Animated Water Bubbles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute bottom-4 left-1/5 w-4 h-4 rounded-full bg-white/30 animate-pulse" />
          <div className="absolute bottom-10 left-2/5 w-6 h-6 rounded-full bg-white/20 animate-pulse" />
          <div className="absolute bottom-6 right-1/4 w-5 h-5 rounded-full bg-white/25 animate-pulse" />
          <div className="absolute bottom-16 right-1/8 w-3 h-3 rounded-full bg-white/40 animate-pulse" />
        </div>

        {/* Aquarium Bottom Elements: Sand, Seaweed, Starfish */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-amber-200/90 via-amber-100/70 to-transparent pointer-events-none flex items-end justify-between px-6 pb-2">
          <div className="text-3xl sm:text-4xl filter drop-shadow-sm select-none opacity-90 animate-pulse">
            🌿🪸
          </div>
          <div className="flex items-center gap-4 text-2xl select-none opacity-85">
            <span>⭐</span>
            <span>🐚</span>
            <span>🪸</span>
          </div>
          <div className="text-3xl sm:text-4xl filter drop-shadow-sm select-none opacity-90 animate-pulse">
            🪸🌿
          </div>
        </div>

        {/* Aquarium Header Info Badge inside tank */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/30 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-xs">
            <span>🌊 Akvaryum</span>
            <span className="text-cyan-100 text-xs font-semibold">
              (İpucu: Sayarken balıklara <strong>SAĞ TIKLAYABİLİRSİN</strong>)
            </span>
          </div>

          {/* Reset Markings Button */}
          {fishList.some((f) => f.isMarked) && (
            <button
              onClick={handleResetMarks}
              className="bg-white/25 hover:bg-white/35 backdrop-blur-md px-3 py-1 rounded-full border border-white/40 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              title="İşaretlenen sayıları sıfırla"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Sayıları Temizle</span>
            </button>
          )}
        </div>

        {/* FISH CONTAINER: Swimming Back and Forth without Exiting Screen (Max 12 strictly) */}
        <div className="relative w-full h-[270px] sm:h-[310px] z-10 overflow-hidden">
          {fishList.map((fish) => {
            return (
              <div
                key={fish.id}
                ref={(el) => {
                  fishDomRefs.current[fish.id] = el;
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleToggleFishMark(fish.id);
                }}
                onClick={(e) => {
                  e.preventDefault();
                  handleLeftClickWarning();
                }}
                style={{
                  position: 'absolute',
                  left: `${fish.initialX}%`,
                  top: `${fish.initialY}%`,
                  transform: 'translate(-50%, -50%)',
                  cursor: 'context-menu',
                }}
                className="group select-none"
                title={`${fish.species.name} (SAĞ TIKLA ve say)`}
              >
                <div className="relative flex items-center justify-center transition-transform group-hover:scale-125 active:scale-95">
                  {/* Fish Emoji Body with facing direction */}
                  <span
                    ref={(el) => {
                      fishBodyRefs.current[fish.id] = el;
                    }}
                    className="text-4xl sm:text-5xl select-none inline-block drop-shadow-md transition-transform duration-150"
                    style={{
                      transform: `scaleX(${fish.direction === 1 ? -1 : 1})`,
                    }}
                  >
                    {fish.species.emoji}
                  </span>

                  {/* Number Badge if child right-clicked to count */}
                  {fish.isMarked && (
                    <div className="absolute -top-3.5 -right-2.5 w-6 h-6 rounded-full bg-amber-400 border-2 border-white text-amber-950 font-black text-xs flex items-center justify-center shadow-md animate-scale-in">
                      {fish.markedNumber}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* NO BOTTOM QUESTION BAR - (Removed per prompt instruction: "altta artık bu akvaryumda kaç tane balık var diye sormasın") */}
      </div>

      {/* 4. THREE ANSWER OPTIONS (SAĞ TIK İLE ÇALIŞIR, SOL TIK UYARIR) */}
      <div className="w-full bg-white rounded-3xl border-3 border-cyan-200 p-4 sm:p-6 mt-3 shadow-md relative">
        {/* Right-Click Reminder Banner if left click attempted */}
        {showRightClickHint && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-white font-black text-xs px-4 py-1 rounded-full shadow-lg border-2 border-white animate-bounce z-30 flex items-center gap-1.5">
            <MousePointer2 className="w-3.5 h-3.5" />
            <span>SOL TIK DEĞİL, SAĞ TUŞLA TIKLA! 🖱️</span>
          </div>
        )}

        <div className="text-center mb-3 flex items-center justify-center gap-2">
          <span className="text-xs font-black text-slate-600 uppercase tracking-wider">
            🔢 Doğru Sayı Seçeneğine
          </span>
          <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 border border-amber-500 uppercase tracking-wider animate-pulse flex items-center gap-1">
            <MousePointer2 className="w-3 h-3" />
            SAĞ TUŞLA TIKLA
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-2xl mx-auto">
          {options.map((optionNum) => {
            const isSelected = selectedOption === optionNum;
            const isCorrectChoice = isSelected && answerStatus === 'correct';
            const isWrongChoice = isSelected && answerStatus === 'wrong';

            return (
              <button
                key={`opt_${optionNum}`}
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleSelectOption(optionNum);
                }}
                onClick={(e) => {
                  e.preventDefault();
                  handleLeftClickWarning();
                }}
                disabled={answerStatus === 'correct'}
                className={`w-full py-4 sm:py-5 px-3 rounded-2xl sm:rounded-3xl border-3 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 transition-all duration-200 select-none cursor-context-menu relative ${
                  isCorrectChoice
                    ? 'bg-emerald-500 border-emerald-600 text-white shadow-lg scale-105'
                    : isWrongChoice
                    ? 'bg-rose-100 border-rose-400 text-rose-800 animate-shake scale-95'
                    : 'bg-white hover:bg-cyan-50 border-slate-200 hover:border-cyan-500 shadow-sm hover:shadow-md hover:scale-102 active:scale-95'
                }`}
              >
                {/* Prominent Blue Dot (🔵) as described in prompt */}
                <div
                  className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                    isCorrectChoice
                      ? 'bg-white text-emerald-700 text-sm font-black border-white'
                      : isWrongChoice
                      ? 'bg-rose-500 text-white text-sm font-black border-white'
                      : 'bg-blue-100 border-blue-400 text-blue-600 group-hover:scale-105'
                  }`}
                >
                  {isCorrectChoice ? (
                    '✓'
                  ) : (
                    <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-600 block shadow-xs" />
                  )}
                </div>

                {/* Big Readable Number */}
                <span
                  className={`text-2xl sm:text-4xl font-black tracking-tight ${
                    isCorrectChoice ? 'text-white' : 'text-slate-800'
                  }`}
                >
                  {optionNum}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MODAL: HELP MODAL */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border-4 border-cyan-400 p-6 sm:p-8 shadow-2xl relative animate-scale-in">
            <button
              onClick={() => setShowHelpModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center text-2xl font-black shrink-0">
                🐠
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800">
                  Akvaryumda Balık Sayma – Nasıl Oynanır?
                </h3>
                <p className="text-xs font-bold text-cyan-600">
                  Sağ Tık (Right-Click) & 15 Bölümlü Görsel Sayma
                </p>
              </div>
            </div>

            <div className="space-y-3 text-slate-700 text-xs sm:text-sm font-medium mb-6">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-300">
                <strong>🖱️ SAĞ TIK KURALI:</strong> Bu oyunda seçenekleri seçmek ve balıkları saymak için mouse’unun <strong>SAĞ TUŞUNA</strong> tıklamalısın! Sol tık çalışmaz.
              </div>
              <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-200">
                <strong>1. 15 Bölüm Boyunca İlerle:</strong> 1. bölümden 15. bölüme kadar balık sayıları basitten zora doğru karma olarak sunulur.
              </div>
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                <strong>2. Balıklara Sağ Tıkla:</strong> Balıklara da sağ tıklayarak üzerlerine 1, 2, 3 gibi sayı baloncukları koyabilirsin.
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <strong>3. Doğru Sayıya Sağ Tıkla:</strong> Altta bulunan 3 seçenek arasından saydığın miktarın kutucuğuna SAĞ TUŞLA tıkla.
              </div>
              <div className="p-3 rounded-xl bg-slate-100 border border-slate-300">
                <strong>4. Kesin Sınır:</strong> Akvaryumda hiçbir zaman 12'den fazla balık bulunmaz! (Maksimum balık sayısı 12'dir).
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-black text-sm transition-colors cursor-pointer shadow-md"
            >
              Anladım, Oyuna Dön!
            </button>
          </div>
        </div>
      )}

      {/* MODAL: GRAND FINALE GAME COMPLETED (15 BÖLÜM TAMAMLANDI) */}
      {isGameFinishedModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border-4 border-amber-400 p-6 sm:p-8 shadow-2xl text-center relative animate-scale-in">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 flex items-center justify-center text-4xl mx-auto mb-3 shadow-lg border-2 border-white">
              🏆
            </div>

            <span className="inline-block px-3.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black uppercase tracking-wider mb-2">
              MEZUNİYET: SAĞ TIK VE BALIK SAYMA ŞAMPİYONU!
            </span>

            <h3 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2">
              15 BÖLÜMÜ DE TAMAMLADIN! 🐠🎉
            </h3>

            <p className="text-sm sm:text-base font-bold text-slate-600 mb-4">
              1. bölümden 15. bölüme kadar tüm balıkları başarıyla saydın ve mouse SAĞ TUŞUNU harika bir şekilde kullanarak gerçek bir şampiyon oldun!
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

            <div className="bg-cyan-50 rounded-2xl p-3 border border-cyan-200 mb-6 flex items-center justify-center gap-3">
              <span className="text-3xl">🐠</span>
              <div className="text-left">
                <span className="text-[10px] font-bold text-cyan-600 uppercase block">Kazanılan Rozet:</span>
                <span className="text-sm font-black text-cyan-950">Sağ Tık & Balık Dedektifi</span>
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
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-black text-sm transition-all cursor-pointer shadow-md"
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

// Also export as Activity7FishCount for clean naming
export const Activity7FishCount = Activity7RocketLaunch;
