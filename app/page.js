// app/page.js
'use client'; // This directive is needed because we're using useState and useRouter

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [logoutMessage, setLogoutMessage] = useState(''); // New state for logout message
  const router = useRouter();

  // Check login status on component mount
  useEffect(() => {
    const userToken = localStorage.getItem('userToken');
    const userInfo = localStorage.getItem('userInfo');
    if (userToken && userInfo) {
      setIsLoggedIn(true);
      try {
        const user = JSON.parse(userInfo);
        setUserName(user.name.split(' ')[0] || 'User'); // Just display first name
      } catch (e) {
        console.error("Failed to parse userInfo from localStorage", e);
        setIsLoggedIn(false); // Fallback if info is corrupted
      }
    } else {
      setIsLoggedIn(false);
      setUserName('');
    }

    // Check if there's a logout message from a redirect (e.g., after successful logout)
    const storedLogoutMessage = localStorage.getItem('logoutMessage');
    if (storedLogoutMessage) {
      setLogoutMessage(storedLogoutMessage);
      localStorage.removeItem('logoutMessage'); // Clear it after displaying
      setTimeout(() => setLogoutMessage(''), 3000); // Hide message after 3 seconds
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userInfo');
    setIsLoggedIn(false);
    setUserName('');
    localStorage.setItem('logoutMessage', 'Logged out successfully! See you next time, hero!'); // Set message for next page load
    router.push('/'); // Redirect to home/login page
  };

  const handleWhatsAppSupport = () => {
    const phoneNumber = '254112227763'; // <-- IMPORTANT: Replace with your actual WhatsApp support number
    const message = encodeURIComponent("Hi, I need assistance with MangaVerse. Can you help me?");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Logout Success Message */}
      {logoutMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-xl text-center z-50 anime-message animate-fade-in-down">
          {logoutMessage}
        </div>
      )}

      {/* CORRECTED: Floating WhatsApp Support Button with Text */}
      <button
        onClick={handleWhatsAppSupport}
        className="fixed bottom-6 right-6 bg-green-500 text-white font-bold py-3 px-5 rounded-full shadow-xl hover:bg-green-600 transition-all duration-300 ease-in-out transform hover:scale-105 z-50 animate-bounce-whatsapp
                   flex items-center gap-2" 
        aria-label="Chat with us on WhatsApp"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.52 3.39 1.41 4.79l-1.42 5.23 5.37-1.4c1.32.73 2.82 1.13 4.55 1.13 5.46 0 9.91-4.45 9.91-9.91s-4.45-9.91-9.91-9.91zm.01 1.76c4.59 0 8.33 3.74 8.33 8.33 0 4.59-3.74 8.33-8.33 8.33-1.63 0-3.15-.47-4.43-1.28l-.31-.19-3.21.84.85-3.13-.2-.32c-.88-1.42-1.35-3.05-1.35-4.75 0-4.59 3.74-8.33 8.33-8.33zm-2.48 4.09c-.11-.26-.24-.28-.35-.29-.08-.01-.19-.01-.27.01s-.21-.07-.32.06c-.11.13-.41.51-.5.61-.09.09-.18.11-.34.05s-.69-.26-.88-.41c-.2-.15-.22-.12-.3-.08-.09.05-.66.83-.82.99-.15.15-.27.18-.49.07-.22-.11-.93-.34-1.29-.63-.35-.29-.64-.24-.87-.24-.23 0-.49-.06-.75.02-.26.08-.32.22-.32.53-.02.48.33.91.38.97.05.06.33.56.77.94s.95.73 1.75.98c.8.25 1.48.2 2.01.12.53-.08 1.11-.45 1.28-.67s.2-.42.14-.52c-.06-.1-.18-.16-.38-.27z"/>
        </svg>
        <span>Chat with us on WhatsApp</span> {/* The text is now here! */}
      </button>

      {/* --- Hero Section (Dynamic Anime Feel) --- */}
      <main className="flex-grow flex items-center justify-center py-20 px-4 md:px-8 bg-gradient-to-br from-purple-50 to-pink-50 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <div className="text-center md:text-left animate-fade-in-up">
            <h1 className="text-6xl md:text-7xl font-extrabold text-gray-900 leading-tight mb-8 drop-shadow-lg">
              Unleash Your Inner <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Otaku</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-10 max-w-md mx-auto md:mx-0 leading-relaxed">
              Dive into the vibrant world of your favorite **anime and manga comics**. Discover new series, classic tales, and exclusive editions!
            </p>
            <Link href="/shop" className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-5 rounded-full text-xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-400 ease-out animate-bounce-slow">
              Start Your Adventure!
            </Link>
          </div>

          {/* Visual Element Placeholder (More dynamic) */}
          <div className="relative w-full h-96 bg-gradient-to-br from-purple-300 to-pink-300 rounded-3xl shadow-3xl flex items-center justify-center overflow-hidden transform rotate-3 scale-105 animate-float">
            <div className="absolute inset-0 bg-gradient-to-tr from-yellow-100 via-purple-100 to-red-100 opacity-30 animate-pulse-light"></div>
            <p className="text-white text-3xl font-bold text-center p-6 z-10 drop-shadow-lg">
              Your Next Epic Saga <br /> Awaits!
            </p>
            {/* This space can later hold dynamic anime art, character illustrations, or a carousel of popular comic covers */}
          </div>
        </div>
      </main>

      {/* --- Footer Section (Sleek Dark) --- */}
      <footer className="bg-gray-900 text-gray-300 py-8 px-6 md:px-12 text-center border-t-2 border-purple-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center text-md">
          <p>&copy; {new Date().getFullYear()} MangaVerse. All rights reserved. For fans, by fans.</p>
          <div className="mt-5 md:mt-0 space-x-6">
            <Link href="/privacy" className="hover:text-purple-400 transition-colors duration-200">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-pink-400 transition-colors duration-200">Terms of Service</Link>
            <Link href="/faq" className="hover:text-purple-400 transition-colors duration-200">FAQ</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}