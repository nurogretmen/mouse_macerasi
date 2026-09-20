import React, { useState, useEffect, useRef } from 'react';

interface InteractiveMouseWidgetProps {
  lastActionText?: string;
  className?: string;
}

export const InteractiveMouseWidget: React.FC<InteractiveMouseWidgetProps> = ({
  lastActionText,
  className = '',
}) => {
  const [leftPressed, setLeftPressed] = useState(false);
  const [rightPressed, setRightPressed] = useState(false);
  const [wheelPressed, setWheelPressed] = useState(false);
  const [isDoubleClick, setIsDoubleClick] = useState(false);
  const [recentAction, setRecentAction] = useState<string>('Hazır');
  const doubleClickTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        setLeftPressed(true);
        setRecentAction('Sol Tık!');
      } else if (e.button === 2) {
        setRightPressed(true);
        setRecentAction('Sağ Tık!');
      } else if (e.button === 1) {
        setWheelPressed(true);
        setRecentAction('Tekerlek Tıkı!');
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) setLeftPressed(false);
      if (e.button === 2) setRightPressed(false);
      if (e.button === 1) setWheelPressed(false);
    };

    const handleDblClick = () => {
      setIsDoubleClick(true);
      setRecentAction('Çift Tık!');
      if (doubleClickTimeoutRef.current) {
        window.clearTimeout(doubleClickTimeoutRef.current);
      }
      doubleClickTimeoutRef.current = window.setTimeout(() => {
        setIsDoubleClick(false);
      }, 500);
    };

    const handleWheel = () => {
      setWheelPressed(true);
      setRecentAction('Tekerlek!');
      setTimeout(() => setWheelPressed(false), 250);
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('dblclick', handleDblClick);
    window.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('dblclick', handleDblClick);
      window.removeEventListener('wheel', handleWheel);
      if (doubleClickTimeoutRef.current) {
        window.clearTimeout(doubleClickTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`flex items-center gap-2 sm:gap-2.5 bg-slate-50/90 hover:bg-slate-100/90 px-2.5 sm:px-3.5 py-1.5 rounded-2xl border-2 border-slate-200/80 shadow-2xs select-none transition-colors ${className}`}
      title="Canlı Mouse Algılayıcı: Farenizin tuşlarına bastığınızda burada anlık olarak yanar!"
    >
      {/* SVG Mouse Graphic */}
      <div className="relative w-6 h-9 sm:w-7 sm:h-10 shrink-0">
        <svg viewBox="0 0 28 40" className="w-full h-full drop-shadow-2xs" fill="none">
          {/* Outer Mouse Body */}
          <rect
            x="2"
            y="2"
            width="24"
            height="36"
            rx="12"
            className="fill-white stroke-slate-300 stroke-2"
          />
          {/* Dividers */}
          <path d="M2 17H26" className="stroke-slate-300 stroke-1" />
          <path d="M14 2V17" className="stroke-slate-300 stroke-1" />

          {/* Left Click Area */}
          <path
            d="M2 14C2 7.37 7.37 2 14 2V17H2V14Z"
            className={`transition-colors duration-100 ${
              isDoubleClick
                ? 'fill-amber-400'
                : leftPressed
                ? 'fill-[#2563eb]'
                : 'fill-slate-100 hover:fill-blue-50'
            }`}
          />

          {/* Right Click Area */}
          <path
            d="M14 2C20.63 2 26 7.37 26 14V17H14V2Z"
            className={`transition-colors duration-100 ${
              rightPressed
                ? 'fill-[#f43f5e]'
                : 'fill-slate-100 hover:fill-rose-50'
            }`}
          />

          {/* Scroll Wheel */}
          <rect
            x="12"
            y="5"
            width="4"
            height="8"
            rx="2"
            className={`transition-colors duration-100 ${
              wheelPressed ? 'fill-amber-500' : 'fill-slate-400'
            }`}
          />
        </svg>

        {/* Dynamic Glow / Ping Highlights */}
        {(leftPressed || isDoubleClick) && (
          <span className="absolute -top-1 -left-1 w-3.5 h-3.5 rounded-full bg-blue-500 animate-ping opacity-75 pointer-events-none" />
        )}
        {rightPressed && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping opacity-75 pointer-events-none" />
        )}
        {wheelPressed && (
          <span className="absolute top-1 left-1.5 w-3 h-3 rounded-full bg-amber-400 animate-ping opacity-75 pointer-events-none" />
        )}
      </div>

      {/* Text Label */}
      <div className="flex flex-col text-left leading-tight">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Canlı Mouse
        </span>
        <span
          className={`text-xs font-black transition-colors ${
            isDoubleClick
              ? 'text-amber-600'
              : leftPressed
              ? 'text-blue-600'
              : rightPressed
              ? 'text-rose-600'
              : wheelPressed
              ? 'text-amber-600'
              : 'text-slate-700'
          }`}
        >
          {lastActionText || recentAction}
        </span>
      </div>
    </div>
  );
};
