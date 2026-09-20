import React from 'react';
import { MouseActionType } from '../types.ts';

interface MouseActionBadgeProps {
  action: MouseActionType;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export const MouseActionBadge: React.FC<MouseActionBadgeProps> = ({
  action,
  label,
  size = 'md',
  animated = true,
}) => {
  const getBadgeConfig = () => {
    switch (action) {
      case 'left-click':
        return {
          bg: 'bg-[#dbeafe]',
          text: 'text-[#1d4ed8]',
          border: 'border-[#93c5fd]',
          defaultLabel: 'Sol Tık',
          activeButton: 'left',
        };
      case 'double-click':
        return {
          bg: 'bg-[#fef3c7]',
          text: 'text-[#b45309]',
          border: 'border-[#fcd34d]',
          defaultLabel: 'Çift Tık (2 Kez Hızlı)',
          activeButton: 'double',
        };
      case 'right-click':
        return {
          bg: 'bg-[#ffe4e6]',
          text: 'text-[#be123c]',
          border: 'border-[#fca5a5]',
          defaultLabel: 'Sağ Tık (Özel Menü)',
          activeButton: 'right',
        };
      case 'drag-drop':
        return {
          bg: 'bg-[#ede9fe]',
          text: 'text-[#6d28d9]',
          border: 'border-[#c4b5fd]',
          defaultLabel: 'Sürükle & Bırak',
          activeButton: 'drag',
        };
      case 'hover':
      default:
        return {
          bg: 'bg-[#dcfce7]',
          text: 'text-[#047857]',
          border: 'border-[#86efac]',
          defaultLabel: 'Hassas Gezinme',
          activeButton: 'hover',
        };
    }
  };

  const config = getBadgeConfig();
  const displayLabel = label || config.defaultLabel;

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3.5 py-1.5 text-sm gap-2',
    lg: 'px-5 py-2 text-base gap-2.5',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full font-bold border ${config.bg} ${config.text} ${config.border} ${sizeClasses} shadow-xs select-none whitespace-nowrap`}
    >
      {/* Visual Mini Mouse Indicator */}
      <svg
        className={size === 'lg' ? 'w-5 h-6' : 'w-4 h-5'}
        viewBox="0 0 24 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Mouse body */}
        <rect
          x="3"
          y="2"
          width="18"
          height="28"
          rx="9"
          className="fill-white stroke-current stroke-2"
        />
        {/* Horizontal separator */}
        <path d="M3 13H21" className="stroke-current stroke-1 opacity-40" />
        {/* Vertical button divider */}
        <path d="M12 2V13" className="stroke-current stroke-1 opacity-40" />

        {/* Left Button Highlight */}
        {(config.activeButton === 'left' || config.activeButton === 'double' || config.activeButton === 'drag') && (
          <path
            d="M3 11C3 6.02944 7.02944 2 12 2V13H3V11Z"
            className={
              config.activeButton === 'double'
                ? 'fill-[#f59e0b]'
                : config.activeButton === 'drag'
                ? 'fill-[#8b5cf6]'
                : 'fill-[#2563eb]'
            }
          />
        )}

        {/* Right Button Highlight */}
        {config.activeButton === 'right' && (
          <path
            d="M12 2C16.9706 2 21 6.02944 21 11V13H12V2Z"
            className="fill-[#e11d48]"
          />
        )}

        {/* Scroll wheel */}
        <rect
          x="10.5"
          y="5"
          width="3"
          height="6"
          rx="1.5"
          className="fill-slate-400"
        />

        {/* Double click ripple cue */}
        {config.activeButton === 'double' && animated && (
          <circle
            cx="7"
            cy="7"
            r="3"
            className="stroke-amber-600 stroke-1 fill-none animate-ping"
          />
        )}
      </svg>

      <span>{displayLabel}</span>
    </span>
  );
};
