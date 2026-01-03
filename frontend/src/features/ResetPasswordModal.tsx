import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { PixelModal } from '@/components/PixelModal';
import { PixelButton } from '@/components/PixelButton';

export function ResetPasswordModal({
  onBack,
  onClose,
  onSuccess,
}: {
  onBack: () => void;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [show, setShow] = useState(false);

  return (
    <PixelModal
      title="Reset password"
      onClose={onClose}
      showBack
      onBack={onBack}
    >
      <label className="block mb-2 uppercase text-sm">
        New Password *
      </label>

      <div className="relative mb-2">
        <input
          type={show ? 'text' : 'password'}
          className="pixel-border w-full px-4 py-3 pr-12"
          placeholder="••••••••"
        />
        <button
          className="absolute right-3 top-1/2 -translate-y-1/2"
          onClick={() => setShow(!show)}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <p className="text-xs mb-4 text-[var(--choco)]/60">
        Minimum 8 characters
      </p>

      <label className="block mb-2 uppercase text-sm">
        Confirm New Password *
      </label>

      <input
        type={show ? 'text' : 'password'}
        className="pixel-border w-full px-4 py-3"
        placeholder="••••••••"
      />

      <PixelButton
        variant="secondary"
        size="lg"
        className="w-full mt-6"
        onClick={onSuccess}
      >
        Confirm
      </PixelButton>
    </PixelModal>
  );
}