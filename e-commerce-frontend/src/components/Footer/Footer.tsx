import React from "react";
import Link from "next/link";
import { Github, Twitter, Instagram, ShoppingBag } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-[var(--bg-primary)] border-t border-[var(--border)] mt-12">
      <div className="container-app py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

          {/* Brand */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-lg font-bold text-[var(--accent-600)]">
              <ShoppingBag className="h-5 w-5" />
              ShopNest
            </div>
            <p className="text-sm text-[var(--text-muted)]">Quality products, delivered.</p>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6">
            <Link
              href="/products"
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-600)] transition-colors"
            >
              Products
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-600)] transition-colors"
            >
              Privacy Policy
            </Link>
          </nav>

          {/* Social icons */}
          <div className="flex items-center gap-3">
            <a
              href="#"
              aria-label="GitHub"
              className="btn btn-ghost btn-icon text-[var(--text-muted)] hover:text-[var(--accent-600)]"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="Twitter"
              className="btn btn-ghost btn-icon text-[var(--text-muted)] hover:text-[var(--accent-600)]"
            >
              <Twitter className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="btn btn-ghost btn-icon text-[var(--text-muted)] hover:text-[var(--accent-600)]"
            >
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-4 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--text-muted)] text-center">
            © {new Date().getFullYear()} ShopNest. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
