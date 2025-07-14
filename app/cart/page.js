// book-ecommerce-frontend/app/cart/page.js
'use client';

import { useCart } from '../context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const CartPage = () => {
  const {
    cartItems,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    totalItems,
    totalPrice,
  } = useCart();

  const router = useRouter();

  const handleRemove = (productId, title) => {
    removeFromCart(productId);
    toast.error(`${title} removed from cart.`);
  };

  const handleClearCart = () => {
    clearCart();
    toast.success("Your cart has been cleared!");
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty. Please add items before checking out.");
      return;
    }
    router.push('/checkout');
  };

  return (
    <div className="container mx-auto p-4 py-8 text-white">
      <h1 className="text-5xl md:text-6xl font-heading text-center text-comic-yellow mb-10
                     drop-shadow-lg animate-bounce-in">
        Your Shopping Cart
      </h1>

      {cartItems.length === 0 ? (
        <div className="text-center bg-gray-900 border-4 border-anime-pink rounded-xl p-8 shadow-comic-pop-lg animate-fade-in">
          <p className="text-3xl font-body text-gray-300 mb-4">
            Your cart is currently empty.
          </p>
          <Link href="/shop" className="inline-flex items-center bg-anime-blue text-white font-bold py-3 px-6 rounded-lg
                                         hover:bg-anime-pink transition-all duration-300 ease-in-out
                                         transform active:scale-95 shadow-lg border-b-4 border-gray-900">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Start Shopping!
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items List */}
          <div className="lg:w-2/3 bg-gray-900 border-4 border-comic-yellow rounded-xl p-6 shadow-comic-pop-lg">
            {cartItems.map((item) => (
              <div
                key={item._id}
                className="flex items-center bg-gray-800 border-2 border-anime-blue rounded-lg p-4 mb-4
                               shadow-md animate-fade-in-up"
              >
                {/* Product Image */}
                <div className="w-24 h-24 relative flex-shrink-0 mr-4 rounded-md overflow-hidden border border-gray-700">
                  {item.coverImage && (
                    <Image
                      src={item.coverImage}
                      alt={item.title || 'Product Image'}
                      fill={true}
                      className="object-cover"
                      sizes="96px"
                    />
                  )}
                </div>

                {/* Product Info & Controls */}
                <div className="flex-grow">
                  <Link href={`/product/${item._id}`} className="text-2xl font-heading text-comic-yellow hover:text-anime-pink transition-colors duration-200">
                    {item.title}
                  </Link>
                  <p className="text-gray-400 font-body text-md">{item.author}</p>
                  <p className="text-xl font-bold text-anime-pink my-1">${item.price.toFixed(2)}</p>

                  {/* Quantity Controls */}
                  <div className="flex items-center mt-2">
                    <button
                      onClick={() => decreaseQuantity(item._id)}
                      className="bg-comic-red text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg
                                 hover:bg-red-700 transition-colors duration-200 active:scale-90"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="mx-3 text-xl font-bold">{item.quantity}</span>
                    <button
                      onClick={() => increaseQuantity(item._id)}
                      className="bg-anime-blue text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg
                                 hover:bg-teal-600 transition-colors duration-200 active:scale-90"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                    <button
                      onClick={() => handleRemove(item._id, item.title)}
                      className="ml-auto text-gray-400 hover:text-comic-red transition-colors duration-200
                                 text-sm font-body flex items-center"
                      aria-label="Remove item"
                    >
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div className="mt-6 text-right">
              <button
                onClick={handleClearCart}
                className="bg-gray-700 text-white font-bold py-2 px-4 rounded-lg
                           hover:bg-gray-600 transition-colors duration-200 active:scale-95 shadow-md"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:w-1/3 bg-gray-900 border-4 border-anime-pink rounded-xl p-6 shadow-comic-pop-lg">
            <h2 className="text-3xl font-heading text-comic-yellow mb-6 border-b pb-4 border-gray-700">
              Order Summary
            </h2>
            <div className="flex justify-between text-xl font-body mb-4">
              <span>Total Items:</span>
              <span className="font-bold text-anime-blue">{totalItems}</span>
            </div>
            <div className="flex justify-between text-2xl font-bold mb-6 border-t pt-4 border-gray-700">
              <span>Total Price:</span>
              <span className="text-comic-yellow">${totalPrice.toFixed(2)}</span>
            </div>
            <button
              onClick={handleProceedToCheckout} // Corrected line: Removed the JSX comment inside {}
              className="w-full bg-gradient-to-r from-anime-pink to-comic-red text-white font-bold py-4 px-6 rounded-lg
                         text-2xl hover:from-comic-red hover:to-anime-pink transition-all duration-300 ease-in-out
                         active:scale-95 shadow-lg border-b-4 border-gray-900"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;