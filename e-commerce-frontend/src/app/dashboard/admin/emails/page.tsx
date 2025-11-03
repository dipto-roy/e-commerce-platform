'use client';
import React, { useState, useEffect } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { adminAPI } from '@/lib/adminAPI';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

interface EmailHistory {
  id: number;
  subject: string;
  recipients: string[];
  sentAt: string;
  status: 'sent' | 'failed';
}

export default function EmailPage() {
  const [activeTab, setActiveTab] = useState<'compose' | 'templates' | 'history'>('compose');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [recipients, setRecipients] = useState('');
  const [recipientType, setRecipientType] = useState<'all' | 'users' | 'sellers' | 'custom'>('all');
  const [loading, setLoading] = useState(false);
  const [emailHistory, setEmailHistory] = useState<EmailHistory[]>([]);
  const [templates] = useState<EmailTemplate[]>([
    {
      id: '1',
      name: 'Welcome Email',
      subject: 'Welcome to Our Platform!',
      body: 'Dear {{name}},\n\nWelcome to our e-commerce platform! We\'re excited to have you join our community.\n\nBest regards,\nThe Team'
    },
    {
      id: '2',
      name: 'Order Confirmation',
      subject: 'Order Confirmation - #{{orderNumber}}',
      body: 'Dear {{name}},\n\nThank you for your order! Your order #{{orderNumber}} has been confirmed and is being processed.\n\nBest regards,\nThe Team'
    },
    {
      id: '3',
      name: 'Seller Verification',
      subject: 'Seller Account Verified',
      body: 'Dear {{name}},\n\nCongratulations! Your seller account has been verified. You can now start listing your products.\n\nBest regards,\nThe Team'
    }
  ]);
  
  const { addToast } = useToast();

  // Fetch email history
  const fetchEmailHistory = async () => {
    try {
      const response = await adminAPI.getEmailHistory();
      const historyData = (response.data as any).history || [];
      setEmailHistory(historyData);
    } catch (error) {
      console.error('Failed to fetch email history:', error);
      addToast('Failed to load email history', 'error');
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchEmailHistory();
    }
  }, [activeTab]);

  // Handle email sending
  const handleSendEmail = async () => {
    if (!subject.trim() || !message.trim()) {
      addToast('Please fill in both subject and message', 'error');
      return;
    }

    if (recipientType === 'custom' && !recipients.trim()) {
      addToast('Please specify recipients', 'error');
      return;
    }

    try {
      setLoading(true);
      
      if (recipientType === 'custom') {
        // Send to custom email list
        const recipientsList = recipients.split(',').map(email => email.trim()).filter(email => email);
        
        if (recipientsList.length === 0) {
          addToast('Please provide at least one valid email address', 'error');
          return;
        }

        await adminAPI.sendEmail({
          subject,
          message,
          recipients: recipientsList,
        });
      } else {
        // Send bulk email based on recipient type
        await adminAPI.sendBulkEmail({
          subject,
          message,
          recipientType: recipientType as 'all' | 'users' | 'sellers',
        });
      }

      addToast('Email sent successfully!', 'success');
      
      // Reset form
      setSubject('');
      setMessage('');
      setRecipients('');
      setRecipientType('all');
      
    } catch (error: any) {
      console.error('Failed to send email:', error);
      addToast(error.response?.data?.message || 'Failed to send email', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle template selection
  const handleTemplateSelect = (template: EmailTemplate) => {
    setSubject(template.subject);
    setMessage(template.body);
    setActiveTab('compose');
  };

  // Handle welcome email sending
  const handleSendWelcomeEmail = async (email: string) => {
    try {
      setLoading(true);
      // TODO: Call POST /api/admin/emails/welcome from NestJS backend
      await adminAPI.sendEmail({
        subject: 'Welcome to Our Platform!',
        message: 'Welcome to our e-commerce platform! We\'re excited to have you join our community.',
        recipients: [email]
      });
      addToast('Welcome email sent successfully!', 'success');
    } catch (error: any) {
      console.error('Failed to send welcome email:', error);
      addToast('Failed to send welcome email', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Email System</h1>
        <p className="mt-1 text-sm text-gray-600">
          Send emails to users, manage templates, and view email history
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['compose', 'templates', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Compose Email Tab */}
      {activeTab === 'compose' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Compose Email</h2>
          
          <div className="space-y-4">
            {/* Recipients */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipients
              </label>
              <select
                value={recipientType}
                onChange={(e) => setRecipientType(e.target.value as any)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Users</option>
                <option value="users">Regular Users Only</option>
                <option value="sellers">Sellers Only</option>
                <option value="custom">Custom Email List</option>
              </select>
            </div>

            {/* Custom Recipients Input */}
            {recipientType === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Addresses (comma-separated)
                </label>
                <textarea
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                  placeholder="user1@example.com, user2@example.com, ..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
            )}

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={8}
              />
              <p className="mt-2 text-sm text-gray-500">
                You can use variables like {'{{name}}'}, {'{{email}}'}, {'{{orderNumber}}'} in your message.
              </p>
            </div>

            {/* Send Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSendEmail}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Send Email'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Email Templates</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <h3 className="font-medium text-gray-900 mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-2">Subject: {template.subject}</p>
                <p className="text-sm text-gray-500 mb-4 line-clamp-3">{template.body}</p>
                <button
                  onClick={() => handleTemplateSelect(template)}
                  className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Use Template
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Email History</h2>
          </div>
          
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recipients
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sent At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {emailHistory.map((email) => (
                  <tr key={email.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {email.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {Array.isArray(email.recipients) 
                        ? `${email.recipients.length} recipients`
                        : email.recipients
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(email.sentAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        email.status === 'sent' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {email.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {emailHistory.length === 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m14 0H4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No emails sent</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by sending your first email.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}