'use client';
import { useAuth } from "@/contexts/AuthContextNew";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, RefreshCw, ShoppingBag } from "lucide-react";

export default function VerificationPendingPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('verificationEmail');
    if (stored) setEmail(stored);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (user?.role?.toLowerCase() === 'seller' && user.isVerified) {
      router.push('/dashboard/seller');
      return;
    }
    if (user && user.role?.toLowerCase() !== 'seller') {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) { window.location.reload(); return 30; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    sessionStorage.removeItem('verificationEmail');
    await logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-tertiary)' }}>
        <span className="spinner" style={{ width: '3rem', height: '3rem', borderWidth: '3px' }} />
      </div>
    );
  }

  if (!user || user.role?.toLowerCase() !== 'seller') return null;

  const isLoggedIn = !!user;
  const displayEmail = user?.email || email;

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-tertiary)' }}>
      <div className="card p-8 w-full max-w-md text-center space-y-6">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2 mb-2" style={{ color: 'var(--accent-600)' }}>
          <ShoppingBag className="w-6 h-6" />
          <span className="text-xl font-bold">ShopNest</span>
        </div>

        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: 'var(--accent-50)' }}>
            <Clock className="w-10 h-10" style={{ color: '#f59e0b' }} />
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {isLoggedIn ? 'Verification Pending' : 'Account Verification Required'}
          </h1>

          {isLoggedIn ? (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Welcome <span className="font-semibold" style={{ color: 'var(--accent-600)' }}>{user.fullName || user.username}</span>!
              Your seller account is pending admin verification. You can access your dashboard once approved.
            </p>
          ) : (
            <>
              {displayEmail && (
                <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                  Account: <span className="font-semibold" style={{ color: 'var(--accent-600)' }}>{displayEmail}</span>
                </p>
              )}
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Your seller account requires admin verification before you can login.
              </p>
            </>
          )}
        </div>

        {/* What happens next (not-logged-in) */}
        {!isLoggedIn && (
          <div className="p-4 rounded-xl text-left" style={{ background: 'var(--bg-secondary)' }}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>What happens next</p>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              {[
                'Admin reviews your seller application',
                "You'll receive an email notification once approved",
                'After approval, you can log in successfully',
                'Access your seller dashboard and start selling',
              ].map(t => (
                <li key={t} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: 'var(--accent-500)' }} />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Status indicator (logged-in) */}
        {isLoggedIn && (
          <div className="p-4 rounded-xl" style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <div className="flex items-center justify-center gap-2 mb-1">
              <RefreshCw className="w-4 h-4 animate-spin" style={{ color: '#f59e0b' }} />
              <span className="font-medium text-sm" style={{ color: '#f59e0b' }}>Status: Pending Verification</span>
            </div>
            <p className="text-xs" style={{ color: '#d97706' }}>
              Next status check in {timeRemaining} seconds
            </p>
          </div>
        )}

        {/* Account details (logged-in) */}
        {isLoggedIn && (
          <div className="p-4 rounded-xl text-left" style={{ background: 'var(--bg-secondary)' }}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Account Details</p>
            <div className="space-y-1 text-sm">
              {[['Email', user.email], ['Username', user.username], ['Role', user.role]].map(([k, v]) => (
                <p key={k} style={{ color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{k}: </span>
                  <span style={{ color: 'var(--text-primary)' }}>{v}</span>
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {isLoggedIn ? (
            <>
              <button onClick={() => window.location.reload()} className="btn btn-primary btn-full">
                <RefreshCw className="w-4 h-4" /> Check Status Now
              </button>
              <button onClick={handleLogout} className="btn btn-danger btn-full">Sign Out</button>
            </>
          ) : (
            <>
              <button onClick={() => { sessionStorage.removeItem('verificationEmail'); router.push('/login'); }}
                className="btn btn-primary btn-full">
                Back to Login
              </button>
              <Link href="/Singup" className="btn btn-outline btn-full block text-center">
                Register New Account
              </Link>
            </>
          )}
        </div>

        {/* Support */}
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Need help? Contact{' '}
          <a href="mailto:support@shopnest.com" className="underline" style={{ color: 'var(--accent-600)' }}>
            support@shopnest.com
          </a>
        </p>
      </div>
    </div>
  );
}
