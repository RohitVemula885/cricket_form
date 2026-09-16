import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function InputField({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  required = false,
  options = [],
  icon: Icon,
  disabled = false,
  helperText,
  maxLength,
}) {
  const isSelect = type === 'select';
  const hasError = Boolean(error);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <label 
          htmlFor={id} 
          className="block text-sm font-semibold text-slate-700"
        >
          {label}
          {required && <span className="text-rose-500 ml-1" aria-hidden="true">*</span>}
        </label>
        {helperText && !hasError && (
          <span className="text-xs text-slate-400 font-medium">{helperText}</span>
        )}
      </div>

      <div className="relative rounded-lg shadow-2xs">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}

        {isSelect ? (
          <select
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            className={`w-full appearance-none rounded-lg bg-white px-3.5 py-2.5 text-sm text-slate-800 transition-colors border ${
              hasError
                ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                : 'border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-100'
            } ${Icon ? 'pl-10' : ''} pr-10 outline-hidden font-medium disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer`}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={id}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            className={`w-full rounded-lg bg-white px-3.5 py-2.5 text-sm text-slate-800 transition-colors border ${
              hasError
                ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                : 'border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-100'
            } ${Icon ? 'pl-10' : ''} outline-hidden font-medium placeholder:text-slate-400 placeholder:font-normal disabled:bg-slate-50 disabled:text-slate-400`}
          />
        )}

        {isSelect && (
          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}
      </div>

      {/* Clean Error Message display */}
      {hasError && (
        <p 
          id={`${id}-error`} 
          className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-rose-600 animate-in fade-in duration-150"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
