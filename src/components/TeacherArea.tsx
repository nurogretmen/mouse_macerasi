import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  KeyRound,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  Users,
  Settings2,
  Play,
  ShieldAlert,
  GraduationCap
} from 'lucide-react';
import { ACTIVITIES, STAGES } from '../data/activities.ts';
import { ActivityInfo } from '../types.ts';

interface TeacherAreaProps {
  completedActivities: Record<number, { completed: boolean; stars: number; score: number }>;
  onSelectActivity: (id: number) => void;
  onUnlockAll: () => void;
  onResetProgress: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const TeacherArea: React.FC<TeacherAreaProps> = ({
  completedActivities,
  onSelectActivity,
  onUnlockAll,
  onResetProgress,
  soundEnabled,
  onToggleSound,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'plan' | 'tracking' | 'controls'>('plan');
  const [teachingMode, setTeachingMode] = useState<'individual' | 'classroom'>('individual');

  const defaultTeacherPass = 'ogretmen123';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === defaultTeacherPass || passcode.trim() === '1234') {
      setIsAuthenticated(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Hatalı öğretmen şifresi! (Varsayılan: 1234 veya ogretmen123)');
    }
  };

  const totalCompleted = Object.values(completedActivities).filter((v) => v.completed).length;

  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-md mx-auto my-8 bg-white rounded-3xl border-4 border-emerald-200 shadow-xl p-8 text-center select-none">
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 border-2 border-emerald-300 text-emerald-700 flex items-center justify-center mx-auto mb-4">
          <GraduationCap className="w-9 h-9" />
        </div>

        <h2 className="text-xl font-black text-slate-800">
          Öğretmen Kontrol Alanı
        </h2>
        <p className="text-xs text-slate-600 font-semibold mt-1 mb-6">
          Ders planı, öğrenci ilerleme takibi ve etkinlik kilit kontrolleri için giriş yapın.
        </p>

        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <div className="relative">
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Öğretmen Şifresi (1234)"
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-300 focus:border-emerald-500 focus:outline-hidden text-sm font-bold text-center"
            />
            <KeyRound className="w-4 h-4 text-slate-400 absolute right-4 top-3.5" />
          </div>

          {errorMsg && (
            <p className="text-xs font-bold text-rose-600 animate-shake">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-[0_4px_0_#047857] active:translate-y-1 transition-transform cursor-pointer"
          >
            Öğretmen Girişi Yap
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 font-semibold">
          💡 İpucu: Hızlı erişim şifresi: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono">1234</code>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto my-4 bg-white rounded-3xl border-4 border-emerald-200 shadow-xl overflow-hidden flex flex-col select-none">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 text-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black">
              Öğretmen Yönetim ve Takip Paneli
            </h1>
            <p className="text-xs text-emerald-100 font-semibold">
              İlkokul Mouse Eğitimi 110 Dakikalık Müfredat ve İlerleme Yönetimi
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAuthenticated(false)}
          className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-xs font-black cursor-pointer"
        >
          Çıkış Yap
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('plan')}
          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'plan'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>110 Dakikalık Ders Planı</span>
        </button>

        <button
          onClick={() => setActiveTab('tracking')}
          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'tracking'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Öğrenci İlerleme Durumu ({totalCompleted}/{ACTIVITIES.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('controls')}
          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'controls'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
          }`}
        >
          <Settings2 className="w-4 h-4" />
          <span>Hızlı Kilit ve Sınıf Ayarları</span>
        </button>
      </div>

      {/* Tab 1: Curriculum Lesson Plan */}
      {activeTab === 'plan' && (
        <div className="p-6 overflow-y-auto max-h-[600px] flex flex-col gap-6">
          <div className="bg-teal-50 border border-teal-200 p-4 rounded-2xl">
            <h3 className="text-sm font-black text-teal-950 flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-teal-700" />
              <span>Ders Akış Özeti (110 Dakika - 3 Aşama)</span>
            </h3>
            <p className="text-xs text-teal-800 font-semibold">
              Öğrencilerin farenin doğru tutuşundan başlayarak tek tık, çift tık, sağ tık ve sürükle-bırak becerilerini eksiksiz tamamlaması için tasarlanmıştır.
            </p>
          </div>

          {STAGES.map((stage) => {
            const stageActivities = ACTIVITIES.filter((a) => a.stageId === stage.id);

            return (
              <div
                key={stage.id}
                className="border-2 border-slate-200 rounded-2xl p-5 bg-white shadow-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 mr-2">
                      {stage.totalMinutes} Dakika
                    </span>
                    <strong className="text-sm sm:text-base font-black text-slate-800">
                      {stage.title}
                    </strong>
                  </div>
                  <span className="text-xs text-slate-500 font-bold">
                    {stage.subtitle}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {stageActivities.map((act) => {
                    const status = completedActivities[act.id];

                    return (
                      <div
                        key={act.id}
                        className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-colors"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {act.id}
                          </span>
                          <div>
                            <h4 className="text-xs font-black text-slate-800">
                              {act.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 font-semibold line-clamp-1">
                              {act.goal}
                            </p>
                            <span className="inline-block mt-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                              ⏱️ {act.durationMinutes} dk • {act.skillBadge}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => onSelectActivity(act.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-black flex items-center gap-1 cursor-pointer shrink-0"
                          title="Doğrudan Başlat"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Aç</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Tracking Student Progress */}
      {activeTab === 'tracking' && (
        <div className="p-6 flex flex-col gap-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-emerald-50 border-2 border-emerald-200 p-4 rounded-2xl text-center">
              <span className="text-2xl font-black text-emerald-700 block">
                {totalCompleted} / {ACTIVITIES.length}
              </span>
              <span className="text-xs font-bold text-emerald-900">
                Tamamlanan Etkinlik
              </span>
            </div>

            <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-2xl text-center">
              <span className="text-2xl font-black text-amber-700 block">
                %{Math.round((totalCompleted / ACTIVITIES.length) * 100)}
              </span>
              <span className="text-xs font-bold text-amber-900">
                Müfredat İlerleme Oranı
              </span>
            </div>

            <div className="bg-purple-50 border-2 border-purple-200 p-4 rounded-2xl text-center">
              <span className="text-2xl font-black text-purple-700 block">
                {Object.values(completedActivities).reduce((acc, v) => acc + (v.stars || 0), 0)} ⭐
              </span>
              <span className="text-xs font-bold text-purple-900">
                Kazanılan Başarı Yıldızı
              </span>
            </div>
          </div>

          {/* Activity Matrix */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-black border-b border-slate-200">
                <tr>
                  <th className="p-3">No</th>
                  <th className="p-3">Etkinlik Adı</th>
                  <th className="p-3">Hedef Becerisi</th>
                  <th className="p-3">Süre</th>
                  <th className="p-3">Durum</th>
                  <th className="p-3 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold">
                {ACTIVITIES.map((act) => {
                  const st = completedActivities[act.id];
                  const isDone = st?.completed;

                  return (
                    <tr key={act.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold">{act.id}</td>
                      <td className="p-3 font-bold text-slate-800">{act.title}</td>
                      <td className="p-3 text-slate-600">{act.skillBadge}</td>
                      <td className="p-3">{act.durationMinutes} dk</td>
                      <td className="p-3">
                        {isDone ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Tamamlandı ({st.stars} ⭐)
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Henüz Yapılmadı</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => onSelectActivity(act.id)}
                          className="px-2 py-1 rounded bg-slate-200 hover:bg-emerald-500 hover:text-white text-slate-700 font-black text-[11px] cursor-pointer"
                        >
                          Etkinliğe Git
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Teacher Fast Controls */}
      {activeTab === 'controls' && (
        <div className="p-6 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Unlock All Activities */}
            <div className="border-2 border-emerald-200 rounded-2xl p-5 bg-emerald-50/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-900 font-black mb-1">
                  <Unlock className="w-5 h-5 text-emerald-600" />
                  <h4>Tüm Etkinliklerin Kilidini Aç</h4>
                </div>
                <p className="text-xs text-emerald-800 font-semibold mb-4">
                  Sınıfta istediğiniz etkinliği anında açmak veya öğrenciye serbest çalışma imkanı tanımak için bütün bölümlerin kilidini açabilirsiniz.
                </p>
              </div>

              <button
                onClick={onUnlockAll}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                <span>Tüm Bölümleri Kilitsiz Yap</span>
              </button>
            </div>

            {/* Reset Progress */}
            <div className="border-2 border-rose-200 rounded-2xl p-5 bg-rose-50/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-rose-900 font-black mb-1">
                  <RotateCcw className="w-5 h-5 text-rose-600" />
                  <h4>Öğrenci İlerlemesini Sıfırla</h4>
                </div>
                <p className="text-xs text-rose-800 font-semibold mb-4">
                  Yeni bir öğrenci başladığında veya yeni bir ders oturumunda kayıtlı yıldız ve puanları sıfırlayabilirsiniz.
                </p>
              </div>

              <button
                onClick={() => {
                  if (window.confirm('Öğrenci ilerlemesini sıfırlamak istediğinize emin misiniz?')) {
                    onResetProgress();
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>İlerlemeyi Sıfırla (Yeni Oturum)</span>
              </button>
            </div>
          </div>

          {/* Mode switch & audio toggle */}
          <div className="border border-slate-200 rounded-2xl p-5 bg-white">
            <h4 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Sınıf İçi Uygulama Ayarları</span>
            </h4>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Uygulama Modu
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTeachingMode('individual')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer ${
                      teachingMode === 'individual'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Bireysel Çalışma
                  </button>
                  <button
                    onClick={() => setTeachingMode('classroom')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer ${
                      teachingMode === 'classroom'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Sınıf İçi Toplu Uygulama (Projeksiyon)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Efekt Sesleri
                </label>
                <button
                  onClick={onToggleSound}
                  className={`px-4 py-1.5 rounded-xl text-xs font-black cursor-pointer ${
                    soundEnabled
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {soundEnabled ? 'Sesler Açık 🔊' : 'Sesler Kapalı 🔇'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
