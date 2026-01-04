import { ReactNode } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { useNav } from '@/hooks/useNav';

interface PixelModalProps {
  title?: string;
  onClose: () => void;
  showBack?: boolean;
  onBack?: () => void;
  children: ReactNode;
  width?: string;
}

export function PixelModal({
  title,
  onClose,
  showBack = false,
  onBack,
  children,
  width = '360px',
}: PixelModalProps) {
  const nav = useNav();

  const handleBack = () => {
    if (onBack) onBack();
    else nav.back();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="pixel-card bg-white p-6 relative"
          style={{ width }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            {showBack ? (
              <button
                className="p-2 hover:bg-[var(--cream)] transition-colors"
                onClick={handleBack}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <div />
            )}

            <button
              className="p-2 hover:bg-[var(--cream)] transition-colors"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {title && (
            <h2
              className="text-center text-sm mb-6"
              style={{ fontFamily: "'Press Start 2P', cursive" }}
            >
              {title}
            </h2>
          )}

          {children}
        </div>
      </div>
    </>
  );
}
