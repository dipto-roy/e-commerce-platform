import Link from "next/link";
import React from "react";

const Navbar: React.FC = () => {
  return (
    <nav className="flex items-center justify-between w-full max-w-6xl px-4 py-2 mx-auto">
      <div className="flex items-center p-4">
        <a
          href="/"
          className="text-xl font-bold text-white hover:text-neutral-300"
        >
          Almas
        </a>
      </div>
      <div className="hidden md:flex space-x-4 p-4">
        <a
          href="/about"
          className="text-white text-lg font-medium hover:border-b-2 hover:border-purple-500 hover:text-neutral-300"
        >
          About
        </a>
        <a
          href="/contact"
          className="text-white text-lg font-medium hover:border-b-2 hover:border-purple-500 hover:text-neutral-300"
        >
          Contact
        </a>
        <Link href="/seller">
          <span className="text-white text-lg font-medium hover:border-b-2 hover:border-purple-500 hover:text-neutral-300 cursor-pointer">
            Seller Dashboard
          </span>
        </Link>

        <Link href="/login">
            <button className="bg-purple-500 text-white text-lg font-medium px-6 py-2 rounded-md hover:bg-purple-600 transition duration-200">
            Log In
            </button>
        </Link>
        
      </div>
    </nav>
  );
};

export default Navbar;
