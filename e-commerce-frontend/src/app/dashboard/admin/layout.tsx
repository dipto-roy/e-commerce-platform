'use client';
import React, { useState } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import { ToastProvider } from '@/contexts/ToastContext';

export const dynamic = 'force-dynamic';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { loading, isAdmin } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bg-secondary)' }}>
        <span className="spinner" style={{ width: '3rem', height: '3rem', borderWidth: '3px' }} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bg-secondary)' }}>
        <div className="card p-8 max-w-sm text-center">
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Access Denied
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            You don&apos;t have permission to access this area.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Admin header (contains sidebar hamburger on mobile) */}
          <Header onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
