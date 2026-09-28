import React from 'react';
import { Award, Star, CheckCircle2, Lock, Sparkles, Trophy } from 'lucide-react';
import { ACTIVITIES } from '../data/activities.ts';

interface AchievementsViewProps {
  completedActivities: Record<number, { completed: boolean; stars: number; score: number }>;
  totalStars: number;
  totalScore: number;
  onSelectActivity: (id: number) => void;
}

interface BadgeItem {
  id: number;
  activityId: number;
  title: string;
  description: string;
  emoji: string;
  color: string;
}

const BADGES: BadgeItem[] = [
  { id: 1, activityId: 1, title: 'Kelebek Avcısı', description: 'Mouse imlecini hedefin üzerine getirmeyi başardın.', emoji: '🦋', color: 'from-sky-400 to-blue-500' },
  { id: 2, activityId: 2, title: 'Balon Patlatıcı', description: 'Sol tuşla tek tıklayarak balonları patlattın.', emoji: '🎈', color: 'from-rose-400 to-red-500' },
  { id: 3, activityId: 3, title: 'Renk Dedektifi', description: 'Doğru renkleri dikkatle seçip tıkladın.', emoji: '🎨', color: 'from-emerald-400 to-teal-500' },
  { id: 4, activityId: 4, title: 'Uzay Kaşifi', description: 'Uzayda imleç takibi ve tıklama görevlerini bitirdin.', emoji: '🚀', color: 'from-indigo-400 to-purple-500' },
  { id: 5, activityId: 5, title: 'Çift Tık Ustası', description: 'Hızlıca iki kez basarak özel balonları uçurdun.', emoji: '⚡', color: 'from-amber-400 to-orange-500' },
  { id: 6, activityId: 6, title: 'Hafıza Şampiyonu', description: 'Kartları tek tıklamayla açıp ikili eşleri buldun.', emoji: '🃏', color: 'from-pink-400 to-rose-500' },
  { id: 7, activityId: 7, title: 'Labirent Ustası', description: "Mouse'unu dikkatli hareket ettirerek fareyi peynire ulaştırdın.", emoji: '🧀', color: 'from-amber-400 to-orange-500' },
  { id: 8, activityId: 8, title: 'Düzen Ustası', description: 'Oyuncakları sürükleyip kutularına yerleştirdin.', emoji: '🧸', color: 'from-teal-400 to-emerald-500' },
  { id: 9, activityId: 9, title: 'Bahçe Mimarı', description: 'Yapboz parçalarını doğru yuvalara taşıdın.', emoji: '🧩', color: 'from-lime-400 to-green-600' },
  { id: 10, activityId: 10, title: 'Dedektif Mouse', description: 'Görsel dikkat ve sol tuşla tek tıklamayla tüm gizli nesneleri buldun.', emoji: '🔎', color: 'from-blue-600 to-indigo-600' },
  { id: 11, activityId: 11, title: 'Yıldız Avcısı', description: 'Hareketli hedefleri dikkatle takip ettin.', emoji: '⭐', color: 'from-yellow-400 to-amber-500' },
  { id: 12, activityId: 12, title: 'Büyük Macera Şampiyonu', description: '12 adımlık mouse serüvenini başarıyla tamamladın!', emoji: '🏆', color: 'from-amber-400 to-yellow-600' },
];

export const AchievementsView: React.FC<AchievementsViewProps> = ({
  completedActivities,
  totalStars,
  totalScore,
  onSelectActivity,
}) => {
  const completedCount = Object.values(completedActivities).filter((a) => a.completed).length;

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-4 flex flex-col gap-6 select-none">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 rounded-3xl p-6 sm:p-8 text-amber-950 shadow-xl border-3 border-amber-500 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 bg-white/40 px-3 py-1 rounded-full text-xs font-black uppercase text-amber-950 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Öğrenci Başarı Tablosu
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Tebrikler, Harika İlerliyorsun!
          </h2>
          <p className="text-sm sm:text-base font-bold text-amber-900 mt-1 max-w-xl">
            Her etkinliği tamamladıkça özel başarı rozetleri açılır. Görevleri tekrar oynayarak yıldızlarını üçe tamamlayabilirsin.
          </p>
        </div>

        {/* Stats Pill */}
        <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-4 border-2 border-amber-300 flex items-center gap-4 shrink-0 shadow-md">
          <div className="text-center">
            <span className="text-2xl font-black text-amber-600 block">
              {totalStars} ⭐
            </span>
            <span className="text-[11px] font-bold text-slate-600">
              Yıldız
            </span>
          </div>

          <div className="w-px h-10 bg-amber-200" />

          <div className="text-center">
            <span className="text-2xl font-black text-emerald-600 block">
              {completedCount} / {ACTIVITIES.length}
            </span>
            <span className="text-[11px] font-bold text-slate-600">
              Kazanılan Rozet
            </span>
          </div>

          <div className="w-px h-10 bg-amber-200" />

          <div className="text-center">
            <span className="text-2xl font-black text-indigo-600 block">
              {totalScore}
            </span>
            <span className="text-[11px] font-bold text-slate-600">
              Toplam Puan
            </span>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="w-full">
        <h3 className="text-lg sm:text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-600" />
          <span>Kazanılan Başarı Rozetleri</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BADGES.map((badge) => {
            const status = completedActivities[badge.activityId];
            const isUnlocked = status?.completed;

            return (
              <div
                key={badge.id}
                onClick={() => onSelectActivity(badge.activityId)}
                className={`rounded-2xl p-4 border-3 transition-all cursor-pointer flex items-center gap-4 ${
                  isUnlocked
                    ? 'bg-white border-amber-300 shadow-md hover:border-amber-400 hover:scale-102'
                    : 'bg-slate-50 border-slate-200 opacity-60 hover:opacity-80'
                }`}
              >
                {/* Badge Icon */}
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-inner ${
                    isUnlocked
                      ? `bg-gradient-to-tr ${badge.color} text-white`
                      : 'bg-slate-200 grayscale text-slate-400'
                  }`}
                >
                  {isUnlocked ? badge.emoji : '🔒'}
                </div>

                {/* Badge Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-sm font-black text-slate-800 truncate">
                      {badge.title}
                    </h4>
                    {isUnlocked && (
                      <span className="text-xs font-bold text-amber-600 flex items-center">
                        {status.stars} ⭐
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-semibold line-clamp-2 mt-0.5">
                    {badge.description}
                  </p>
                  <span className="text-[10px] text-blue-600 font-bold mt-1 inline-block">
                    Etkinlik #{badge.activityId}'e Git →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
