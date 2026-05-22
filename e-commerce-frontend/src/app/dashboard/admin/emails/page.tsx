'use client';
import React, { useState, useEffect } from 'react';
import { Mail, Clock, Users, Send, FileText, CheckCircle } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { adminAPI } from '@/lib/adminAPI';

interface EmailTemplate { id: string; name: string; subject: string; body: string; }
interface EmailHistory { id: number; subject: string; recipients: string[]; sentAt: string; status: 'sent' | 'failed'; }

type Tab = 'compose' | 'templates' | 'history';

const TEMPLATES: EmailTemplate[] = [
  {
    id: '1', name: 'Welcome Email',
    subject: 'Welcome to Our Platform!',
    body: 'Dear {{name}},\n\nWelcome to our e-commerce platform! We\'re excited to have you join our community.\n\nBest regards,\nThe Team',
  },
  {
    id: '2', name: 'Order Confirmation',
    subject: 'Order Confirmation - #{{orderNumber}}',
    body: 'Dear {{name}},\n\nThank you for your order! Your order #{{orderNumber}} has been confirmed and is being processed.\n\nBest regards,\nThe Team',
  },
  {
    id: '3', name: 'Seller Verification',
    subject: 'Seller Account Verified',
    body: 'Dear {{name}},\n\nCongratulations! Your seller account has been verified. You can now start listing your products.\n\nBest regards,\nThe Team',
  },
];

export default function EmailPage() {
  const [activeTab, setActiveTab]     = useState<Tab>('compose');
  const [subject, setSubject]         = useState('');
  const [message, setMessage]         = useState('');
  const [recipients, setRecipients]   = useState('');
  const [recipientType, setRecipientType] = useState<'all' | 'users' | 'sellers' | 'custom'>('all');
  const [loading, setLoading]         = useState(false);
  const [emailHistory, setEmailHistory] = useState<EmailHistory[]>([]);
  const { addToast } = useToast();

  useEffect(() => {
    if (activeTab === 'history') fetchEmailHistory();
  }, [activeTab]);

  const fetchEmailHistory = async () => {
    try {
      const response = await adminAPI.getEmailHistory();
      setEmailHistory((response.data as any).history || []);
    } catch { addToast('Failed to load email history', 'error'); }
  };

  const handleSendEmail = async () => {
    if (!subject.trim() || !message.trim()) { addToast('Fill in subject and message', 'error'); return; }
    if (recipientType === 'custom' && !recipients.trim()) { addToast('Specify recipients', 'error'); return; }
    try {
      setLoading(true);
      if (recipientType === 'custom') {
        const list = recipients.split(',').map(e => e.trim()).filter(Boolean);
        if (!list.length) { addToast('Provide at least one email', 'error'); return; }
        await adminAPI.sendEmail({ subject, message, recipients: list });
      } else {
        await adminAPI.sendBulkEmail({ subject, message, recipientType: recipientType as any });
      }
      addToast('Email sent successfully!', 'success');
      setSubject(''); setMessage(''); setRecipients(''); setRecipientType('all');
    } catch (err: any) { addToast(err.response?.data?.message || 'Failed to send email', 'error'); }
    finally { setLoading(false); }
  };

  const handleTemplateSelect = (t: EmailTemplate) => {
    setSubject(t.subject); setMessage(t.body); setActiveTab('compose');
  };

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'compose',   label: 'Compose',   icon: <Mail className="w-3.5 h-3.5" /> },
    { key: 'templates', label: 'Templates', icon: <FileText className="w-3.5 h-3.5" /> },
    { key: 'history',   label: 'History',   icon: <Clock className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="section-title">Email System</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Send emails to users, manage templates, and view history
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--border)]">
        {TABS.map(({ key, label, icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === key
                ? 'border-[var(--accent-500)] text-[var(--accent-600)]'
                : 'border-transparent hover:border-[var(--border)] text-[var(--text-secondary)]'
            }`}>
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Compose */}
      {activeTab === 'compose' && (
        <div className="card p-6">
          <h2 className="font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>Compose Email</h2>
          <div className="space-y-4">
            <div className="input-group">
              <label className="label">Recipients</label>
              <select value={recipientType} onChange={(e) => setRecipientType(e.target.value as any)} className="input">
                <option value="all">All Users</option>
                <option value="users">Regular Users Only</option>
                <option value="sellers">Sellers Only</option>
                <option value="custom">Custom Email List</option>
              </select>
            </div>

            {recipientType === 'custom' && (
              <div className="input-group">
                <label className="label">Email Addresses (comma-separated)</label>
                <textarea
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                  placeholder="user1@example.com, user2@example.com…"
                  className="input"
                  rows={3}
                />
              </div>
            )}

            <div className="input-group">
              <label className="label">Subject</label>
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject…" className="input" />
            </div>

            <div className="input-group">
              <label className="label">Message</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message…" className="input" rows={8} />
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Use variables like {'{{name}}'}, {'{{email}}'}, {'{{orderNumber}}'} in your message.
              </p>
            </div>

            <div className="flex justify-end">
              <button onClick={handleSendEmail} disabled={loading} className="btn btn-primary">
                {loading ? <><span className="spinner" /> Sending…</> : <><Send className="w-4 h-4" /> Send Email</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Templates */}
      {activeTab === 'templates' && (
        <div className="card p-6">
          <h2 className="font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>Email Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEMPLATES.map((t) => (
              <div key={t.id} className="card p-4 card-interactive">
                <p className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{t.name}</p>
                <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Subject: {t.subject}</p>
                <p className="text-xs mb-4 line-clamp-3" style={{ color: 'var(--text-muted)' }}>{t.body}</p>
                <button onClick={() => handleTemplateSelect(t)} className="btn btn-outline btn-sm btn-full">
                  Use Template
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      {activeTab === 'history' && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border)]">
            <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Email History</h2>
          </div>
          {emailHistory.length === 0 ? (
            <div className="text-center py-16">
              <Mail className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>No emails sent yet</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Get started by composing an email.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Recipients</th>
                    <th>Sent At</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {emailHistory.map((email) => (
                    <tr key={email.id}>
                      <td className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{email.subject}</td>
                      <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {Array.isArray(email.recipients) ? `${email.recipients.length} recipients` : email.recipients}
                      </td>
                      <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {new Date(email.sentAt).toLocaleString()}
                      </td>
                      <td>
                        <span className={email.status === 'sent' ? 'badge badge-green' : 'badge badge-red'}>
                          {email.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
