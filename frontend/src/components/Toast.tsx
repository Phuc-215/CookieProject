import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

export function Toast({ id, message, type = 'info', duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const typeStyles = {
    success: {
      bg: 'bg-[#4DB6AC]',
      border: 'border-[#4A3B32]',
      icon: <CheckCircle className="w-5 h-5" />,
    },
    error: {
      bg: 'bg-[#FF99AA]',
      border: 'border-[#4A3B32]',
      icon: <XCircle className="w-5 h-5" />,
    },
    warning: {
      bg: 'bg-[#FFE4C4]',
      border: 'border-[#4A3B32]',
      icon: <AlertCircle className="w-5 h-5" />,
    },
    info: {
      bg: 'bg-[#FFF8E1]',
      border: 'border-[#4A3B32]',
      icon: <AlertCircle className="w-5 h-5" />,
    },
  };

  const style = typeStyles[type];

  return (
    <div
      className={`
        pixel-card ${style.bg} ${style.border} border-2
        px-4 py-3 flex items-center gap-3
        shadow-[4px_4px_0px_rgba(74,59,50,0.3)]
        animate-slide-in
        min-w-[300px] max-w-[500px]
      `}
    >
      <div className="text-[#4A3B32] shrink-0">
        {style.icon}
      </div>
      <p className="flex-1 font-vt323 text-lg text-[#4A3B32]">
        {message}
      </p>
      <button
        onClick={() => onClose(id)}
        className="text-[#4A3B32] hover:text-[#4A3B32]/70 transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
