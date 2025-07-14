// book-ecommerce-frontend/app/context/CartContext.js
'use client'; // This context will be used in client components

import { createContext, useContext, useState, useEffect } from 'react';

// 1. Create the Context
const CartContext = createContext();

// Custom hook to use the CartContext
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// 2. Create the Provider Component
export const CartProvider = ({ children }) => {
  // Initialize cart as empty array by default for SSR.
  // The actual cart data from localStorage will be loaded on the client side after hydration.
  const [cartItems, setCartItems] = useState([]); // <--- IMPORTANT CHANGE HERE: Always initialize as empty array

  // A flag to ensure localStorage operations only run on the client after initial mount
  const [isClient, setIsClient] = useState(false); // <--- NEW STATE

  // Effect to load cartItems from localStorage on component mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCart = localStorage.getItem('cartItems');
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
      setIsClient(true); // <--- Set client flag to true after initial mount/hydration
    }
  }, []); // Empty dependency array: runs only once on mount

  // Effect to save cartItems to localStorage whenever it changes
  useEffect(() => {
    // Only save if we are on the client and the initial hydration has completed
    if (isClient && typeof window !== 'undefined') { // <--- Condition added
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }
  }, [cartItems, isClient]); // Dependency array: run this effect when cartItems or isClient changes

  // Function to add an item to the cart
  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item._id === product._id);

      if (existingItem) {
        return prevItems.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
    console.log(`Added ${product.title} to cart!`);
  };

  // Function to remove an item from the cart
  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item._id !== productId));
  };

  // Function to increase quantity of an item
  const increaseQuantity = (productId) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item._id === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  // Function to decrease quantity of an item
  const decreaseQuantity = (productId) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item._id === productId ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item
      ).filter(item => item.quantity > 0)
    );
  };

  // Function to clear the entire cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Calculate total items and total price
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // The value that will be supplied to any components that consume this context
  const contextValue = {
    cartItems,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    totalItems,
    totalPrice,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};