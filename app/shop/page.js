// book-ecommerce-frontend/app/shop/page.js
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../context/CartContext'; // NEW: Import useCart hook
import toast from 'react-hot-toast'; // NEW: Import toast for notifications

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { addToCart } = useCart(); // NEW: Get addToCart from context

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProducts(data || []);
      } catch (err) {
        setError(err);
        console.error("Failed to fetch products:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // NEW: Handle Add to Cart click
  const handleAddToCart = (product, event) => {
    event.stopPropagation(); // Prevent Link navigation if button is inside a Link
    addToCart(product);
    toast.success(`${product.title} added to cart!`); // Show a success notification
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
        <h2 className="text-4xl font-heading text-anime-pink animate-pulse-light mb-4">
          Loading Awesome Comics...
        </h2>
        <p className="text-xl font-body text-gray-300">
          Just a moment, our heroes are on their way!
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
        <h2 className="text-4xl font-heading text-red-500 mb-4">
          Error! Pow!
        </h2>
        <p className="text-xl font-body text-gray-300">
          Something went wrong while fetching the comics. Please try again later.
        </p>
        <p className="text-md font-body text-red-400 mt-2">{error.message || 'Unknown error'}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
        <h2 className="text-4xl font-heading text-comic-yellow mb-4">
          Whoops! No Comics Found!
        </h2>
        <p className="text-xl font-body text-gray-300">
          Our shelves are currently empty. Check back soon for new adventures!
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 py-8">
      <h1 className="text-5xl md:text-6xl font-heading text-center text-comic-yellow mb-10
                      drop-shadow-lg animate-bounce-in">
        The Comic Store
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <div
            key={product._id}
            className="relative bg-gray-900 border-4 border-comic-yellow rounded-xl overflow-hidden
                       shadow-comic-pop-lg transform transition-transform duration-300 ease-in-out
                       hover:scale-[1.02] hover:shadow-2xl hover:shadow-anime-blue/50
                       flex flex-col animate-pop-up"
          >
            {/* Price Tag - Now custom styled */}
            <div className="absolute top-4 right-4 bg-comic-red text-white font-bold text-xl px-4 py-2
                            rounded-full shadow-md z-10 border-2 border-gray-900 transform rotate-6
                            origin-top-right animate-bounce-in">
              ${product.price ? product.price.toFixed(2) : 'N/A'}
            </div>

            {/* Product Link Area - click to view details */}
            <Link href={`/product/${product._id}`} className="block">
              {product.coverImage && (
                <div className="w-full h-64 overflow-hidden relative">
                  <Image
                    src={product.coverImage}
                    alt={product.title || 'Product Image'}
                    fill={true}
                    className="transition-transform duration-300 ease-in-out hover:scale-110 object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={true}
                  />
                </div>
              )}
            </Link>

            {/* Product Info Area */}
            <div className="p-6 flex flex-col flex-grow">
              <Link href={`/product/${product._id}`}>
                <h2 className="text-3xl font-heading text-white mb-2 leading-tight hover:text-anime-pink transition-colors duration-200">
                  {product.title}
                </h2>
              </Link>
              <p className="text-gray-300 font-body text-base mb-4 flex-grow">
                {product.description}
              </p>

              <div className="mt-auto">
                <button
                  onClick={(event) => handleAddToCart(product, event)} // NEW: Add onClick handler
                  className="w-full py-3 px-4 rounded-lg font-bold text-lg relative z-20 overflow-hidden
                             bg-gradient-to-r from-anime-blue to-anime-pink text-white
                             border-b-4 border-r-4 border-gray-900
                             transform transition-all duration-200 ease-in-out
                             active:translate-y-1 active:border-b-0 active:border-r-0
                             hover:from-anime-pink hover:to-anime-blue
                             hover:shadow-lg hover:shadow-anime-pink/50
                             focus:outline-none focus:ring-4 focus:ring-anime-blue focus:ring-opacity-75"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopPage;