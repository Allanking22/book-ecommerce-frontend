// app/auth/forgot-password/page.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { FaEnvelope } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        throw new Error('Backend URL is not defined in environment variables.');
      }

      // This is the endpoint your backend will need to provide
      const res = await axios.post(`${backendUrl}/users/forgot-password`, {
        email,
      });

      toast.success(res.data.message || 'If an account with that email exists, a password reset link has been sent to your inbox.');
      setEmail(''); // Clear the email field after successful submission

      // Optionally, you might redirect the user or show a message to check their email
      // For now, let's keep them on the page but clear the input and show success toast.

    } catch (err) {
      console.error('Forgot password error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(`Error: ${err.response.data.message}`);
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center
                    bg-[url('https://cdn.pixabay.com/photo/2024/09/20/01/10/neighborhood-9060077_640.png')] bg-cover bg-center bg-no-repeat bg-fixed
                    relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">

      <div className="absolute inset-0 bg-black opacity-40"></div>

      <div className="max-w-md w-full bg-white bg-opacity-95 rounded-xl shadow-2xl p-8 space-y-8 backdrop-blur-sm border border-purple-200 anime-card-shadow relative z-10">
        <div>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900 drop-shadow-md">
            Forgot Your Password?
          </h2>
          <p className="mt-2 text-center text-lg text-gray-600">
            Enter your email to receive a password reset link.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Email Input with Icon */}
          <div className="relative">
            <label htmlFor="email-address" className="sr-only">
              Email address
            </label>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaEnvelope className="h-5 w-5 text-red-500" />
            </div>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none relative block w-full pl-10 pr-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-lg transition duration-200"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 transform hover:scale-105 shadow-lg"
              disabled={loading}
            >
              {loading ? 'Sending Link...' : 'Send Reset Link'}
            </button>
          </div>
        </form>
        <div className="text-center text-gray-600 mt-4">
          Remember your password?{' '}
          <Link href="/auth/login" className="font-medium text-purple-600 hover:text-pink-500">
            Login Here
          </Link>
        </div>
      </div>
    </div>
  );
}