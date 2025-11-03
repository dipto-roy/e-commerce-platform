'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Store, Users } from 'lucide-react';
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

export default function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    phone: ''
  });
  const { addToast } = useToast();

    const fetchSellers = async () => {
    try {
      setLoading(true);
      
      // Fetch real sellers from API
      const response = await adminAPI.getAllSellers();
      const sellersData = response.data as any[];
      
      // Transform the data to match our interface
      const transformedSellers: Seller[] = sellersData.map((seller: any) => ({
        id: seller.id,
        businessName: seller.fullName || seller.username,
        contactPerson: seller.fullName || seller.username,
        email: seller.email,
        phone: seller.phone || '',
        businessAddress: '', // Not available in current schema
        businessType: '', // Not available in current schema  
        isVerified: seller.isVerified,
        isActive: seller.isActive,
        taxNumber: '', // Not available in current schema
        bankDetails: '', // Not available in current schema
        documentsUploaded: false, // Not available in current schema
        joinedDate: seller.createdAt,
        totalProducts: 0, // Would need to be calculated
        totalSales: 0 // Would need to be calculated
      }));
      
      setSellers(transformedSellers);
    } catch (error) {
      console.error('Failed to fetch sellers:', error);
      addToast('Failed to load sellers from database. Using demo data.', 'error');
      
      // Fallback to empty array
      setSellers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleToggleStatus = async (seller: Seller) => {
    try {
      setLoading(true);
      
      // Use the new toggleSellerStatus method which properly handles the API
      await adminAPI.toggleSellerStatus(seller.id);
      
      // Update local state
      setSellers(sellers.map(s => 
        s.id === seller.id ? { ...s, isActive: !s.isActive } : s
      ));
      
      addToast(`Seller ${seller.isActive ? 'deactivated' : 'activated'} successfully`, 'success');
    } catch (error) {
      console.error('Failed to toggle seller status:', error);
      addToast('Failed to update seller status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVerification = async (seller: Seller) => {
    try {
      setLoading(true);
      await adminAPI.verifySeller(seller.id);
      
      // Update local state
      setSellers(sellers.map(s => 
        s.id === seller.id ? { ...s, isVerified: !s.isVerified } : s
      ));
      
      addToast(`Seller ${seller.isVerified ? 'unverified' : 'verified'} successfully`, 'success');
    } catch (error: any) {
      console.error('Failed to toggle verification:', error);
      
      if (error.response?.status === 404) {
        addToast('Seller not found or not a valid seller account', 'error');
      } else if (error.response?.status === 409) {
        addToast('Seller is already verified', 'warning');
      } else if (error.response?.status === 401) {
        addToast('You need to be logged in as an admin to perform this action', 'error');
      } else {
        addToast('Failed to update verification status', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSeller = async () => {
    if (!selectedSeller) return;
    
    try {
      setLoading(true);
      await adminAPI.deleteSeller(selectedSeller.id);
      
      setSellers(sellers.filter(s => s.id !== selectedSeller.id));
      setShowDeleteModal(false);
      setSelectedSeller(null);
      
      addToast('Seller deleted successfully', 'success');
    } catch (error) {
      console.error('Failed to delete seller:', error);
      addToast('Failed to delete seller', 'error');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (seller: Seller) => {
    setSelectedSeller(seller);
    setShowDeleteModal(true);
  };

  const handleCreateSeller = async () => {
    try {
      setLoading(true);
      
      // Create new seller using the adminAPI
      const response = await adminAPI.createSeller(createForm);
      
      // Add to local state
      const newSeller: Seller = {
        id: (response.data as any).id,
        businessName: createForm.fullName,
        contactPerson: createForm.fullName,
        email: createForm.email,
        phone: createForm.phone,
        isVerified: false,
        isActive: true,
        totalProducts: 0,
        totalSales: 0
      };
      
      setSellers([...sellers, newSeller]);
      setShowCreateModal(false);
      setCreateForm({ fullName: '', username: '', email: '', password: '', phone: '' });
      
      addToast('Seller created successfully', 'success');
    } catch (error: any) {
      console.error('Failed to create seller:', error);
      
      if (error.response?.status === 409) {
        addToast('Username or email already exists', 'error');
      } else {
        addToast('Failed to create seller', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Seller Management</h1>
        <p className="mt-2 text-gray-600">Manage and monitor all registered sellers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sellers</p>
              <p className="text-2xl font-bold text-gray-900">{sellers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-green-500 rounded-full"></div>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Sellers</p>
              <p className="text-2xl font-bold text-green-600">{sellers.filter(s => s.isActive).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-blue-500 rounded-full"></div>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Verified Sellers</p>
              <p className="text-2xl font-bold text-blue-600">{sellers.filter(s => s.isVerified).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-yellow-500 rounded-full"></div>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Verification</p>
              <p className="text-2xl font-bold text-yellow-600">{sellers.filter(s => !s.isVerified).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search sellers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Seller
          </button>
        </div>
      </div>

      {/* Sellers List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="space-y-4">
            {sellers
              .filter(seller => 
                seller.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                seller.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map(seller => (
              <div key={seller.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Store className="h-10 w-10 text-blue-600 bg-blue-100 rounded-full p-2" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{seller.businessName}</h3>
                      <p className="text-gray-600">{seller.contactPerson}</p>
                      <p className="text-gray-600">{seller.email}</p>
                      <div className="mt-2 flex space-x-2">
                        <button
                          onClick={() => handleToggleVerification(seller)}
                          disabled={loading}
                          className={`px-2 py-1 text-xs rounded-full transition-colors ${
                            seller.isVerified 
                              ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
                              : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {seller.isVerified ? 'Verified' : 'Verify'}
                        </button>
                        <button
                          onClick={() => handleToggleStatus(seller)}
                          disabled={loading}
                          className={`px-2 py-1 text-xs rounded-full transition-colors ${
                            seller.isActive 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {seller.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{seller.totalProducts} products</p>
                    <p className="text-sm text-gray-600">${seller.totalSales.toLocaleString()}</p>
                    <div className="mt-2 flex space-x-2">
                      <button 
                        className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                        title="Edit Seller"
                        disabled={loading}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => confirmDelete(seller)}
                        className="p-1 text-red-600 hover:text-red-800 transition-colors"
                        title="Delete Seller"
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedSeller && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Seller</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{selectedSeller.businessName}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSeller}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Seller Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Seller</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={createForm.fullName}
                  onChange={(e) => setCreateForm({...createForm, fullName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={createForm.username}
                  onChange={(e) => setCreateForm({...createForm, username: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({...createForm, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateForm({ fullName: '', username: '', email: '', password: '', phone: '' });
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSeller}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                disabled={loading || !createForm.fullName || !createForm.username || !createForm.email || !createForm.password}
              >
                {loading ? 'Creating...' : 'Create Seller'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
