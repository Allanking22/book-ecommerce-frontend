// book-ecommerce-frontend/app/layout.js
import { Inter } from 'next/font/google'; // Recommended way to import Google Fonts
import './globals.css'; // IMPORTANT: This imports your global Tailwind CSS
import { Toaster } from 'react-hot-toast'; // For toast notifications

// Import your custom contexts and components
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar'; // Import the Navbar component here

// Configure your fonts using next/font
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

import localFont from 'next/font/local';

const bangers = localFont({
  src: '../public/fonts/Bangers-Regular.ttf',
  variable: '--font-bangers',
  display: 'swap',
});

const chakraPetch = localFont({
  src: [
    { path: '../public/fonts/ChakraPetch-Light.ttf', weight: '300' },
    { path: '../public/fonts/ChakraPetch-Regular.ttf', weight: '400' },
    { path: '../public/fonts/ChakraPetch-Medium.ttf', weight: '500' },
    { path: '../public/fonts/ChakraPetch-SemiBold.ttf', weight: '600' },
    { path: '../public/fonts/ChakraPetch-Bold.ttf', weight: '700' },
  ],
  variable: '--font-chakra-petch',
  display: 'swap',
});

export const metadata = {
  title: 'MangaVerse - Unleash Your Inner Otaku!',
  description: 'Dive into the vibrant world of your favorite anime and manga comics. Discover new series, classic tales, and exclusive editions!',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${bangers.variable} ${chakraPetch.variable} ${inter.variable}`}>
      <body>
        <Toaster position="top-center" reverseOrder={false} />

        <AuthProvider>
          <CartProvider>
            <Navbar /> {/* This is the ONLY place Navbar should be rendered globally */}
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}