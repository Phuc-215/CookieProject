import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { verifyEmailApi } from '../api/auth.api';
import { PixelButton } from '../components/PixelButton';
import verify_hamster from '../assets/signup_hamster.svg';

export function VerifyEmail() {
  const navigate = useNavigate();
  const [code, setCode] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
  };

  const handleVerifyEmail = async () => {
    if (!code || code.length !== 6) {
      setErrorMessage('Please enter a 6-digit code');
      return;
    }

    try {
      setIsVerifying(true);
      setVerifyStatus('loading');
      setErrorMessage('');

      await verifyEmailApi(code);

      setVerifyStatus('success');
      // Redirect to home after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      setErrorMessage(error.response?.data?.message || 'Email verification failed');
      setVerifyStatus('error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && code.length === 6) {
      handleVerifyEmail();
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background-image)]">

      <div className="max-w-md mx-auto px-4 py-12">
        <div className="pixel-card bg-white p-8">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="inline-block w-32 h-32 relative mb-4">
              <img
                src={verify_hamster}
                alt="Verify Hamster"
                className="w-full h-full object-contain"
              />
            </div>
            <h2
              className="text-lg mb-2"
              style={{ fontFamily: "'Press Start 2P', cursive" }}
            >
              Verify Email
            </h2>
            <p className="text-sm text-[var(--choco)]/70">
              Enter the 6-digit code
            </p>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {verifyStatus === 'idle' && (
              <>
                <p className="text-sm text-gray-600 text-center">
                  Check your email for the verification code
                </p>
                <div>
                  <label className="block text-sm text-[var(--choco)] mb-2">
                    Verification Code*
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={code}
                    onChange={handleCodeChange}
                    onKeyPress={handleKeyPress}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full px-4 py-3 border-4 border-[var(--choco)] focus:outline-none focus:ring-2 focus:ring-[var(--choco)] font-mono text-2xl text-center font-bold tracking-widest"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {code.length}/6 digits
                  </p>
                </div>
                <PixelButton
                  onClick={handleVerifyEmail}
                  disabled={code.length !== 6 || isVerifying}
                  className="w-full"
                >
                  {isVerifying ? 'Verifying...' : 'Verify Email'}
                </PixelButton>
              </>
            )}

            {verifyStatus === 'loading' && (
              <div className="text-center space-y-4">
                <div className="inline-block">
                  <div className="animate-spin h-12 w-12 border-4 border-[var(--choco)] border-t-transparent rounded-full"></div>
                </div>
                <p className="text-sm font-bold text-[var(--choco)]">
                  Verifying your code...
                </p>
              </div>
            )}

            {verifyStatus === 'success' && (
              <div className="text-center space-y-4">
                <h3 className="font-bold text-[var(--choco)]">
                  Email Verified!
                </h3>
                <p className="text-sm text-gray-600">
                  Your email has been verified successfully.
                  Redirecting to home page...
                </p>
              </div>
            )}

            {verifyStatus === 'error' && (
              <div className="text-center space-y-4">
                <h3 className="font-bold text-pink-500">
                  Verification Failed
                </h3>
                <p className="text-sm text-pink-500">
                  {errorMessage}
                </p>
                <PixelButton
                  onClick={() => {
                    setVerifyStatus('idle');
                    setCode('');
                  }}
                  className="w-full"
                >
                  Try Again
                </PixelButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
