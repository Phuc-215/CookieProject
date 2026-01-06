import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginApi } from '@/api/auth.api';
import * as z from 'zod'; 

import { PixelInput } from '@/components/PixelInput';
import { PixelButton } from '@/components/PixelButton';
import { NavBar } from '@/components/NavBar';
import { ForgotPasswordModal } from '@/components/modals/ForgotPasswordModal';
import { ResetPasswordModal } from '@/components/modals/ResetPasswordModal';
import { ResetSuccessModal } from '@/components/modals/ResetSuccessModal';
import { useNav } from '../hooks/useNav';
import login_hamster from "@/assets/login_hamster.svg";

const loginSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z.string()
    .min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginProps {
  onLogin?: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const nav = useNav();
  const [openForgot, setOpenForgot] = useState(false);
  const [openReset, setOpenReset] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    }
  });

  const rememberMeValue = watch('rememberMe');

  const onSubmit = async (data: LoginFormData) => {
    try {
      setSubmitError(null);

      const res = await loginApi({
        email: data.email,
        password: data.password,
      });

      // Save tokens to localStorage
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      onLogin?.();
      nav.home();
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Login failed');
    }
  };



  return (
    <div className="min-h-screen bg-[var(--background-image)]">
      {/* NavBar */}
      <NavBar 
        isLoggedIn={false}
        notificationCount={0}
        onLogout={() => {}}
      />

      {/* Login Form */}
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="pixel-card bg-white p-8">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="inline-block w-32 h-32 relative mb-4">
              <img src={login_hamster} alt="Baker Hamster" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-lg mb-2" style={{ fontFamily: "'Press Start 2P', cursive" }}>
              Welcome Back!
            </h2>
            <p className="text-sm text-[var(--choco)]/70">
              Log in to your baker account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Email Field */}
            <div>
              <PixelInput
                label="Email Address *"
                type="email"
                placeholder="baker@cookie.exe"
                // Spread register props
                {...register("email")}
                error={errors.email?.message} 
              />
              {/* Email error */}
              {errors.email && (
                <p className="inline-block text-pink-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block mb-2 uppercase text-sm tracking-wide">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`w-full px-4 py-3 pixel-border bg-white placeholder:text-[var(--choco)]/50 pr-12 focus:outline-none transition-shadow ${
                    errors.password
                      ? 'border-pink-500 shadow-[0_0_0_3px_#f9a8d4]'
                      : 'focus:shadow-[0_0_0_3px_var(--brown)]'           
                  }`}
                  placeholder="••••••••"
                  {...register("password")}
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
              {/* Password */}
              {errors.password && (
                <p className="inline-block text-pink-500">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  className={`w-5 h-5 pixel-border flex items-center justify-center transition-colors ${
                    rememberMeValue ? 'bg-[var(--mint)]' : 'bg-white'
                  }`}
                  onClick={() => setValue('rememberMe', !rememberMeValue)}
                >
                  {rememberMeValue && <span className="text-xs">✓</span>}
                </div>
                <input type="checkbox" className="hidden" {...register("rememberMe")} />
                
                <span className="text-sm">Remember Me</span>
              </label>
              
              <button
                type="button"
                className="text-sm text-[var(--choco)] hover:underline uppercase"
                onClick={() => setOpenForgot(true)}
              >
                Forgot?
              </button>
            </div>
            {submitError && (
              <p className="text-pink-500 text-sm text-center mt-3">
                {submitError}
              </p>
            )}
            <PixelButton 
              variant="secondary" 
              size="lg" 
              className={`w-full ${!isValid ? 'opacity-50 cursor-not-allowed' : ''}`} 
              type="submit"
              
              disabled={!isValid} 
            >
              {'Log In'}
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
      {/* FORGOT */}
      <ForgotPasswordModal
        open={openForgot}
        onClose={() => setOpenForgot(false)}
        onNext={() => {
          setOpenForgot(false);
          setOpenReset(true);
        }}
      />

      {/* RESET */}
      {openReset && (
        <ResetPasswordModal
          onBack={() => {
            setOpenReset(false);
            setOpenForgot(true);
          }}
          onClose={() => setOpenReset(false)}
          onSuccess={() => {
            setOpenReset(false);
            setOpenSuccess(true);
          }}
        />
      )}

      {/* SUCCESS */}
      {openSuccess && (
        <ResetSuccessModal
          onClose={() => {
            setOpenSuccess(false);
            // nếu cần quay về login:
            // setOpenLogin(true);
          }}
        />
      )}
    </div>
  );
}