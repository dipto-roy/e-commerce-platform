'use client';
import { SessionNotification } from "@/components/SessionNotification";
import { ForgotPasswordModal } from "@/components/ForgotPasswordModal";
import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { Eye, EyeOff, ShoppingBag, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContextNew";
import { useRouter, useSearchParams } from "next/navigation";

export const dynamic = 'force-dynamic';

function LoginContent() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | React.ReactNode>("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({ email: "", password: "" });
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showSellerOAuthWarning, setShowSellerOAuthWarning] = useState(false);

  const { login, user, redirectToDashboard } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      setError("Your session has expired. Please log in again.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (user && !loading) {
      const timer = setTimeout(() => redirectToDashboard(), 500);
      return () => clearTimeout(timer);
    }
  }, [user, loading, redirectToDashboard]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const trimmedValue = id === 'email' ? value.trim() : value;
    setFormData({ ...formData, [id]: trimmedValue });
    if (validationErrors[id as keyof typeof validationErrors]) {
      setValidationErrors({ ...validationErrors, [id]: "" });
    }
    if (error) setError("");
  };

  const validateForm = () => {
    const errors = { email: "", password: "" };
    let isValid = true;
    if (!formData.email.trim()) { errors.email = "Email or username is required"; isValid = false; }
    else if (formData.email.length < 3) { errors.email = "Must be at least 3 characters"; isValid = false; }
    if (!formData.password) { errors.password = "Password is required"; isValid = false; }
    else if (formData.password.length < 6) { errors.password = "Must be at least 6 characters"; isValid = false; }
    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) return;
    setLoading(true);
    try {
      const result = await login(formData.email, formData.password.trim());
      if (result.success) {
        setTimeout(() => redirectToDashboard(), 100);
      } else {
        if (result.needsVerification) {
          sessionStorage.setItem('verificationEmail', formData.email);
          router.push('/seller/verification-pending');
          return;
        }
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    "Access thousands of curated products",
    "Track your orders in real-time",
    "Secure payments & buyer protection",
  ];

  return (
    <div className="min-h-screen flex">
      <SessionNotification />

      {/* Left panel — brand */}
      <div
        className="hidden md:flex flex-col justify-between w-5/12 p-12 text-white"
        style={{ background: 'linear-gradient(160deg, var(--accent-600) 0%, var(--accent-800) 100%)' }}
      >
        <div className="flex items-center gap-2 text-xl font-bold">
          <ShoppingBag className="w-6 h-6" />
          ShopNest
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-3 leading-tight">
            Your trusted<br />marketplace
          </h2>
          <p className="text-white/70 mb-8 text-sm">
            Join thousands of shoppers discovering great deals every day.
          </p>
          <ul className="space-y-3">
            {features.map(f => (
              <li key={f} className="flex items-center gap-3 text-sm text-white/90">
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-white/40 text-xs">© {new Date().getFullYear()} ShopNest</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 bg-[var(--bg-tertiary)]">
        {/* Mobile brand */}
        <div className="flex items-center gap-2 mb-8 md:hidden font-bold text-xl" style={{ color: 'var(--accent-600)' }}>
          <ShoppingBag className="w-5 h-5" />
          ShopNest
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Welcome back</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="alert alert-error mb-6">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="input-group">
              <label htmlFor="email" className="label">Email or Username</label>
              <input
                id="email"
                type="text"
                value={formData.email}
                onChange={handleChange}
                className={`input ${validationErrors.email ? 'input-error' : ''}`}
                placeholder="Enter your email or username"
                autoComplete="username"
              />
              {validationErrors.email && <p className="field-error">{validationErrors.email}</p>}
            </div>

            <div className="input-group">
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="label" style={{ margin: 0 }}>Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(true)}
                  className="text-xs font-medium hover:underline"
                  style={{ color: 'var(--accent-600)' }}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className={`input pr-10 ${validationErrors.password ? 'input-error' : ''}`}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {validationErrors.password && <p className="field-error">{validationErrors.password}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-full btn-lg">
              {loading ? (
                <><span className="spinner" /> Signing in…</>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-[var(--bg-tertiary)]" style={{ color: 'var(--text-muted)' }}>Or continue with</span>
            </div>
          </div>

          {showSellerOAuthWarning && (
            <div className="alert alert-warning mb-4">
              <span><strong>Seller accounts</strong> require admin approval — use email/password login instead.</span>
            </div>
          )}

          {/* Google */}
          <button
            type="button"
            onClick={() => {
              setShowSellerOAuthWarning(true);
              setTimeout(() => setShowSellerOAuthWarning(false), 5000);
              const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4002/api/v1';
              window.location.href = `${API_URL}/auth/google`;
            }}
            className="w-full flex items-center justify-center gap-3 bg-white border border-[var(--border)] rounded-lg py-2.5 px-4 text-sm font-medium hover:bg-[var(--bg-tertiary)] transition-colors"
            style={{ color: 'var(--text-primary)' }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
          <p className="text-center text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
            Google sign-in is for regular users only
          </p>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-secondary)' }}>
            Don't have an account?{" "}
            <Link href="/Singup" className="font-semibold hover:underline" style={{ color: 'var(--accent-600)' }}>
              Sign up free
            </Link>
          </p>
        </div>
      </div>

      <ForgotPasswordModal isOpen={showForgotPasswordModal} onClose={() => setShowForgotPasswordModal(false)} />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-tertiary)' }}>
        <span className="spinner" style={{ width: '2.5rem', height: '2.5rem', borderWidth: '3px' }} />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
