'use client';
import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Store, Users, CheckCircle, Clock, RefreshCw, X } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { adminAPI } from '@/lib/adminAPI';

interface Seller {
  id: number;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  isVerified: boolean;
  isActive: boolean;
  totalProducts: number;
  totalSales: number;
}

const STAT_CARDS = [
  { key: 'total',    label: 'Total Sellers',       icon: Users,        color: 'var(--accent-500)' },
  { key: 'active',   label: 'Active Sellers',       icon: Store,        color: '#10b981' },
  { key: 'verified', label: 'Verified Sellers',     icon: CheckCircle,  color: '#3b82f6' },
  { key: 'pending',  label: 'Pending Verification', icon: Clock,        color: '#f59e0b' },
] as const;

export default function SellersPage() {
  const [sellers, setSellers]           = useState<Seller[]>([]);
  const [searchQuery, setSearchQuery]   = useState('');
  const [loading, setLoading]           = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm]     = useState({ fullName: '', username: '', email: '', password: '', phone: '' });
  const { addToast } = useToast();

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllSellers();
      const sellersData = response.data as any[];
      const transformed: Seller[] = sellersData.map((s: any) => ({
        id: s.id,
        businessName: s.fullName || s.username,
        contactPerson: s.fullName || s.username,
        email: s.email,
        phone: s.phone || '',
        isVerified: s.isVerified,
        isActive: s.isActive,
        totalProducts: 0,
        totalSales: 0,
      }));
      setSellers(transformed);
    } catch {
      addToast('Failed to load sellers', 'error');
      setSellers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSellers(); }, []);

  const handleToggleStatus = async (seller: Seller) => {
    try {
      setLoading(true);
      await adminAPI.toggleSellerStatus(seller.id);
      setSellers(prev => prev.map(s => s.id === seller.id ? { ...s, isActive: !s.isActive } : s));
      addToast(`Seller ${seller.isActive ? 'deactivated' : 'activated'} successfully`, 'success');
    } catch { addToast('Failed to update seller status', 'error'); }
    finally { setLoading(false); }
  };

  const handleToggleVerification = async (seller: Seller) => {
    try {
      setLoading(true);
      await adminAPI.verifySeller(seller.id);
      setSellers(prev => prev.map(s => s.id === seller.id ? { ...s, isVerified: !s.isVerified } : s));
      addToast(`Seller ${seller.isVerified ? 'unverified' : 'verified'} successfully`, 'success');
    } catch (err: any) {
      const status = err.response?.status;
      addToast(
        status === 404 ? 'Seller not found' :
        status === 409 ? 'Seller already verified' :
        status === 401 ? 'Unauthorized' :
        'Failed to update verification', 'error'
      );
    } finally { setLoading(false); }
  };

  const handleDeleteSeller = async () => {
    if (!selectedSeller) return;
    try {
      setLoading(true);
      await adminAPI.deleteSeller(selectedSeller.id);
      setSellers(prev => prev.filter(s => s.id !== selectedSeller.id));
      setShowDeleteModal(false);
      setSelectedSeller(null);
      addToast('Seller deleted successfully', 'success');
    } catch { addToast('Failed to delete seller', 'error'); }
    finally { setLoading(false); }
  };

  const handleCreateSeller = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.createSeller(createForm);
      const newSeller: Seller = {
        id: (response.data as any).id,
        businessName: createForm.fullName,
        contactPerson: createForm.fullName,
        email: createForm.email,
        phone: createForm.phone,
        isVerified: false,
        isActive: true,
        totalProducts: 0,
        totalSales: 0,
      };
      setSellers(prev => [...prev, newSeller]);
      setShowCreateModal(false);
      setCreateForm({ fullName: '', username: '', email: '', password: '', phone: '' });
      addToast('Seller created successfully', 'success');
    } catch (err: any) {
      addToast(err.response?.status === 409 ? 'Username or email already exists' : 'Failed to create seller', 'error');
    } finally { setLoading(false); }
  };

  const filtered = sellers.filter(s =>
    s.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total:    sellers.length,
    active:   sellers.filter(s => s.isActive).length,
    verified: sellers.filter(s => s.isVerified).length,
    pending:  sellers.filter(s => !s.isVerified).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="section-title">Seller Management</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Manage and monitor all registered sellers
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary btn-sm">
            <Plus className="w-3.5 h-3.5" /> Add Seller
          </button>
          <button onClick={fetchSellers} disabled={loading} className="btn btn-outline btn-sm">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ key, label, icon: Icon, color }) => (
          <div key={key} className="card p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${color}1a` }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats[key]}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search sellers…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9"
          />
        </div>
      </div>

      {/* Sellers list */}
      <div className="card overflow-hidden">
        {loading && filtered.length === 0 ? (
          <div className="p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton h-20 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Store className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>No sellers found</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {filtered.map((seller) => (
              <div key={seller.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--bg-secondary)] transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'var(--accent-50)' }}>
                    <Store className="w-5 h-5" style={{ color: 'var(--accent-600)' }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{seller.businessName}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{seller.email}</p>
                    {seller.phone && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{seller.phone}</p>}
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleToggleVerification(seller)}
                        disabled={loading}
                        className={`btn btn-sm ${seller.isVerified ? 'btn-outline' : 'btn-primary'}`}>
                        <CheckCircle className="w-3 h-3" />
                        {seller.isVerified ? 'Verified' : 'Verify'}
                      </button>
                      <button
                        onClick={() => handleToggleStatus(seller)}
                        disabled={loading}
                        className={`btn btn-sm ${seller.isActive ? 'btn-danger' : 'btn-outline'}`}>
                        {seller.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{seller.totalProducts} products</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>${seller.totalSales.toLocaleString()} sales</p>
                  </div>
                  <div className="flex gap-1">
                    <button className="btn btn-icon btn-outline" title="Edit" disabled={loading}>
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => { setSelectedSeller(seller); setShowDeleteModal(true); }}
                      className="btn btn-icon btn-danger" title="Delete" disabled={loading}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && selectedSeller && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>Delete Seller</h3>
              <button onClick={() => setShowDeleteModal(false)} className="btn btn-icon btn-ghost">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              Delete <strong>"{selectedSeller.businessName}"</strong>? This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDeleteModal(false)} disabled={loading} className="btn btn-outline">Cancel</button>
              <button onClick={handleDeleteSeller} disabled={loading} className="btn btn-danger">
                {loading ? <><span className="spinner" /> Deleting…</> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-5">
              <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>Create New Seller</h3>
              <button onClick={() => setShowCreateModal(false)} className="btn btn-icon btn-ghost">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { id: 'fullName',  label: 'Full Name', type: 'text',     placeholder: 'Enter full name' },
                { id: 'username',  label: 'Username',  type: 'text',     placeholder: 'Enter username' },
                { id: 'email',     label: 'Email',     type: 'email',    placeholder: 'Enter email' },
                { id: 'password',  label: 'Password',  type: 'password', placeholder: 'Enter password' },
                { id: 'phone',     label: 'Phone',     type: 'tel',      placeholder: '01XXXXXXXXX' },
              ].map(({ id, label, type, placeholder }) => (
                <div key={id} className="input-group">
                  <label htmlFor={id} className="label">{label}</label>
                  <input
                    id={id}
                    type={type}
                    value={createForm[id as keyof typeof createForm]}
                    onChange={(e) => setCreateForm({ ...createForm, [id]: e.target.value })}
                    className="input"
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => { setShowCreateModal(false); setCreateForm({ fullName: '', username: '', email: '', password: '', phone: '' }); }}
                disabled={loading} className="btn btn-outline">Cancel</button>
              <button onClick={handleCreateSeller}
                disabled={loading || !createForm.fullName || !createForm.username || !createForm.email || !createForm.password}
                className="btn btn-primary">
                {loading ? <><span className="spinner" /> Creating…</> : 'Create Seller'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
