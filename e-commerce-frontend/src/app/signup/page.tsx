'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContextNew';
import { useRouter } from 'next/navigation';
import { ShoppingBag, AlertCircle } from 'lucide-react';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', fullName: '', phone: '',
    role: 'user' as 'user' | 'seller',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({
    username: '', email: '', password: '', role: '',
  });

  const { register, user, redirectToDashboard } = useAuth();
  const router = useRouter();

  useEffect(() => { if (user) redirectToDashboard(); }, [user, redirectToDashboard]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (validationErrors[id as keyof typeof validationErrors])
      setValidationErrors(prev => ({ ...prev, [id]: '' }));
    if (error) setError('');
  };

  const validateForm = (): boolean => {
    const errors = { username: '', email: '', password: '', role: '' };
    let valid = true;
    if (!formData.username.trim())           { errors.username = 'Username is required'; valid = false; }
    else if (formData.username.length < 3)   { errors.username = 'At least 3 characters'; valid = false; }
    if (!formData.email.trim())              { errors.email = 'Email is required'; valid = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { errors.email = 'Valid email required'; valid = false; }
    if (!formData.password)                  { errors.password = 'Password is required'; valid = false; }
    else if (formData.password.length < 6)   { errors.password = 'At least 6 characters'; valid = false; }
    setValidationErrors(errors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;
    setLoading(true);
    try {
      const result = await register(formData);
      if (result.success) { setTimeout(() => redirectToDashboard(), 100); }
      else setError(result.message);
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-tertiary)' }}>
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2 mb-6" style={{ color: 'var(--accent-600)' }}>
          <ShoppingBag className="w-6 h-6" />
          <span className="text-xl font-bold">ShopNest</span>
        </div>

        <div className="card p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Create Account</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Join our e-commerce platform
            </p>
          </div>

          {error && (
            <div className="alert alert-error mb-5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Account type */}
            <div className="input-group">
              <label htmlFor="role" className="label">Account Type</label>
              <select id="role" value={formData.role} onChange={handleChange} className="input">
                <option value="user">Customer Account</option>
                <option value="seller">Seller Account (Requires Verification)</option>
              </select>
              {formData.role === 'seller' && (
                <p className="text-xs mt-1" style={{ color: '#f59e0b' }}>
                  ⚠️ Seller accounts require admin verification before listing products.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="input-group">
                <label htmlFor="username" className="label">Username *</label>
                <input id="username" type="text" value={formData.username} onChange={handleChange}
                  className={`input ${validationErrors.username ? 'border-red-400' : ''}`}
                  placeholder="e.g. john_doe" />
                {validationErrors.username && <p className="text-xs text-red-500 mt-1">{validationErrors.username}</p>}
              </div>
              <div className="input-group">
                <label htmlFor="fullName" className="label">Full Name</label>
                <input id="fullName" type="text" value={formData.fullName} onChange={handleChange}
                  className="input" placeholder="John Doe" />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="email" className="label">Email Address *</label>
              <input id="email" type="email" value={formData.email} onChange={handleChange}
                className={`input ${validationErrors.email ? 'border-red-400' : ''}`}
                placeholder="you@example.com" />
              {validationErrors.email && <p className="text-xs text-red-500 mt-1">{validationErrors.email}</p>}
            </div>

            <div className="input-group">
              <label htmlFor="password" className="label">Password *</label>
              <input id="password" type="password" value={formData.password} onChange={handleChange}
                className={`input ${validationErrors.password ? 'border-red-400' : ''}`}
                placeholder="Min 6 characters" />
              {validationErrors.password && <p className="text-xs text-red-500 mt-1">{validationErrors.password}</p>}
            </div>

            <div className="input-group">
              <label htmlFor="phone" className="label">Phone Number</label>
              <input id="phone" type="tel" value={formData.phone} onChange={handleChange}
                className="input" placeholder="Enter phone number" />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-full mt-2">
              {loading ? <><span className="spinner" /> Creating Account…</> : 'Create Account'}
            </button>
          </form>

          {/* Google OAuth — customer only */}
          {formData.role === 'user' && (
            <>
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--border)]" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2" style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)' }}>
                    Or continue with
                  </span>
                </div>
              </div>
              <button type="button"
                onClick={() => { const u = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4002/api/v1'; window.location.href = `${u}/auth/google`; }}
                className="btn btn-outline btn-full gap-3">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign up with Google
              </button>
            </>
          )}

          {formData.role === 'seller' && (
            <div className="alert mt-5" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: '0.75rem' }}>
              <p className="text-xs" style={{ color: '#1e40af' }}>
                <strong>Note:</strong> Seller accounts require admin approval and cannot use Google sign-in.
              </p>
            </div>
          )}

          <p className="text-center text-sm mt-5" style={{ color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-semibold hover:underline" style={{ color: 'var(--accent-600)' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
