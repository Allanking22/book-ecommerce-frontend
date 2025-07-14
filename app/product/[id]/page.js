// book-ecommerce-frontend/app/product/[id]/page.js
'use client'; // Ensure this is at the very top

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link'; // Make sure Link is imported
import { useCart } from '../../context/CartContext'; // Import useCart hook
import toast from 'react-hot-toast'; // Import toast for notifications
import React from 'react'; // Import React for React.use()

const ProductDetailPage = ({ params }) => {
  // Use React.use() to safely unwrap params as suggested by the error.
  // This tells React to wait for the params object to be fully resolved.
  const unwrappedParams = React.use(params);
  const { id } = unwrappedParams; // Access the id from the unwrapped object

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { addToCart } = useCart(); // Get addToCart from context

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Use the 'id' from the unwrappedParams here
        const response = await fetch(`http://localhost:5000/api/products/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err);
        console.error("Failed to fetch product details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    // Ensure 'id' is available before fetching
    if (id) {
      fetchProduct();
    }
  }, [id]); // Dependency array still uses 'id' from the unwrappedParams

  // Handle Add to Cart click for this specific product
  const handleAddToCart = () => {
    if (product) { // Ensure product data is loaded before adding
      addToCart(product);
      toast.success(`${product.title} added to cart!`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
        <h2 className="text-4xl font-heading text-anime-pink animate-pulse-light mb-4">
          Summoning Product Details...
        </h2>
        <p className="text-xl font-body text-gray-300">
          Our heroes are fetching your chosen item!
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
        <h2 className="text-4xl font-heading text-red-500 mb-4">
          Error! Blip!
        </h2>
        <p className="text-xl font-body text-gray-300">
          Could not fetch product details. Please try again later or check the URL.
        </p>
        <p className="text-md font-body text-red-400 mt-2">{error.message || 'Unknown error'}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
        <h2 className="text-4xl font-heading text-comic-yellow mb-4">
          Product Not Found!
        </h2>
        <p className="text-xl font-body text-gray-300">
          Looks like this adventure is out of stock or doesn't exist.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 py-8 text-white">
      {/* NEW: Back to Shop Button */}
      <div className="mb-8">
        <Link href="/shop" className="inline-flex items-center text-comic-blue hover:text-anime-pink transition-colors duration-200 text-lg font-bold">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to Shop
        </Link>
      </div>
      {/* END NEW: Back to Shop Button */}

      <h1 className="text-5xl md:text-6xl font-heading text-center text-comic-yellow mb-10
                      drop-shadow-lg animate-bounce-in">
        {product.title}
      </h1>

      <div className="flex flex-col md:flex-row gap-8 bg-gray-900 border-4 border-comic-yellow rounded-xl shadow-comic-pop-lg p-6 md:p-10 animate-fade-in">
        {/* Product Image Section */}
        <div className="md:w-1/2 relative h-96 md:h-auto min-h-[300px] rounded-lg overflow-hidden border-2 border-comic-blue">
          {product.coverImage && (
            <Image
              src={product.coverImage}
              alt={product.title || 'Product Cover'}
              fill={true}
              className="rounded-xl object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={true}
            />
          )}
        </div>

        {/* Product Details Section */}
        <div className="md:w-1/2 flex flex-col justify-between">
          <div>
            <p className="text-comic-blue text-lg font-bold mb-2 uppercase">
              By {product.author}
            </p>
            <p className="text-gray-300 font-body text-lg mb-4">{product.description}</p>

            <div className="text-lg font-body mb-4 grid grid-cols-2 gap-2">
              <p><strong>ISBN:</strong> {product.isbn}</p>
              <p><strong>Category:</strong> {product.category}</p>
              <p><strong>Sub-Category:</strong> {product.subCategory}</p>
              <p><strong>Language:</strong> {product.language}</p>
              <p><strong>Publisher:</strong> {product.publisher}</p>
              <p><strong>Publication Date:</strong> {new Date(product.publicationDate).toLocaleDateString()}</p>
              <p><strong>Pages:</strong> {product.pages}</p>
              <p><strong>Stock:</strong> {product.stock > 0 ? `${product.stock} available` : 'Out of Stock'}</p>
              {product.averageRating > 0 && (
                <p><strong>Rating:</strong> {product.averageRating.toFixed(1)} ({product.numberOfReviews} reviews)</p>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center">
            <p className="text-comic-red font-heading text-6xl mb-4 drop-shadow-lg">
              ${product.price ? product.price.toFixed(2) : 'N/A'}
            </p>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`w-full py-4 px-6 rounded-lg font-bold text-2xl relative z-20 overflow-hidden
                         bg-gradient-to-r from-anime-blue to-anime-pink text-white
                         border-b-4 border-r-4 border-gray-900
                         transform transition-all duration-200 ease-in-out
                         ${product.stock === 0 ? 'opacity-50 cursor-not-allowed' : 'active:translate-y-1 active:border-b-0 active:border-r-0 hover:from-anime-pink hover:to-anime-blue hover:shadow-lg hover:shadow-anime-pink/50'}
                         focus:outline-none focus:ring-4 focus:ring-anime-blue focus:ring-opacity-75`}
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;