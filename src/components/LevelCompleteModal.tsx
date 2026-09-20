import React from 'react';
import { Star, RotateCcw, Home } from 'lucide-react';

interface LevelCompleteModalProps {
  levelTitle: string;
  learningOutcome?: string;
  starsEarned: number;
  score: number;
  onNextLevel?: () => void;
  onReplay: () => void;
  onHome: () => void;
  hasNextLevel: boolean;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  levelTitle,
  learningOutcome,
  starsEarned,
  score,
  onReplay,
  onHome,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl border-4 border-amber-300 shadow-2xl p-6 sm:p-8 flex flex-col items-center text-center animate-in zoom-in-95 duration-200 select-none">
        {/* Top Floating Badge */}
        <div className="w-20 h-20 -mt-16 rounded-full bg-gradient-to-tr from-amber-400 to-amber-300 border-4 border-white shadow-xl flex items-center justify-center text-4xl animate-bounce">
          🎉
        </div>

        <h3 className="text-2xl sm:text-3xl font-black text-slate-800 mt-2">
          Harika İş Çıkardın!
        </h3>
        <p className="text-slate-600 font-semibold text-sm mt-1">
          <span className="text-blue-600 font-bold">{levelTitle}</span> etkinliğini başarıyla tamamladın!
        </p>

        {learningOutcome && (
          <div className="mt-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold px-4 py-2.5 rounded-2xl">
            💡 {learningOutcome}
          </div>
        )}

        {/* 3 Stars Animation */}
        <div className="flex items-center justify-center gap-3 my-5">
          {[1, 2, 3].map((starIdx) => (
            <div
              key={starIdx}
              className={`transition-all duration-500 ${
                starIdx <= starsEarned
                  ? 'text-amber-400 scale-110 drop-shadow-md animate-pulse'
                  : 'text-slate-200 scale-90'
              }`}
            >
              <Star
                className="w-12 h-12"
                fill={starIdx <= starsEarned ? '#fbbf24' : '#e2e8f0'}
              />
            </div>
          ))}
        </div>

        {/* Score Badge */}
        <div className="bg-[#f0fdf4] border-2 border-emerald-300 px-6 py-2 rounded-full mb-6">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
            Kazanılan Puan:{' '}
          </span>
          <span className="text-xl font-extrabold text-emerald-700">
            +{score}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-3">
          {/* Primary Return to Home */}
          <button
            onClick={onHome}
            className="w-full py-3.5 px-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base flex items-center justify-center gap-2 cursor-pointer shadow-md transition-transform active:scale-95"
          >
            <Home className="w-5 h-5" />
            <span>Ana Sayfaya Dön</span>
          </button>

          {/* Replay */}
          <button
            onClick={onReplay}
            className="w-full py-2.5 px-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer border border-slate-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Tekrar Oyna</span>
          </button>
        </div>
      </div>
    </div>
  );
};
