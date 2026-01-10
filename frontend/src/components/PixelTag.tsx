import React from 'react';
import { X } from 'lucide-react';

interface PixelTagProps {
  label: string;
  variant?: 'green' | 'pink' | 'default';
  removable?: boolean;
  onRemove?: () => void;
}

export function PixelTag({ 
  label, 
  variant = 'default', 
  removable = false, 
  onRemove 
}: PixelTagProps) {
  const variantClasses = {
    green: 'bg-[#4DB6AC] text-[#5D4037]',
    pink: 'bg-[#FF8FAB] text-[#5D4037]',
    default: 'bg-white text-[#5D4037]',
  };

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 pixel-border text-sm uppercase ${variantClasses[variant]}`}>
      {label}
      {removable && (
        <button
          onClick={onRemove}
          className="hover:scale-110 transition-transform"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}
