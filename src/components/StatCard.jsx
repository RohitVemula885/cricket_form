import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'slate', // 'slate' | 'teal' | 'amber' | 'rose'
  onClick,
  isActive = false,
}) {
  const variantStyles = {
    slate: {
      border: isActive ? 'border-slate-800 ring-2 ring-slate-400' : 'border-slate-200',
      iconBg: 'bg-slate-100 text-slate-800',
      badge: 'bg-slate-100 text-slate-700',
      valueColor: 'text-slate-900',
    },
    teal: {
      border: isActive ? 'border-teal-600 ring-2 ring-teal-300' : 'border-teal-200/70',
      iconBg: 'bg-teal-50 text-teal-700',
      badge: 'bg-teal-50 text-teal-700 border-teal-200',
      valueColor: 'text-teal-700',
    },
    amber: {
      border: isActive ? 'border-amber-500 ring-2 ring-amber-300' : 'border-amber-200/70',
      iconBg: 'bg-amber-50 text-amber-700',
      badge: 'bg-amber-50 text-amber-800 border-amber-200',
      valueColor: 'text-amber-800',
    },
    rose: {
      border: isActive ? 'border-rose-500 ring-2 ring-rose-300' : 'border-rose-200/70',
      iconBg: 'bg-rose-50 text-rose-700',
      badge: 'bg-rose-50 text-rose-800 border-rose-200',
      valueColor: 'text-rose-800',
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.slate;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border p-4 sm:p-5 transition-all shadow-2xs ${
        onClick ? 'cursor-pointer hover:shadow-xs hover:-translate-y-0.5' : ''
      } ${currentVariant.border}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm font-semibold text-slate-600 uppercase tracking-wider">
          {title}
        </span>
        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${currentVariant.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-2.5 sm:mt-3 flex items-baseline gap-2">
        <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${currentVariant.valueColor}`}>
          {value}
        </span>
        {subtitle && (
          <span className="text-xs text-slate-400 font-medium">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
