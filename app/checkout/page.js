'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import Link from 'next/link';
import Script from 'next/script'; // NEW: Add this import for PayPal SDK

const CheckoutPage = () => {
    // State declarations
    const { cartItems, totalPrice, totalItems, clearCart } = useCart();
    const { token, isLoading } = useAuth();
    const router = useRouter();

    const [currentStep, setCurrentStep] = useState(1);
    const [shippingInfo, setShippingInfo] = useState({
        fullName: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        phone: '',
    });
    const [paymentMethod, setPaymentMethod] = useState('');
    const [paymentDetails, setPaymentDetails] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
    });
    // NEW STATE: For M-Pesa phone number
    const [mpesaPhoneNumber, setMpesaPhoneNumber] = useState('');

    // NEW STATE: To prevent redirect after successful order
    const [orderPlacedSuccessfully, setOrderPlacedSuccessfully] = useState(false);

    // Effect to handle empty cart or non-logged-in users on page load
    useEffect(() => {
        if (!isLoading && totalItems === 0 && !orderPlacedSuccessfully) {
            console.log('DEBUG: Cart is empty on load or became empty, and no order was just placed. Redirecting to shop.');
            toast.error('Your cart is empty. Please add items before checking out.');
            router.push('/shop');
        }
    }, [isLoading, totalItems, token, router, orderPlacedSuccessfully]);

    // NEW: PayPal Buttons useEffect
    useEffect(() => {
        if (paymentMethod === 'paypal' && window.paypal) {
            // Ensure the PayPal buttons are re-rendered if payment method changes
            // Clear any existing buttons to avoid duplicates
            const paypalButtonContainer = document.getElementById('paypal-button-container');
            if (paypalButtonContainer) {
                paypalButtonContainer.innerHTML = ''; // Clear previous buttons
            }

            window.paypal.Buttons({
                // Sets up the transaction when a PayPal button is clicked
                createOrder: (data, actions) => {
                    // Here, you would typically make an API call to your backend
                    // to create an order in PayPal's system for security and robustness.
                    // For simplicity, we'll create a basic order on the client-side for now.
                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: totalPrice.toFixed(2), // Use your totalPrice state
                                currency_code: 'USD' // Match the currency in the SDK script. Adjust if needed.
                            },
                            description: `Managaverse Order: ${Date.now()}` // Example description
                        }]
                    });
                },
                // Finalize the transaction after the buyer approves
                onApprove: async (data, actions) => {
                    try {
                        const order = await actions.order.capture();
                        console.log('PayPal Order Captured:', order);
                        toast.success('Payment successful via PayPal!');

                        // Simulate order creation and redirect after successful PayPal payment
                        const orderData = {
                            orderItems: cartItems.map(item => ({
                                productId: item._id, // Assuming _id is the productId
                                name: item.title,
                                quantity: item.quantity,
                                price: item.price,
                            })),
                            shippingAddress: shippingInfo,
                            paymentMethod: 'paypal',
                            paymentResult: {
                                id: order.id,
                                status: order.status,
                                update_time: order.update_time,
                                email_address: order.payer.email_address,
                            },
                            totalAmount: totalPrice, // Use totalAmount as per your backend model
                        };

                        const config = {
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`,
                            },
                        };

                        console.log('DEBUG: Attempting to create order in backend after PayPal success...');
                        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/orders`, orderData, config);
                        const createdOrder = response.data;

                        if (createdOrder.success) {
                            setOrderPlacedSuccessfully(true);
                            clearCart();
                            router.push(`/order-confirmation?orderId=${createdOrder.order._id}`);
                        } else {
                            toast.error('Failed to create order after PayPal payment. Please contact support.');
                        }

                    } catch (error) {
                        console.error('Error capturing PayPal order or creating backend order:', error);
                        toast.error('PayPal payment failed or was cancelled. Please try again.');
                        if (error.response) {
                            console.error('PayPal Backend Order Creation Error Data:', error.response.data);
                        }
                    }
                },
                // Handle cases where the buyer cancels the payment or an error occurs
                onCancel: (data) => {
                    console.log('PayPal payment cancelled:', data);
                    toast('PayPal payment cancelled.', { icon: '👋' });
                },
                onError: (err) => {
                    console.error('PayPal onError:', err);
                    toast.error('An error occurred with PayPal. Please try again.');
                }
            }).render('#paypal-button-container'); // Renders the PayPal buttons
        }
    }, [paymentMethod, totalPrice, cartItems, shippingInfo, token, router, clearCart]); // Add all dependencies

    // --- Handlers for Navigation Between Steps ---
    const handleNextStep = () => {
        if (currentStep === 1) {
            // Validate shipping info before moving to next step
            if (!shippingInfo.fullName || !shippingInfo.addressLine1 || !shippingInfo.city || !shippingInfo.country || !shippingInfo.phone) {
                toast.error('Please fill in all required shipping fields (Name, Address, City, Country, Phone).');
                return;
            }
        }
        if (currentStep === 2) {
            // Validate payment method selection
            if (!paymentMethod) {
                toast.error('Please select a payment method.');
                return;
            }
            if (paymentMethod === 'creditCard') {
                if (!paymentDetails.cardNumber || !paymentDetails.expiryDate || !paymentDetails.cvv) {
                    toast.error('Please fill in all credit card details.');
                    return;
                }
                if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(paymentDetails.expiryDate)) {
                    toast.error('Invalid expiry date format (MM/YY).');
                    return;
                }
                if (!/^\d{3,4}$/.test(paymentDetails.cvv)) {
                    toast.error('Invalid CVV format (3 or 4 digits).');
                    return;
                }
            }
            // UPDATED VALIDATION: For M-Pesa phone number to include 010 and 011 prefixes
            if (paymentMethod === 'mpesa') {
                if (!mpesaPhoneNumber) {
                    toast.error('Please enter your M-Pesa phone number.');
                    return;
                }
                // Updated M-Pesa phone number validation regex
                if (!/^(254(?:7|10|11)\d{8})$/.test(mpesaPhoneNumber)) {
                    toast.error('Invalid M-Pesa phone number format. Must be 2547XXXXXXXX, 25410XXXXXXXX, or 25411XXXXXXXX (12 digits).');
                    return;
                }
            }
            // If PayPal is selected, we don't proceed with handleNextStep
            // Instead, the PayPal buttons will handle the payment
            if (paymentMethod === 'paypal') {
                toast('Please click the "Pay with PayPal" button to proceed.', { icon: 'ℹ️' });
                return; // Prevent moving to step 3 via this button if PayPal is chosen
            }
        }
        setCurrentStep(prevStep => prevStep + 1);
    };

    const handlePreviousStep = () => {
        setCurrentStep(prevStep => prevStep - 1);
    };

    // --- Order Placement Handler ---
    const handlePlaceOrder = async () => {
        console.log('DEBUG: handlePlaceOrder function initiated.');

        if (cartItems.length === 0) {
            toast.error('Your cart is empty! Cannot place an order.');
            console.log('DEBUG: Cart is empty on Place Order click. Redirecting to shop.');
            router.push('/shop');
            return;
        }

        if (!token) {
            toast.error('You need to be logged in to place an order.');
            console.log('DEBUG: No authentication token found. Redirecting to login.');
            router.push('/login');
            return;
        }

        // If PayPal is selected, the payment is handled by the PayPal buttons' onApprove callback.
        // The 'Place Order' button should NOT directly trigger PayPal payment logic.
        if (paymentMethod === 'paypal') {
            toast('For PayPal, please click the "Pay with PayPal" button instead of Place Order.', { icon: 'ℹ️' });
            return;
        }

        // UPDATED VALIDATION: Validate M-Pesa phone number if M-Pesa is selected right before placing order
        if (paymentMethod === 'mpesa') {
            if (!mpesaPhoneNumber) {
                toast.error('Please enter your M-Pesa phone number for payment.');
                return;
            }
            if (!/^(254(?:7|10|11)\d{8})$/.test(mpesaPhoneNumber)) {
                toast.error('Invalid M-Pesa phone number format. Must be 2547XXXXXXXX, 25410XXXXXXXX, or 25411XXXXXXXX (12 digits).');
                return;
            }
        }

        toast.loading('Processing your order...', { id: 'orderProcessingToast' });
        console.log('DEBUG: "Processing your order..." toast displayed.');

        try {
            const orderData = {
                orderItems: cartItems.map(item => ({
                    productId: item._id,
                    name: item.title,
                    quantity: item.quantity,
                    price: item.price,
                })),
                shippingAddress: shippingInfo,
                paymentMethod: paymentMethod,
                totalAmount: totalPrice,
                // Only send paymentDetails if it's credit card
                paymentDetails: paymentMethod === 'creditCard' ? paymentDetails : {},
            };

            console.log('DEBUG: Constructed orderData for initial creation:', orderData);
            console.log('DEBUG: Token for Authorization:', token ? 'Exists' : 'Does NOT Exist');

            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            };

            // 1. Create the order in your backend database
            console.log('DEBUG: Attempting axios.post to http://localhost:5000/api/orders...');
            const { data: createdOrder } = await axios.post('http://localhost:5000/api/orders', orderData, config);
            console.log('DEBUG: Order created successfully! Backend response:', createdOrder);

            toast.dismiss('orderProcessingToast');
            toast.success('Order created successfully!');

            // 2. If payment method is M-Pesa, initiate STK Push
            if (paymentMethod === 'mpesa') {
                toast.loading('Initiating M-Pesa STK Push...', { id: 'mpesaToast' });
                console.log('DEBUG: Initiating M-Pesa STK Push for Order ID:', createdOrder.order._id);

                const mpesaPayload = {
                     phoneNumber: mpesaPhoneNumber,
                     amount: totalPrice,
                     orderId: createdOrder.order._id,
                     description: `Managaverse - Order: ${createdOrder.order._id}` // Updated value
                };

                const mpesaConfig = {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`, // Still needs auth for the STK push endpoint
                    },
                };

                console.log('DEBUG: Sending M-Pesa STK Push request to backend...');
                const mpesaResponse = await axios.post(
                    'http://localhost:5000/api/mpesa/stk-push',
                    mpesaPayload,
                    mpesaConfig
                );
                console.log('DEBUG: M-Pesa STK Push response from backend:', mpesaResponse.data);

                toast.dismiss('mpesaToast');
                if (mpesaResponse.data.response && mpesaResponse.data.response.ResponseCode === '0') {
                    toast.success('M-Pesa STK Push sent! Check your phone to complete payment.');
                } else {
                    toast.error(`M-Pesa STK Push failed: ${mpesaResponse.data.response?.CustomerMessage || 'Unknown error'}`);
                    // Optionally, you might want to mark the order as failed in your DB here
                    // if the STK push itself failed immediately.
                }

                // For M-Pesa, we redirect to a confirmation page regardless, as the payment
                // will be confirmed via the callback to your backend later.
                setOrderPlacedSuccessfully(true);
                clearCart();
                router.push(`/order-confirmation?orderId=${createdOrder.order._id}`); // Pass orderId for confirmation page
                return; // Exit here if M-Pesa
            }

            // For other payment methods (like credit card or COD), proceed as before
            setOrderPlacedSuccessfully(true);
            console.log('DEBUG: setOrderPlacedSuccessfully(true) called.');

            console.log('DEBUG: Calling clearCart() now...');
            clearCart();
            console.log('DEBUG: Cart cleared. Cart state should be empty.');

            console.log('DEBUG: Calling router.push("/order-confirmation"). This should navigate the user.');
            router.push(`/order-confirmation?orderId=${createdOrder.order._id}`); // Pass orderId

            console.log('DEBUG: router.push initiated. WATCH NETWORK TAB CLOSELY for subsequent requests!');

        } catch (error) {
            console.error('DEBUG: Catch block entered. An error occurred during order placement or M-Pesa initiation.');
            toast.dismiss('orderProcessingToast');
            toast.dismiss('mpesaToast'); // Dismiss M-Pesa toast too

            if (error.response) {
                console.error('DEBUG: Server error response:', error.response.data);
                toast.error(`Operation Failed: ${error.response.data.message || 'Server error'}`);
            } else if (error.request) {
                console.error('DEBUG: No response received from server. Check server status/network:', error.request);
                toast.error('Operation failed: No response from server. Check your internet connection.');
            } else {
                console.error('DEBUG: Error in setting up request:', error.message);
                toast.error(`Operation failed: ${error.message}`);
            }
        }
    };

    // --- Loading State and Empty Cart UI ---
    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center text-white text-xl">Loading user authentication...</div>;
    }

    if (totalItems === 0 && !orderPlacedSuccessfully) { // Added condition here too for safety
        return (
            <div className="container mx-auto p-4 py-10 min-h-screen text-white text-center flex flex-col justify-center items-center">
                <h1 className="text-4xl font-heading text-comic-yellow mb-8">Your Cart is Empty</h1>
                <p className="text-xl text-gray-300 mb-6">
                    Add some amazing books to your cart before proceeding to checkout!
                </p>
                <Link href="/shop" className="bg-anime-blue text-white font-bold py-3 px-6 rounded-lg text-xl hover:bg-blue-700 transition-colors duration-200">
                    Go to Shop
                </Link>
            </div>
        );
    }

    // --- Main Checkout Page Render ---
    return (
        <div className="container mx-auto p-4 py-10 min-h-screen">
            <h1 className="text-4xl font-heading text-center text-comic-yellow mb-8">Checkout</h1>

            {/* Progress Indicator */}
            <div className="flex justify-around mb-8 border-b pb-4 border-gray-700">
                <div className={`text-xl font-body ${currentStep === 1 ? 'text-anime-pink font-bold' : 'text-gray-400'}`}>1. Shipping</div>
                <div className={`text-xl font-body ${currentStep === 2 ? 'text-anime-pink font-bold' : 'text-gray-400'}`}>2. Payment</div>
                <div className={`text-xl font-body ${currentStep === 3 ? 'text-anime-pink font-bold' : 'text-gray-400'}`}>3. Review</div>
            </div>

            {/* --- Step 1: Shipping Information --- */}
            {currentStep === 1 && (
                <div className="bg-gray-900 border-4 border-anime-blue rounded-xl p-8 shadow-comic-pop-lg max-w-2xl mx-auto">
                    <h2 className="text-3xl font-heading text-comic-yellow mb-6">Delivery Address</h2>
                    <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label htmlFor="fullName" className="block text-gray-300 text-lg font-bold mb-2">Full Name</label>
                                <input
                                    type="text" id="fullName" name="fullName"
                                    className="w-full p-3 rounded-lg bg-gray-800 border-2 border-gray-700 text-white focus:outline-none focus:border-comic-yellow"
                                    value={shippingInfo.fullName} onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-gray-300 text-lg font-bold mb-2">Phone Number</label>
                                <input
                                    type="tel" id="phone" name="phone"
                                    className="w-full p-3 rounded-lg bg-gray-800 border-2 border-gray-700 text-white focus:outline-none focus:border-comic-yellow"
                                    value={shippingInfo.phone} onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="addressLine1" className="block text-gray-300 text-lg font-bold mb-2">Address Line 1</label>
                                <input
                                    type="text" id="addressLine1" name="addressLine1"
                                    className="w-full p-3 rounded-lg bg-gray-800 border-2 border-gray-700 text-white focus:outline-none focus:border-comic-yellow"
                                    value={shippingInfo.addressLine1} onChange={(e) => setShippingInfo({ ...shippingInfo, addressLine1: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="addressLine2" className="block text-gray-300 text-lg font-bold mb-2">Address Line 2 (Optional)</label>
                                <input
                                    type="text" id="addressLine2" name="addressLine2"
                                    className="w-full p-3 rounded-lg bg-gray-800 border-2 border-gray-700 text-white focus:outline-none focus:border-comic-yellow"
                                    value={shippingInfo.addressLine2} onChange={(e) => setShippingInfo({ ...shippingInfo, addressLine2: e.target.value })}
                                />
                            </div>
                            <div>
                                <label htmlFor="city" className="block text-gray-300 text-lg font-bold mb-2">City</label>
                                <input
                                    type="text" id="city" name="city"
                                    className="w-full p-3 rounded-lg bg-gray-800 border-2 border-gray-700 text-white focus:outline-none focus:border-comic-yellow"
                                    value={shippingInfo.city} onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="state" className="block text-gray-300 text-lg font-bold mb-2">State/Province</label>
                                <input
                                    type="text" id="state" name="state"
                                    className="w-full p-3 rounded-lg bg-gray-800 border-2 border-gray-700 text-white focus:outline-none focus:border-comic-yellow"
                                    value={shippingInfo.state} onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                                />
                            </div>
                            <div>
                                <label htmlFor="postalCode" className="block text-gray-300 text-lg font-bold mb-2">Postal Code</label>
                                <input
                                    type="text" id="postalCode" name="postalCode"
                                    className="w-full p-3 rounded-lg bg-gray-800 border-2 border-gray-700 text-white focus:outline-none focus:border-comic-yellow"
                                    value={shippingInfo.postalCode} onChange={(e) => setShippingInfo({ ...shippingInfo, postalCode: e.target.value })}
                                />
                            </div>
                            <div>
                                <label htmlFor="country" className="block text-gray-300 text-lg font-bold mb-2">Country</label>
                                <input
                                    type="text" id="country" name="country"
                                    className="w-full p-3 rounded-lg bg-gray-800 border-2 border-gray-700 text-white focus:outline-none focus:border-comic-yellow"
                                    value={shippingInfo.country} onChange={(e) => setShippingInfo({ ...shippingInfo, country: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-anime-pink to-comic-red text-white font-bold py-3 px-6 rounded-lg
                                            text-xl hover:from-comic-red hover:to-anime-pink transition-all duration-300 ease-in-out
                                            active:scale-95 shadow-lg border-b-4 border-gray-900"
                            >
                                Next: Payment
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* --- Step 2: Payment Method --- */}
            {currentStep === 2 && (
                <div className="bg-gray-900 border-4 border-anime-blue rounded-xl p-8 shadow-comic-pop-lg max-w-2xl mx-auto">
                    <h2 className="text-3xl font-heading text-comic-yellow mb-6">Payment Method</h2>
                    <div className="space-y-4 mb-6">
                        {/* Credit Card Option */}
                        <label className="flex items-center text-white text-lg cursor-pointer">
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="creditCard"
                                checked={paymentMethod === 'creditCard'}
                                onChange={() => setPaymentMethod('creditCard')}
                                className="form-radio h-5 w-5 text-anime-pink"
                            />
                            <span className="ml-3">Credit Card</span>
                        </label>

                        {paymentMethod === 'creditCard' && (
                            <div className="ml-8 mt-4 space-y-4">
                                <div>
                                    <label htmlFor="cardNumber" className="block text-gray-300 text-md font-bold mb-2">Card Number</label>
                                    <input
                                        type="text" id="cardNumber"
                                        className="w-full p-2 rounded-lg bg-gray-800 border-2 border-gray-700 text-white focus:outline-none focus:border-comic-yellow"
                                        value={paymentDetails.cardNumber} onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
                                        placeholder="XXXX XXXX XXXX XXXX"
                                        required={paymentMethod === 'creditCard'}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="expiryDate" className="block text-gray-300 text-md font-bold mb-2">Expiry Date (MM/YY)</label>
                                        <input
                                            type="text" id="expiryDate"
                                            className="w-full p-2 rounded-lg bg-gray-800 border-2 border-gray-700 text-white focus:outline-none focus:border-comic-yellow"
                                            value={paymentDetails.expiryDate} onChange={(e) => setPaymentDetails({ ...paymentDetails, expiryDate: e.target.value })}
                                            placeholder="MM/YY"
                                            required={paymentMethod === 'creditCard'}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="cvv" className="block text-gray-300 text-md font-bold mb-2">CVV</label>
                                        <input
                                            type="text" id="cvv"
                                            className="w-full p-2 rounded-lg bg-gray-800 border-2 border-gray-700 text-white focus:outline-none focus:border-comic-yellow"
                                            value={paymentDetails.cvv} onChange={(e) => setPaymentDetails({ ...paymentDetails, cvv: e.target.value })}
                                            placeholder="XXX"
                                            required={paymentMethod === 'creditCard'}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PayPal Option */}
                        <label className="flex items-center text-white text-lg cursor-pointer">
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="paypal"
                                checked={paymentMethod === 'paypal'}
                                onChange={() => setPaymentMethod('paypal')}
                                className="form-radio h-5 w-5 text-anime-pink"
                            />
                            <span className="ml-3">PayPal</span>
                        </label>

                        {/* NEW: PayPal Buttons Container (conditionally rendered) */}
                        {paymentMethod === 'paypal' && (
                            <div className="ml-8 mt-4 space-y-4">
                                <div id="paypal-button-container">
                                    {/* PayPal buttons will render here */}
                                </div>
                            </div>
                        )}

                        {/* M-Pesa Option */}
                        <label className="flex items-center text-white text-lg cursor-pointer">
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="mpesa" // IMPORTANT: Use 'mpesa' as the value
                                checked={paymentMethod === 'mpesa'}
                                onChange={() => setPaymentMethod('mpesa')}
                                className="form-radio h-5 w-5 text-anime-pink"
                            />
                            <span className="ml-3">M-Pesa (Safaricom STK Push)</span>
                        </label>

                        {/* M-Pesa Phone Number Input (conditionally rendered) */}
                        {paymentMethod === 'mpesa' && (
                            <div className="ml-8 mt-4 space-y-4">
                                <div>
                                    <label htmlFor="mpesaPhone" className="block text-gray-300 text-md font-bold mb-2">
                                        M-Pesa Phone Number (e.g., 2547XXXXXXXX, 25410XXXXXXXX, 25411XXXXXXXX)
                                    </label>
                                    <input
                                        type="tel" // Use type='tel'
                                        id="mpesaPhone"
                                        name="mpesaPhone"
                                        className="w-full p-2 rounded-lg bg-gray-800 border-2 border-gray-700 text-white focus:outline-none focus:border-comic-yellow"
                                        value={mpesaPhoneNumber}
                                        onChange={(e) => setMpesaPhoneNumber(e.target.value)}
                                        placeholder="2547XXXXXXXX or 2541XXXXXXXX" // Updated placeholder
                                        // UPDATED pattern validation for Kenyan Safaricom numbers
                                        pattern="^254(?:7|10|11)\d{8}$"
                                        title="Please enter a valid M-Pesa phone number starting with 2547, 25410, or 25411 (e.g., 254712345678, 254101234567, 254111234567)" // Updated title
                                        required={paymentMethod === 'mpesa'} // Make required if M-Pesa is chosen
                                    />
                                    <p className="text-gray-500 text-sm mt-1">
                                        This is the number that will receive the M-Pesa STK Push prompt.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Cash on Delivery */}
                        <label className="flex items-center text-white text-lg cursor-pointer">
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="cod"
                                checked={paymentMethod === 'cod'}
                                onChange={() => setPaymentMethod('cod')}
                                className="form-radio h-5 w-5 text-anime-pink"
                            />
                            <span className="ml-3">Cash on Delivery (COD)</span>
                        </label>
                    </div>

                    <div className="flex justify-between mt-8">
                        <button
                            type="button"
                            onClick={handlePreviousStep}
                            className="bg-gray-700 text-white font-bold py-3 px-6 rounded-lg
                                        text-xl hover:bg-gray-600 transition-colors duration-200
                                        active:scale-95 shadow-lg border-b-4 border-gray-800"
                        >
                            Previous
                        </button>
                        <button
                            type="button"
                            onClick={handleNextStep}
                            className="bg-gradient-to-r from-anime-pink to-comic-red text-white font-bold py-3 px-6 rounded-lg
                                        text-xl hover:from-comic-red hover:to-anime-pink transition-all duration-300 ease-in-out
                                        active:scale-95 shadow-lg border-b-4 border-gray-900"
                        >
                            Next: Review Order
                        </button>
                    </div>
                </div>
            )}

            {/* --- Step 3: Order Review & Place Order --- */}
            {currentStep === 3 && (
                <div className="bg-gray-900 border-4 border-anime-blue rounded-xl p-8 shadow-comic-pop-lg max-w-2xl mx-auto">
                    <h2 className="text-3xl font-heading text-comic-yellow mb-6">Review Your Order</h2>

                    <div className="mb-8">
                        <h3 className="text-2xl font-heading text-anime-pink mb-4">Shipping Details:</h3>
                        <p className="text-gray-300 text-lg"><strong>Name:</strong> {shippingInfo.fullName}</p>
                        <p className="text-gray-300 text-lg"><strong>Address:</strong> {shippingInfo.addressLine1}{shippingInfo.addressLine2 && `, ${shippingInfo.addressLine2}`}</p>
                        <p className="text-gray-300 text-lg">{shippingInfo.city}, {shippingInfo.state} {shippingInfo.postalCode}</p>
                        <p className="text-gray-300 text-lg">{shippingInfo.country}</p>
                        <p className="text-gray-300 text-lg"><strong>Phone:</strong> {shippingInfo.phone}</p>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-2xl font-heading text-anime-pink mb-4">Payment Method:</h3>
                        <p className="text-gray-300 text-lg"><strong>Method:</strong> {paymentMethod === 'creditCard' ? 'Credit Card' : paymentMethod === 'paypal' ? 'PayPal' : paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod === 'mpesa' ? 'M-Pesa' : 'Not selected'}</p>
                        {paymentMethod === 'creditCard' && paymentDetails.cardNumber && (
                            <p className="text-gray-300 text-lg"><strong>Card ending in:</strong> {paymentDetails.cardNumber.slice(-4)}</p>
                        )}
                        {/* NEW: Display M-Pesa Phone Number in review */}
                        {paymentMethod === 'mpesa' && mpesaPhoneNumber && (
                            <p className="text-gray-300 text-lg"><strong>M-Pesa Number:</strong> {mpesaPhoneNumber}</p>
                        )}
                    </div>

                    <div className="mb-8">
                        <h3 className="text-2xl font-heading text-anime-pink mb-4">Order Items:</h3>
                        {cartItems.length === 0 ? (
                            <p className="text-gray-400">Your cart is empty.</p>
                        ) : (
                            <ul className="space-y-2">
                                {cartItems.map(item => (
                                    <li key={item._id} className="flex justify-between items-center text-gray-300 text-lg border-b border-gray-700 pb-2 last:border-b-0">
                                        <span>{item.title} x {item.quantity}</span>
                                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                                    </li>
                                ))}
                                <li className="flex justify-between items-center text-comic-yellow text-xl font-bold pt-4">
                                    <span>Total:</span>
                                    <span>${totalPrice.toFixed(2)}</span>
                                </li>
                            </ul>
                        )}
                    </div>

                    <div className="flex justify-between mt-8">
                        <button
                            type="button"
                            onClick={handlePreviousStep}
                            className="bg-gray-700 text-white font-bold py-3 px-6 rounded-lg
                                        text-xl hover:bg-gray-600 transition-colors duration-200
                                        active:scale-95 shadow-lg border-b-4 border-gray-800"
                        >
                            Previous
                        </button>
                        {/* Conditional rendering for Place Order button / PayPal buttons */}
                        {paymentMethod === 'paypal' ? (
                            // For PayPal, the buttons are rendered by the SDK in the container
                            <div id="paypal-button-container-review" className="w-full max-w-xs mx-auto">
                                {/* The SDK will place buttons here */}
                            </div>
                        ) : (
                            // For other methods, show the regular Place Order button
                            <button
                                type="button"
                                onClick={handlePlaceOrder}
                                className="bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold py-3 px-6 rounded-lg
                                            text-xl hover:from-green-600 hover:to-teal-700 transition-all duration-300 ease-in-out
                                            active:scale-95 shadow-lg border-b-4 border-gray-900"
                            >
                                Place Order
                            </button>
                        )}
                    </div>
                </div>
            )}
            {/* NEW: PayPal SDK Script */}
            <Script
                src={`https://www.paypal.com/sdk/js?client-id=ATGUGBOZtMF0SSKjhmPhXe723Suw_wM0uFTcQ120ABB2k3zTDTFkus9x_WA17DKX2KJWy2ehln5QwoHN&currency=USD`} 
                strategy="afterInteractive" // Load after the page is interactive
            />
        </div>
    );
};

export default CheckoutPage;