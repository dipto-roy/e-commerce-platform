'use client';
import React, { useState } from 'react';
import { useSellerGuard } from '@/hooks/useAuthGuard';
import { mailAPI } from '@/utils/api';
import { Mail, Send, User, Package, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const TEMPLATES = [
  {
    id: 'order_shipped', name: 'Order Shipped',
    subject: 'Your order has been shipped - Order #{orderId}',
    message: `Dear {customerName},\n\nGreat news! Your order has been shipped and is on its way to you.\n\nOrder Details:\n- Order ID: {orderId}\n- Product: {productName}\n- Tracking Number: [Please add tracking number]\n\nYou can expect delivery within 3-7 business days.\n\nThank you for your business!\n\nBest regards,\n{sellerName}`,
  },
  {
    id: 'order_ready', name: 'Order Ready for Pickup',
    subject: 'Your order is ready for pickup - Order #{orderId}',
    message: `Dear {customerName},\n\nYour order is now ready for pickup!\n\nOrder Details:\n- Order ID: {orderId}\n- Product: {productName}\n\nPlease visit our store during business hours to collect your order.\n\nThank you!\n\nBest regards,\n{sellerName}`,
  },
  {
    id: 'product_inquiry', name: 'Product Inquiry Response',
    subject: 'Response to your inquiry about {productName}',
    message: `Dear {customerName},\n\nThank you for your inquiry about {productName}.\n\n[Please customize this message with specific details.]\n\nIf you have any additional questions, please don't hesitate to contact us.\n\nBest regards,\n{sellerName}`,
  },
  { id: 'custom', name: 'Custom Message', subject: '', message: '' },
];

export default function SellerMailPage() {
  const { user, loading, isAuthorized } = useSellerGuard();
  const [mailForm, setMailForm] = useState({
    toName: '', toEmail: '', subject: '', message: '', productName: '', orderId: '',
  });
  const [sending, setSending]   = useState(false);
  const [success, setSuccess]   = useState<string | null>(null);
  const [error, setError]       = useState<string | null>(null);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMailForm(prev => ({ ...prev, [name]: value }));
  };

  const useTemplate = (t: typeof TEMPLATES[0]) => {
    setMailForm(prev => ({ ...prev, subject: t.subject, message: t.message }));
    setSuccess(null); setError(null);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSending(true); setError(null); setSuccess(null);
    try {
      await mailAPI.sendSellerToBuyer({
        fromName: user.fullName || user.username,
        fromEmail: user.email,
        toName: mailForm.toName, toEmail: mailForm.toEmail,
        subject: mailForm.subject, message: mailForm.message,
        productName: mailForm.productName || undefined,
        orderId: mailForm.orderId || undefined,
      });
      setSuccess('Email sent successfully!');
      setMailForm({ toName: '', toEmail: '', subject: '', message: '', productName: '', orderId: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send email. Please try again.');
    } finally { setSending(false); }
  };

  if (loading) {
    return (
      <div className="page-wrapper flex items-center justify-center">
        <span className="spinner" style={{ width: '3rem', height: '3rem', borderWidth: '3px' }} />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="page-wrapper flex items-center justify-center p-6">
        <div className="card p-8 max-w-sm text-center">
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Unauthorized</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container-app">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--accent-50)' }}>
              <Mail className="w-5 h-5" style={{ color: 'var(--accent-600)' }} />
            </div>
            <div>
              <h1 className="section-title">Mail Center</h1>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                Communicate with your customers
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-app py-8">
        {!user?.isVerified && (
          <div className="alert mb-6" style={{
            background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '0.75rem',
          }}>
            <AlertCircle className="w-4 h-4 shrink-0" style={{ color: '#f59e0b' }} />
            <p className="text-sm" style={{ color: '#92400e' }}>
              <strong>Account Pending Verification:</strong> Mail is available but limited until verified.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Templates */}
          <div className="lg:col-span-1">
            <div className="card p-5">
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Templates</h3>
              <div className="space-y-2">
                {TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => useTemplate(t)}
                    className="w-full text-left card card-interactive p-3">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t.name}</p>
                    {t.subject && (
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{t.subject}</p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <h3 className="font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>
                Send Email to Customer
              </h3>

              {success && (
                <div className="alert alert-success mb-5">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <p>{success}</p>
                </div>
              )}
              {error && (
                <div className="alert alert-error mb-5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSendEmail} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="input-group">
                    <label className="label flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Customer Name
                    </label>
                    <input type="text" name="toName" value={mailForm.toName} onChange={handleFormChange}
                      required className="input" placeholder="Enter customer name" />
                  </div>
                  <div className="input-group">
                    <label className="label flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" /> Customer Email
                    </label>
                    <input type="email" name="toEmail" value={mailForm.toEmail} onChange={handleFormChange}
                      required className="input" placeholder="customer@example.com" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="input-group">
                    <label className="label flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5" /> Product Name <span style={{ color: 'var(--text-muted)' }}>(optional)</span>
                    </label>
                    <input type="text" name="productName" value={mailForm.productName} onChange={handleFormChange}
                      className="input" placeholder="Product name" />
                  </div>
                  <div className="input-group">
                    <label className="label flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> Order ID <span style={{ color: 'var(--text-muted)' }}>(optional)</span>
                    </label>
                    <input type="text" name="orderId" value={mailForm.orderId} onChange={handleFormChange}
                      className="input" placeholder="Order ID" />
                  </div>
                </div>

                <div className="input-group">
                  <label className="label">Subject</label>
                  <input type="text" name="subject" value={mailForm.subject} onChange={handleFormChange}
                    required className="input" placeholder="Email subject" />
                </div>

                <div className="input-group">
                  <label className="label">Message</label>
                  <textarea name="message" value={mailForm.message} onChange={handleFormChange}
                    required rows={8} className="input resize-none" placeholder="Type your message here…" />
                </div>

                <button type="submit" disabled={sending} className="btn btn-primary btn-full">
                  {sending
                    ? <><span className="spinner" /> Sending…</>
                    : <><Send className="w-4 h-4" /> Send Email</>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
