import { useId } from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, maxLength = 500, id: externalId, ...props }: InputProps) {
  const autoId = useId();
  const inputId = externalId || autoId;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="space-y-1">
      {label && <label htmlFor={inputId} className="text-sm font-medium text-gray-700">{label}</label>}
      <input
        id={inputId}
        maxLength={maxLength}
        aria-invalid={!!error}
        aria-describedby={errorId}
        className={cn(
          'w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-white',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'focus-visible:ring-2 focus-visible:ring-primary-500',
          'placeholder:text-gray-400 transition-all min-h-[44px]',
          error && 'border-red-300 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && <p id={errorId} className="text-xs text-red-500" role="alert">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className, id: externalId, ...props }: SelectProps) {
  const autoId = useId();
  const selectId = externalId || autoId;

  return (
    <div className="space-y-1">
      {label && <label htmlFor={selectId} className="text-sm font-medium text-gray-700">{label}</label>}
      <select
        id={selectId}
        className={cn(
          'w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-white',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'focus-visible:ring-2 focus-visible:ring-primary-500',
          'min-h-[44px] appearance-none',
          className
        )}
        {...props}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function TextArea({ label, className, maxLength = 5000, id: externalId, ...props }: TextAreaProps) {
  const autoId = useId();
  const taId = externalId || autoId;

  return (
    <div className="space-y-1">
      {label && <label htmlFor={taId} className="text-sm font-medium text-gray-700">{label}</label>}
      <textarea
        id={taId}
        maxLength={maxLength}
        className={cn(
          'w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-white',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'focus-visible:ring-2 focus-visible:ring-primary-500',
          'placeholder:text-gray-400 transition-all resize-none',
          className
        )}
        rows={3}
        {...props}
      />
    </div>
  );
}
