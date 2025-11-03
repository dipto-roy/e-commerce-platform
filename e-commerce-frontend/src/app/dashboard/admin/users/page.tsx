'use client';
import React, { useState, useEffect } from 'react';
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

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  const { addToast } = useToast();

  // Fetch users data
  const fetchUsers = async (page = 1, limit = itemsPerPage, search = searchQuery) => {
    try {
      setLoading(true);
      // TODO: Call GET /api/admin/users from NestJS backend
      const response = await adminAPI.getUsers(page, limit, search);
      const data = response.data as UsersResponse;
      
      setUsers(data.users || []);
      setTotalItems(data.total || 0);
      setTotalPages(data.totalPages || 0);
      setCurrentPage(page);
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      addToast('Failed to load users', 'error');
      
      // Fallback to dummy data for demo purposes
      const dummyUsers: User[] = [
        {
          id: 1,
          username: 'john_doe',
          email: 'john@example.com',
          fullName: 'John Doe',
          role: 'USER',
          isActive: true,
          isVerified: true,
          createdAt: '2024-01-15T10:30:00Z',
          lastLogin: '2024-01-20T14:20:00Z'
        },
        {
          id: 2,
          username: 'jane_smith',
          email: 'jane@example.com',
          fullName: 'Jane Smith',
          role: 'USER',
          isActive: false,
          isVerified: true,
          createdAt: '2024-01-10T09:15:00Z',
          lastLogin: '2024-01-18T16:45:00Z'
        }
      ];
      
      setUsers(dummyUsers);
      setTotalItems(dummyUsers.length);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1, itemsPerPage, searchQuery);
  }, [itemsPerPage, searchQuery]);

  // Handle user actions
  const handleToggleStatus = async (user: User) => {
    try {
      setActionLoading(true);
      // TODO: Call PUT /api/admin/users/{id}/toggle-status from NestJS backend
      await adminAPI.toggleUserStatus(user.id);
      
      addToast(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`, 'success');
      await fetchUsers(currentPage, itemsPerPage, searchQuery);
    } catch (error: any) {
      console.error('Failed to toggle user status:', error);
      addToast('Failed to update user status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      setActionLoading(true);
      // TODO: Call DELETE /api/admin/users/{id} from NestJS backend
      await adminAPI.deleteUser(selectedUser.id);
      
      addToast('User deleted successfully', 'success');
      setShowDeleteModal(false);
      setSelectedUser(null);
      await fetchUsers(currentPage, itemsPerPage, searchQuery);
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      addToast('Failed to delete user', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateUser = async (userData: Omit<User, 'id'>) => {
    try {
      setActionLoading(true);
      // TODO: Call POST /api/admin/users from NestJS backend
      await adminAPI.createUser(userData);
      
      addToast('User created successfully', 'success');
      setShowUserForm(false);
      await fetchUsers(currentPage, itemsPerPage, searchQuery);
    } catch (error: any) {
      console.error('Failed to create user:', error);
      addToast('Failed to create user', 'error');
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateUser = async (userData: Omit<User, 'id'>) => {
    if (!editingUser) return;
    
    try {
      setActionLoading(true);
      // TODO: Call PUT /api/admin/users/{id} from NestJS backend
      await adminAPI.updateUser(editingUser.id, userData);
      
      addToast('User updated successfully', 'success');
      setShowUserForm(false);
      setEditingUser(null);
      await fetchUsers(currentPage, itemsPerPage, searchQuery);
    } catch (error: any) {
      console.error('Failed to update user:', error);
      addToast('Failed to update user', 'error');
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const handleUserFormSubmit = async (userData: Omit<User, 'id'>) => {
    if (editingUser) {
      await handleUpdateUser(userData);
    } else {
      await handleCreateUser(userData);
    }
  };

  const openCreateForm = () => {
    setEditingUser(null);
    setShowUserForm(true);
  };

  const openEditForm = (user: User) => {
    setEditingUser(user);
    setShowUserForm(true);
  };

  const closeUserForm = () => {
    setShowUserForm(false);
    setEditingUser(null);
  };

  // Table columns configuration
  const columns: Column<User>[] = [
    {
      key: 'id',
      header: 'ID',
      sortable: true,
      width: 'w-16'
    },
    {
      key: 'username',
      header: 'Username',
      sortable: true,
      render: (user) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium mr-3">
            {user.username[0].toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-gray-900">{user.username}</div>
            <div className="text-gray-500 text-sm">{user.fullName}</div>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (user) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
          user.role === 'SELLER' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {user.role}
        </span>
      )
    },
    {
      key: 'isActive',
      header: 'Status',
      sortable: true,
      render: (user) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {user.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'isVerified',
      header: 'Verified',
      render: (user) => user.isVerified ? '✅' : '❌'
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (user) => user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'
    }
  ];

  // Actions for each row
  const renderActions = (user: User) => (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => openEditForm(user)}
        disabled={actionLoading}
        className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 disabled:opacity-50"
      >
        Edit
      </button>
      
      <button
        onClick={() => handleToggleStatus(user)}
        disabled={actionLoading}
        className={`px-3 py-1 text-xs font-medium rounded-md ${
          user.isActive 
            ? 'bg-red-100 text-red-700 hover:bg-red-200' 
            : 'bg-green-100 text-green-700 hover:bg-green-200'
        } disabled:opacity-50`}
      >
        {user.isActive ? 'Deactivate' : 'Activate'}
      </button>
      
      <button
        onClick={() => {
          setSelectedUser(user);
          setShowDeleteModal(true);
        }}
        disabled={actionLoading}
        className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={openCreateForm}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New User
          </button>
          
          <button
            onClick={() => fetchUsers(currentPage, itemsPerPage, searchQuery)}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                  <dd className="text-lg font-medium text-gray-900">{totalItems}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {users.filter(u => u.isActive).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">🛡️</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Admins</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {users.filter(u => u.role === 'ADMIN').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">🏪</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Sellers</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {users.filter(u => u.role === 'SELLER').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <DataTable
        data={users}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search users by name or email..."
        onSearch={setSearchQuery}
        actions={renderActions}
        emptyMessage="No users found"
      />

      {/* Pagination */}
      {totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={(page) => fetchUsers(page, itemsPerPage, searchQuery)}
          onItemsPerPageChange={(newItemsPerPage) => {
            setItemsPerPage(newItemsPerPage);
            setCurrentPage(1);
          }}
          loading={loading}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete user "${selectedUser?.username}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
        loading={actionLoading}
      />

      {/* User Form Modal */}
      {showUserForm && (
        <UserForm
          user={editingUser}
          onSubmit={handleUserFormSubmit}
          onCancel={closeUserForm}
          loading={actionLoading}
        />
      )}
    </div>
  );
}