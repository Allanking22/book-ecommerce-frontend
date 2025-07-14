// app/user/orders/page.js
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext'; // Adjust import path for useAuth
import axios from 'axios';
import toast from 'react-hot-toast';
import Link from 'next/link'; // Import Link

const MyOrdersPage = () => {
    const { token, isLoading } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!isLoading && !token) {
                toast.error("Please log in to view your orders.");
                setLoadingOrders(false);
                // Optionally redirect to login:
                // router.push('/login');
                return;
            }
            if (!token) {
                setLoadingOrders(false);
                return;
            }

            try {
                setLoadingOrders(true);
                setError(null);
                const config = {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                };
                // Make sure your backend has this endpoint:
                const response = await axios.get('http://localhost:5000/api/orders/myorders', config);
                setOrders(response.data);
            } catch (err) {
                console.error("Failed to fetch orders:", err);
                if (err.response) {
                    setError(err.response.data.message || "Failed to fetch orders.");
                } else {
                    setError("Network error or server unavailable. Failed to fetch orders.");
                }
                toast.error("Failed to load your orders.");
            } finally {
                setLoadingOrders(false);
            }
        };

        fetchOrders();
    }, [token, isLoading]);

    if (isLoading || loadingOrders) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white text-xl">
                Loading orders...
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-4 py-10 min-h-screen text-white text-center">
                <h1 className="text-4xl font-heading text-comic-yellow mb-8">Error Loading Orders</h1>
                <p className="text-xl text-red-400">{error}</p>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="container mx-auto p-4 py-10 min-h-screen text-white text-center">
                <h1 className="text-4xl font-heading text-comic-yellow mb-8">No Orders Found</h1>
                <p className="text-xl text-gray-300">You haven't placed any orders yet.</p>
                <Link href="/shop" className="mt-6 inline-block bg-anime-blue text-white font-bold py-3 px-6 rounded-lg text-xl hover:bg-blue-700 transition-colors duration-200">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 py-10 min-h-screen">
            <h1 className="text-4xl font-heading text-center text-comic-yellow mb-8">My Orders</h1>
            <div className="space-y-6">
                {orders.map(order => (
                    <div key={order._id} className="bg-gray-900 border-4 border-anime-blue rounded-xl p-6 shadow-comic-pop-lg">
                        <h2 className="text-2xl font-heading text-anime-pink mb-3">Order ID: {order._id}</h2>
                        <p className="text-gray-300"><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                        <p className="text-gray-300"><strong>Total Amount:</strong> ${order.totalAmount.toFixed(2)}</p>
                        <p className="text-gray-300"><strong>Payment Method:</strong> {order.paymentMethod}</p>
                        <p className="text-gray-300"><strong>Status:</strong> <span className="capitalize">{order.status}</span></p>

                        <div className="mt-4">
                            <h3 className="text-xl font-heading text-comic-yellow mb-2">Items:</h3>
                            <ul className="list-disc list-inside text-gray-400">
                                {order.orderItems.map(item => (
                                    <li key={item._id || item.productId}>
                                        {item.name} x {item.quantity} - ${item.price.toFixed(2)} each
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="mt-4 text-right">
                            <Link href={`/user/orders/${order._id}`} className="text-anime-pink hover:underline">
                                View Details
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyOrdersPage;