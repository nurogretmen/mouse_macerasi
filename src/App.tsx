import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { LevelSelector } from './components/LevelSelector.tsx';
import { TeacherArea } from './components/TeacherArea.tsx';
import { AchievementsView } from './components/AchievementsView.tsx';
import { MouseLessonGuideModal } from './components/MouseLessonGuideModal.tsx';
import { LevelCompleteModal } from './components/LevelCompleteModal.tsx';
import { ACTIVITIES } from './data/activities.ts';
import { AppView } from './types.ts';
import { ArrowLeft, BookOpen, RotateCcw } from 'lucide-react';
import { soundEffects } from './utils/audio.ts';

// 12 Activity Components
import { Activity1Butterfly } from './components/levels/Activity1Butterfly.tsx';
import { Activity2BalloonsSingle } from './components/levels/Activity2BalloonsSingle.tsx';
import { Activity3ColorSquares } from './components/levels/Activity3ColorSquares.tsx';
import { Activity4RabbitPath } from './components/levels/Activity4RabbitPath.tsx';
import { Activity5BalloonsDouble } from './components/levels/Activity5BalloonsDouble.tsx';
import { Activity6MemoryCards } from './components/levels/Activity6MemoryCards.tsx';
import { Activity7RocketLaunch } from './components/levels/Activity7RocketLaunch.tsx';
import { Activity8ShadowMatch } from './components/levels/Activity8ShadowMatch.tsx';
import { Activity9GardenPuzzle } from './components/levels/Activity9GardenPuzzle.tsx';
import { Activity10MoleReflex } from './components/levels/Activity10MoleReflex.tsx';
import { Activity11MovingStars } from './components/levels/Activity11MovingStars.tsx';
import { Activity12StarLadder } from './components/levels/Activity12StarLadder.tsx';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [activeActivityId, setActiveActivityId] = useState<number | null>(null);

  // Fresh reset on entry as explicitly requested:
  // "bir öğrenci bu uygulamaya her girdiğinde o yıldızları görmemeli her girdiğinde sıfırlanmış bir vaziyette olmalı."
  const [completedActivities, setCompletedActivities] = useState<
    Record<number, { completed: boolean; stars: number; score: number }>
  >(() => {
    const initial: Record<number, { completed: boolean; stars: number; score: number }> = {};
    ACTIVITIES.forEach((a) => {
      initial[a.id] = { completed: false, stars: 0, score: 0 };
    });
    return initial;
  });

  const [totalScore, setTotalScore] = useState<number>(0);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('mouse_adventure_sound');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [showGuideModal, setShowGuideModal] = useState(false);
  const [completedModalInfo, setCompletedModalInfo] = useState<{
    activityId: number;
    stars: number;
    score: number;
  } | null>(null);

  // Sound preference persistence
  useEffect(() => {
    try {
      localStorage.setItem('mouse_adventure_sound', soundEnabled.toString());
    } catch {
      // storage quota
    }
  }, [soundEnabled]);

  const totalStars = Object.values(completedActivities).reduce(
    (acc, curr) => acc + (curr.stars || 0),
    0
  );
  const maxStars = ACTIVITIES.length * 3;

  const handleSoundToggle = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (next) {
      soundEffects.playPop(true);
    }
  };

  const handleSelectView = (view: AppView) => {
    soundEffects.playPop(soundEnabled);
    setCurrentView(view);
    setActiveActivityId(null);
    setCompletedModalInfo(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectActivity = (activityId: number) => {
    soundEffects.playPop(soundEnabled);
    setActiveActivityId(activityId);
    setCompletedModalInfo(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleActivityCompleted = (stars: number, earnedScore: number) => {
    if (activeActivityId === null) return;

    setCompletedActivities((prev) => {
      const current = prev[activeActivityId] || { completed: false, stars: 0, score: 0 };
      return {
        ...prev,
        [activeActivityId]: {
          completed: true,
          stars: Math.max(current.stars, stars),
          score: Math.max(current.score, earnedScore),
        },
      };
    });

    setTotalScore((prev) => prev + earnedScore);

    setCompletedModalInfo({
      activityId: activeActivityId,
      stars,
      score: earnedScore,
    });
  };

  const handleNextActivity = () => {
    if (activeActivityId === null) return;
    const nextId = activeActivityId + 1;
    const nextAct = ACTIVITIES.find((a) => a.id === nextId);

    if (nextAct) {
      setActiveActivityId(nextId);
      setCompletedModalInfo(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCompletedModalInfo(null);
      setActiveActivityId(null);
      setCurrentView('achievements');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleReplayActivity = () => {
    setCompletedModalInfo(null);
  };

  const handleGoHome = () => {
    soundEffects.playPop(soundEnabled);
    setActiveActivityId(null);
    setCurrentView('home');
    setCompletedModalInfo(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUnlockAll = () => {
    soundEffects.playMagicChime(soundEnabled);
    soundEffects.playFanfare(soundEnabled);
    const unlocked: Record<number, { completed: boolean; stars: number; score: number }> = {};
    ACTIVITIES.forEach((a) => {
      unlocked[a.id] = { completed: true, stars: 3, score: 100 };
    });
    setCompletedActivities(unlocked);
  };

  const handleResetProgress = () => {
    soundEffects.playPop(soundEnabled);
    const reset: Record<number, { completed: boolean; stars: number; score: number }> = {};
    ACTIVITIES.forEach((a) => {
      reset[a.id] = { completed: false, stars: 0, score: 0 };
    });
    setCompletedActivities(reset);
    setTotalScore(0);
  };

  const activeActivity = ACTIVITIES.find((a) => a.id === activeActivityId);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-[#0f172a] selection:bg-[#fde047] selection:text-[#0f172a]">
      {/* Top Application Header */}
      <Header
        soundEnabled={soundEnabled}
        onSoundToggle={handleSoundToggle}
        onGoHome={handleGoHome}
        onOpenGuide={() => setShowGuideModal(true)}
        activeActivityTitle={activeActivity?.title}
        isGameActive={activeActivityId !== null}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 flex flex-col items-center">
        {activeActivityId !== null ? (
          /* Active Game/Activity Screen - Focused & Restrained */
          <div className="w-full flex flex-col items-center">
            {/* Top Navigation Bar inside Active Activity */}
            <div className="w-full max-w-5xl flex items-center justify-between gap-2 mb-4">
              <button
                onClick={handleGoHome}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white text-slate-700 font-black text-xs sm:text-sm border-2 border-slate-200 cursor-pointer shadow-xs hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Ana Sayfaya Dön</span>
              </button>

              {/* Guide Button */}
              <button
                onClick={() => setShowGuideModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-blue-50 text-blue-700 text-xs sm:text-sm font-black border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span>Tuş Rehberi</span>
              </button>
            </div>

            {/* Dynamic Activity Component Rendering */}
            {activeActivityId === 1 && (
              <Activity1Butterfly
                key={activeActivityId}
                soundEnabled={soundEnabled}
                onComplete={handleActivityCompleted}
                onSoundToggle={handleSoundToggle}
              />
            )}

            {activeActivityId === 2 && (
              <Activity2BalloonsSingle
                key={activeActivityId}
                soundEnabled={soundEnabled}
                onComplete={handleActivityCompleted}
                onSoundToggle={handleSoundToggle}
              />
            )}

            {activeActivityId === 3 && (
              <Activity3ColorSquares
                key={activeActivityId}
                soundEnabled={soundEnabled}
                onComplete={handleActivityCompleted}
                onSoundToggle={handleSoundToggle}
              />
            )}

            {activeActivityId === 4 && (
              <Activity4RabbitPath
                key={activeActivityId}
                soundEnabled={soundEnabled}
                onComplete={handleActivityCompleted}
                onSoundToggle={handleSoundToggle}
              />
            )}

            {activeActivityId === 5 && (
              <Activity5BalloonsDouble
                key={activeActivityId}
                soundEnabled={soundEnabled}
                onComplete={handleActivityCompleted}
                onSoundToggle={handleSoundToggle}
              />
            )}

            {activeActivityId === 6 && (
              <Activity6MemoryCards
                key={activeActivityId}
                soundEnabled={soundEnabled}
                onComplete={handleActivityCompleted}
                onSoundToggle={handleSoundToggle}
              />
            )}

            {activeActivityId === 7 && (
              <Activity7RocketLaunch
                key={activeActivityId}
                soundEnabled={soundEnabled}
                onComplete={handleActivityCompleted}
                onSoundToggle={handleSoundToggle}
              />
            )}

            {activeActivityId === 8 && (
              <Activity8ShadowMatch
                key={activeActivityId}
                soundEnabled={soundEnabled}
                onComplete={handleActivityCompleted}
                onSoundToggle={handleSoundToggle}
              />
            )}

            {activeActivityId === 9 && (
              <Activity9GardenPuzzle
                key={activeActivityId}
                soundEnabled={soundEnabled}
                onComplete={handleActivityCompleted}
                onSoundToggle={handleSoundToggle}
              />
            )}

            {activeActivityId === 10 && (
              <Activity10MoleReflex
                key={activeActivityId}
                soundEnabled={soundEnabled}
                onComplete={handleActivityCompleted}
                onSoundToggle={handleSoundToggle}
              />
            )}

            {activeActivityId === 11 && (
              <Activity11MovingStars
                key={activeActivityId}
                soundEnabled={soundEnabled}
                onComplete={handleActivityCompleted}
                onSoundToggle={handleSoundToggle}
              />
            )}

            {activeActivityId === 12 && (
              <Activity12StarLadder
                key={activeActivityId}
                soundEnabled={soundEnabled}
                onComplete={handleActivityCompleted}
                onSoundToggle={handleSoundToggle}
              />
            )}
          </div>
        ) : (
          /* Main Views */
          <div className="w-full">
            {currentView === 'teacher' && (
              <TeacherArea
                completedActivities={completedActivities}
                onSelectActivity={handleSelectActivity}
                onUnlockAll={handleUnlockAll}
                onResetProgress={handleResetProgress}
                soundEnabled={soundEnabled}
                onToggleSound={handleSoundToggle}
              />
            )}

            {currentView === 'achievements' && (
              <AchievementsView
                completedActivities={completedActivities}
                totalStars={totalStars}
                totalScore={totalScore}
                onSelectActivity={handleSelectActivity}
              />
            )}

            {(currentView === 'home' || currentView === 'map' || currentView === 'games') && (
              <LevelSelector
                completedActivities={completedActivities}
                onSelectActivity={handleSelectActivity}
                totalStars={totalStars}
                onOpenGuide={() => setShowGuideModal(true)}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer Bar - strictly matching "Mouse Macerası • Nur Öğretmen" */}
      <footer className="w-full border-t border-slate-200 bg-white/90 py-4 px-6 text-center text-xs font-semibold text-slate-500 mt-auto select-none shadow-xs">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-bold text-slate-700">
            <span>🖱️ Mouse Macerası</span>
            <span className="text-slate-400">•</span>
            <span className="text-blue-700 font-extrabold">Nur Öğretmen</span>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Tüm etkinlik ilerlemeni ve yıldızlarını sıfırlamak istiyor musun?')) {
                handleResetProgress();
              }
            }}
            className="text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>İlerlemeyi Sıfırla</span>
          </button>
        </div>
      </footer>

      {/* MODALS */}
      {completedModalInfo && activeActivity && (
        <LevelCompleteModal
          levelTitle={activeActivity.title}
          learningOutcome={activeActivity.learningMessage}
          starsEarned={completedModalInfo.stars}
          score={completedModalInfo.score}
          onNextLevel={handleNextActivity}
          onReplay={handleReplayActivity}
          onHome={handleGoHome}
          hasNextLevel={activeActivityId !== null && activeActivityId < ACTIVITIES.length}
        />
      )}

      {showGuideModal && (
        <MouseLessonGuideModal onClose={() => setShowGuideModal(false)} />
      )}
    </div>
  );
}
