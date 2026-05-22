'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { sellerAPI } from '@/utils/api';
import { ArrowLeft, Upload, Plus, X, Save, AlertCircle, CheckCircle } from 'lucide-react';

interface FormErrors { [key: string]: string; }

const CATEGORIES = [
  'Electronics', 'Clothing', 'Home & Garden', 'Sports & Outdoors',
  'Books', 'Toys & Games', 'Health & Beauty', 'Automotive', 'Food & Beverages', 'Other',
];

export default function NewProductPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuthGuard(['seller']);

  const [formData, setFormData] = useState({
    name: '', description: '', price: '', stockQuantity: '', category: '', isActive: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, file: 'Please select a valid image file' })); return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, file: 'File size must be less than 10MB' })); return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    setErrors(prev => ({ ...prev, file: '' }));
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    const input = document.getElementById('file-input') as HTMLInputElement;
    if (input) input.value = '';
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    else if (formData.name.length > 80) newErrors.name = 'Product name must not exceed 80 characters';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    else if (formData.description.length > 1200) newErrors.description = 'Description must not exceed 1200 characters';
    if (!formData.price.trim()) newErrors.price = 'Price is required';
    else {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price < 0.01) newErrors.price = 'Price must be at least $0.01';
    }
    if (formData.stockQuantity.trim()) {
      const stock = parseInt(formData.stockQuantity);
      if (isNaN(stock) || stock < 0) newErrors.stockQuantity = 'Stock must be a non-negative number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!isAuthenticated) {
      setErrors({ submit: 'Authentication required. Please log in again.' });
      router.push('/login');
      return;
    }
    setIsSubmitting(true);
    setErrors({});
    try {
      const fd = new FormData();
      fd.append('name', formData.name.trim());
      fd.append('description', formData.description.trim());
      fd.append('price', formData.price);
      fd.append('stockQuantity', formData.stockQuantity || '0');
      fd.append('category', formData.category);
      fd.append('isActive', formData.isActive.toString());
      if (selectedFile) fd.append('file', selectedFile);
      await sellerAPI.createProductWithImage(fd);
      setSubmitSuccess(true);
      setTimeout(() => router.push('/seller/products'), 2000);
    } catch (error: any) {
      if (error.response?.status === 401) { setErrors({ submit: 'Authentication required.' }); router.push('/login'); }
      else if (error.response?.status === 403) setErrors({ submit: 'Access denied. Ensure your seller account is verified.' });
      else setErrors({ submit: error.response?.data?.message || error.message || 'Failed to create product.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper flex items-center justify-center">
        <span className="spinner" style={{ width: '3rem', height: '3rem', borderWidth: '3px' }} />
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="page-wrapper flex items-center justify-center p-6">
        <div className="card p-10 max-w-sm text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--accent-50)' }}>
            <CheckCircle className="w-8 h-8" style={{ color: 'var(--accent-600)' }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Product Created!
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Redirecting to your products…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container-app">
          <button onClick={() => router.back()}
            className="flex items-center gap-2 text-sm mb-3 transition-colors hover:opacity-80"
            style={{ color: 'var(--accent-600)' }}>
            <ArrowLeft className="w-4 h-4" /> Back to Products
          </button>
          <h1 className="section-title">Add New Product</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Create a new product listing for your store
          </p>
        </div>
      </div>

      <div className="container-app py-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="card">
          <div className="p-6 space-y-6">
            {errors.submit && (
              <div className="alert alert-error">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{errors.submit}</p>
              </div>
            )}

            {/* Name */}
            <div className="input-group">
              <label htmlFor="name" className="label">Product Name *</label>
              <input
                type="text" id="name" name="name" value={formData.name}
                onChange={handleInputChange} maxLength={80} placeholder="Enter product name"
                className={`input ${errors.name ? 'border-red-400' : ''}`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{formData.name.length}/80</p>
            </div>

            {/* Description */}
            <div className="input-group">
              <label htmlFor="description" className="label">Description *</label>
              <textarea
                id="description" name="description" value={formData.description}
                onChange={handleInputChange} rows={4} maxLength={1200}
                placeholder="Describe your product in detail"
                className={`input resize-none ${errors.description ? 'border-red-400' : ''}`}
              />
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{formData.description.length}/1200</p>
            </div>

            {/* Price & Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="input-group">
                <label htmlFor="price" className="label">Price ($) *</label>
                <input
                  type="number" id="price" name="price" value={formData.price}
                  onChange={handleInputChange} step="0.01" min="0.01" placeholder="0.00"
                  className={`input ${errors.price ? 'border-red-400' : ''}`}
                />
                {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
              </div>
              <div className="input-group">
                <label htmlFor="stockQuantity" className="label">Stock Quantity</label>
                <input
                  type="number" id="stockQuantity" name="stockQuantity" value={formData.stockQuantity}
                  onChange={handleInputChange} min="0" placeholder="0"
                  className={`input ${errors.stockQuantity ? 'border-red-400' : ''}`}
                />
                {errors.stockQuantity && <p className="text-xs text-red-500 mt-1">{errors.stockQuantity}</p>}
              </div>
            </div>

            {/* Category */}
            <div className="input-group">
              <label htmlFor="category" className="label">Category</label>
              <select id="category" name="category" value={formData.category}
                onChange={handleInputChange} className="input">
                <option value="">Select a category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Image upload */}
            <div className="input-group">
              <label className="label">Product Image</label>
              {!imagePreview ? (
                <div className="border-2 border-dashed rounded-xl p-8 text-center transition-colors hover:border-[var(--accent-400)]"
                  style={{ borderColor: 'var(--border)' }}>
                  <Upload className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                  <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>PNG, JPG, GIF up to 10MB</p>
                  <input type="file" id="file-input" accept="image/*" onChange={handleFileChange} className="hidden" />
                  <label htmlFor="file-input" className="btn btn-outline btn-sm mt-4 inline-flex cursor-pointer">
                    <Plus className="w-3.5 h-3.5" /> Choose File
                  </label>
                </div>
              ) : (
                <div className="relative inline-block">
                  <img src={imagePreview} alt="Preview"
                    className="w-48 h-48 object-cover rounded-xl border border-[var(--border)]" />
                  <button type="button" onClick={removeImage}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white bg-red-500 hover:bg-red-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              {errors.file && <p className="text-xs text-red-500 mt-1">{errors.file}</p>}
            </div>

            {/* Active toggle */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox" id="isActive" name="isActive" checked={formData.isActive}
                onChange={handleInputChange}
                className="w-4 h-4 rounded"
                style={{ accentColor: 'var(--accent-500)' }}
              />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Make this product active immediately
              </span>
            </label>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[var(--border)] flex justify-end gap-3"
            style={{ background: 'var(--bg-secondary)' }}>
            <button type="button" onClick={() => router.back()} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting
                ? <><span className="spinner" /> Creating…</>
                : <><Save className="w-4 h-4" /> Create Product</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
