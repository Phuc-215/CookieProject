import { useState } from 'react';
import { PixelModal } from '@/components/modals/PixelModal';
import { PixelInput } from '@/components/PixelInput';
import { PixelButton } from '@/components/PixelButton';
import { requestPasswordResetApi } from '@/api/auth.api';
import forgot_hamster from "@/assets/forgot_hamster.svg";

interface Props {
  open: boolean;
  onClose: () => void;
  onNext: () => void;
}

export function ForgotPasswordModal({ open, onClose, onNext }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await requestPasswordResetApi(email.trim());
      onNext();
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to send reset email';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PixelModal
      title="Forgot your password?"
      onClose={onClose}
      showBack
      onBack={onClose}
    >
      <div className="flex justify-center mb-6">
        <img src={forgot_hamster} className="w-28 h-28" />
      </div>

      <p className="text-sm text-center mb-6 text-[var(--choco)]/70">
        Don't worry - it happens! We'll help you reset it
      </p>

      <PixelInput
        label="Email *"
        placeholder="baker@cookie.exe"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={error || undefined}
      />

      <PixelButton
        variant="secondary"
        size="lg"
        className="w-full mt-6"
        disabled={loading}
        onClick={handleSubmit}
      >
        {loading ? 'Sending...' : 'Send Reset Link'}
      </PixelButton>
    </PixelModal>
  );
}

