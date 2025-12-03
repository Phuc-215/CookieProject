import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { PixelInput } from '../components/PixelInput';
import { PixelButton } from '../components/PixelButton';
import { NavBar } from '../components/NavBar';
import { useNav } from '../hooks/useNav'; 
import signup_hamster from "../assets/signup_hamster.svg";
interface SignupProps {
  onSignup?: () => void;
}

export function Signup({ onSignup }: SignupProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const nav = useNav();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    
    if (!agreeToTerms) {
      alert('Please accept the Terms of Service');
      return;
    }
    
    // Mock signup success
    onSignup?.();
    nav.home();
  };

  return (
    <div className="min-h-screen bg-[var(--background-image)]">
      {/* NavBar */}
      <NavBar 
        isLoggedIn={false}
        notificationCount={0}
        onLogout={() => {}}
      />

      {/* Signup Form */}
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="pixel-card bg-white p-8">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="inline-block w-32 h-32 relative mb-4">
                <img
                  src={signup_hamster}
                  alt="Baker Hamster"
                  className="w-full h-full object-contain"
                />
              </div>
            <h2 
              className="text-lg mb-2" 
              style={{ fontFamily: "'Press Start 2P', cursive" }}
            >
              Join Cookie
            </h2>
            <p className="text-sm text-[var(--choco)]/70">
              Create your baker account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <PixelInput
              label="Username *"
              type="text"
              placeholder="BakerBob"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            {/* Email */}
            <PixelInput
              label="Email Address *"
              type="email"
              placeholder="baker@cookie.exe"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* Password */}
            <div>
              <label className="block mb-2 uppercase text-sm tracking-wide">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-3 pixel-border bg-white placeholder:text-[var(--choco)]/50 pr-12  focus:outline-none focus:shadow-[0_0_0_3px_var(--brown)] transition-shadow"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[var(--cream)] transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-[var(--choco)]/70" />
                  ) : (
                    <Eye className="w-5 h-5 text-[var(--choco)]/70" />
                  )}
                </button>
              </div>
              <p className="text-xs text-[var(--choco)]/50 mt-1">
                Minimum 8 characters
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block mb-2 uppercase text-sm tracking-wide">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="w-full px-4 py-3 pixel-border bg-white placeholder:text-[var(--choco)]/50 pr-12  focus:outline-none focus:shadow-[0_0_0_3px_var(--brown)] transition-shadow"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[var(--cream)] transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5 text-[var(--choco)]/70" />
                  ) : (
                    <Eye className="w-5 h-5 text-[var(--choco)]/70" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms Agreement */}
            <label className="flex items-start gap-3 cursor-pointer">
              <div
                className={`w-5 h-5 pixel-border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                  agreeToTerms ? 'bg-[var(--mint)]' : 'bg-white'
                }`}
                onClick={() => setAgreeToTerms(!agreeToTerms)}
              >
                {agreeToTerms && <span className="text-xs">✓</span>}
              </div>
              <span className="text-sm">
                I agree to the{' '}
                <button
                  type="button"
                  className="underline hover:text-[var(--mint)] uppercase"
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  className="underline hover:text-[var(--mint)] uppercase"
                >
                  Privacy Policy
                </button>
              </span>
            </label>

            {/* Submit Button */}
            <PixelButton variant="primary" size="lg" className="w-full" type="submit">
              Create Account
            </PixelButton>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-[var(--choco)]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-[var(--choco)]/70 uppercase">Or</span>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm mb-3">Already have an account?</p>
              <PixelButton 
                variant="outline" 
                size="md" 
                className="w-full"
                type="button"
                onClick={() => nav.login()}
              >
                Log In
              </PixelButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
