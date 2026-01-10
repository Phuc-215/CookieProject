import { Camera } from 'lucide-react';

interface ImageUploadProps {
  value?: string;
  rounded?: boolean;
  label?: string;
  className?: string;
  onUpload: (file: File) => void;
}

export function ImageUpload({
  value,
  rounded,
  label,
  className,
  onUpload,
}: ImageUploadProps) {
  return (
    <label className={`cursor-pointer block ${className}`}>
      <div
        className={`
          pixel-border bg-[#FAFAFA]
          aspect-square w-full
          flex items-center justify-center
          overflow-hidden
          ${rounded ? 'rounded-full' : ''}
        `}
      >
        {value ? (
          <img
            src={value}
            alt="upload"
            className="w-full h-full object-cover"
          />
        ) : (
          <Camera className="w-8 h-8 text-[#5D4037]/40" />
        )}
      </div>

      {label && (
        <div className="mt-2 text-xs uppercase text-[#5D4037]/70 text-center">
          {label}
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
        }}
      />
    </label>
  );
}