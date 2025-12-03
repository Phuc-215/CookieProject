import React from 'react';

interface PixelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function PixelInput({ label, className = '', ...props }: PixelInputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block mb-2 uppercase text-sm tracking-wide">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 pixel-border bg-white text-[var(--choco)] placeholder:text-[var(--choco)]/50 focus:outline-none focus:shadow-[0_0_0_3px_#FF8FAB] transition-shadow ${className}`}
        {...props}
      />
    </div>
  );
}
