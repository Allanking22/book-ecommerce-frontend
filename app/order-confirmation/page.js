// book-ecommerce-frontend/app/order-confirmation/page.js
'use client';

import { useEffect } from 'react'; // Import useEffect
import Link from 'next/link';
import { useCart } from '../context/CartContext'; // Temporarily import useCart for debugging

const OrderConfirmationPage = () => {
  const { totalItems, cartItems } = useCart(); // Get cart state for debugging

  useEffect(() => {
    console.log('DEBUG: OrderConfirmationPage mounted.');
    console.log('DEBUG: OrderConfirmationPage - totalItems:', totalItems);
    console.log('DEBUG: OrderConfirmationPage - cartItems:', cartItems);
  }, [totalItems, cartItems]); // Run when totalItems or cartItems change

  return (
    <div className="container mx-auto p-4 py-10 min-h-screen text-white flex flex-col items-center justify-center">
      <h1 className="text-5xl md:text-6xl font-heading text-center text-comic-yellow mb-6
                     drop-shadow-lg animate-bounce-in">
        Order Confirmed!
      </h1>
      <p className="text-2xl font-body text-gray-300 mb-8 text-center max-w-xl">
        Thank you for your purchase! Your order has been placed successfully.
        You will receive an email confirmation shortly.
      </p>

      <div className="flex space-x-4">
        <Link href="/shop" className="bg-anime-blue text-white font-bold py-3 px-6 rounded-lg
                                     hover:bg-anime-pink transition-all duration-300 ease-in-out
                                     transform active:scale-95 shadow-lg border-b-4 border-gray-900">
          Continue Shopping
        </Link>
        <Link href="/user/orders" className="bg-comic-red text-white font-bold py-3 px-6 rounded-lg
                                        hover:bg-red-700 transition-all duration-300 ease-in-out
                                        transform active:scale-95 shadow-lg border-b-4 border-gray-900">
          View My Orders
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;