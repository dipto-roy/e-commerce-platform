'use client';
import React, { useState } from 'react';
import {
  FileText, Download, Calendar, TrendingUp, Users,
  Package, ShoppingCart, DollarSign, BarChart3, CheckCircle,
} from 'lucide-react';
import api from '@/utils/api';

const REPORT_TYPES = [
  { value: 'sales',     label: 'Sales Report',     desc: 'Detailed sales transactions and summary',   icon: DollarSign,  color: 'var(--accent-500)' },
  { value: 'users',     label: 'Users Report',     desc: 'User registration and activity metrics',    icon: Users,       color: '#3b82f6' },
  { value: 'products',  label: 'Products Report',  desc: 'Product catalog and inventory status',      icon: Package,     color: '#8b5cf6' },
  { value: 'orders',    label: 'Orders Report',    desc: 'Order status and tracking information',     icon: ShoppingCart,color: '#f59e0b' },
  { value: 'revenue',   label: 'Revenue Report',   desc: 'Revenue analysis and trends by period',    icon: TrendingUp,  color: '#10b981' },
  { value: 'inventory', label: 'Inventory Report', desc: 'Stock levels and low-stock alerts',         icon: BarChart3,   color: '#ef4444' },
];

const FORMAT_TYPES = [
  { value: 'pdf',   label: 'PDF',   desc: 'Portable Document Format', emoji: '📄' },
  { value: 'excel', label: 'Excel', desc: 'Microsoft Excel Spreadsheet', emoji: '📊' },
  { value: 'csv',   label: 'CSV',   desc: 'Comma-Separated Values', emoji: '📋' },
];

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState('sales');
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState<string | null>(null);

  const handleGenerateReport = async () => {
    try {
      setLoading(true); setError(null); setSuccess(null);
      const params = new URLSearchParams({ type: selectedReport, format: selectedFormat });
      if (startDate) params.append('startDate', startDate);
      if (endDate)   params.append('endDate', endDate);

      const response = await api.get<Blob>(`/admin/reports/generate?${params.toString()}`, { responseType: 'blob' });
      const blob = new Blob([response.data as BlobPart], { type: response.headers['content-type'] || 'application/octet-stream' });
      const url  = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href  = url;
      const cd   = response.headers['content-disposition'];
      let filename = `${selectedReport}-report-${startDate}.${selectedFormat}`;
      if (cd) { const m = cd.match(/filename="?(.+)"?/i); if (m) filename = m[1]; }
      link.download = filename;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setSuccess(`Report downloaded: ${filename}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate report.');
    } finally { setLoading(false); }
  };

  const selectedReportInfo = REPORT_TYPES.find(r => r.value === selectedReport);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Reports</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Generate and download business reports in various formats
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-50)' }}>
          <FileText className="w-5 h-5" style={{ color: 'var(--accent-600)' }} />
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <div className="alert alert-success">
          <Download className="w-4 h-4 shrink-0" /><span>{success}</span>
        </div>
      )}
      {error && <div className="alert alert-error"><span>{error}</span></div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: config */}
        <div className="lg:col-span-2 space-y-6">
          {/* Report type */}
          <div className="card p-6">
            <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Select Report Type</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {REPORT_TYPES.map(({ value, label, desc, icon: Icon, color }) => (
                <button key={value} onClick={() => setSelectedReport(value)}
                  className={`p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3 ${
                    selectedReport === value
                      ? 'border-[var(--accent-500)] bg-[var(--accent-50)]'
                      : 'border-[var(--border)] hover:border-[var(--border-accent)]'
                  }`}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${color}1a` }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{label}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                  </div>
                  {selectedReport === value && <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--accent-600)' }} />}
                </button>
              ))}
            </div>
          </div>

          {/* Format */}
          <div className="card p-6">
            <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Export Format</h2>
            <div className="grid grid-cols-3 gap-3">
              {FORMAT_TYPES.map(({ value, label, desc, emoji }) => (
                <button key={value} onClick={() => setSelectedFormat(value)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    selectedFormat === value
                      ? 'border-[var(--accent-500)] bg-[var(--accent-50)]'
                      : 'border-[var(--border)] hover:border-[var(--border-accent)]'
                  }`}>
                  <div className="text-3xl mb-2">{emoji}</div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Date range */}
          <div className="card p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Calendar className="w-4 h-4" style={{ color: 'var(--accent-600)' }} />
              Date Range
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="input-group">
                <label className="label">Start Date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input" />
              </div>
              <div className="input-group">
                <label className="label">End Date</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input" />
              </div>
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Leave empty to include all data</p>
          </div>
        </div>

        {/* Right: preview */}
        <div className="space-y-4">
          <div className="card p-6 sticky top-6">
            <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Report Preview</h2>
            {selectedReportInfo && (
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{ background: `${selectedReportInfo.color}1a` }}>
                  {React.createElement(selectedReportInfo.icon, { className: 'w-7 h-7', style: { color: selectedReportInfo.color } })}
                </div>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedReportInfo.label}</p>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{selectedReportInfo.desc}</p>
                </div>
                <div className="border-t border-[var(--border)] pt-4 space-y-2 text-sm">
                  {[
                    ['Format', selectedFormat.toUpperCase()],
                    startDate ? ['From', new Date(startDate).toLocaleDateString()] : null,
                    endDate   ? ['To',   new Date(endDate).toLocaleDateString()]   : null,
                  ].filter(Boolean).map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span style={{ color: 'var(--text-secondary)' }}>{k}</span>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{v}</span>
                    </div>
                  ))}
                </div>
                <button onClick={handleGenerateReport} disabled={loading} className="btn btn-primary btn-full">
                  {loading ? <><span className="spinner" /> Generating…</> : <><Download className="w-4 h-4" /> Generate Report</>}
                </button>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="card p-5" style={{ background: 'var(--bg-secondary)' }}>
            <p className="font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>📊 Report Features</p>
            <ul className="space-y-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
              {[
                'Real-time data from database',
                'Summary statistics included',
                'Detailed data tables',
                'Professional formatting',
                'Instant download',
              ].map(f => (
                <li key={f} className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--accent-500)' }} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="alert alert-info">
        <div className="text-xs space-y-1">
          <p className="font-semibold mb-1">Report Information</p>
          {[
            'Reports are generated in real-time from your latest data',
            'PDF reports include charts and professional formatting',
            'Excel reports contain multiple sheets with summary and details',
            'CSV reports are ideal for further data analysis',
            'Date filters are optional — leave empty to include all data',
          ].map(t => <p key={t}>• {t}</p>)}
        </div>
      </div>
    </div>
  );
}
