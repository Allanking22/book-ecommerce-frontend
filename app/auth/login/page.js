// app/auth/login/page.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
// import { useRouter } from 'next/navigation'; // REMOVE: useRouter will be handled by AuthContext
import axios from 'axios';
// import { jwtDecode } from 'jwt-decode'; // REMOVE: jwtDecode logic moves to AuthContext if needed
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext'; // <--- NEW: Import useAuth

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    // const router = useRouter(); // REMOVE: useRouter from here, AuthContext will handle it
    const { login: authLogin, isAuthenticated } = useAuth(); // <--- NEW: Get login function from AuthContext

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
            if (!backendUrl) {
                throw new Error('Backend URL is not defined in environment variables.');
            }

            // Make the API call to your backend
            const res = await axios.post(`${backendUrl}/users/login`, {
                email,
                password,
            });

            // Instead of directly manipulating localStorage and router here,
            // call the login function provided by AuthContext
            // Pass the necessary data (token, user info) to authLogin
            await authLogin({
                token: res.data.token,
                user: {
                    _id: res.data.id, // Assuming backend sends user id
                    name: res.data.name,
                    email: res.data.email,
                    role: res.data.role,
                },
            });

            // toast.success(`Login successful! Welcome back, ${res.data.name.split(' ')[0]}!`); // Toast will be handled by AuthContext
            // router.refresh(); // Handled by AuthContext
            // setTimeout(() => { router.push('/'); }, 1500); // Handled by AuthContext

        } catch (err) {
            console.error('Login error:', err);
            if (err.response && err.response.data && err.response.data.message) {
                toast.error(`Error: ${err.response.data.message}`);
            } else {
                toast.error('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // You might want to uncomment this if you have a dashboard or protected route
    // and want to redirect logged-in users away from the login page.
    // if (isAuthenticated) {
    //     router.push('/shop'); // Or your dashboard/home page
    //     return null;
    // }

    return (
        <div className="min-h-screen flex items-center justify-center
                             bg-[url('https://cdn.pixabay.com/photo/2024/09/20/01/10/neighborhood-9060077_640.png')] bg-cover bg-center bg-no-repeat bg-fixed
                             relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">

            <div className="absolute inset-0 bg-black opacity-40"></div>

            <div className="max-w-md w-full bg-white bg-opacity-95 rounded-xl shadow-2xl p-8 space-y-8 backdrop-blur-sm border border-purple-200 anime-card-shadow relative z-10">
                <div>
                    <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900 drop-shadow-md">
                        Welcome Back, Otaku!
                    </h2>
                    <p className="mt-2 text-center text-lg text-gray-600">
                        Sign in to continue your epic journey.
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

                    {/* Password Input with Eye Icon */}
                    <div className="relative">
                        <label htmlFor="password" className="sr-only">
                            Password
                        </label>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaLock className="h-5 w-5 text-red-500" />
                        </div>
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            required
                            className="appearance-none relative block w-full pl-10 pr-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-lg transition duration-200"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {/* Eye icon button */}
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                            {showPassword ? (
                                <FaEyeSlash className="h-5 w-5" />
                            ) : (
                                <FaEye className="h-5 w-5" />
                            )}
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                Remember me
                            </label>
                        </div>

                        <div className="text-sm">
                            <Link href="/auth/forgot-password" className="font-medium text-purple-600 hover:text-pink-500">
                                Forgot your password?
                            </Link>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 transform hover:scale-105 shadow-lg"
                            disabled={loading}
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </div>
                </form>
                <div className="text-center text-gray-600 mt-4">
                    Don't have an account?{' '}
                    <Link href="/auth/register" className="font-medium text-purple-600 hover:text-pink-500">
                        Register Here
                    </Link>
                </div>
            </div>
        </div>
    );
}