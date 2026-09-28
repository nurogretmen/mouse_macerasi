import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  Sparkles,
  Trophy,
  CheckCircle2,
  ChevronRight,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Lightbulb,
  Clock,
  HelpCircle,
  X,
  MousePointer,
  Award,
  Zap,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEffects } from '../../utils/audio.ts';

interface Activity10Props {
  soundEnabled: boolean;
  onComplete: (stars: number, score: number) => void;
  onSoundToggle: () => void;
}

// Detective Object Types
type ShapeType = 'star' | 'circle' | 'triangle' | 'square' | 'heart';
type ColorType = 'red' | 'blue' | 'yellow' | 'green' | 'purple';
type AnimalType = 'cat' | 'dog' | 'rabbit' | 'panda' | 'fox' | 'frog';
type AccessoryType = 'none' | 'hat' | 'glasses' | 'bow';
type ObjectKind = 'shape' | 'animal' | 'odd_one';

interface DetectiveObject {
  id: string;
  kind: ObjectKind;
  shape?: ShapeType;
  color: ColorType;
  animal?: AnimalType;
  accessory?: AccessoryType;
  size?: 'normal' | 'small';
  isOddVariant?: boolean;
  oddVariantType?: 'color' | 'winking' | 'sparkle';
  isTarget: boolean;
  found: boolean;
  shake?: boolean;
}

interface LevelMission {
  levelNum: number;
  stageName: string;
  title: string;
  subtitle: string;
  missionText: string;
  descriptionText: string;
  hintText: string;
  targetPreview: DetectiveObject;
  subRoundTotal?: number;
  subRoundIndex?: number;
  hasTimer?: boolean;
  timeLimitSeconds?: number;
  badgeName: string;
  badgeIcon: string;
  generateObjects: (subRound: number) => DetectiveObject[];
  successMessage: string;
}

// Turkish Text-to-Speech Helper for young primary school kids
const speakTurkishText = (text: string) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'tr-TR';
    utterance.rate = 0.92;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  } catch {
    // Ignore speech error if blocked or unsupported
  }
};

// Cheerful feedback message lists
const CORRECT_MESSAGES = [
  'Harika!',
  'Doğru hedef!',
  'Çok iyi yakaladın!',
  'Dedektif gözlerin çalışıyor!',
  'Bir tane daha buldun!',
  'Süper!',
  'Dikkatin çok iyi!',
  'Doğru hedefi buldun!',
];

const WRONG_MESSAGES = [
  'Bu nesne değil. İpucuna tekrar bak.',
  'Bir daha dikkatlice incele.',
  'Aradığın nesnenin rengini kontrol et.',
  'Şekline biraz daha dikkat et.',
  'Dedektif, ipucunu tekrar kontrol et!',
  'Biraz daha yakından bak, doğru hedef seni bekliyor!',
];

