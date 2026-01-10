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
  return (
    <div
      className="pixel-border bg-[var(--cream)] overflow-hidden"
      style={{
        width: size,
        height: size,
      }}
    >
      <img
        src={src || '/avatar-placeholder.png'}
        alt={alt}
        className="w-full h-full object-cover"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src =
            '/avatar-placeholder.png';
        }}
      />
    </div>
  );
}