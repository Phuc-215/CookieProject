import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { PixelInput } from '../components/PixelInput';
import { PixelButton } from '../components/PixelButton';
import { NavBar } from '../components/NavBar';
import { useNav } from '../hooks/useNav'; 

interface LoginProps {
  onLogin?: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const nav = useNav();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - in real app, validate credentials
    onLogin?.();
  };

  return (
    <div className="min-h-screen bg-[var(--background-image)]">
      {/* NavBar */}
      <NavBar 
        isLoggedIn={false}
        notificationCount={0}
        onLogout={() => {}}
        searchQuery=""
        onSearchChange={() => {}}
        onSearchSubmit={() => {}}
      />

      {/* Login Form */}
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="pixel-card bg-white p-8">
          {/* Logo */}
          <div className="mb-8 text-center">
              <div className="inline-block w-32 h-32 relative mb-4">
                <img
                  src="../../src/assets/login_hamster.svg"
                  alt="Baker Hamster"
                  className="w-full h-full object-contain"
                />
              </div>
            <h2 
              className="text-lg mb-2" 
              style={{ fontFamily: "'Press Start 2P', cursive" }}
            >
              Welcome Back!
            </h2>
            <p className="text-sm text-[var(--choco)]/70">
              Log in to your baker account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="w-full px-4 py-3 pixel-border bg-white placeholder:text-[var(--choco)]/50 pr-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  className={`w-5 h-5 pixel-border flex items-center justify-center transition-colors ${
                    rememberMe ? 'bg-[var(--mint)]' : 'bg-white'
                  }`}
                  onClick={() => setRememberMe(!rememberMe)}
                >
                  {rememberMe && <span className="text-xs">✓</span>}
                </div>
                <span className="text-sm">Remember Me</span>
              </label>
              <button
                type="button"
                className="text-sm text-[var(--choco)] hover:underline uppercase"
              >
                Forgot?
              </button>
            </div>

            {/* Submit Button */}
            <PixelButton variant="secondary" size="lg" className="w-full" type="submit">
              Log In
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

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-sm mb-3">Don't have an account?</p>
              <PixelButton 
                variant="outline" 
                size="md" 
                className="w-full"
                type="button"
                onClick={() => nav.signup()}
              >
                Create Account
              </PixelButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}