import React from "react";

interface HeadlineProps {
  children: React.ReactNode;
  className?: string;
}

export function Headline({ children, className = "" }: HeadlineProps) {
  return (
    <div className={`w-full flex flex-col items-center ${className}`}>
      <div
        className="
          bg-white 
          border-4 border-[var(--border)]
          px-10 py-3 
          font-vt text-2xl font-bold tracking-wide
        "
        style={{
          transform: "translateY(2px)",
        }}
      >
        {children}
      </div>

      <div className="relative w-4/5 mb-4">
        <div className="absolute left-0 right-0 border-b-4 border-[var(--border)] top-0 " />
      </div>
    </div>
  );
}