// Helper colors for rendering
const COLOR_HEX: Record<ColorType, { fill: string; stroke: string; label: string; bg: string }> = {
  red: { fill: '#ef4444', stroke: '#b91c1c', label: 'Kırmızı', bg: 'bg-red-50 text-red-700 border-red-200' },
  blue: { fill: '#3b82f6', stroke: '#1d4ed8', label: 'Mavi', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  yellow: { fill: '#eab308', stroke: '#ca8a04', label: 'Sarı', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  green: { fill: '#22c55e', stroke: '#15803d', label: 'Yeşil', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  purple: { fill: '#a855f7', stroke: '#7e22ce', label: 'Mor', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
};

// SVG shapes renderer
const ObjectGraphic: React.FC<{
  obj: DetectiveObject;
  isHovered?: boolean;
}> = ({ obj }) => {
  const c = COLOR_HEX[obj.color];
  const isSmall = obj.size === 'small';
  const dim = isSmall ? 48 : 64;

  if (obj.kind === 'shape') {
    switch (obj.shape) {
      case 'star':
        return (
          <svg width={dim} height={dim} viewBox="0 0 64 64" className="filter drop-shadow-sm transition-transform">
            <polygon
              points="32,4 40,22 60,24 45,38 49,58 32,48 15,58 19,38 4,24 24,22"
              fill={c.fill}
              stroke={c.stroke}
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Cute glossy highlight */}
            <circle cx="28" cy="24" r="3.5" fill="#ffffff" opacity="0.75" />
            {obj.oddVariantType === 'winking' && (
              <g stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round">
                <line x1="24" y1="34" x2="30" y2="34" />
                <circle cx="38" cy="34" r="2.5" fill="#ffffff" />
                <path d="M 28 42 Q 32 46 36 42" fill="none" />
              </g>
            )}
            {obj.oddVariantType === 'sparkle' && (
              <circle cx="44" cy="18" r="4.5" fill="#ffffff" className="animate-ping" />
            )}
          </svg>
        );

      case 'triangle':
        return (
          <svg width={dim} height={dim} viewBox="0 0 64 64" className="filter drop-shadow-sm transition-transform">
            <polygon
              points="32,8 58,54 6,54"
              fill={c.fill}
              stroke={c.stroke}
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <circle cx="28" cy="32" r="3" fill="#ffffff" opacity="0.7" />
          </svg>
        );

      case 'square':
        return (
          <svg width={dim} height={dim} viewBox="0 0 64 64" className="filter drop-shadow-sm transition-transform">
            <rect
              x="10"
              y="10"
              width="44"
              height="44"
              rx="10"
              fill={c.fill}
              stroke={c.stroke}
              strokeWidth="3.5"
            />
            <circle cx="22" cy="22" r="3" fill="#ffffff" opacity="0.7" />
          </svg>
        );

      case 'heart':
        return (
          <svg width={dim} height={dim} viewBox="0 0 64 64" className="filter drop-shadow-sm transition-transform">
            <path
              d="M32,54 C32,54 8,38 8,22 C8,13 15,7 24,7 C28.5,7 31.5,9.5 32,11 C32.5,9.5 35.5,7 40,7 C49,7 56,13 56,22 C56,38 32,54 32,54 Z"
              fill={c.fill}
              stroke={c.stroke}
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <circle cx="24" cy="18" r="3" fill="#ffffff" opacity="0.7" />
          </svg>
        );

      case 'circle':
      default:
        return (
          <svg width={dim} height={dim} viewBox="0 0 64 64" className="filter drop-shadow-sm transition-transform">
            <circle
              cx="32"
              cy="32"
              r="24"
              fill={c.fill}
              stroke={c.stroke}
              strokeWidth="3.5"
            />
            <circle cx="24" cy="22" r="4" fill="#ffffff" opacity="0.75" />
          </svg>
        );
    }
  }

  // Animal rendering with accessories
  const animalEmojiMap: Record<AnimalType, string> = {
    cat: '🐱',
    dog: '🐶',
    rabbit: '🐰',
    panda: '🐼',
    fox: '🦊',
    frog: '🐸',
  };

  const emoji = obj.animal ? animalEmojiMap[obj.animal] : '🐱';

  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{ width: dim, height: dim }}
    >
      <span className={isSmall ? 'text-3xl' : 'text-4xl'}>{emoji}</span>

      {/* Hat Accessory */}
      {obj.accessory === 'hat' && (
        <span
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-2xl filter drop-shadow-md animate-bounce"
          style={{ animationDuration: '2s' }}
        >
          🎩
        </span>
      )}

      {/* Glasses Accessory */}
      {obj.accessory === 'glasses' && (
        <span className="absolute top-2 left-1/2 -translate-x-1/2 text-xl filter drop-shadow-sm">
          👓
        </span>
      )}

      {/* Bowtie Accessory */}
      {obj.accessory === 'bow' && (
        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-lg filter drop-shadow-sm">
          🎀
        </span>
      )}
    </div>
  );
};

// LEVELS CONFIGURATION (EXACTLY 24 OBJECTS PER ROUND FOR 4 ROWS x 6 COLUMNS GRID)
const GAME_LEVELS: LevelMission[] = [
  // SEVİYE 1: RENK DEDEKTİFİ
  {
    levelNum: 1,
    stageName: 'Seviye 1 – Renk Dedektifi',
    title: 'Kırmızı Yıldızlar',
    subtitle: 'Renkleri Ayırt Et ve Tek Tıkla',
    missionText: 'Sadece kırmızı yıldızları bul!',
    descriptionText: 'Dedektif arkadaşım! Kalabalık odada farklı renklerde yıldızlar var. Sen sadece 5 adet kırmızı yıldızı bul ve sol fare tuşuyla bir kez tıkla!',
    hintText: 'Yıldızların renklerine dikkat et. Yalnızca parlak kırmızı renkte olan 5 yıldızı seç.',
    targetPreview: { id: 'prev_l1', kind: 'shape', shape: 'star', color: 'red', isTarget: true, found: false },
    badgeName: 'İlk Dedektiflik Görevi',
    badgeIcon: '🔎',
    successMessage: 'Harika! 5 kırmızı yıldızın tamamını buldun!',
    generateObjects: () => {
      // Exactly 24 items: 5 red stars (targets) + 7 blue + 6 yellow + 6 green = 24
      const list: DetectiveObject[] = [];
      let id = 1;
      for (let i = 0; i < 5; i++) {
        list.push({ id: `l1_red_${id++}`, kind: 'shape', shape: 'star', color: 'red', isTarget: true, found: false });
      }
      for (let i = 0; i < 7; i++) {
        list.push({ id: `l1_blue_${id++}`, kind: 'shape', shape: 'star', color: 'blue', isTarget: false, found: false });
      }
      for (let i = 0; i < 6; i++) {
        list.push({ id: `l1_yellow_${id++}`, kind: 'shape', shape: 'star', color: 'yellow', isTarget: false, found: false });
      }
      for (let i = 0; i < 6; i++) {
        list.push({ id: `l1_green_${id++}`, kind: 'shape', shape: 'star', color: 'green', isTarget: false, found: false });
      }
      return list.sort(() => Math.random() - 0.5);
    },
  },

  // SEVİYE 2: ŞEKİL DEDEKTİFİ
  {
    levelNum: 2,
    stageName: 'Seviye 2 – Şekil Dedektifi',
    title: 'Şekil Keşfi',
    subtitle: 'Farklı Şekilleri Ayırt Et',
    missionText: 'Sadece üçgenleri bul!',
    descriptionText: 'Harika gidiyorsun! Şimdi şekillere odaklanıyoruz. Kareler, daireler ve kalpler arasına saklanmış 5 üçgeni bulup tek tıkla!',
    hintText: 'Şekillerin köşelerine dikkat et. Üç köşesi olan üçgenleri tek tek tıkla.',
    targetPreview: { id: 'prev_l2', kind: 'shape', shape: 'triangle', color: 'blue', isTarget: true, found: false },
    subRoundTotal: 2,
    badgeName: 'Hedef Uzmanı',
    badgeIcon: '🎯',
    successMessage: 'Harika! Şekilleri çok iyi ayırt ediyorsun!',
    generateObjects: (subRound: number) => {
      // Exactly 24 items: 5 targets + 19 distractors = 24
      const list: DetectiveObject[] = [];
      let id = 1;
      const targetShape: ShapeType = subRound === 1 ? 'triangle' : 'star';
      const colors: ColorType[] = ['red', 'blue', 'yellow', 'green', 'purple'];

      // 5 targets
      for (let i = 0; i < 5; i++) {
        list.push({
          id: `l2_t_${id++}`,
          kind: 'shape',
          shape: targetShape,
          color: colors[i % colors.length],
          isTarget: true,
          found: false,
        });
      }

      // 19 distractors
      const distractors: ShapeType[] = subRound === 1
        ? ['square', 'circle', 'heart', 'star']
        : ['square', 'circle', 'heart', 'triangle'];

      for (let i = 0; i < 19; i++) {
        list.push({
          id: `l2_d_${id++}`,
          kind: 'shape',
          shape: distractors[i % distractors.length],
          color: colors[i % colors.length],
          isTarget: false,
          found: false,
        });
      }

      return list.sort(() => Math.random() - 0.5);
    },
  },

  // SEVİYE 3: RENK + ŞEKİL
  {
    levelNum: 3,
    stageName: 'Seviye 3 – Renk + Şekil',
    title: 'İkili Özellik',
    subtitle: 'Hem Renge Hem Şekle Dikkat Et',
    missionText: 'Sadece kırmızı yıldızları bul!',
    descriptionText: 'Dikkat! Bu seviyede iki özelliğe birden bakmalısın: Hem rengi KIRMIZI hem de şekli YILDIZ olmalı. Mavi yıldızlara veya kırmızı dairelere tıklama!',
    hintText: 'Hem kırmızı hem de yıldız olmalı! Kırmızı dairelere veya mavi yıldızlara tıklama.',
    targetPreview: { id: 'prev_l3', kind: 'shape', shape: 'star', color: 'red', isTarget: true, found: false },
    badgeName: 'Yıldız Avcısı',
    badgeIcon: '⭐',
    successMessage: 'Mükemmel! Renk ve şekli aynı anda harika takip ettin!',
    generateObjects: () => {
      // Exactly 24 items: 5 red stars + 19 distractors = 24
      const list: DetectiveObject[] = [];
      let id = 1;
      // 5 Red Stars (Targets)
      for (let i = 0; i < 5; i++) {
        list.push({ id: `l3_t_${id++}`, kind: 'shape', shape: 'star', color: 'red', isTarget: true, found: false });
      }
      // Distractors with same shape but wrong color (6 items)
      const wrongColorStars: ColorType[] = ['blue', 'yellow', 'green', 'purple', 'blue', 'yellow'];
      wrongColorStars.forEach((c) => {
        list.push({ id: `l3_d_star_${id++}`, kind: 'shape', shape: 'star', color: c, isTarget: false, found: false });
      });
      // Distractors with same color but wrong shape (8 items)
      const wrongShapeRed: ShapeType[] = ['circle', 'triangle', 'heart', 'square', 'circle', 'triangle', 'heart', 'square'];
      wrongShapeRed.forEach((s) => {
        list.push({ id: `l3_d_red_${id++}`, kind: 'shape', shape: s, color: 'red', isTarget: false, found: false });
      });
      // Other distractors (5 items) -> total = 5 + 6 + 8 + 5 = 24
      const otherShapes: { s: ShapeType; c: ColorType }[] = [
        { s: 'circle', c: 'blue' },
        { s: 'circle', c: 'yellow' },
        { s: 'triangle', c: 'green' },
        { s: 'square', c: 'purple' },
        { s: 'heart', c: 'blue' },
      ];
      otherShapes.forEach((o) => {
        list.push({ id: `l3_d_other_${id++}`, kind: 'shape', shape: o.s, color: o.c, isTarget: false, found: false });
      });
      return list.sort(() => Math.random() - 0.5);
    },
  },

  // SEVİYE 4: OLUMSUZ GÖREVLER
  {
    levelNum: 4,
    stageName: 'Seviye 4 – Olumsuz Görevler',
    title: 'Kırmızı Olmayanlar',
    subtitle: 'Tersine Dikkat ve Eleme Becerisi',
    missionText: 'Kırmızı olmayan yıldızları bul!',
    descriptionText: 'Tersine düşünme vakti! Yıldızlara dikkatle bak, ancak kırmızı olanları ASLA seçme. Mavi, sarı, yeşil ve mor renkteki 5 yıldızı bul!',
    hintText: 'Yıldızlara bak. Kırmızı olanları seçme, diğer renkteki yıldızlara tıkla.',
    targetPreview: { id: 'prev_l4', kind: 'shape', shape: 'star', color: 'blue', isTarget: true, found: false },
    badgeName: 'Dikkat Ustası',
    badgeIcon: '🧠',
    successMessage: 'Tebrikler! Olumsuz yönergeleri kavramada çok ustasın!',
    generateObjects: () => {
      // Exactly 24 items: 5 target non-red stars + 10 red stars + 9 other shapes = 24
      const list: DetectiveObject[] = [];
      let id = 1;
      const targetColors: ColorType[] = ['blue', 'yellow', 'green', 'purple', 'blue'];
      for (let i = 0; i < 5; i++) {
        list.push({ id: `l4_t_${id++}`, kind: 'shape', shape: 'star', color: targetColors[i], isTarget: true, found: false });
      }
      // 10 red stars (distractors)
      for (let i = 0; i < 10; i++) {
        list.push({ id: `l4_red_${id++}`, kind: 'shape', shape: 'star', color: 'red', isTarget: false, found: false });
      }
      // 9 other shapes (distractors)
      const shapes: ShapeType[] = ['circle', 'triangle', 'heart', 'square'];
      for (let i = 0; i < 9; i++) {
        list.push({ id: `l4_s_${id++}`, kind: 'shape', shape: shapes[i % shapes.length], color: targetColors[i % 5], isTarget: false, found: false });
      }
      return list.sort(() => Math.random() - 0.5);
    },
  },

  // SEVİYE 5: HAYVAN DEDEKTİFİ
  {
    levelNum: 5,
    stageName: 'Seviye 5 – Hayvan Dedektifi',
    title: 'Aksesuar Dedektifi',
    subtitle: 'Sevimli Hayvanların Aksesuarlarını Bul',
    missionText: 'Şapka takan hayvanları bul!',
    descriptionText: 'Sevimli hayvan dostlarımız odaya toplandı! Başlarında dedektif şapkası takan 4 sevimli hayvanı bulup sol mouse tuşuyla tek tıkla!',
    hintText: 'Sevimli dostlarımızın kafalarına dikkatle bak. Başında şapka olanları tek tıkla!',
    targetPreview: { id: 'prev_l5', kind: 'animal', animal: 'cat', color: 'blue', accessory: 'hat', isTarget: true, found: false },
    subRoundTotal: 2,
    badgeName: 'Hayvan Dedektifi',
    badgeIcon: '🐾',
    successMessage: 'Harika bir hayvan dedektifisin! Tüm aksesuarları yakaladın!',
    generateObjects: (subRound: number) => {
      // Exactly 24 items: 4 targets + 20 distractors = 24
      const list: DetectiveObject[] = [];
      let id = 1;
      const targetAccessory: AccessoryType = subRound === 1 ? 'hat' : 'glasses';
      const animals: AnimalType[] = ['cat', 'dog', 'rabbit', 'panda', 'fox', 'frog'];

      // 4 targets with target accessory
      for (let i = 0; i < 4; i++) {
        list.push({
          id: `l5_t_${id++}`,
          kind: 'animal',
          color: 'blue',
          animal: animals[i % animals.length],
          accessory: targetAccessory,
          isTarget: true,
          found: false,
        });
      }

      // 20 distractors
      for (let i = 0; i < 20; i++) {
        const acc: AccessoryType = i % 4 === 0 && subRound === 1 ? 'glasses' : i % 5 === 0 ? 'bow' : 'none';
        list.push({
          id: `l5_d_${id++}`,
          kind: 'animal',
          color: 'yellow',
          animal: animals[(i + 2) % animals.length],
          accessory: acc === targetAccessory ? 'none' : acc,
          isTarget: false,
          found: false,
        });
      }

      return list.sort(() => Math.random() - 0.5);
    },
  },

  // SEVİYE 6: FARKLI OLANI BUL
  {
    levelNum: 6,
    stageName: 'Seviye 6 – Farklı Olanı Bul',
    title: 'Gizli Ayrıntı',
    subtitle: 'Diğerlerinden Farklı Olan Tek Nesneyi Keşfet',
    missionText: 'Diğerlerinden farklı olan yıldızı bul!',
    descriptionText: 'Bütün yıldızlar birbirine çok benziyor! Ancak bir tanesi sana sevimli bir şekilde göz kırpıyor. O farklı yıldızı hemen keşfet ve tek tıkla!',
    hintText: 'Tüm yıldızları gözünle süz. Biri diğerlerinden küçük bir ayrıntıyla ayrılıyor!',
    targetPreview: { id: 'prev_l6', kind: 'shape', shape: 'star', color: 'yellow', oddVariantType: 'winking', isTarget: true, found: false },
    badgeName: 'Keskin Göz',
    badgeIcon: '👀',
    successMessage: '🎉 Dedektif gözlerin çok keskin! Farkı hemen yakaladın!',
    generateObjects: () => {
      // Exactly 24 items: 1 unique winking star + 23 identical normal stars = 24
      const list: DetectiveObject[] = [];
      let id = 1;
      list.push({
        id: `l6_odd_${id++}`,
        kind: 'shape',
        shape: 'star',
        color: 'yellow',
        oddVariantType: 'winking',
        isTarget: true,
        found: false,
      });

      for (let i = 0; i < 23; i++) {
        list.push({
          id: `l6_star_${id++}`,
          kind: 'shape',
          shape: 'star',
          color: 'yellow',
          isTarget: false,
          found: false,
        });
      }

      return list.sort(() => Math.random() - 0.5);
    },
  },

  // SEVİYE 7: HIZLI DEDEKTİF
  {
    levelNum: 7,
    stageName: 'Seviye 7 – Hızlı Dedektif',
    title: 'Zamanla Yarış (60 Sn)',
    subtitle: 'Sakin Kal, Doğru Hedefleri Yakala',
    missionText: '60 saniye içinde 5 kırmızı yıldızı bul!',
    descriptionText: 'Süre başladı! Ama acele edip panik yapma, 60 saniye çok uzun ve rahat bir süre. Sakince 5 kırmızı yıldızı bul ve tek tıkla.',
    hintText: 'Sakin ol dedektif, 60 saniye bolca yeter! Sadece kırmızı yıldızları tek tek tıkla.',
    targetPreview: { id: 'prev_l7', kind: 'shape', shape: 'star', color: 'red', isTarget: true, found: false },
    hasTimer: true,
    timeLimitSeconds: 60,
    badgeName: 'Hızlı Dedektif',
    badgeIcon: '⚡',
    successMessage: 'Muhteşem bir hız ve dikkat! Süre dolmadan tüm hedefleri tamamladın!',
    generateObjects: () => {
      // Exactly 24 items: 5 red stars + 19 distractors = 24
      const list: DetectiveObject[] = [];
      let id = 1;
      for (let i = 0; i < 5; i++) {
        list.push({ id: `l7_red_${id++}`, kind: 'shape', shape: 'star', color: 'red', isTarget: true, found: false });
      }
      const colors: ColorType[] = ['blue', 'yellow', 'green', 'purple'];
      const shapes: ShapeType[] = ['star', 'circle', 'triangle', 'heart', 'square'];
      for (let i = 0; i < 19; i++) {
        list.push({
          id: `l7_d_${id++}`,
          kind: 'shape',
          shape: shapes[i % shapes.length],
          color: colors[i % colors.length],
          isTarget: false,
          found: false,
        });
      }
      return list.sort(() => Math.random() - 0.5);
    },
  },

  // SEVİYE 8: SÜPER DEDEKTİF
  {
    levelNum: 8,
    stageName: 'Seviye 8 – Süper Dedektif',
    title: 'Küçük Mavi Hedefler',
    subtitle: 'Daha Fazla ve Küçük Nesneler Arasında Seçim',
    missionText: 'Sadece küçük mavi yıldızları bul!',
    descriptionText: 'İşte büyük final seviyesi! Ekranda büyük ve küçük nesneler karışık duruyor. Yalnızca hem KÜÇÜK hem de MAVİ renkteki yıldızları bulup tek tıkla!',
    hintText: 'Hem boyuta hem renge dikkat et: Yalnızca KÜÇÜK ve MAVİ olan yıldızlara tıkla!',
    targetPreview: { id: 'prev_l8', kind: 'shape', shape: 'star', color: 'blue', size: 'small', isTarget: true, found: false },
    badgeName: 'Süper Dedektif',
    badgeIcon: '🏆',
    successMessage: 'İnanılmaz! En zorlu dedektiflik görevini kusursuz tamamladın!',
    generateObjects: () => {
      // Exactly 24 items: 5 small blue stars + 4 big blue stars + 5 small other stars + 10 shapes = 24
      const list: DetectiveObject[] = [];
      let id = 1;

      // 5 small blue stars (Targets)
      for (let i = 0; i < 5; i++) {
        list.push({
          id: `l8_t_${id++}`,
          kind: 'shape',
          shape: 'star',
          color: 'blue',
          size: 'small',
          isTarget: true,
          found: false,
        });
      }

      // 4 normal blue stars
      for (let i = 0; i < 4; i++) {
        list.push({
          id: `l8_d_bigblue_${id++}`,
          kind: 'shape',
          shape: 'star',
          color: 'blue',
          size: 'normal',
          isTarget: false,
          found: false,
        });
      }

      // 5 small stars of other colors
      const otherColors: ColorType[] = ['red', 'yellow', 'green', 'purple', 'red'];
      for (let i = 0; i < 5; i++) {
        list.push({
          id: `l8_d_other_${id++}`,
          kind: 'shape',
          shape: 'star',
          color: otherColors[i % otherColors.length],
          size: 'small',
          isTarget: false,
          found: false,
        });
      }

      // 10 other shapes (circles, triangles, hearts, squares)
      const shapes: ShapeType[] = ['circle', 'triangle', 'heart', 'square'];
      for (let i = 0; i < 10; i++) {
        list.push({
          id: `l8_d_shapes_${id++}`,
          kind: 'shape',
          shape: shapes[i % shapes.length],
          color: otherColors[i % otherColors.length],
          size: i % 2 === 0 ? 'small' : 'normal',
          isTarget: false,
          found: false,
        });
      }

      return list.sort(() => Math.random() - 0.5);
    },
  },
];

// GRAND FINALE EXAM QUESTIONS (BÜYÜK DEDEKTİF SINAVI - 24 OBJECTS EACH)
interface ExamQuestion {
  questionNum: number;
  missionText: string;
  descriptionText: string;
  hintText: string;
  targetPreview: DetectiveObject;
  generateObjects: () => DetectiveObject[];
}

const EXAM_QUESTIONS: ExamQuestion[] = [
  {
    questionNum: 1,
    missionText: '3 kırmızı yıldız bul.',
    descriptionText: 'Büyük Dedektif Sınavı Soru 1: Ekrandaki 3 parlak kırmızı yıldızı bul ve tek tıkla!',
    hintText: 'Ekrandaki 3 parlak kırmızı yıldızı bul ve tek tıkla.',
    targetPreview: { id: 'prev_ex1', kind: 'shape', shape: 'star', color: 'red', isTarget: true, found: false },
    generateObjects: () => {
      // Exactly 24 items: 3 targets + 21 distractors = 24
      const list: DetectiveObject[] = [];
      let id = 1;
      for (let i = 0; i < 3; i++) {
        list.push({ id: `ex1_t_${id++}`, kind: 'shape', shape: 'star', color: 'red', isTarget: true, found: false });
      }
      const others: ColorType[] = ['blue', 'yellow', 'green', 'purple'];
      for (let i = 0; i < 21; i++) {
        list.push({ id: `ex1_d_${id++}`, kind: 'shape', shape: 'star', color: others[i % others.length], isTarget: false, found: false });
      }
      return list.sort(() => Math.random() - 0.5);
    },
  },
  {
    questionNum: 2,
    missionText: '2 mavi üçgen bul.',
    descriptionText: 'Büyük Dedektif Sınavı Soru 2: Rengi mavi ve 3 köşesi olan 2 adet üçgeni bulup tek tıkla!',
    hintText: 'Rengi mavi ve üç köşesi olan 2 üçgeni seç.',
    targetPreview: { id: 'prev_ex2', kind: 'shape', shape: 'triangle', color: 'blue', isTarget: true, found: false },
    generateObjects: () => {
      // Exactly 24 items: 2 targets + 22 distractors = 24
      const list: DetectiveObject[] = [];
      let id = 1;
      for (let i = 0; i < 2; i++) {
        list.push({ id: `ex2_t_${id++}`, kind: 'shape', shape: 'triangle', color: 'blue', isTarget: true, found: false });
      }
      const shapes: ShapeType[] = ['square', 'circle', 'heart', 'star'];
      const colors: ColorType[] = ['red', 'blue', 'yellow', 'green'];
      for (let i = 0; i < 22; i++) {
        list.push({ id: `ex2_d_${id++}`, kind: 'shape', shape: shapes[i % shapes.length], color: colors[i % colors.length], isTarget: false, found: false });
      }
      return list.sort(() => Math.random() - 0.5);
    },
  },
  {
    questionNum: 3,
    missionText: 'Şapkalı hayvanları bul.',
    descriptionText: 'Büyük Dedektif Sınavı Soru 3: Başında dedektif şapkası takan 3 sevimli hayvanı tek tıkla!',
    hintText: 'Başında dedektif şapkası olan sevimli dostlarımızı seç.',
    targetPreview: { id: 'prev_ex3', kind: 'animal', animal: 'cat', color: 'blue', accessory: 'hat', isTarget: true, found: false },
    generateObjects: () => {
      // Exactly 24 items: 3 targets + 21 distractors = 24
      const list: DetectiveObject[] = [];
      let id = 1;
      const animals: AnimalType[] = ['cat', 'dog', 'rabbit', 'fox', 'panda', 'frog'];
      for (let i = 0; i < 3; i++) {
        list.push({ id: `ex3_t_${id++}`, kind: 'animal', color: 'blue', animal: animals[i], accessory: 'hat', isTarget: true, found: false });
      }
      for (let i = 0; i < 21; i++) {
        list.push({ id: `ex3_d_${id++}`, kind: 'animal', color: 'yellow', animal: animals[(i + 3) % animals.length], accessory: 'none', isTarget: false, found: false });
      }
      return list.sort(() => Math.random() - 0.5);
    },
  },
  {
    questionNum: 4,
    missionText: 'Diğerlerinden farklı olan nesneyi bul.',
    descriptionText: 'Büyük Dedektif Sınavı Soru 4: Bütün yıldızların arasına saklanmış göz kırpan tek yıldızı bul!',
    hintText: 'Yıldızları dikkatlice tara, biri göz kırpıyor!',
    targetPreview: { id: 'prev_ex4', kind: 'shape', shape: 'star', color: 'yellow', oddVariantType: 'winking', isTarget: true, found: false },
    generateObjects: () => {
      // Exactly 24 items: 1 target + 23 distractors = 24
      const list: DetectiveObject[] = [];
      let id = 1;
      list.push({ id: `ex4_t_${id++}`, kind: 'shape', shape: 'star', color: 'yellow', oddVariantType: 'winking', isTarget: true, found: false });
      for (let i = 0; i < 23; i++) {
        list.push({ id: `ex4_d_${id++}`, kind: 'shape', shape: 'star', color: 'yellow', isTarget: false, found: false });
      }
      return list.sort(() => Math.random() - 0.5);
    },
  },
  {
    questionNum: 5,
    missionText: 'Küçük sarı yıldızı bul.',
    descriptionText: 'Büyük Dedektif Sınavı Soru 5: Normal sarı yıldızların arasında saklanan minik sarı yıldızı tek tıkla!',
    hintText: 'Büyük yıldızların arasına saklanmış minik sarı yıldızı tek tıkla!',
    targetPreview: { id: 'prev_ex5', kind: 'shape', shape: 'star', color: 'yellow', size: 'small', isTarget: true, found: false },
    generateObjects: () => {
      // Exactly 24 items: 1 target + 23 distractors = 24
      const list: DetectiveObject[] = [];
      let id = 1;
      list.push({ id: `ex5_t_${id++}`, kind: 'shape', shape: 'star', color: 'yellow', size: 'small', isTarget: true, found: false });
      for (let i = 0; i < 23; i++) {
        list.push({ id: `ex5_d_${id++}`, kind: 'shape', shape: 'star', color: 'yellow', size: 'normal', isTarget: false, found: false });
      }
      return list.sort(() => Math.random() - 0.5);
    },
  },
];

// Click Floating Effect
interface FloatingParticle {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
}

export const Activity10MoleReflex: React.FC<Activity10Props> = ({
  soundEnabled,
  onComplete,
  onSoundToggle,
}) => {
  // Game Flow State
  const [hasStarted, setHasStarted] = useState(false);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [subRound, setSubRound] = useState(1);
  const [isExamMode, setIsExamMode] = useState(false);
  const [currentExamIndex, setCurrentExamIndex] = useState(0);
  const [examStarsEarned, setExamStarsEarned] = useState<number[]>([]);

  // Score & Streak
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [objects, setObjects] = useState<DetectiveObject[]>([]);
  const [bannerMessage, setBannerMessage] = useState<{ text: string; type: 'success' | 'warning' | 'info' } | null>(null);
  // Modals & Overlays
  const [showHintModal, setShowHintModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showLevelIntroModal, setShowLevelIntroModal] = useState(false);
  const [isLevelFinishedModal, setIsLevelFinishedModal] = useState(false);
  const [isGameFinishedModal, setIsGameFinishedModal] = useState(false);

  // Timer state for Level 7
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isTimeUpModal, setIsTimeUpModal] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Floating score tags
  const [floatingParticles, setFloatingParticles] = useState<FloatingParticle[]>([]);
  const nextParticleId = useRef(1);

  // Earned Badges
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);

  // Prevent multiple rapid clicks (debounce)
  const isClickLockedRef = useRef(false);

  // Current level reference
  const currentLevel = GAME_LEVELS[currentLevelIndex];
  const currentExam = EXAM_QUESTIONS[currentExamIndex];

  // Spawn Objects for Current State
  const setupCurrentStage = useCallback(() => {
    if (isExamMode) {
      const examQ = EXAM_QUESTIONS[currentExamIndex];
      setObjects(examQ.generateObjects());
      setBannerMessage({
        text: `🔎 Sınav Görevi ${examQ.questionNum}/5: ${examQ.missionText}`,
        type: 'info',
      });
      return;
    }

    const lvl = GAME_LEVELS[currentLevelIndex];
    const generated = lvl.generateObjects(subRound);
    setObjects(generated);

    // If level 2 has subround 2, change mission text dynamically
    if (lvl.levelNum === 2 && subRound === 2) {
      setBannerMessage({ text: '🔎 Sonraki Görev: Sadece yıldızları bul!', type: 'info' });
    } else if (lvl.levelNum === 5 && subRound === 2) {
      setBannerMessage({ text: '🔎 Sonraki Görev: Gözlük takan hayvanları bul!', type: 'info' });
    } else {
      setBannerMessage({ text: `🔎 Görevin: "${lvl.missionText}"`, type: 'info' });
    }

    // Timer setup if level 7
    if (lvl.hasTimer && lvl.timeLimitSeconds) {
      setTimeLeft(lvl.timeLimitSeconds);
    }
  }, [currentLevelIndex, subRound, isExamMode, currentExamIndex]);

  // Initialize or update on stage change
  useEffect(() => {
    if (hasStarted) {
      setupCurrentStage();
    }
  }, [hasStarted, setupCurrentStage]);

  // Timer loop for Level 7
  useEffect(() => {
    if (!hasStarted || isExamMode || !currentLevel.hasTimer || isLevelFinishedModal || isGameFinishedModal || isTimeUpModal) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsTimeUpModal(true);
          soundEffects.playGentleBoing(soundEnabled);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasStarted, isExamMode, currentLevel, isLevelFinishedModal, isGameFinishedModal, isTimeUpModal, soundEnabled]);

  // Targets count calculation
  const totalTargetsInRound = objects.filter((o) => o.isTarget).length;
  const foundTargetsInRound = objects.filter((o) => o.isTarget && o.found).length;

  // Trigger floating particle
  const spawnFloatingText = (x: number, y: number, text: string, color: string) => {
    const id = nextParticleId.current++;
    setFloatingParticles((prev) => [...prev, { id, x, y, text, color }]);
    setTimeout(() => {
      setFloatingParticles((prev) => prev.filter((p) => p.id !== id));
    }, 1000);
  };

  // Main Handle Single Click (SOL TUŞLA TEK TIKLAMA)
  const handleObjectClick = (e: React.MouseEvent, clickedObj: DetectiveObject) => {
    // Only accept genuine primary left button click
    if (e.button !== 0) return;
    if (clickedObj.found) return; // already found
    if (isClickLockedRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = rect.left + rect.width / 2;
    const clickY = rect.top + rect.height / 2;

    if (clickedObj.isTarget) {
      // CORRECT CLICK!
      soundEffects.playStar(soundEnabled);
      const newStreak = streak + 1;
      setStreak(newStreak);

      // Streak Bonus Calculation:
      // 3 in a row -> +15, 5 in a row -> +25, 10 in a row -> +50, default +10
      let pointsEarned = 10;
      let bonusText = '+10';
      if (newStreak === 3) {
        pointsEarned += 15;
        bonusText = '+25 (3x Seri!)';
      } else if (newStreak === 5) {
        pointsEarned += 25;
        bonusText = '+35 (5x Süper Seri!)';
      } else if (newStreak >= 10 && newStreak % 5 === 0) {
        pointsEarned += 50;
        bonusText = `+60 (${newStreak}x Usta Seri!)`;
      }

      setScore((s) => s + pointsEarned);
      spawnFloatingText(clickX, clickY, bonusText, '#16a34a');

      // Random encouraging message
      const randomMsg = CORRECT_MESSAGES[Math.floor(Math.random() * CORRECT_MESSAGES.length)];
      setBannerMessage({ text: `⭐ ${randomMsg}`, type: 'success' });

      // Update object found state
      const updated = objects.map((item) =>
        item.id === clickedObj.id ? { ...item, found: true } : item
      );
      setObjects(updated);

      // Check if all targets found in this round
      const remainingTargets = updated.filter((o) => o.isTarget && !o.found).length;

      if (remainingTargets === 0) {
        handleRoundOrLevelComplete();
      }
    } else {
      // WRONG OBJECT CLICKED!
      soundEffects.playGentleBoing(soundEnabled);
      setStreak(0); // Reset streak, but DO NOT DEDUCT SCORE!

      // Gentle visual shake on clicked object
      setObjects((prev) =>
        prev.map((item) =>
          item.id === clickedObj.id ? { ...item, shake: true } : item
        )
      );
      setTimeout(() => {
        setObjects((prev) =>
          prev.map((item) =>
            item.id === clickedObj.id ? { ...item, shake: false } : item
          )
        );
      }, 500);

      const randomWrong = WRONG_MESSAGES[Math.floor(Math.random() * WRONG_MESSAGES.length)];
      setBannerMessage({ text: `🔍 ${randomWrong}`, type: 'warning' });
      spawnFloatingText(clickX, clickY, 'Bu Değil 🧐', '#ea580c');
    }
  };

  // Completion logic for current round / level / exam
  const handleRoundOrLevelComplete = () => {
    isClickLockedRef.current = true;
    soundEffects.playDropSuccess(soundEnabled);

    // If in EXAM MODE:
    if (isExamMode) {
      setExamStarsEarned((prev) => [...prev, currentExamIndex + 1]);
      soundEffects.playStar(soundEnabled);

      if (currentExamIndex + 1 < EXAM_QUESTIONS.length) {
        setTimeout(() => {
          setCurrentExamIndex((prev) => prev + 1);
          setShowLevelIntroModal(true);
          isClickLockedRef.current = false;
        }, 800);
      } else {
        // GRAND FINALE EXAM COMPLETED!
        setTimeout(() => {
          setIsGameFinishedModal(true);
          soundEffects.playFanfare(soundEnabled);
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
          });
          onComplete(3, score + 100);
          isClickLockedRef.current = false;
        }, 600);
      }
      return;
    }

    // Standard Levels progression:
    const lvl = currentLevel;

    // Check if level has a sub-round (e.g. Level 2 or Level 5)
    if (lvl.subRoundTotal && subRound < lvl.subRoundTotal) {
      setTimeout(() => {
        setSubRound((r) => r + 1);
        setShowLevelIntroModal(true);
        isClickLockedRef.current = false;
      }, 700);
      return;
    }

    // Full level completed!
    if (!earnedBadges.includes(lvl.badgeName)) {
      setEarnedBadges((prev) => [...prev, lvl.badgeName]);
    }

    setTimeout(() => {
      setIsLevelFinishedModal(true);
      soundEffects.playFanfare(soundEnabled);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
      isClickLockedRef.current = false;
    }, 600);
  };

  // Move to next level or start exam
  const handleNextLevel = () => {
    setIsLevelFinishedModal(false);
    setSubRound(1);
    setShowLevelIntroModal(true);

    if (currentLevelIndex + 1 < GAME_LEVELS.length) {
      setCurrentLevelIndex((prev) => prev + 1);
    } else {
      // All 8 levels completed! Start Grand Finale Exam
      setIsExamMode(true);
      setCurrentExamIndex(0);
    }
  };

  // Restart current round / level
  const handleRestartLevel = () => {
    setIsTimeUpModal(false);
    setIsLevelFinishedModal(false);
    setShowLevelIntroModal(true);
    setupCurrentStage();
  };

  // Total reset game
  const handleResetEntireGame = () => {
    setScore(0);
    setStreak(0);
    setCurrentLevelIndex(0);
    setSubRound(1);
    setIsExamMode(false);
    setCurrentExamIndex(0);
    setExamStarsEarned([]);
    setEarnedBadges([]);
    setIsLevelFinishedModal(false);
    setIsGameFinishedModal(false);
    setIsTimeUpModal(false);
    setShowLevelIntroModal(true);
    setupCurrentStage();
  };

  // Get active mission text & hint text & description & target preview
  const activeMissionText = isExamMode
    ? currentExam.missionText
    : currentLevel.levelNum === 2 && subRound === 2
    ? 'Sadece yıldızları bul!'
    : currentLevel.levelNum === 5 && subRound === 2
    ? 'Gözlük takan hayvanları bul!'
    : currentLevel.missionText;

  const activeDescriptionText = isExamMode
    ? currentExam.descriptionText
    : currentLevel.levelNum === 2 && subRound === 2
    ? 'Harika! Şimdi şekiller arasından 5 köşesi parlayan 5 adet yıldızı bulup tek tıkla!'
    : currentLevel.levelNum === 5 && subRound === 2
    ? 'Şimdi gözlerine dikkat et! Gözünde şirin gözlükler olan 4 sevimli hayvanı bulup tek tıkla.'
    : currentLevel.descriptionText;

  const activeTargetPreview: DetectiveObject = isExamMode
    ? currentExam.targetPreview
    : currentLevel.levelNum === 2 && subRound === 2
    ? { id: 'prev_l2_s2', kind: 'shape', shape: 'star', color: 'yellow', isTarget: true, found: false }
    : currentLevel.levelNum === 5 && subRound === 2
    ? { id: 'prev_l5_s2', kind: 'animal', animal: 'dog', color: 'yellow', accessory: 'glasses', isTarget: true, found: false }
    : currentLevel.targetPreview;

  const activeHintText = isExamMode
    ? currentExam.hintText
    : currentLevel.levelNum === 2 && subRound === 2
    ? 'Şekillere dikkat et! Beş köşesi parlayan yıldızları bul.'
    : currentLevel.levelNum === 5 && subRound === 2
    ? 'Sevimli dostlarımızın gözlerine bak. Gözlük takanları tek tıkla!'
    : currentLevel.hintText;

  // 1. OPENING INTRO SCREEN
  if (!hasStarted) {
    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center py-6 px-4 select-none">
        <div className="w-full bg-gradient-to-br from-blue-700 via-indigo-700 to-sky-700 rounded-3xl p-6 sm:p-10 text-white shadow-2xl border-4 border-blue-400 relative overflow-hidden flex flex-col items-center text-center">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

          {/* Cute Detective Mouse Mascot SVG Illustration */}
          <div className="relative mb-5 flex items-center justify-center">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-white/20 backdrop-blur-md border-4 border-amber-300 flex items-center justify-center shadow-lg relative">
              <svg width="90" height="90" viewBox="0 0 100 100" className="drop-shadow-md">
                {/* Big Ears */}
                <circle cx="24" cy="28" r="16" fill="#fca5a5" stroke="#f43f5e" strokeWidth="3" />
                <circle cx="76" cy="28" r="16" fill="#fca5a5" stroke="#f43f5e" strokeWidth="3" />
                {/* Head */}
                <circle cx="50" cy="55" r="30" fill="#cbd5e1" stroke="#64748b" strokeWidth="3" />
                {/* Cheeks */}
                <circle cx="36" cy="62" r="5" fill="#f43f5e" opacity="0.6" />
                <circle cx="64" cy="62" r="5" fill="#f43f5e" opacity="0.6" />
                {/* Eyes */}
                <circle cx="42" cy="50" r="4.5" fill="#0f172a" />
                <circle cx="43.5" cy="48.5" r="1.5" fill="#ffffff" />
                <circle cx="58" cy="50" r="4.5" fill="#0f172a" />
                <circle cx="59.5" cy="48.5" r="1.5" fill="#ffffff" />
                {/* Nose & Whiskers */}
                <polygon points="50,58 46,54 54,54" fill="#f43f5e" />
                <line x1="28" y1="58" x2="42" y2="59" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
                <line x1="26" y1="64" x2="42" y2="63" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
                <line x1="72" y1="58" x2="58" y2="59" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
                <line x1="74" y1="64" x2="58" y2="63" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
                {/* Detective Hat */}
                <path d="M 32 34 Q 50 20 68 34" fill="#78350f" stroke="#451a03" strokeWidth="2" />
                <rect x="22" y="32" width="56" height="6" rx="3" fill="#92400e" stroke="#451a03" strokeWidth="2" />
                <rect x="34" y="16" width="32" height="18" rx="4" fill="#78350f" stroke="#451a03" strokeWidth="2" />
                <rect x="34" y="27" width="32" height="4" fill="#f59e0b" />
              </svg>
              {/* Magnifying Glass badge */}
              <div className="absolute -bottom-2 -right-2 bg-amber-400 text-amber-950 p-2 rounded-full border-2 border-white shadow-md text-xl animate-pulse">
                🔍
              </div>
            </div>
          </div>

          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 bg-amber-400/30 text-amber-200 border border-amber-300/50 px-4 py-1.5 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            İlkokul Mouse Becerileri & Görsel Dikkat
          </span>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-2 drop-shadow-sm">
            DEDEKTİF MOUSE 🔎🖱️
          </h1>

          <p className="text-base sm:text-xl font-bold text-amber-300 mb-6 italic">
            "Dikkatli bak, doğru nesneyi bul ve tek tıkla!"
          </p>

          {/* 4 Rules Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-2xl w-full text-left mb-8">
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 flex items-start gap-3">
              <span className="text-2xl shrink-0">🖱️</span>
              <div>
                <h4 className="font-black text-sm text-amber-200">Fareyi Hedefe Götür</h4>
                <p className="text-xs text-blue-100 font-medium">
                  İmleci aradığın nesnenin üzerine doğru ve sakince konumlandır.
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 flex items-start gap-3">
              <span className="text-2xl shrink-0">👆</span>
              <div>
                <h4 className="font-black text-sm text-amber-200">Sol Tuşla Tek Tıkla</h4>
                <p className="text-xs text-blue-100 font-medium">
                  Sadece bir kez sol tuşa bas. Çift tık veya sürükleme yok!
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 flex items-start gap-3">
              <span className="text-2xl shrink-0">🔎</span>
              <div>
                <h4 className="font-black text-sm text-amber-200">Görev İpucunu Oku</h4>
                <p className="text-xs text-blue-100 font-medium">
                  Üst paneldeki dedektif ipucunu incele, benzer nesneleri ayırt et.
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 flex items-start gap-3">
              <span className="text-2xl shrink-0">💡</span>
              <div>
                <h4 className="font-black text-sm text-amber-200">Ceza Yok, İpucu Var</h4>
                <p className="text-xs text-blue-100 font-medium">
                  Yanlış tıklamalarda puan silinmez, ipucu butonuna özgürce basabilirsin.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => {
                soundEffects.playPop(soundEnabled);
                setHasStarted(true);
                setShowLevelIntroModal(true);
              }}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black text-base sm:text-lg shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer border-3 border-emerald-300 flex items-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>DEDEKTİFLİĞE BAŞLA</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. MAIN ACTIVE GAME SCREEN
  return (
    <div
      className="w-full max-w-5xl mx-auto flex flex-col items-center py-2 sm:py-4 px-2 sm:px-4 select-none relative"
      onDragStart={(e) => e.preventDefault()}
    >
      {/* Floating score / feedback animations */}
      {floatingParticles.map((p) => (
        <div
          key={p.id}
          className="fixed pointer-events-none z-50 font-black text-lg sm:text-xl drop-shadow-md animate-bounce"
          style={{
            left: `${p.x}px`,
            top: `${p.y - 20}px`,
            color: p.color,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {p.text}
        </div>
      ))}

      {/* TOP HEADER CONTROLS & STATUS */}
      <div className="w-full bg-white rounded-3xl border-3 border-blue-200 shadow-md p-4 sm:p-5 mb-3 sm:mb-4 relative overflow-hidden">
        {/* Soft background glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-100/50 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-3">
          {/* Title & Stage */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl shadow-xs font-black">
              🔎
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-black text-slate-800 tracking-tight">
                  Dedektif Mouse
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-100 text-blue-800 border border-blue-200">
                  {isExamMode ? '🎓 BÜYÜK SINAV' : currentLevel.stageName}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-500">
                Dikkatli bak, doğru nesneyi bul ve tek tıkla!
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Mission Description Button */}
            <button
              onClick={() => {
                soundEffects.playPop(soundEnabled);
                setShowLevelIntroModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-black transition-colors cursor-pointer"
              title="Görevi Ekranda Aç"
            >
              <span>📋 Görevi Oku</span>
            </button>

            {/* Hint Button */}
            <button
              onClick={() => {
                soundEffects.playPop(soundEnabled);
                setShowHintModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-300 text-xs font-black transition-colors cursor-pointer"
              title="Dedektif İpucu"
            >
              <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>İpucu</span>
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

        {/* STATS BAR: Bulunan, Puan, Seri, Süre */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-xl">
              🖱️ Sol Tuşla Tek Tıklama
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Bulunan / Hedef */}
            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <div className="text-xs">
                <span className="text-slate-400 font-bold block text-[10px]">Bulunan</span>
                <span className="font-black text-slate-800 text-sm">
                  {foundTargetsInRound} / {totalTargetsInRound}
                </span>
              </div>
            </div>

            {/* Puan */}
            <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-600" />
              <div className="text-xs">
                <span className="text-amber-500 font-bold block text-[10px]">Puan</span>
                <span className="font-black text-amber-900 text-sm">{score}</span>
              </div>
            </div>

            {/* Streak / Seri */}
            {streak >= 2 && (
              <div className="bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-pulse">
                <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                <div className="text-xs">
                  <span className="text-orange-500 font-bold block text-[10px]">Seri</span>
                  <span className="font-black text-orange-700 text-sm">{streak}x</span>
                </div>
              </div>
            )}

            {/* Timer (Level 7) */}
            {currentLevel.hasTimer && !isExamMode && (
              <div
                className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${
                  timeLeft <= 10
                    ? 'bg-red-50 border-red-300 text-red-700 animate-pulse'
                    : 'bg-blue-50 border-blue-200 text-blue-800'
                }`}
              >
                <Clock className="w-4 h-4" />
                <div className="text-xs">
                  <span className="font-bold block text-[10px]">Kalan Süre</span>
                  <span className="font-black text-sm">{timeLeft}s</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FEEDBACK BANNER MESSAGE */}
        {bannerMessage && (
          <div
            className={`mt-2.5 py-1.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between transition-all ${
              bannerMessage.type === 'success'
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                : bannerMessage.type === 'warning'
                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                : 'bg-slate-100 text-slate-800 border border-slate-200'
            }`}
          >
            <span>{bannerMessage.text}</span>
            <span className="text-[11px] font-medium opacity-75 hidden sm:inline">
              (Sol tuşla tek tıkla)
            </span>
          </div>
        )}
      </div>

      {/* PROMINENT GÖREV PANOSU (Directly Above the Grid so children see it immediately) */}
      <div className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white rounded-3xl p-3.5 sm:p-4 mb-4 shadow-lg border-3 border-blue-400 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 relative overflow-hidden">
        {/* Subtle glow */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        {/* Left: Target Miniature + Large Task Text */}
        <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
          {/* Target Preview Box */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/95 border-3 border-amber-300 shadow-md flex items-center justify-center shrink-0 relative">
            <ObjectGraphic obj={activeTargetPreview} />
            <div className="absolute -top-2 -right-2 bg-amber-400 text-amber-950 text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-xs border border-white">
              HEDEF
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <span className="text-[11px] sm:text-xs font-black text-amber-300 uppercase tracking-wider block">
              ŞİMDİKİ GÖREVİN:
            </span>
            <h3 className="text-base sm:text-xl lg:text-2xl font-black text-white leading-tight drop-shadow-xs">
              "{activeMissionText}"
            </h3>
          </div>
        </div>

        {/* Right: Sound & Modal Buttons for Quick Kids Access */}
        <div className="flex items-center gap-2 sm:gap-2.5 w-full md:w-auto justify-end">
          {/* Read aloud */}
          <button
            onClick={() => speakTurkishText(activeDescriptionText)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/20 hover:bg-white/30 text-white border border-white/30 text-xs sm:text-sm font-black transition-all cursor-pointer shadow-xs active:scale-95"
            title="Görevi Sesli Dinle"
          >
            <Volume2 className="w-4 h-4 text-amber-300" />
            <span>Sesli Dinle 🔊</span>
          </button>

          {/* Open full explanation modal */}
          <button
            onClick={() => setShowLevelIntroModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs sm:text-sm font-black transition-all cursor-pointer shadow-xs active:scale-95"
            title="Görevin Resimli Açıklamasını Gör"
          >
            <span>📋 Açıklamayı Göster</span>
          </button>
        </div>
      </div>

      {/* 3. MAIN DETECTIVE PLAYGROUND GRID (4 SATIR x 6 SÜTUN = 24 NESNE) */}
      <div className="w-full bg-slate-50/90 rounded-3xl border-3 border-slate-200 p-3 sm:p-5 md:p-6 min-h-[460px] flex items-center justify-center relative shadow-inner overflow-hidden">
        {/* Playfield Subtle Background Patterns */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#94a3b8 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* 4 ROWS x 6 COLUMNS GRID */}
        <div className="w-full max-w-4xl grid grid-cols-6 grid-rows-4 gap-2 sm:gap-3 md:gap-3.5 lg:gap-4 justify-items-center items-center py-2 relative z-10">
          {objects.map((obj) => {
            return (
              <div
                key={obj.id}
                onClick={(e) => handleObjectClick(e, obj)}
                className={`w-full max-w-[80px] sm:max-w-[92px] aspect-square group relative flex items-center justify-center rounded-2xl p-1.5 sm:p-2.5 transition-all duration-200 cursor-pointer select-none ${
                  obj.found
                    ? 'opacity-35 scale-90 pointer-events-none bg-emerald-50/50 border-2 border-emerald-300 shadow-none'
                    : 'bg-white hover:bg-blue-50/90 border-2 border-slate-200 hover:border-blue-400 hover:shadow-md hover:scale-108 active:scale-95'
                } ${obj.shake ? 'animate-bounce border-amber-400 bg-amber-50' : ''}`}
                title="Sol tuşla tek tıkla seç"
              >
                {/* Found Golden Checkmark Badge */}
                {obj.found && (
                  <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-black shadow-md border-2 border-white z-20 animate-scale-in">
                    ✓
                  </div>
                )}

                {/* Actual Graphic */}
                <ObjectGraphic obj={obj} />

                {/* Magnifying Glass Indicator on Hover */}
                {!obj.found && (
                  <div className="absolute inset-0 rounded-2xl pointer-events-none border-2 border-transparent group-hover:border-blue-400/60 transition-colors" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. BOTTOM TIPS & DETECTIVE FOOTER */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 mt-3 px-2 text-xs font-bold text-slate-500">
        <div className="flex items-center gap-1.5">
          <MousePointer className="w-3.5 h-3.5 text-blue-600" />
          <span>
            Hedefe sol tuşla <strong>tek tıkla</strong>. Çift tık veya sürükleme yok!
          </span>
        </div>
        <div className="flex items-center gap-2">
          {earnedBadges.length > 0 && (
            <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              {earnedBadges.length} Rozet Kazanıldı
            </span>
          )}
        </div>
      </div>

      {/* MODAL 0: LEVEL MISSION ANNOUNCEMENT MODAL (Directly on screen for elementary school kids) */}
      {showLevelIntroModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border-4 border-blue-400 p-6 sm:p-7 shadow-2xl relative animate-scale-in text-center">
            {/* Close button */}
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
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-black uppercase tracking-wider mb-3 border border-blue-200">
              <span>🔎</span>
              <span>{isExamMode ? `BÜYÜK DEDEKTİF SINAVI (${currentExamIndex + 1}/5)` : currentLevel.stageName}</span>
            </div>

            {/* Large Visual Target Preview inside Radar Ring */}
            <div className="relative my-3 flex items-center justify-center">
              <div className="w-24 h-24 rounded-3xl bg-blue-50 border-3 border-blue-300 flex items-center justify-center shadow-lg relative">
                <ObjectGraphic obj={activeTargetPreview} />
                <div className="absolute -bottom-2 -right-2 bg-amber-400 text-amber-950 p-1.5 rounded-full border-2 border-white shadow-md text-base">
                  🔍
                </div>
              </div>
            </div>

            <span className="text-[11px] font-black text-amber-600 uppercase tracking-widest block mb-1">
              ARANAN HEDEF
            </span>

            {/* Big readable mission text */}
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 leading-snug">
              "{activeMissionText}"
            </h3>

            {/* Clear kid-friendly description */}
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-950 font-bold text-sm sm:text-base leading-relaxed mb-4 text-center">
              {activeDescriptionText}
            </div>

            {/* Quick Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
              <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-black border border-slate-200">
                🎯 Hedef: {totalTargetsInRound} Adet
              </span>
              <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 text-xs font-black border border-blue-200">
                🖱️ Kural: Sol Tuşla Tek Tık
              </span>
            </div>

            {/* Action Buttons: Listen & Start */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => speakTurkishText(activeDescriptionText)}
                className="w-full sm:w-auto flex-1 py-3 px-4 rounded-2xl bg-blue-100 hover:bg-blue-200 text-blue-900 font-black text-sm border-2 border-blue-300 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                <Volume2 className="w-4 h-4 text-blue-700" />
                <span>Sesli Dinle 🔊</span>
              </button>

              <button
                onClick={() => {
                  soundEffects.playPop(soundEnabled);
                  setShowLevelIntroModal(false);
                }}
                className="w-full sm:w-auto flex-2 py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black text-base shadow-lg cursor-pointer transition-all border-2 border-emerald-300 flex items-center justify-center gap-2 active:scale-95"
              >
                <span>ANLADIM, BAŞLA! 🔎</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: HINT MODAL */}
      {showHintModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border-4 border-amber-300 p-6 shadow-2xl relative animate-scale-in">
            <button
              onClick={() => setShowHintModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-3xl mb-4 mx-auto">
              💡
            </div>

            <h3 className="text-xl font-black text-slate-800 text-center mb-2">
              Dedektif İpucu
            </h3>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 font-bold text-sm sm:text-base leading-relaxed text-center mb-6">
              "{activeHintText}"
            </div>

            <button
              onClick={() => setShowHintModal(false)}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm transition-colors cursor-pointer shadow-md"
            >
              Anladım, Aramaya Devam Et! 🔎
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: HOW TO PLAY HELP MODAL */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border-4 border-blue-400 p-6 sm:p-8 shadow-2xl relative animate-scale-in">
            <button
              onClick={() => setShowHelpModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-black shrink-0">
                🔎
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800">
                  Dedektif Mouse – Nasıl Oynanır?
                </h3>
                <p className="text-xs font-bold text-blue-600">
                  Sol Tuş Tek Tıklama ve Görsel Dikkat
                </p>
              </div>
            </div>

            <div className="space-y-3 text-slate-700 text-xs sm:text-sm font-medium mb-6">
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                <strong>1. Görevi İncele:</strong> Ekranın üstündeki ipucunu oku (örneğin: "Sadece kırmızı yıldızları bul!").
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <strong>2. Tek Tıkla:</strong> Mouse imlecini doğru nesnenin üzerine götür ve sol tuşla <strong>sadece bir kez</strong> tıkla.
              </div>
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
                <strong>3. Seri Başarı Bonusu:</strong> Arka arkaya doğru hedefleri seçtiğinde bonus puanlar ve alevli seri çarpanı kazanırsın!
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <strong>4. Korkmadan Dene:</strong> Yanlış nesneye tıkladığında puanın silinmez. Tekrar sakin bir şekilde deneyebilirsin.
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm transition-colors cursor-pointer shadow-md"
            >
              Harika, Oyuna Dön!
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: TIME UP (Level 7) Encouraging Retry */}
      {isTimeUpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border-4 border-amber-300 p-6 sm:p-8 shadow-2xl text-center relative animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-3xl mx-auto mb-3">
              ⏱️
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">
              Süre Tamamlandı!
            </h3>
            <p className="text-sm font-bold text-slate-600 mb-6 leading-relaxed">
              "Bu kez biraz daha dikkatli dene! 60 saniye boyunca kırmızı yıldızları sakince bulabilirsin."
            </p>
            <button
              onClick={handleRestartLevel}
              className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-base shadow-md cursor-pointer transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Tekrar Deneyelim! 🚀</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: LEVEL COMPLETED MODAL */}
      {isLevelFinishedModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border-4 border-emerald-400 p-6 sm:p-8 shadow-2xl text-center relative animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
              {currentLevel.badgeIcon || '⭐'}
            </div>

            <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider mb-2">
              Seviye Başarıyla Tamamlandı!
            </span>

            <h3 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2">
              {currentLevel.title}
            </h3>

            <p className="text-sm font-bold text-emerald-700 mb-4">
              {currentLevel.successMessage}
            </p>

            {/* Badge Earned Card */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center gap-2 mb-6">
              <span className="text-2xl">{currentLevel.badgeIcon}</span>
              <div className="text-left">
                <span className="text-[10px] font-bold text-amber-600 uppercase block">Kazanılan Rozet:</span>
                <span className="text-sm font-black text-amber-900">{currentLevel.badgeName}</span>
              </div>
            </div>

            <button
              onClick={handleNextLevel}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black text-base shadow-lg cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <span>
                {currentLevelIndex + 1 < GAME_LEVELS.length
                  ? 'Sonraki Seviyeye Geç'
                  : 'BÜYÜK DEDEKTİF SINAVINA GEÇ 🎓'}
              </span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* MODAL 5: GRAND FINALE GAME FINISHED MODAL */}
      {isGameFinishedModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border-4 border-amber-400 p-6 sm:p-8 shadow-2xl text-center relative animate-scale-in">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 flex items-center justify-center text-4xl mx-auto mb-3 shadow-lg border-2 border-white">
              🏆
            </div>

            <span className="inline-block px-3.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black uppercase tracking-wider mb-2">
              MEZUNİYET: SÜPER DEDEKTİF!
            </span>

            <h3 className="text-2xl sm:text-4xl font-black text-slate-800 mb-2">
              BÜYÜK DEDEKTİF SINAVI TAMAMLANDI!
            </h3>

            <p className="text-sm sm:text-base font-bold text-slate-600 mb-4">
              Tüm seviyeleri ve 5 aşamalı final sınavını başarıyla geçerek gerçek bir mouse ustası ve süper dedektif oldun!
            </p>

            {/* Score & Stars Display */}
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

            {/* Showcase All Earned Badges */}
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 mb-6">
              <span className="text-xs font-black text-slate-700 block mb-2">
                Kazanılan Dedektif Rozetleri:
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {[
                  { name: 'İlk Dedektiflik Görevi', icon: '🔎' },
                  { name: 'Hedef Uzmanı', icon: '🎯' },
                  { name: 'Yıldız Avcısı', icon: '⭐' },
                  { name: 'Dikkat Ustası', icon: '🧠' },
                  { name: 'Hayvan Dedektifi', icon: '🐾' },
                  { name: 'Keskin Göz', icon: '👀' },
                  { name: 'Hızlı Dedektif', icon: '⚡' },
                  { name: 'Süper Dedektif', icon: '🏆' },
                ].map((b, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs"
                  >
                    <span>{b.icon}</span>
                    <span>{b.name}</span>
                  </span>
                ))}
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
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm transition-all cursor-pointer shadow-md"
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
