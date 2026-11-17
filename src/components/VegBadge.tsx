import React from 'react';

interface VegBadgeProps {
  isVeg: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const VegBadge: React.FC<VegBadgeProps> = ({ isVeg, size = 'md', showLabel = false }) => {
  const boxDimensions = {
    sm: 'w-3.5 h-3.5 p-[2px]',
    md: 'w-4 h-4 p-[2.5px]',
    lg: 'w-5 h-5 p-[3px]',
  }[size];

  const dotDimensions = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  }[size];

  return (
    <div className="inline-flex items-center gap-1.5">
      <div
        className={`${boxDimensions} border-2 rounded-[3px] flex items-center justify-center flex-shrink-0 transition-transform ${
          isVeg
            ? 'border-emerald-500 bg-emerald-950/20 shadow-glow-veg/30'
            : 'border-rose-500 bg-rose-950/20 shadow-glow-nonveg/30'
        }`}
        title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
      >
        <div
          className={`${dotDimensions} rounded-full ${
            isVeg ? 'bg-emerald-500' : 'bg-rose-500'
          }`}
        />
      </div>
      {showLabel && (
        <span
          className={`text-xs font-semibold uppercase tracking-wider ${
            isVeg ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {isVeg ? 'Veg' : 'Non-Veg'}
        </span>
      )}
    </div>
  );
};
