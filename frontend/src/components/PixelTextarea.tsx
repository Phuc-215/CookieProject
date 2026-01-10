import React from 'react';

interface PixelTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function PixelTextarea({ label, className = '', ...props }: PixelTextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block mb-2 uppercase text-sm tracking-wide">
          {label}
        </label>
      )}
      <textarea
        className={`w-full px-4 py-3 pixel-border bg-white text-[#5D4037] placeholder:text-[#5D4037]/50 focus:outline-none focus:shadow-[0_0_0_3px_var(--brown)] transition-shadow resize-none ${className}`}
        {...props}
      />
    </div>
  );
}
