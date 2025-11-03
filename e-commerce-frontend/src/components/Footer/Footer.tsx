import React from "react";
import Link from "next/link";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 py-6 mt-12">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
        {/* Left side: Brand / Copyright */}
        <p className="text-sm text-center md:text-left">
          © {new Date().getFullYear()} Bg Remover. All rights reserved.
        </p>

        {/* Right side: Links */}
        <div className="flex space-x-6 mt-4 md:mt-0">
          <Link
            href="/products"
            className="hover:text-purple-400 transition duration-200"
          >
            Products
          </Link>
          <Link
            href="/privacy"
            className="hover:text-purple-400 transition duration-200"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
