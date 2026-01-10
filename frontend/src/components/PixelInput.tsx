import React from 'react';

interface PixelInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: boolean | string;
  rightIcon?: React.ReactNode;
}

export function PixelInput({ label, error, rightIcon, className = '', ...props }: PixelInputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block mb-2 uppercase text-sm tracking-wide">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          className={`
            w-full px-4 py-3
            ${rightIcon ? 'pr-12' : ''}
            pixel-border bg-white
            text-[var(--choco)]
            placeholder:text-[var(--choco)]/50
            focus:outline-none transition-shadow
            ${
              error
                ? 'border-pink-500 shadow-[0_0_0_3px_#f9a8d4]'
                : 'focus:shadow-[0_0_0_3px_var(--brown)]'
            }
            ${className}
          `}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
            {rightIcon}
          </div>
        )}
      </div>

    </div>
  );
}