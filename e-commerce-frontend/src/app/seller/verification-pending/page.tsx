'use client';
import { useAuth } from "@/contexts/AuthContextNew";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function VerificationPendingPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [email, setEmail] = useState<string | null>(null);

  // Get email from session storage if coming from login attempt
  useEffect(() => {
    const storedEmail = sessionStorage.getItem('verificationEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  // Handle different scenarios
  useEffect(() => {
    if (loading) return;
    
    // Case 1: User is logged in and is a verified seller
    if (user?.role?.toLowerCase() === 'seller' && user.isVerified) {
      console.log('✅ Seller is verified, redirecting to dashboard');
      router.push('/dashboard/seller');
      return;
    }
    
    // Case 2: User is logged in but not a seller
    if (user && user.role?.toLowerCase() !== 'seller') {
      console.log('❌ Not a seller, redirecting to login');
      router.push('/login');
      return;
    }
    
    // Case 3: User is logged in as seller but not verified - stay on this page
    // Case 4: User is not logged in but has email in session - show verification pending
    // Both cases can stay on this page
  }, [user, loading, router]);

  // Auto refresh check every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Check verification status
          window.location.reload();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    // Clear verification email from session
    sessionStorage.removeItem('verificationEmail');
    await logout();
    router.push('/login');
  };

  const handleCheckStatus = () => {
    window.location.reload();
  };

  const handleBackToLogin = () => {
    sessionStorage.removeItem('verificationEmail');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show verification pending message
  const displayEmail = user?.email || email;
  const isLoggedIn = !!user;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user || user.role?.toLowerCase() !== 'seller') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-lg p-8 text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white">
          {isLoggedIn ? 'Verification Pending' : 'Account Verification Required'}
        </h1>

        {/* Message */}
        <div className="space-y-3">
          {isLoggedIn ? (
            <>
              <p className="text-gray-300">
                Welcome <span className="text-purple-400 font-semibold">{user.fullName || user.username}</span>!
              </p>
              <p className="text-gray-300">
                Your seller account is currently pending admin verification. 
                You will be able to access your dashboard once your account is approved.
              </p>
            </>
          ) : (
            <>
              <p className="text-gray-300">
                {displayEmail && (
                  <>Account: <span className="text-purple-400 font-semibold">{displayEmail}</span></>
                )}
              </p>
              <p className="text-gray-300">
                Your seller account requires admin verification before you can login. 
                Please wait for approval notification.
              </p>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-left">
                <h3 className="text-blue-400 font-semibold mb-2">📋 What happens next:</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Admin reviews your seller application</li>
                  <li>• You'll receive notification once approved</li>
                  <li>• After approval, you can login successfully</li>
                  <li>• Access your seller dashboard and start selling</li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Status Box - only show for logged in users */}
        {isLoggedIn && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2 text-yellow-400">
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="font-medium">Status: Pending Verification</span>
            </div>
            <p className="text-yellow-300 text-sm mt-2">
              Next status check in {timeRemaining} seconds
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {isLoggedIn ? (
            <>
              <button
                onClick={handleCheckStatus}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Check Status Now
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleBackToLogin}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Back to Login
              </button>
              
              <Link 
                href="/Singup" 
                className="block w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Register New Account
              </Link>
            </>
          )}
        </div>

        {/* Additional Info */}
        <div className="text-center space-y-2">
          <p className="text-gray-400 text-sm">
            Need help? Contact our support team
          </p>
          <div className="text-gray-500 text-xs">
            📧 support@yourstore.com | 📞 +1-234-567-8900
          </div>
        </div>

        {/* User Info - only for logged in users */}
        {isLoggedIn && user && (
          <div className="bg-gray-700/50 rounded-lg p-3 text-left">
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Account Details</p>
            <div className="space-y-1 text-sm">
              <p className="text-gray-300">
                <span className="text-gray-400">Email:</span> {user.email}
              </p>
              <p className="text-gray-300">
                <span className="text-gray-400">Username:</span> {user.username}
              </p>
              <p className="text-gray-300">
                <span className="text-gray-400">Role:</span> 
                <span className="text-purple-400 ml-1 capitalize">{user.role}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}