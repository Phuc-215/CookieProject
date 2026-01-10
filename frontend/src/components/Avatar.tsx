import { User } from 'lucide-react';

interface AvatarProps {
  src?: string;        // avatar url
  alt?: string;
  size?: number;       // px, default 32
}

export function Avatar({
  src,
  alt = 'avatar',
  size = 32,
}: AvatarProps) {
  if (!src) {
    return (
      <div
        className="pixel-border bg-[var(--mint)] flex items-center justify-center"
        style={{
          width: size,
          height: size,
        }}
      >
        <User className="text-[var(--foreground)]" style={{ width: size * 0.625, height: size * 0.625 }} />
      </div>
    );
  }

  return (
    <div
      className="pixel-border bg-[var(--cream)] overflow-hidden"
      style={{
        width: size,
        height: size,
      }}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onError={(e) => {
          // Hide image and show icon instead
          const parent = e.currentTarget.parentElement;
          if (parent) {
            parent.className = 'pixel-border bg-[var(--mint)] flex items-center justify-center';
            parent.style.width = `${size}px`;
            parent.style.height = `${size}px`;
            const icon = document.createElement('div');
            icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${size * 0.625}" height="${size * 0.625}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-[var(--foreground)]"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
            parent.innerHTML = '';
            parent.appendChild(icon);
          }
        }}
      />
    </div>
  );
}