'use client';
import React, { useState } from 'react';
import { useSellerGuard } from '@/hooks/useAuthGuard';
import { mailAPI } from '@/utils/api';
import { Mail, Send, User, Package, FileText, AlertCircle } from 'lucide-react';

export default function SellerMailPage() {
  const { user, loading, isAuthorized } = useSellerGuard();
  const [mailForm, setMailForm] = useState({
    toName: '',
    toEmail: '',
    subject: '',
    message: '',
    productName: '',
    orderId: '',
  });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Quick email templates for sellers
  const emailTemplates = [
    {
      id: 'order_shipped',
      name: 'Order Shipped',
      subject: 'Your order has been shipped - Order #{orderId}',
      message: `Dear {customerName},

Great news! Your order has been shipped and is on its way to you.

Order Details:
- Order ID: {orderId}
- Product: {productName}
- Tracking Number: [Please add tracking number]

You can expect delivery within 3-7 business days. We'll send you a tracking notification once your package is out for delivery.

Thank you for your business!

Best regards,
{sellerName}`
    },
    {
      id: 'order_ready',
      name: 'Order Ready for Pickup',
      subject: 'Your order is ready for pickup - Order #{orderId}',
      message: `Dear {customerName},

Your order is now ready for pickup!

Order Details:
- Order ID: {orderId}
- Product: {productName}

Please visit our store during business hours to collect your order. Don't forget to bring your order confirmation.

Thank you for choosing us!

Best regards,
{sellerName}`
    },
    {
      id: 'product_inquiry',
      name: 'Product Inquiry Response',
      subject: 'Response to your inquiry about {productName}',
      message: `Dear {customerName},

Thank you for your inquiry about {productName}.

[Please customize this message with specific details about the product, availability, pricing, or any other information the customer requested.]

If you have any additional questions, please don't hesitate to contact us.

Best regards,
{sellerName}`
    },
    {
      id: 'custom',
      name: 'Custom Message',
      subject: '',
      message: ''
    }
  ];

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMailForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const useTemplate = (template: typeof emailTemplates[0]) => {
    setMailForm(prev => ({
      ...prev,
      subject: template.subject,
      message: template.message
    }));
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSending(true);
    setError(null);
    setSuccess(null);

    try {
      const messageData = {
        fromName: user.fullName || user.username,
        fromEmail: user.email,
        toName: mailForm.toName,
        toEmail: mailForm.toEmail,
        subject: mailForm.subject,
        message: mailForm.message,
        productName: mailForm.productName || undefined,
        orderId: mailForm.orderId || undefined,
      };

      await mailAPI.sendSellerToBuyer(messageData);
      setSuccess('Email sent successfully!');
      
      // Reset form
      setMailForm({
        toName: '',
        toEmail: '',
        subject: '',
        message: '',
        productName: '',
        orderId: '',
      });
    } catch (error: any) {
      console.error('❌ Error sending email:', error);
      setError(error.response?.data?.message || 'Failed to send email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Unauthorized</h2>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Mail className="w-8 h-8 text-blue-500" />
              <div>
                <h1 className="text-2xl font-bold text-white">Mail Center</h1>
                <p className="text-gray-400">Communicate with your customers</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Verification Status Alert */}
      {!user?.isVerified && (
        <div className="bg-yellow-600 border-l-4 border-yellow-400 p-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div className="ml-3">
                <p className="text-sm text-yellow-200">
                  <strong>Account Pending Verification:</strong> Mail functionality is available but limited until your account is verified.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Email Templates */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Templates</h3>
              <div className="space-y-3">
                {emailTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => useTemplate(template)}
                    className="w-full text-left p-3 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
                  >
                    <div className="text-white font-medium">{template.name}</div>
                    {template.subject && (
                      <div className="text-gray-400 text-sm mt-1">{template.subject}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Email Form */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Send Email to Customer</h3>
              
              {success && (
                <div className="mb-4 p-4 bg-green-600 text-white rounded-md">
                  {success}
                </div>
              )}
              
              {error && (
                <div className="mb-4 p-4 bg-red-600 text-white rounded-md">
                  {error}
                </div>
              )}

              <form onSubmit={handleSendEmail} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Customer Name
                    </label>
                    <input
                      type="text"
                      name="toName"
                      value={mailForm.toName}
                      onChange={handleFormChange}
                      required
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Customer Email
                    </label>
                    <input
                      type="email"
                      name="toEmail"
                      value={mailForm.toEmail}
                      onChange={handleFormChange}
                      required
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="customer@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Package className="w-4 h-4 inline mr-2" />
                      Product Name (Optional)
                    </label>
                    <input
                      type="text"
                      name="productName"
                      value={mailForm.productName}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Product name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <FileText className="w-4 h-4 inline mr-2" />
                      Order ID (Optional)
                    </label>
                    <input
                      type="text"
                      name="orderId"
                      value={mailForm.orderId}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Order ID"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={mailForm.subject}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Email subject"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={mailForm.message}
                    onChange={handleFormChange}
                    required
                    rows={8}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type your message here..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className={`w-full flex items-center justify-center px-4 py-2 rounded-md transition-colors ${
                    sending
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {sending ? 'Sending...' : 'Send Email'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}