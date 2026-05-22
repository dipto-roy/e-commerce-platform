'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextNew';
import { useToast } from '@/contexts/ToastContext';
import { adminAPI } from '@/lib/adminAPI';
import { User, Save, RefreshCw } from 'lucide-react';

interface UserProfile {
  id: number; username: string; email: string;
  fullName?: string; phone?: string; role: string;
  isActive: boolean; isVerified: boolean; createdAt?: string;
}

const ROLE_BADGE: Record<string, string> = {
  ADMIN:  'badge badge-green',
  SELLER: 'badge badge-blue',
  USER:   'badge badge-gray',
};

export default function ProfilePage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', username: '' });

  useEffect(() => { if (user) fetchProfile(); }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      if (!user?.id) return;
      const response = await adminAPI.getUserById(user.id);
      const userData = response.data as UserProfile;
      setProfile(userData);
      setFormData({ fullName: userData.fullName || '', email: userData.email || '', phone: userData.phone || '', username: userData.username || '' });
    } catch { addToast('Failed to load profile', 'error'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    try {
      setSaving(true);
      await adminAPI.updateUser(user.id, formData);
      addToast('Profile updated successfully', 'success');
      fetchProfile();
    } catch (err: any) { addToast(err.response?.data?.message || 'Failed to update profile', 'error'); }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="page-wrapper flex items-center justify-center">
        <span className="spinner" style={{ width: '3rem', height: '3rem', borderWidth: '3px' }} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-wrapper flex items-center justify-center p-6">
        <div className="card p-8 max-w-sm text-center">
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Not logged in</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container-app">
          <h1 className="section-title">Profile Settings</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Manage your account information</p>
        </div>
      </div>

      <div className="container-app py-8 max-w-3xl">
        {/* Avatar & info */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0"
              style={{ background: 'var(--accent-500)' }}>
              {(profile?.fullName || profile?.username || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                {profile?.fullName || profile?.username}
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{profile?.email}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className={profile?.isActive ? 'badge badge-green' : 'badge badge-red'}>
                  {profile?.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className={profile?.isVerified ? 'badge badge-green' : 'badge badge-yellow'}>
                  {profile?.isVerified ? 'Verified' : 'Unverified'}
                </span>
                <span className={ROLE_BADGE[profile?.role || 'USER'] || 'badge badge-gray'}>
                  {profile?.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div className="card p-6">
          <h2 className="font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>Edit Information</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                { id: 'fullName', label: 'Full Name',     type: 'text',  placeholder: 'Enter your full name' },
                { id: 'username', label: 'Username',      type: 'text',  placeholder: 'Enter your username' },
                { id: 'email',    label: 'Email Address', type: 'email', placeholder: 'Enter your email' },
                { id: 'phone',    label: 'Phone Number',  type: 'tel',   placeholder: '01XXXXXXXXX' },
              ].map(({ id, label, type, placeholder }) => (
                <div key={id} className="input-group">
                  <label htmlFor={id} className="label">{label}</label>
                  <input
                    type={type}
                    id={id}
                    name={id}
                    value={formData[id as keyof typeof formData]}
                    onChange={(e) => setFormData(prev => ({ ...prev, [id]: e.target.value }))}
                    className="input"
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={fetchProfile} disabled={saving} className="btn btn-outline">
                <RefreshCw className="w-4 h-4" /> Reset
              </button>
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? <><span className="spinner" /> Saving…</> : <><Save className="w-4 h-4" /> Save Changes</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
