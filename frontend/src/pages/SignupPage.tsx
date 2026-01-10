import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import * as z from 'zod';
import { registerApi } from '../api/auth.api';

import { PixelInput } from '../components/PixelInput';
import { PixelButton } from '../components/PixelButton';
import { useNav } from '../hooks/useNav'; 
import signup_hamster from "../assets/signup_hamster.svg";
import { setTokens } from '@/utils/token';
import type { Viewer } from "@/types/Viewer";

const signupSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z.string()
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
    .min(1, "Please confirm your password"),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"], // Gắn lỗi vào field confirmPassword
});

type SignupFormData = z.infer<typeof signupSchema>;
interface SignupProps {
  onSignup: (user: Viewer) => void;
}

export function Signup({ onSignup }: SignupProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const nav = useNav();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid }
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange', // Validate ngay khi rời khỏi field
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    }
  });

  // Watch checkbox value for custom UI
  const agreeToTermsValue = watch('agreeToTerms');

  const onSubmit = async (data: SignupFormData) => {
    try {
      setSubmitError(null);

      const res = await registerApi({
        username: data.username,
        email: data.email,
        password: data.password,
      });

      setTokens(res.data.accessToken, res.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      onSignup(res.data.user);
      
      // Store verification code and redirect to verify email page
      if (res.data.verificationCode) {
        localStorage.setItem('verificationCode', res.data.verificationCode);
      }
      nav.go('/verify-email');
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      setSubmitError(error.response?.data?.message || 'Signup failed');
    }
  };


  return (
    <div className="min-h-screen bg-[var(--background-image)]">

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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Username */}
            <div>
              <PixelInput
                label="Username *"
                type="text"
                placeholder="BakerBob"
                {...register("username")}
                error={errors.username?.message}
              />
              {errors.username && (
                <p className="text-pink-500 text-xs mt-1 font-bold">{errors.username.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <PixelInput
                label="Email Address *"
                type="email"
                placeholder="baker@cookie.exe"
                {...register("email")}
                error={errors.email?.message}
              />
              {errors.email && (
                <p className="text-pink-500 text-xs mt-1 font-bold">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block mb-2 uppercase text-sm tracking-wide">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`w-full px-4 py-3 pixel-border bg-white placeholder:text-[var(--choco)]/50 pr-12 focus:outline-none transition-shadow
                    ${errors.password 
                      ? 'border-2 border-pink-500 focus:shadow-[0_0_0_3px_#f9a8d4]' 
                      : 'focus:shadow-[0_0_0_3px_var(--brown)]'
                    }
                  `}
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
              {errors.password ? (
                 <p className="text-pink-500 text-xs mt-1 font-bold">{errors.password.message}</p>
              ) : (
                <p className="text-xs text-[var(--choco)]/50 mt-1">
                  Minimum 6 characters
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block mb-2 uppercase text-sm tracking-wide">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`w-full px-4 py-3 pixel-border bg-white placeholder:text-[var(--choco)]/50 pr-12 focus:outline-none transition-shadow
                    ${errors.confirmPassword 
                      ? 'border-2 border-pink-500 focus:shadow-[0_0_0_3px_#f9a8d4]' 
                      : 'focus:shadow-[0_0_0_3px_var(--brown)]'
                    }
                  `}
                  placeholder="••••••••"
                  {...register("confirmPassword")}
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
              {errors.confirmPassword && (
                 <p className="text-pink-500 text-xs mt-1 font-bold">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms Agreement */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <div
                  className={`w-5 h-5 pixel-border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    agreeToTermsValue ? 'bg-[var(--mint)]' : 'bg-white'
                  } ${errors.agreeToTerms ? 'border-pink-500 shadow-[0_0_0_2px_#f9a8d4]' : ''}`}
                >
                  {agreeToTermsValue && <span className="text-xs">✓</span>}
                </div>
                {/* Hidden Checkbox for form registration */}
                <input type="checkbox" className="hidden" {...register("agreeToTerms")} />

                <span className="text-sm">
                  I agree to the{' '}
                  <button
                    type="button"
                    className="underline hover:text-[var(--mint)] uppercase"
                    onClick={(e) => e.stopPropagation()} 
                  >
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    className="underline hover:text-[var(--mint)] uppercase"
                    onClick={(e) => e.stopPropagation()} 
                  >
                    Privacy Policy
                  </button>
                </span>
              </label>
              {errors.agreeToTerms && (
                 <p className="text-pink-500 text-xs mt-1 font-bold ml-8">{errors.agreeToTerms.message}</p>
              )}
            </div>

            {submitError && (
              <p className="text-pink-500 text-sm text-center mt-3">
                {submitError}
              </p>
            )}
            {/* Submit Button */}
            <PixelButton 
              variant="primary" 
              size="lg" 
              className={`w-full ${(!isValid) ? 'opacity-50 cursor-not-allowed' : ''}`}
              type="submit"
              disabled={!isValid}
            >
              {'Create Account'}
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