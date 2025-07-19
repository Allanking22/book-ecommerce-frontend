// app/auth/register/page.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash } from 'react-icons/fa'; // ADD FaEye, FaEyeSlash
import toast from 'react-hot-toast'; // Import toast

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // NEW STATE for password visibility
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // NEW STATE for confirm password visibility

    const router = useRouter();

    // NEW: Functions to toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword((prev) => !prev);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (password !== confirmPassword) {
            toast.error('Passwords do not match.');
            setLoading(false);
            return;
        }

        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
            if (!backendUrl) {
                throw new Error('Backend URL is not defined in environment variables.');
            }

            const res = await axios.post(`${backendUrl}/api/users/register`, {
                name,
                email,
                password,
            });

            localStorage.setItem('userToken', res.data.token);
            const decodedToken = jwtDecode(res.data.token);
            localStorage.setItem('userInfo', JSON.stringify({
                _id: decodedToken.id,
                name: res.data.name,
                email: res.data.email,
                role: res.data.role,
            }));

            toast.success(`Registration successful! Welcome to MangaVerse, ${res.data.name}!`);

            try {
                await axios.post('/api/send-welcome-email', {
                    recipientEmail: email,
                    recipientName: name,
                });
                console.log('Welcome email trigger initiated successfully.');
            } catch (emailError) {
                console.error('Failed to trigger welcome email API:', emailError);
            }

            setTimeout(() => {
                router.push('/');
            }, 1500);

        } catch (err) {
            console.error('Registration error:', err);
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
                         bg-[url('https://cdn.pixabay.com/photo/2023/09/27/21/26/anime-8280339_1280.jpg')] bg-cover bg-center bg-no-repeat bg-fixed
                         relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">

            <div className="absolute inset-0 bg-black opacity-40"></div>

            <div className="max-w-md w-full bg-white bg-opacity-95 rounded-xl shadow-2xl p-8 space-y-8 backdrop-blur-sm border border-purple-200 anime-card-shadow relative z-10">
                <div>
                    <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900 drop-shadow-md">
                        Join the MangaVerse!
                    </h2>
                    <p className="mt-2 text-center text-lg text-gray-600">
                        Create your account and unleash your inner hero.
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {/* Name Input with Icon */}
                    <div className="relative">
                        <label htmlFor="name" className="sr-only">
                            Full Name
                        </label>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaUser className="h-5 w-5 text-red-500" />
                        </div>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            autoComplete="name"
                            required
                            className="appearance-none relative block w-full pl-10 pr-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-lg transition duration-200"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

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
                            autoComplete="new-password"
                            required
                            className="appearance-none relative block w-full pl-10 pr-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-lg transition duration-200" // pr-10 added for icon
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {/* Eye icon button */}
                        <button
                            type="button" // Important: Prevents form submission
                            onClick={togglePasswordVisibility}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                            {showPassword ? (
                                <FaEyeSlash className="h-5 w-5" /> // Show hide icon
                            ) : (
                                <FaEye className="h-5 w-5" /> // Show eye icon
                            )}
                        </button>
                    </div>

                    {/* Confirm Password Input with Eye Icon */}
                    <div className="relative">
                        <label htmlFor="confirm-password" className="sr-only">
                            Confirm Password
                        </label>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaLock className="h-5 w-5 text-red-500" />
                        </div>
                        <input
                            id="confirm-password"
                            name="confirm-password"
                            type={showConfirmPassword ? 'text' : 'password'} 
                            autoComplete="new-password"
                            required
                            className="appearance-none relative block w-full pl-10 pr-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-lg transition duration-200" // pr-10 added for icon
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        {/* Eye icon button for confirm password */}
                        <button
                            type="button" // Important: Prevents form submission
                            onClick={toggleConfirmPasswordVisibility}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                            {showConfirmPassword ? (
                                <FaEyeSlash className="h-5 w-5" />
                            ) : (
                                <FaEye className="h-5 w-5" />
                            )}
                        </button>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 transform hover:scale-105 shadow-lg"
                            disabled={loading}
                        >
                            {loading ? 'Registering...' : 'Register'}
                        </button>
                    </div>
                </form>
                <div className="text-center text-gray-600 mt-4">
                    Already have an account?{' '}
                    <Link href="/auth/login" className="font-medium text-purple-600 hover:text-pink-500">
                        Sign In Here
                    </Link>
                </div>
            </div>
        </div>
    );
}