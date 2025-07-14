// book-ecommerce-frontend/app/auth/reset-password/page.js
'use client';

import { useState, useEffect, Suspense } from 'react'; // <--- ADD Suspense import
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import Link from 'next/link'; // Make sure Link is imported if used for "Login Here"


// --- Step 1: Create a separate component that uses useSearchParams ---
function ResetPasswordFormContent() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams(); // <-- useSearchParams is now inside this component

    // Get the token from the URL query parameters when the component mounts
    useEffect(() => {
        const tokenFromUrl = searchParams.get('token');
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
        } else {
            // If no token is found, might redirect or show an error
            toast.error('No reset token found in the URL. Please use the link from your email.');
            router.push('/auth/forgot-password'); // Redirect back to forgot password page
        }
    }, [searchParams, router]); // Added router to dependencies

    // Function to toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    // Function to toggle confirm password visibility
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

        // Password Policy Validation (same as register)
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;
        if (!passwordRegex.test(password)) {
            toast.error(
                'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*()_+).'
            );
            setLoading(false);
            return;
        }

        if (!token) {
            toast.error('Reset token is missing.');
            setLoading(false);
            return;
        }

        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
            if (!backendUrl) {
                throw new Error('Backend URL is not defined in environment variables.');
            }

            // Send the new password and token to the backend
            const res = await axios.put(`${backendUrl}/users/reset-password/${token}`, {
                password,
            });

            toast.success(res.data.message || 'Password has been reset successfully!');
            setTimeout(() => {
                router.push('/auth/login'); // Redirect to login page after successful reset
            }, 2000);

        } catch (err) {
            console.error('Password reset error:', err);
            if (err.response && err.response.data && err.response.data.message) {
                toast.error(`Error: ${err.response.data.message}`);
            } else {
                toast.error('An unexpected error occurred during password reset. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {/* New Password Input with Eye Icon */}
            <div className="relative">
                <label htmlFor="new-password" className="sr-only">
                    New Password
                </label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-red-500" />
                </div>
                <input
                    id="new-password"
                    name="new-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className="appearance-none relative block w-full pl-10 pr-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-lg transition duration-200"
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
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

            {/* Confirm New Password Input with Eye Icon */}
            <div className="relative">
                <label htmlFor="confirm-new-password" className="sr-only">
                    Confirm New Password
                </label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-red-500" />
                </div>
                <input
                    id="confirm-new-password"
                    name="confirm-new-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className="appearance-none relative block w-full pl-10 pr-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-lg transition duration-200"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                    type="button"
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
                    {loading ? 'Resetting...' : 'Reset Password'}
                </button>
            </div>
        </form>
    );
}

// --- Step 2: Wrap the component using useSearchParams with Suspense ---
export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center
                        bg-[url('https://cdn.pixabay.com/photo/2023/09/27/21/26/anime-8280339_1280.jpg')] bg-cover bg-center bg-no-repeat bg-fixed
                        relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">

            <div className="absolute inset-0 bg-black opacity-40"></div>

            <div className="max-w-md w-full bg-white bg-opacity-95 rounded-xl shadow-2xl p-8 space-y-8 backdrop-blur-sm border border-purple-200 anime-card-shadow relative z-10">
                <div>
                    <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900 drop-shadow-md">
                        Reset Your Password
                    </h2>
                    <p className="mt-2 text-center text-lg text-gray-600">
                        Enter your new password below.
                    </p>
                </div>
                {/* This is the key change: wrapping the form content in Suspense */}
                <Suspense fallback={<div>Loading password reset form...</div>}>
                    <ResetPasswordFormContent />
                </Suspense>
                <div className="text-center text-gray-600 mt-4">
                    Remembered your password?{' '}
                    <Link href="/auth/login" className="font-medium text-purple-600 hover:text-pink-500">
                        Login Here
                    </Link>
                </div>
            </div>
        </div>
    );
}