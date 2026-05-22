import Link from 'next/link';
import React from 'react';
import { ShoppingBag } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="flex items-center justify-between w-full max-w-6xl px-4 py-3 mx-auto">
      <div className="flex items-center gap-2 p-2">
        <ShoppingBag className="w-5 h-5" style={{ color: 'var(--accent-600)' }} />
        <a href="/" className="text-xl font-bold hover:opacity-80 transition-opacity"
          style={{ color: 'var(--text-primary)' }}>
          ShopNest
        </a>
      </div>
      <div className="hidden md:flex items-center gap-4 p-2">
        <a href="/about"
          className="text-sm font-medium hover:underline transition-colors"
          style={{ color: 'var(--text-secondary)' }}>
          About
        </a>
        <a href="/contact"
          className="text-sm font-medium hover:underline transition-colors"
          style={{ color: 'var(--text-secondary)' }}>
          Contact
        </a>
        <Link href="/seller"
          className="text-sm font-medium hover:underline transition-colors"
          style={{ color: 'var(--text-secondary)' }}>
          Seller Dashboard
        </Link>
        <Link href="/login" className="btn btn-primary btn-sm">
          Log In
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
