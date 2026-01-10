import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { PixelModal } from '@/components/modals/PixelModal';
import { PixelButton } from '@/components/PixelButton';
import { PixelInput } from '@/components/PixelInput';
import { verifyResetCodeApi, resetPasswordApi } from '@/api/auth.api';

interface Props {
  onBack: () => void;
  onClose: () => void;
  onSuccess: () => void;
  initialToken?: string;
}

export function ResetPasswordModal({ onBack, onClose, onSuccess, initialToken }: Props) {
  const [step, setStep] = useState<'code' | 'password'>('code');
  const [code, setCode] = useState(initialToken || '');
  const [show, setShow] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCode(initialToken || '');
  }, [initialToken]);

  const handleVerifyCode = async () => {
    if (!code.trim()) {
      setError('Reset code is required');
      return;
    }
    if (!/^\d{6}$/.test(code.trim())) {
      setError('Code must be 6 digits');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await verifyResetCodeApi(code.trim());
      setStep('password');
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Invalid or expired code';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await resetPasswordApi({ code: code.trim(), newPassword: password });
      onSuccess();
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to reset password';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'password') {
      setStep('code');
      setPassword('');
      setConfirm('');
      setError(null);
    } else {
      onBack();
    }
  };

  return (
    <PixelModal
      title={step === 'code' ? 'Enter reset code' : 'Set new password'}
      onClose={onClose}
      showBack
      onBack={handleBack}
    >
      {step === 'code' && (
        <>
          <p className="text-sm text-center mb-4 text-[var(--choco)]/70">
            Enter the 6-digit code from your email
          </p>

          <PixelInput
            label="Reset Code *"
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
            error={error || undefined}
          />

          {error && (
            <p className="text-pink-500 text-sm mt-3">{error}</p>
          )}

          <PixelButton
            variant="secondary"
            size="lg"
            className="w-full mt-6"
            disabled={loading}
            onClick={handleVerifyCode}
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </PixelButton>
        </>
      )}

      {step === 'password' && (
        <>
          <label className="block mb-2 uppercase text-sm">
            New Password *
          </label>

          <div className="relative mb-2">
            <input
              type={show ? 'text' : 'password'}
              className="pixel-border w-full px-4 py-3 pr-12"
              placeholder=""
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2"
              onClick={() => setShow(!show)}
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <p className="text-xs mb-4 text-[var(--choco)]/60">
            Minimum 6 characters
          </p>

          <label className="block mb-2 uppercase text-sm">
            Confirm New Password *
          </label>

          <input
            type={show ? 'text' : 'password'}
            className="pixel-border w-full px-4 py-3"
            placeholder=""
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />

          {error && (
            <p className="text-pink-500 text-sm mt-3">{error}</p>
          )}

          <PixelButton
            variant="secondary"
            size="lg"
            className="w-full mt-6"
            disabled={loading}
            onClick={handleResetPassword}
          >
            {loading ? 'Updating...' : 'Reset Password'}
          </PixelButton>
        </>
      )}
    </PixelModal>
  );
}
