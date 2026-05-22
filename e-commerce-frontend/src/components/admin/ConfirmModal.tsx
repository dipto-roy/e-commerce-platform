'use client';
import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean; onClose: () => void; onConfirm: () => void;
  title: string; message: string;
  confirmText?: string; cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

const TYPE_CONFIG = {
  danger:  { icon: '🗑️', iconBg: 'rgba(239,68,68,0.1)',  btnClass: 'btn btn-danger' },
  warning: { icon: '⚠️',  iconBg: 'rgba(245,158,11,0.1)', btnClass: 'btn' },
  info:    { icon: 'ℹ️',  iconBg: 'var(--accent-50)',     btnClass: 'btn btn-primary' },
};

export default function ConfirmModal({
  isOpen, onClose, onConfirm, title, message,
  confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger', loading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;
  const cfg = TYPE_CONFIG[type];

  return (
    <div className="fixed inset-0 bg-black/50 overflow-y-auto z-50 flex items-center justify-center p-4">
      <div className="card shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-xl"
              style={{ background: cfg.iconBg }}>
              {cfg.icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{message}</p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button type="button" onClick={onClose} disabled={loading} className="btn btn-outline">
            {cancelText}
          </button>
          <button type="button" onClick={onConfirm} disabled={loading} className={cfg.btnClass}>
            {loading ? <><span className="spinner" /> Processing…</> : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
