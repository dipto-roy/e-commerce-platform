'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign,
  BarChart3,
  Loader2
} from 'lucide-react';
import api from '@/utils/api';

// Report type configuration
const reportTypes = [
  {
    value: 'sales',
    label: 'Sales Report',
    description: 'Detailed sales transactions and summary',
    icon: DollarSign,
    color: 'bg-green-100 text-green-600',
  },
  {
    value: 'users',
    label: 'Users Report',
    description: 'User registration and activity metrics',
    icon: Users,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    value: 'products',
    label: 'Products Report',
    description: 'Product catalog and inventory status',
    icon: Package,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    value: 'orders',
    label: 'Orders Report',
    description: 'Order status and tracking information',
    icon: ShoppingCart,
    color: 'bg-orange-100 text-orange-600',
  },
  {
    value: 'revenue',
    label: 'Revenue Report',
    description: 'Revenue analysis and trends by period',
    icon: TrendingUp,
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    value: 'inventory',
    label: 'Inventory Report',
    description: 'Stock levels and low-stock alerts',
    icon: BarChart3,
    color: 'bg-amber-100 text-amber-600',
  },
];

const formatTypes = [
  { value: 'pdf', label: 'PDF', description: 'Portable Document Format', icon: '📄' },
  { value: 'excel', label: 'Excel', description: 'Microsoft Excel Spreadsheet', icon: '📊' },
  { value: 'csv', label: 'CSV', description: 'Comma-Separated Values', icon: '📋' },
];

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState('sales');
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Set default date range (last 30 days)
  React.useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
  }, []);

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Build query parameters
      const params = new URLSearchParams({
        type: selectedReport,
        format: selectedFormat,
      });

      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      // Call API
      const response = await api.get<Blob>(`/admin/reports/generate?${params.toString()}`, {
        responseType: 'blob',
      });

      // Create download link
      const blob = new Blob([response.data as BlobPart], {
        type: response.headers['content-type'] || 'application/octet-stream',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from Content-Disposition header or create default
      const contentDisposition = response.headers['content-disposition'];
      let filename = `${selectedReport}-report-${startDate}.${selectedFormat}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess(`Report generated successfully! ${filename}`);
    } catch (err: any) {
      console.error('Report generation error:', err);
      setError(err.response?.data?.message || 'Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedReportInfo = reportTypes.find(r => r.value === selectedReport);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Generate and download business reports in various formats</p>
        </div>
        <FileText className="w-8 h-8 text-blue-600" />
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <Download className="w-5 h-5" />
          <span>{success}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Report Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Report Type Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Report Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportTypes.map((report) => {
                const Icon = report.icon;
                return (
                  <button
                    key={report.value}
                    onClick={() => setSelectedReport(report.value)}
                    className={`
                      p-4 rounded-lg border-2 transition-all text-left
                      ${selectedReport === report.value
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${report.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{report.label}</h3>
                        <p className="text-sm text-gray-600">{report.description}</p>
                      </div>
                      {selectedReport === report.value && (
                        <div className="text-blue-600">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Format Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Format</h2>
            <div className="grid grid-cols-3 gap-4">
              {formatTypes.map((format) => (
                <button
                  key={format.value}
                  onClick={() => setSelectedFormat(format.value)}
                  className={`
                    p-4 rounded-lg border-2 transition-all
                    ${selectedFormat === format.value
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{format.icon}</div>
                    <h3 className="font-semibold text-gray-900 mb-1">{format.label}</h3>
                    <p className="text-xs text-gray-600">{format.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Date Range (Optional)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Leave empty to include all data
            </p>
          </div>
        </div>

        {/* Right Column - Preview & Generate */}
        <div className="space-y-6">
          {/* Preview Card */}
          <div className="bg-white rounded-lg shadow p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Preview</h2>
            
            {selectedReportInfo && (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${selectedReportInfo.color}`}>
                  {React.createElement(selectedReportInfo.icon, { className: 'w-8 h-8 mx-auto' })}
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {selectedReportInfo.label}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedReportInfo.description}
                  </p>
                </div>

                <div className="border-t pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Format:</span>
                    <span className="font-medium text-gray-900">{selectedFormat.toUpperCase()}</span>
                  </div>
                  {startDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">From:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(startDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {endDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">To:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(endDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleGenerateReport}
                  disabled={loading}
                  className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Generate Report
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-3">📊 Report Features</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Real-time data from database</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Summary statistics included</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Detailed data tables</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Professional formatting</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Instant download</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Report Information
        </h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• Reports are generated in real-time from your latest data</p>
          <p>• PDF reports include charts and professional formatting</p>
          <p>• Excel reports contain multiple sheets with summary and details</p>
          <p>• CSV reports are ideal for further data analysis</p>
          <p>• Date filters are optional - leave empty to include all data</p>
        </div>
      </div>
    </div>
  );
}
