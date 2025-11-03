'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sidebarLinks = [
  {
    href: '/dashboard/admin',
    label: 'Dashboard',
    icon: '📊'
  },
  {
    href: '/dashboard/admin/users',
    label: 'Users',
    icon: '👥'
  },
  {
    href: '/dashboard/admin/sellers',
    label: 'Sellers',
    icon: '🏪'
  },
  {
    href: '/dashboard/admin/products',
    label: 'Products',
    icon: '📦'
  },
  {
    href: '/dashboard/admin/orders',
    label: 'Orders',
    icon: '📋'
  },
  {
    href: '/dashboard/admin/emails',
    label: 'Email System',
    icon: '📧'
  },
  {
    href: '/dashboard/admin/notifications',
    label: 'Notifications',
    icon: '🔔'
  }
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-gray-900 text-white z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
        w-64
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">Admin Panel</h2>
          <button
            onClick={onToggle}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="mt-6">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`
                flex items-center px-4 py-3 text-sm font-medium transition-colors duration-200
                hover:bg-gray-700 hover:text-white
                ${pathname === link.href 
                  ? 'bg-blue-600 text-white border-r-4 border-blue-400' 
                  : 'text-gray-300'
                }
              `}
              onClick={() => {
                // Close sidebar on mobile when navigating
                if (window.innerWidth < 1024) {
                  onToggle();
                }
              }}
            >
              <span className="mr-3 text-lg">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
          <div className="text-xs text-gray-400 text-center">
            Admin Dashboard v1.0
          </div>
        </div>
      </div>
    </>
  );
}
