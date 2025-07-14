// book-ecommerce-frontend/app/components/Navbar.js
'use client'; // This is a Client Component

import Link from 'next/link';
import { useCart } from '../context/CartContext'; // Correct relative path for Navbar
import { useAuth } from '../context/AuthContext'; // Correct relative path for Navbar

const Navbar = () => {
  const { totalItems } = useCart();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  return (
    <nav className="bg-gray-950 text-white p-4 shadow-lg sticky top-0 z-50 border-b-4 border-anime-blue">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo/Brand Name */}
        <Link href="/shop" className="text-4xl font-heading text-comic-yellow hover:text-anime-pink transition-colors duration-200 drop-shadow-md">
          MangaVerse
        </Link>

        {/* Navigation Links / Cart Icon */}
        <div className="flex items-center space-x-6">
          {/* Home Link */}
          <Link href="/" className="text-xl font-body hover:text-anime-pink transition-colors duration-200">
            Home
          </Link>

          {/* Existing Shop link */}
          <Link href="/shop" className="text-xl font-body hover:text-anime-pink transition-colors duration-200">
            Shop
          </Link>

          {/* Conditional rendering for Auth links */}
          {isLoading ? (
            // Show a subtle loading indicator or nothing during initial load
            <div className="text-gray-500 text-lg">Loading...</div>
          ) : isAuthenticated ? (
            <>
              {/* Display username if available, otherwise just "User" */}
              <span className="text-xl font-body text-anime-blue">Hello, {user?.name ? user.name.split(' ')[0] : 'User'}!</span>
              <button
                onClick={logout}
                className="text-xl font-body hover:text-comic-red transition-colors duration-200 bg-transparent border-none cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/auth/login" className="text-xl font-body hover:text-anime-pink transition-colors duration-200">
              Login / Register
            </Link>
          )}

          {/* Cart Icon with Item Count */}
          <Link href="/cart" className="relative text-xl hover:text-anime-pink transition-colors duration-200">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-comic-red text-white text-xs font-bold
                                  rounded-full h-5 w-5 flex items-center justify-center
                                  border-2 border-gray-950 animate-pop-up">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;