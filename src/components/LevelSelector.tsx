import React, { useState } from 'react';
import { Play, Sparkles, Clock, BookOpen, CheckCircle2, Volume2 } from 'lucide-react';
import { ACTIVITIES, STAGES } from '../data/activities.ts';
import { StageId } from '../types.ts';
import { MouseActionBadge } from './MouseActionBadge.tsx';
import { speakTurkishText } from '../utils/audio.ts';

interface LevelSelectorProps {
  completedActivities: Record<number, { completed: boolean; stars: number; score: number }>;
  onSelectActivity: (id: number) => void;
  totalStars?: number;
  onOpenGuide?: () => void;
}

export const LevelSelector: React.FC<LevelSelectorProps> = ({
  completedActivities,
  onSelectActivity,
  onOpenGuide,
}) => {
  const [selectedStageFilter, setSelectedStageFilter] = useState<StageId | 'all'>('all');

  const filteredActivities =
    selectedStageFilter === 'all'
      ? ACTIVITIES
      : ACTIVITIES.filter((a) => a.stageId === selectedStageFilter);

  const completedCount = Object.values(completedActivities).filter((a) => a.completed).length;

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center py-4 sm:py-6 px-3 sm:px-4 select-none">
      {/* Hero Welcome Banner */}
      <div className="w-full bg-gradient-to-r from-[#2563eb] via-[#3b82f6] to-[#0284c7] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden mb-6 border-3 border-[#1d4ed8]">
        {/* Soft background accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-12 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider text-amber-200 border border-white/30 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              125 Dakikalık Oyunlaştırılmış Mouse Eğitimi
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Mouse Macerası Başlıyor!
            </h2>
            <p className="text-blue-100 font-medium text-sm sm:text-base mt-2 leading-relaxed">
              Mouse'u doğru tutmayı, tek tıklama, çift tıklama, sağ tıklama ve sürükle-bırak hareketlerini eğlenceli oyunlarla öğren ve tüm görevleri tamamla!
            </p>
          </div>
        </div>
      </div>

      {/* UYGULAMAYI ANLATAN KISIM (Application Explanation Section) */}
      <div className="w-full bg-white rounded-3xl border-3 border-blue-100 shadow-sm p-5 sm:p-6 mb-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl shrink-0 font-black">
              📖
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-800">
                Uygulama Hakkında & Mouse Rehberi
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-slate-500">
                Öğrencilerimiz için tasarlanan 4 temel fare becerisi ve ipuçları
              </p>
            </div>
          </div>

          {onOpenGuide && (
            <button
              onClick={onOpenGuide}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm transition-colors cursor-pointer shadow-xs shrink-0"
            >
              <BookOpen className="w-4 h-4" />
              <span>Resimli Tuş ve Parmak Rehberini Aç</span>
            </button>
          )}
        </div>

        {/* 4 Core Mouse Skills Visual Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-4">
          {/* Sol Tık */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-blue-800 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                1. Sol Tık
              </span>
              <span className="text-[10px] font-bold text-blue-600 bg-white px-2 py-0.5 rounded-full border border-blue-200">
                İşaret Parmağı
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Butonlara basmak, renkleri seçmek ve balonları patlatmak için tek tık kullanılır.
            </p>
          </div>

          {/* Çift Tık */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-800 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                2. Çift Tık
              </span>
              <span className="text-[10px] font-bold text-amber-700 bg-white px-2 py-0.5 rounded-full border border-amber-200">
                Hızlıca 2 Kez
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Sol tuşa parmağı kaldırmadan peş peşe iki kez basılır. Klasör ve sandıkları açar.
            </p>
          </div>

          {/* Sağ Tık */}
          <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/80 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-rose-800 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
                3. Sağ Tık
              </span>
              <span className="text-[10px] font-bold text-rose-600 bg-white px-2 py-0.5 rounded-full border border-rose-200">
                Orta Parmak
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Farenin sağ tuşuna basılarak roketler uzaya fırlatılır veya özel menüler açılır.
            </p>
          </div>

          {/* Sürükle ve Bırak */}
          <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/80 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-purple-800 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block" />
                4. Sürükle & Bırak
              </span>
              <span className="text-[10px] font-bold text-purple-600 bg-white px-2 py-0.5 rounded-full border border-purple-200">
                Basılı Tut & Bırak
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Sol tuşa basılı tutarak nesneyi hedefine taşır, varış noktasında parmağınızı bırakırsınız.
            </p>
          </div>
        </div>

        {/* Live mouse tip */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] sm:text-xs text-slate-500 font-bold">
          <span className="text-blue-600 text-sm">💡</span>
          <span>
            <strong>Canlı Mouse İpucu:</strong> Üst paneldeki fare simgesine dikkat edin; farenizin hangi tuşuna basarsanız o tuş anında yukarıda ışık saçarak aktifleşir!
          </span>
        </div>
      </div>

      {/* Stage Filter Tabs */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-base sm:text-xl font-black text-slate-800">
            🗺️ Etkinlik Haritası
          </span>
          <span className="text-xs font-bold text-slate-500 hidden sm:inline">
            (12 Etkinlik • 3 Aşama)
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border-2 border-slate-200 shadow-2xs">
          <button
            onClick={() => setSelectedStageFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              selectedStageFilter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tüm Etkinlikler (1-12)
          </button>

          {STAGES.map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStageFilter(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedStageFilter === st.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st.title.split(':')[0]} ({st.totalMinutes} dk)
            </button>
          ))}
        </div>
      </div>

      {/* Activities Grid */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredActivities.map((act) => {
          const status = completedActivities[act.id] || { completed: false, stars: 0, score: 0 };
          const isDone = status.completed;

          return (
            <div
              key={act.id}
              onClick={() => onSelectActivity(act.id)}
              className="relative bg-white rounded-3xl border-3 border-slate-200 hover:border-blue-400 p-6 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-1 select-none"
              style={{
                boxShadow: `0 6px 0 ${act.bgLedgeColor || '#94a3b8'}`,
              }}
            >
              <div>
                {/* Card Top: Number & Skill Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-black text-xs flex items-center justify-center border border-blue-200">
                      #{act.id}
                    </span>
                    <span className="text-[11px] font-extrabold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {act.durationMinutes} dk
                    </span>
                  </div>

                  <span
                    className="px-2.5 py-1 rounded-full text-[11px] font-black text-white shadow-2xs"
                    style={{ backgroundColor: act.color }}
                  >
                    {act.skillBadge}
                  </span>
                </div>

                {/* Title & Goal */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-lg font-black text-slate-800 leading-tight">
                      {act.title}
                    </h4>
                    <p className="text-xs font-bold text-blue-600 mt-0.5">
                      {act.subtitle}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakTurkishText(`${act.title}. ${act.actionInstruction}`);
                    }}
                    className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer shrink-0"
                    title="Görevi Sesli Dinle"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-2 line-clamp-2">
                  {act.goal}
                </p>
              </div>

              {/* Card Footer: Status & Play Button (No stars on home page) */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  {isDone && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Tamamlandı
                    </span>
                  )}
                </div>

                {/* Play button */}
                <button
                  className="px-4 py-2 rounded-full font-bold text-xs text-white flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer"
                  style={{ backgroundColor: act.color }}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isDone ? 'Tekrar Oyna' : 'Başla'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
