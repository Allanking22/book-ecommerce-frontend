// book-ecommerce-frontend/app/context/AuthContext.js
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode'; // <--- IMPORTANT: Ensure this is imported here!

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  const router = useRouter();

  // Effect to load user/token from localStorage on component mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Use the correct localStorage keys consistent with your login page
      const storedToken = localStorage.getItem('userToken');
      const storedUserInfo = localStorage.getItem('userInfo');

      if (storedToken && storedUserInfo) {
        try {
            setUser(JSON.parse(storedUserInfo));
            setToken(storedToken);
        } catch (e) {
            console.error("Failed to parse userInfo from localStorage", e);
            // Clear invalid data if parsing fails
            localStorage.removeItem('userToken');
            localStorage.removeItem('userInfo');
            setUser(null);
            setToken(null);
        }
      }
      setIsClient(true);
    }
    setIsLoading(false);
  }, []);

  // Effect to save user/token to localStorage whenever they change
  useEffect(() => {
    if (isClient && typeof window !== 'undefined') {
      if (user && token) {
        // Use the correct localStorage keys consistent with your login page
        localStorage.setItem('userInfo', JSON.stringify(user));
        localStorage.setItem('userToken', token);
      } else {
        localStorage.removeItem('userInfo');
        localStorage.removeItem('userToken');
      }
    }
  }, [user, token, isClient]);

  // Function to handle user login - NOW ACCEPTS REAL TOKEN/USER DATA
  const login = async ({ token: newToken, user: newUser }) => { // <--- Accepts objects directly
    try {
        // Set state from the received data
        setToken(newToken);
        setUser(newUser);

        // You can optionally decode the token here if you need more data
        // that isn't already in `newUser` object, or for validation.
        // const decoded = jwtDecode(newToken);
        // console.log("Decoded token in AuthContext:", decoded);

        // Show success toast
        toast.success(`Welcome back, ${newUser.name.split(' ')[0]}!`);

        router.refresh(); // Refresh the current route to re-fetch props and update server components
        setTimeout(() => {
            router.push('/'); // Redirect after a short delay
        }, 1500);

    } catch (err) {
      console.error('AuthContext login process failed:', err);
      toast.error('An error occurred during login processing.');
    }
  };

  // Function to handle user logout
  const logout = () => {
    setUser(null);
    setToken(null);
    toast.success('You have been logged out.');
    router.refresh(); // Refresh the current route to update UI
    router.push('/'); // Redirect to home or login page after logout
  };

  const contextValue = {
    user,
    token,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user && !!token,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};