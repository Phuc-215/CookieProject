import React from "react";

interface PixelButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "destructive";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function PixelButton({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: PixelButtonProps) {
  const baseClasses =
    "pixel-btn font-vt font-bold uppercase tracking-wide transition-all duration-100";

  const variantClasses = {
    primary:"bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[color-mix(in srgb, var(--primary) 85%, black)]",
    secondary:"bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[color-mix(in srgb, var(--secondary) 85%, black)]",
    outline:"bg-[white] text-[var(--foreground)] hover:bg-[var(--cream)] border-[var(--border)]",
    destructive:"bg-[#d4183d] text-white hover:bg-[#b81535]"
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base"
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
