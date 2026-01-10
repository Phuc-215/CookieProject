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
  const [codeError, setCodeError] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCode(initialToken || '');
  }, [initialToken]);

  /* ================= CODE STEP ================= */

  const handleCodeChange = (value: string) => {
    setCode(value);
    setSubmitError(null);

    if (!value.trim()) {
      setCodeError('Reset code is required');
    } else if (!/^\d{6}$/.test(value.trim())) {
      setCodeError('Code must be 6 digits');
    } else {
      setCodeError(null);
    }
  };

  const handleVerifyCode = async () => {
    if (codeError || !code.trim()) return;

    setLoading(true);
    setSubmitError(null);

    try {
      await verifyResetCodeApi(code.trim());
      setStep('password');
    } catch (err: any) {
      setSubmitError(
        err?.response?.data?.message || 'Invalid or expired code'
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= PASSWORD STEP ================= */

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setSubmitError(null);

    if (value.length < 6) {
      setPasswordError('Password must be at least 6 characters');
    } else {
      setPasswordError(null);
    }

    if (confirm && value !== confirm) {
      setConfirmError('Passwords do not match');
    } else {
      setConfirmError(null);
    }
  };

  const handleConfirmChange = (value: string) => {
    setConfirm(value);
    setSubmitError(null);

    if (value !== password) {
      setConfirmError('Passwords do not match');
    } else {
      setConfirmError(null);
    }
  };

  const hasPasswordError =
    !!passwordError || !!confirmError || !password || !confirm;

  const handleResetPassword = async () => {
    if (hasPasswordError) return;

    setLoading(true);
    setSubmitError(null);

    try {
      await resetPasswordApi({
        code: code.trim(),
        newPassword: password,
      });
      onSuccess();
    } catch (err: any) {
      setSubmitError(
        err?.response?.data?.message || 'Failed to reset password'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'password') {
      setStep('code');
      setPassword('');
      setConfirm('');
      setPasswordError(null);
      setConfirmError(null);
      setSubmitError(null);
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
      {/* ================= CODE STEP ================= */}
      {step === 'code' && (
        <>
          <p className="text-sm text-center mb-4 text-[var(--choco)]/70">
            Enter the 6-digit code from your email
          </p>

          <PixelInput
            label="Reset Code *"
            placeholder="123456"
            value={code}
            maxLength={6}
            onChange={(e) => handleCodeChange(e.target.value)}
            error={codeError || undefined}
          />

          {codeError && (
            <p className="text-pink-500 text-sm mt-1">{codeError}</p>
          )}

          {submitError && (
            <p className="text-pink-500 text-sm mt-1">{submitError}</p>
          )}

          <PixelButton
            variant="secondary"
            size="lg"
            className="w-full mt-6"
            disabled={loading || !!codeError}
            onClick={handleVerifyCode}
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </PixelButton>
        </>
      )}

      {/* ================= PASSWORD STEP ================= */}
      {step === 'password' && (
        <>
        <PixelInput
          label="New Password *"
          type={show ? 'text' : 'password'}
          value={password}
          onChange={(e) => handlePasswordChange(e.target.value)}
          error={!!passwordError}
          rightIcon={
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="text-[var(--choco)]"
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />

        {passwordError && (
          <p className="text-pink-500 text-sm mt-1">
            {passwordError}
          </p>
        )}

        <p className="text-xs mb-4 text-[var(--choco)]/60">
          Minimum 6 characters
        </p>

        <PixelInput
          label="Confirm New Password *"
          type={show ? 'text' : 'password'}
          value={confirm}
          onChange={(e) => handleConfirmChange(e.target.value)}
            error={!!confirmError}
          rightIcon={
              <button
              type="button"
              onClick={() => setShow(!show)}
              className="text-[var(--choco)]"
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />

          {confirmError && (
            <p className="text-pink-500 text-sm mt-1">
              {confirmError}
            </p>
          )}

          <PixelButton
            variant="secondary"
            size="lg"
            className={`w-full mt-6 ${
              hasPasswordError ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading || hasPasswordError}
            onClick={handleResetPassword}
          >
            {loading ? 'Updating...' : 'Reset Password'}
          </PixelButton>
        </>
      )}
    </PixelModal>
  );
}