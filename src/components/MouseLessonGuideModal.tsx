import React from 'react';
import { X, Check } from 'lucide-react';
import { MouseActionBadge } from './MouseActionBadge.tsx';

interface MouseLessonGuideModalProps {
  onClose: () => void;
}

export const MouseLessonGuideModal: React.FC<MouseLessonGuideModalProps> = ({
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border-4 border-blue-400 shadow-2xl p-6 sm:p-8 flex flex-col my-auto animate-in zoom-in-95 duration-200 select-none">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Kapat"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 border-2 border-blue-300 flex items-center justify-center text-2xl">
            🖱️
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-800">
              Mouse (Fare) Nasıl Kullanılır?
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-slate-500">
              İlkokul öğrencileri için temel el pozisyonu ve tuş rehberi
            </p>
          </div>
        </div>

        {/* Interactive Anatomy Card */}
        <div className="bg-[#f0f7ff] border-2 border-[#bae6fd] rounded-2xl p-4 sm:p-6 mb-6 flex flex-col sm:flex-row items-center justify-around gap-6">
          {/* Big Visual SVG Mouse */}
          <div className="w-36 h-48 relative shrink-0">
            <svg viewBox="0 0 100 140" className="w-full h-full drop-shadow-md" fill="none">
              {/* Outer Shell */}
              <rect
                x="10"
                y="10"
                width="80"
                height="120"
                rx="40"
                className="fill-white stroke-slate-400 stroke-[3]"
              />
              {/* Center Divider Line */}
              <path d="M50 10V60" className="stroke-slate-400 stroke-[3]" />
              <path d="M10 60H90" className="stroke-slate-400 stroke-[3]" />

              {/* Left Button (Highlighted Blue) */}
              <path
                d="M10 50C10 27.9 27.9 10 50 10V60H10V50Z"
                className="fill-blue-500/30 hover:fill-blue-500/50 transition-colors cursor-pointer"
              />
              <text x="30" y="42" className="text-[9px] font-extrabold fill-blue-800 text-center" textAnchor="middle">
                SOL
              </text>

              {/* Right Button (Highlighted Coral) */}
              <path
                d="M50 10C72.1 10 90 27.9 90 50V60H50V10Z"
                className="fill-rose-500/30 hover:fill-rose-500/50 transition-colors cursor-pointer"
              />
              <text x="70" y="42" className="text-[9px] font-extrabold fill-rose-800 text-center" textAnchor="middle">
                SAĞ
              </text>

              {/* Scroll Wheel */}
              <rect
                x="44"
                y="24"
                width="12"
                height="22"
                rx="6"
                className="fill-slate-600 stroke-slate-700 stroke-1"
              />
              <path d="M44 32H56" className="stroke-white stroke-1 opacity-60" />
              <path d="M44 38H56" className="stroke-white stroke-1 opacity-60" />

              {/* Palm Resting Area */}
              <text x="50" y="95" className="text-[8px] font-bold fill-slate-400" textAnchor="middle">
                Avuç İçi Alanı
              </text>
            </svg>
          </div>

          {/* Finger Placement Guidelines */}
          <div className="flex flex-col gap-2.5 text-xs sm:text-sm font-semibold text-slate-700">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-500 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>
              <span>
                <strong className="text-blue-700 font-bold">İşaret Parmağı:</strong> Farenin <strong className="text-blue-700">SOL</strong> tuşunun üzerinde durmalıdır.
              </span>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                2
              </span>
              <span>
                <strong className="text-rose-700 font-bold">Orta Parmak:</strong> Farenin <strong className="text-rose-700">SAĞ</strong> tuşunun üzerinde rahatça durmalıdır.
              </span>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-500 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                3
              </span>
              <span>
                <strong className="text-slate-800 font-bold">Baş ve Yüzük Parmağı:</strong> Fareyi yanlardan hafifçe kavrar, sıkmadan yönlendirir.
              </span>
            </div>
          </div>
        </div>

        {/* The 4 Core Mechanics Quick Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="p-3 rounded-2xl border border-blue-200 bg-blue-50/50 flex items-start gap-2.5">
            <MouseActionBadge action="left-click" size="sm" />
            <div className="text-xs text-slate-600">
              <strong className="text-slate-800 block mb-0.5">Sol Tık</strong>
              Butonlara basmak, nesneleri seçmek ve oyundaki balonları patlatmak için kullanılır.
            </div>
          </div>

          <div className="p-3 rounded-2xl border border-amber-200 bg-amber-50/50 flex items-start gap-2.5">
            <MouseActionBadge action="double-click" size="sm" />
            <div className="text-xs text-slate-600">
              <strong className="text-slate-800 block mb-0.5">Çift Tık</strong>
              Sol tuşa parmağı kaldırmadan hızlıca iki kez basılır. Klasör ve sandıkları açar!
            </div>
          </div>

          <div className="p-3 rounded-2xl border border-rose-200 bg-rose-50/50 flex items-start gap-2.5">
            <MouseActionBadge action="right-click" size="sm" />
            <div className="text-xs text-slate-600">
              <strong className="text-slate-800 block mb-0.5">Sağ Tık</strong>
              Özel seçenekler ve sihirli menüyü açar. Orta parmakla basılır.
            </div>
          </div>

          <div className="p-3 rounded-2xl border border-purple-200 bg-purple-50/50 flex items-start gap-2.5">
            <MouseActionBadge action="drag-drop" size="sm" />
            <div className="text-xs text-slate-600">
              <strong className="text-slate-800 block mb-0.5">Sürükle & Bırak</strong>
              Sol tuşa basılı tutarak nesneyi taşır, varış yerine gelince parmağı bırakırsınız.
            </div>
          </div>
        </div>

        {/* Understood Action Button */}
        <button
          onClick={onClose}
          className="btn-toy-success w-full py-3 px-6 rounded-full bg-[#10b981] hover:bg-[#059669] text-white font-extrabold text-base flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          <Check className="w-5 h-5" />
          <span>Anladım, Maceraya Başla!</span>
        </button>
      </div>
    </div>
  );
};
