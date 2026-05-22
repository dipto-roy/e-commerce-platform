'use client';
import React, { useState } from 'react';
import { X, CheckCircle, Mail, Key, Lock } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

enum Step { EMAIL = 'email', OTP = 'otp', NEW_PASSWORD = 'newPassword', SUCCESS = 'success' }

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4002/api/v1';

const STEP_SUBTITLES: Record<Step, string> = {
  [Step.EMAIL]:        'Enter your email to receive an OTP',
  [Step.OTP]:          'Enter the 6-digit code sent to your email',
  [Step.NEW_PASSWORD]: 'Enter your new password',
  [Step.SUCCESS]:      'Your password has been reset',
};

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [step,            setStep]            = useState<Step>(Step.EMAIL);
  const [email,           setEmail]           = useState('');
  const [otp,             setOtp]             = useState('');
  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken,      setResetToken]      = useState('');
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState('');
  const [message,         setMessage]         = useState('');
  const [expiresIn,       setExpiresIn]       = useState(0);

  const resetForm = () => {
    setStep(Step.EMAIL); setEmail(''); setOtp(''); setNewPassword('');
    setConfirmPassword(''); setResetToken(''); setError(''); setMessage(''); setExpiresIn(0);
  };
  const handleClose = () => { resetForm(); onClose(); };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setMessage(''); setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
      setMessage(data.message || 'OTP sent successfully');
      setExpiresIn(data.expiresIn || 600);
      setStep(Step.OTP);
    } catch (err: any) { setError(err.message || 'Failed to send OTP'); }
    finally { setLoading(false); }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setMessage(''); setLoading(true);
    if (otp.length !== 6) { setError('OTP must be 6 digits'); setLoading(false); return; }
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid OTP');
      if (data.valid && data.token) {
        setResetToken(data.token);
        setMessage('OTP verified successfully');
        setStep(Step.NEW_PASSWORD);
      } else throw new Error('OTP verification failed');
    } catch (err: any) { setError(err.message || 'Invalid OTP. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setMessage('');
    if (newPassword.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!regex.test(newPassword)) {
      setError('Need uppercase, lowercase, number, and special character'); return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resetToken, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to reset password');
      setMessage(data.message || 'Password reset successful');
      setStep(Step.SUCCESS);
    } catch (err: any) { setError(err.message || 'Failed to reset password.'); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md">
        <div className="card p-8 space-y-6">
          {/* Close */}
          <button onClick={handleClose} disabled={loading}
            className="absolute top-4 right-4 btn btn-icon btn-ghost">
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{ background: 'var(--accent-50)' }}>
              {step === Step.SUCCESS
                ? <CheckCircle className="w-6 h-6" style={{ color: 'var(--accent-600)' }} />
                : step === Step.OTP
                ? <Key className="w-6 h-6" style={{ color: 'var(--accent-600)' }} />
                : step === Step.NEW_PASSWORD
                ? <Lock className="w-6 h-6" style={{ color: 'var(--accent-600)' }} />
                : <Mail className="w-6 h-6" style={{ color: 'var(--accent-600)' }} />
              }
            </div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Reset Password</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{STEP_SUBTITLES[step]}</p>
          </div>

          {error   && <div className="alert alert-error"><span>{error}</span></div>}
          {message && <div className="alert alert-success"><span>{message}</span></div>}

          {/* Step 1: Email */}
          {step === Step.EMAIL && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="input-group">
                <label htmlFor="reset-email" className="label">Email Address</label>
                <input id="reset-email" type="email" value={email}
                  onChange={e => setEmail(e.target.value)} className="input"
                  placeholder="your@email.com" required disabled={loading} />
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary btn-full">
                {loading ? <><span className="spinner" /> Sending…</> : 'Send OTP'}
              </button>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === Step.OTP && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="input-group">
                <label htmlFor="otp-input" className="label">Enter OTP</label>
                <input id="otp-input" type="text" value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="input text-center text-2xl tracking-widest font-mono"
                  placeholder="000000" maxLength={6} required disabled={loading} />
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Expires in {Math.floor(expiresIn / 60)} minutes
                </p>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(Step.EMAIL)} disabled={loading}
                  className="btn btn-outline flex-1">Back</button>
                <button type="submit" disabled={loading || otp.length !== 6}
                  className="btn btn-primary flex-1">
                  {loading ? <><span className="spinner" /> Verifying…</> : 'Verify OTP'}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: New password */}
          {step === Step.NEW_PASSWORD && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="input-group">
                <label htmlFor="new-password" className="label">New Password</label>
                <input id="new-password" type="password" value={newPassword}
                  onChange={e => setNewPassword(e.target.value)} className="input"
                  placeholder="Enter new password" required disabled={loading} minLength={8} />
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  8+ chars with uppercase, lowercase, number &amp; special character
                </p>
              </div>
              <div className="input-group">
                <label htmlFor="confirm-password" className="label">Confirm Password</label>
                <input id="confirm-password" type="password" value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)} className="input"
                  placeholder="Confirm new password" required disabled={loading} />
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary btn-full">
                {loading ? <><span className="spinner" /> Resetting…</> : 'Reset Password'}
              </button>
            </form>
          )}

          {/* Step 4: Success */}
          {step === Step.SUCCESS && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                style={{ background: 'var(--accent-50)' }}>
                <CheckCircle className="w-10 h-10" style={{ color: 'var(--accent-600)' }} />
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Password successfully reset. You can now log in with your new password.
              </p>
              <button onClick={handleClose} className="btn btn-primary btn-full">Close</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
