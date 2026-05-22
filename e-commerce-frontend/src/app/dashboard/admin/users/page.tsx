'use client';
import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, Users, ShieldCheck, Store, UserCheck } from 'lucide-react';
import DataTable, { Column } from '@/components/admin/DataTable';
import Pagination from '@/components/admin/Pagination';
import ConfirmModal from '@/components/admin/ConfirmModal';
import UserForm from '@/components/admin/UserForm';
import { useToast } from '@/contexts/ToastContext';
import { adminAPI } from '@/lib/adminAPI';

interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt?: string;
  lastLogin?: string;
}

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}

const ROLE_BADGE: Record<string, string> = {
  ADMIN:  'badge badge-green',
  SELLER: 'badge badge-blue',
  USER:   'badge badge-gray',
};

const STAT_CARDS = [
  { key: 'total',    label: 'Total Users',    icon: Users,      color: 'var(--accent-500)' },
  { key: 'active',   label: 'Active Users',   icon: UserCheck,  color: '#10b981' },
  { key: 'admins',   label: 'Admins',         icon: ShieldCheck,color: '#f59e0b' },
  { key: 'sellers',  label: 'Sellers',        icon: Store,      color: '#3b82f6' },
] as const;

export default function UsersPage() {
  const [users, setUsers]               = useState<User[]>([]);
  const [loading, setLoading]           = useState(true);
  const [currentPage, setCurrentPage]   = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems]     = useState(0);
  const [totalPages, setTotalPages]     = useState(0);
  const [searchQuery, setSearchQuery]   = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser]   = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { addToast } = useToast();

  const fetchUsers = async (page = 1, limit = itemsPerPage, search = searchQuery) => {
    try {
      setLoading(true);
      const response = await adminAPI.getUsers(page, limit, search);
      const data = response.data as UsersResponse;
      setUsers(data.users || []);
      setTotalItems(data.total || 0);
      setTotalPages(data.totalPages || 0);
      setCurrentPage(page);
    } catch {
      addToast('Failed to load users', 'error');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(1, itemsPerPage, searchQuery); }, [itemsPerPage, searchQuery]);

  const handleToggleStatus = async (user: User) => {
    try {
      setActionLoading(true);
      await adminAPI.toggleUserStatus(user.id);
      addToast(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`, 'success');
      await fetchUsers(currentPage, itemsPerPage, searchQuery);
    } catch { addToast('Failed to update user status', 'error'); }
    finally { setActionLoading(false); }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      setActionLoading(true);
      await adminAPI.deleteUser(selectedUser.id);
      addToast('User deleted successfully', 'success');
      setShowDeleteModal(false);
      setSelectedUser(null);
      await fetchUsers(currentPage, itemsPerPage, searchQuery);
    } catch { addToast('Failed to delete user', 'error'); }
    finally { setActionLoading(false); }
  };

  const handleUserFormSubmit = async (userData: Omit<User, 'id'>) => {
    try {
      setActionLoading(true);
      if (editingUser) {
        await adminAPI.updateUser(editingUser.id, userData);
        addToast('User updated successfully', 'success');
      } else {
        await adminAPI.createUser(userData);
        addToast('User created successfully', 'success');
      }
      setShowUserForm(false);
      setEditingUser(null);
      await fetchUsers(currentPage, itemsPerPage, searchQuery);
    } catch (err) {
      addToast(editingUser ? 'Failed to update user' : 'Failed to create user', 'error');
      throw err;
    } finally { setActionLoading(false); }
  };

  const stats = {
    total:   totalItems,
    active:  users.filter(u => u.isActive).length,
    admins:  users.filter(u => u.role === 'ADMIN').length,
    sellers: users.filter(u => u.role === 'SELLER').length,
  };

  const columns: Column<User>[] = [
    { key: 'id', header: 'ID', sortable: true, width: 'w-14' },
    {
      key: 'username', header: 'User', sortable: true,
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ background: 'var(--accent-500)' }}>
            {u.username[0].toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{u.username}</p>
            {u.fullName && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.fullName}</p>}
          </div>
        </div>
      ),
    },
    { key: 'email', header: 'Email', sortable: true },
    {
      key: 'role', header: 'Role', sortable: true,
      render: (u) => <span className={ROLE_BADGE[u.role] || 'badge badge-gray'}>{u.role}</span>,
    },
    {
      key: 'isActive', header: 'Status', sortable: true,
      render: (u) => (
        <span className={u.isActive ? 'badge badge-green' : 'badge badge-red'}>
          {u.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'isVerified', header: 'Verified',
      render: (u) => <span className={u.isVerified ? 'badge badge-green' : 'badge badge-gray'}>{u.isVerified ? 'Yes' : 'No'}</span>,
    },
    {
      key: 'createdAt', header: 'Joined', sortable: true,
      render: (u) => u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—',
    },
  ];

  const renderActions = (user: User) => (
    <div className="flex items-center gap-2">
      <button onClick={() => { setEditingUser(user); setShowUserForm(true); }}
        disabled={actionLoading} className="btn btn-outline btn-sm">Edit</button>
      <button onClick={() => handleToggleStatus(user)}
        disabled={actionLoading}
        className={`btn btn-sm ${user.isActive ? 'btn-danger' : 'btn-outline'}`}>
        {user.isActive ? 'Deactivate' : 'Activate'}
      </button>
      <button onClick={() => { setSelectedUser(user); setShowDeleteModal(true); }}
        disabled={actionLoading} className="btn btn-danger btn-sm">Delete</button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="section-title">Users Management</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Manage accounts, roles, and permissions
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setEditingUser(null); setShowUserForm(true); }}
            className="btn btn-primary btn-sm">
            <Plus className="w-3.5 h-3.5" /> Add User
          </button>
          <button onClick={() => fetchUsers(currentPage, itemsPerPage, searchQuery)}
            disabled={loading} className="btn btn-outline btn-sm">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Stat cards */}
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

      {/* Table */}
      <div className="card overflow-hidden">
        <DataTable
          data={users}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search users by name or email…"
          onSearch={setSearchQuery}
          actions={renderActions}
          emptyMessage="No users found"
        />
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={(page) => fetchUsers(page, itemsPerPage, searchQuery)}
          onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1); }}
          loading={loading}
        />
      )}

      {/* Delete modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedUser(null); }}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message={`Delete user "${selectedUser?.username}"? This cannot be undone.`}
        confirmText="Delete"
        type="danger"
        loading={actionLoading}
      />

      {/* User form modal */}
      {showUserForm && (
        <UserForm
          user={editingUser}
          onSubmit={handleUserFormSubmit}
          onCancel={() => { setShowUserForm(false); setEditingUser(null); }}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
