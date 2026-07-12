import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, MapPin, LogIn, ArrowLeft, CheckCircle, Wallet, Banknote, Store } from 'lucide-react';

const Checkout = () => {
    const navigate = useNavigate();

    // --- STATE MANAGEMENT ---
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    const [userData, setUserData] = useState(null);

    const [deliveryOption, setDeliveryOption] = useState("homeDelivery"); // homeDelivery | selfPickup
    const [paymentMethod, setPaymentMethod] = useState("cod"); // cod | upi | card

    const [addressData, setAddressData] = useState({
        fullAddress: '',
        city: '',
        pincode: '',
        phone: '',
    });

    const [cardData, setCardData] = useState({
        cardNumber: '',
        expiry: '',
        cvv: '',
    });

    const [upiId, setUpiId] = useState('');
    const [cartItems, setCartItems] = useState([]);
    const [subTotal, setSubTotal] = useState(0);
    const [kitchenContext, setKitchenContext] = useState(null);

    // --- CHECK AUTH & FETCH USER DATA ---
    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');

        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUserData(parsedUser);
                setAddressData((prev) => ({ ...prev, phone: parsedUser.phone || '' }));
                setIsLoggedIn(true);
            } catch (error) {
                localStorage.removeItem('currentUser');
                setIsLoggedIn(false);
            }
        } else {
            setIsLoggedIn(false);
        }

        try {
            const savedCart = localStorage.getItem('homefeastCart');
            if (savedCart) {
                const parsedCart = JSON.parse(savedCart);
                const normalizedCart = Array.isArray(parsedCart)
                    ? parsedCart.filter((item) => item?.id && Number(item.qty) > 0).map((item) => ({
                        ...item,
                        price: Number(item.price) || 0,
                        qty: Number(item.qty) || 0,
                    }))
                    : [];
                setCartItems(normalizedCart);
                setSubTotal(normalizedCart.reduce((total, item) => total + item.price * item.qty, 0));
            } else {
                setCartItems([]);
                setSubTotal(0);
            }

            const savedKitchenContext = localStorage.getItem('homefeastCheckoutContext');
            if (savedKitchenContext) {
                try {
                    setKitchenContext(JSON.parse(savedKitchenContext));
                } catch (error) {
                    console.error('Failed to parse saved kitchen context', error);
                }
            }
        } catch (error) {
            console.error('Failed to load checkout cart summary', error);
            setCartItems([]);
            setSubTotal(0);
        }

        setIsLoadingAuth(false);
    }, []);

    // --- HANDLERS ---
    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setAddressData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCardChange = (e) => {
        const { name, value } = e.target;
        setCardData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmitOrder = async (e) => {
        e.preventDefault();

        if (cartItems.length === 0) {
            alert("Your basket is empty. Add dishes before checking out.");
            return;
        }

        // Validation: If home delivery, address is required
        if (deliveryOption === 'homeDelivery' && (!addressData.fullAddress || !addressData.phone)) {
            alert("Please provide a valid delivery address and phone number.");
            return;
        }

        // Validation: If card, card details are required
        if (paymentMethod === 'card' && (!cardData.cardNumber || !cardData.cvv)) {
            alert("Please provide card details.");
            return;
        }

        // Validation: If upi, upi id is required
        if (paymentMethod === 'upi' && !upiId) {
            alert("Please provide a valid UPI ID.");
            return;
        }

        const deliveryFee = deliveryOption === 'selfPickup' ? 0 : 40;
        const totalAmount = subTotal + deliveryFee;

        const orderPayload = {
            userEmail: userData?.email || '',
            userName: userData?.name || 'Guest',
            customerPhone: addressData.phone,
            vendorId: kitchenContext?.kitchenId || '',
            vendorName: kitchenContext?.kitchenName || '',
            deliveryOption,
            paymentMethod,
            cartItems,
            subtotal: subTotal,
            deliveryFee,
            deliveryAddress: deliveryOption === 'homeDelivery' ? addressData : null,
            pickupLocation: deliveryOption === 'selfPickup' ? (kitchenContext?.serviceArea || userData?.serviceArea || 'Kitchen pickup location will be shared after confirmation') : null,
            cardDetails: paymentMethod === 'card' ? cardData : null,
            upiId: paymentMethod === 'upi' ? upiId : null,
            totalAmount,
            status: 'Placed',
        };

        try {
            const response = await fetch('http://localhost:5000/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderPayload),
            });

            const data = await response.json().catch(() => ({}));

            if (response.ok) {
                localStorage.removeItem('homefeastCart');
                alert(data.message || 'Order placed successfully!');
                navigate('/');
            } else {
                alert(data.message || 'Failed to place order.');
            }
        } catch (error) {
            alert('Network error. Please try again.');
        }
    };

    // --- UI RENDERING ---

    if (isLoadingAuth) {
        return <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium">Loading checkout details...</div>;
    }

    // VIEW 1: NOT LOGGED IN
    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full text-center">
                    <LogIn className="w-16 h-16 text-[#e05638] mx-auto mb-4" />
                    <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Please Login First</h2>
                    <p className="text-gray-500 mb-8 text-sm">You need to be logged in to proceed to checkout and place an order.</p>

                    <a
                        href="/userLogin"
                        className="w-full bg-[#e05638] text-white font-bold py-3.5 px-4 rounded-lg shadow-md hover:bg-[#c9462a] transition-all duration-150 flex items-center justify-center space-x-2 text-sm uppercase tracking-wider"
                    >
                        <LogIn size={18} />
                        <span>Go to Login / Sign Up</span>
                    </a>
                </div>
            </div>
        );
    }
if(isLoggedIn){
    // VIEW 2: LOGGED IN - CHECKOUT FORM
    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 font-sans">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8">

                {/* LEFT COLUMN: FORMS */}
                <div className="flex-1">
                    <a href="/cart" className="flex items-center text-sm text-gray-500 hover:text-gray-800 mb-6 transition">
                        <ArrowLeft size={16} className="mr-1" /> Back to Cart
                    </a>

                    <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Checkout</h1>

                    {/* User Greeting */}
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm mb-6 flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-lg">
                            {userData?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <p className="font-bold text-gray-800">Welcome back, {userData?.name || 'User'}!</p>
                            <p className="text-xs text-gray-500">{userData?.email}</p>
                        </div>
                    </div>

                    <form id="checkout-form" onSubmit={handleSubmitOrder} className="space-y-6">

                        {/* SECTION 1: DELIVERY OPTION */}
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Truck size={20} className="text-[#e05638]" /> Delivery Option
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setDeliveryOption("homeDelivery")}
                                    className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition ${deliveryOption === 'homeDelivery' ? 'border-[#22c55e] bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <Truck size={24} className={deliveryOption === 'homeDelivery' ? 'text-[#22c55e]' : 'text-gray-400'} />
                                    <span className={`text-sm font-bold ${deliveryOption === 'homeDelivery' ? 'text-[#22c55e]' : 'text-gray-600'}`}>Home Delivery</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDeliveryOption("selfPickup")}
                                    className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition ${deliveryOption === 'selfPickup' ? 'border-[#22c55e] bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <Store size={24} className={deliveryOption === 'selfPickup' ? 'text-[#22c55e]' : 'text-gray-400'} />
                                    <span className={`text-sm font-bold ${deliveryOption === 'selfPickup' ? 'text-[#22c55e]' : 'text-gray-600'}`}>Self Pickup</span>
                                </button>
                            </div>
                        </div>

                        {/* SECTION 2: ADDRESS (Conditional) */}
                        {deliveryOption === 'homeDelivery' && (
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <MapPin size={20} className="text-[#e05638]" /> Delivery Address
                                </h3>
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        name="fullAddress"
                                        required
                                        value={addressData.fullAddress}
                                        onChange={handleAddressChange}
                                        placeholder="Full Street Address / Flat No."
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-[#22c55e] focus:ring-2 focus:ring-green-100 transition text-sm"
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            name="city"
                                            required
                                            value={addressData.city}
                                            onChange={handleAddressChange}
                                            placeholder="City"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-[#22c55e] focus:ring-2 focus:ring-green-100 transition text-sm"
                                        />
                                        <input
                                            type="text"
                                            name="pincode"
                                            required
                                            value={addressData.pincode}
                                            onChange={handleAddressChange}
                                            placeholder="Pincode"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-[#22c55e] focus:ring-2 focus:ring-green-100 transition text-sm"
                                        />
                                    </div>
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        value={addressData.phone}
                                        onChange={handleAddressChange}
                                        placeholder="Contact Number"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-[#22c55e] focus:ring-2 focus:ring-green-100 transition text-sm"
                                    />
                                </div>
                            </div>
                        )}

                        {/* SECTION 2B: KITCHEN LOCATION INFO (Conditional) */}
                        {deliveryOption === 'selfPickup' && (
                            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 shadow-sm">
                                <h3 className="text-md font-bold text-blue-800 mb-2 flex items-center gap-2">
                                    <Store size={18} /> Kitchen Pickup Location
                                </h3>
                                <p className="text-sm text-blue-600 mb-2">
                                    Your order will be prepared at the kitchen. Please go to the following address to pick up your food once ready.
                                </p>
                                {/* This would ideally come from the kitchen's DB data. Hardcoded as example */}
                                <div className="bg-white p-3 rounded-lg border border-blue-200 text-sm text-gray-800 font-medium">
                                    <p>Kitchen: {kitchenContext?.kitchenName || userData?.kitchenName || 'Your Kitchen'}</p>
                                    <p>Address: {kitchenContext?.serviceArea || userData?.serviceArea || 'Location will be shared after confirmation'}</p>
                                </div>
                            </div>
                        )}

                        {/* SECTION 3: PAYMENT METHOD */}
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <CreditCard size={20} className="text-[#e05638]" /> Payment Method
                            </h3>

                            <div className="space-y-3 mb-6">
                                {/* COD Option */}
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('cod')}
                                    className={`w-full p-4 border-2 rounded-xl flex items-center gap-4 transition ${paymentMethod === 'cod' ? 'border-[#22c55e] bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <Banknote size={24} className={paymentMethod === 'cod' ? 'text-[#22c55e]' : 'text-gray-400'} />
                                    <span className={`text-sm font-bold ${paymentMethod === 'cod' ? 'text-[#22c55e]' : 'text-gray-600'}`}>Cash on Delivery</span>
                                </button>

                                {/* UPI Option */}
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('upi')}
                                    className={`w-full p-4 border-2 rounded-xl flex items-center gap-4 transition ${paymentMethod === 'upi' ? 'border-[#22c55e] bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <Wallet size={24} className={paymentMethod === 'upi' ? 'text-[#22c55e]' : 'text-gray-400'} />
                                    <span className={`text-sm font-bold ${paymentMethod === 'upi' ? 'text-[#22c55e]' : 'text-gray-600'}`}>UPI Payment</span>
                                </button>

                                {/* Card Option */}
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('card')}
                                    className={`w-full p-4 border-2 rounded-xl flex items-center gap-4 transition ${paymentMethod === 'card' ? 'border-[#22c55e] bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <CreditCard size={24} className={paymentMethod === 'card' ? 'text-[#22c55e]' : 'text-gray-400'} />
                                    <span className={`text-sm font-bold ${paymentMethod === 'card' ? 'text-[#22c55e]' : 'text-gray-600'}`}>Credit / Debit Card</span>
                                </button>
                            </div>

                            {/* Conditional Payment Inputs */}
                            {paymentMethod === 'upi' && (
                                <input
                                    type="text"
                                    value={upiId}
                                    onChange={(e) => setUpiId(e.target.value)}
                                    placeholder="Enter UPI ID (e.g., name@upi)"
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-[#22c55e] focus:ring-2 focus:ring-green-100 transition text-sm"
                                />
                            )}

                            {paymentMethod === 'card' && (
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        name="cardNumber"
                                        value={cardData.cardNumber}
                                        onChange={handleCardChange}
                                        placeholder="Card Number"
                                        required
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-[#22c55e] focus:ring-2 focus:ring-green-100 transition text-sm"
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            name="expiry"
                                            value={cardData.expiry}
                                            onChange={handleCardChange}
                                            placeholder="MM/YY"
                                            required
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-[#22c55e] focus:ring-2 focus:ring-green-100 transition text-sm"
                                        />
                                        <input
                                            type="text"
                                            name="cvv"
                                            value={cardData.cvv}
                                            onChange={handleCardChange}
                                            placeholder="CVV"
                                            required
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-[#22c55e] focus:ring-2 focus:ring-green-100 transition text-sm"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Submit button for mobile view (Desktop is in right column) */}
                        <button
                            type="submit"
                            className="w-full md:hidden bg-[#22c55e] text-white font-bold py-4 px-4 rounded-xl shadow-lg hover:bg-green-600 transition-all text-sm uppercase tracking-wider"
                        >
                            Place Order
                        </button>

                    </form>
                </div>

                {/* RIGHT COLUMN: ORDER SUMMARY (Sticky on Desktop) */}
                <div className="hidden md:block w-96">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm sticky top-8">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h3>

                        <div className="space-y-3 text-sm mb-6">
                            {cartItems.length === 0 ? (
                                <p className="text-sm text-gray-500">Your basket is empty.</p>
                            ) : (
                                cartItems.map((item) => (
                                    <div key={item.id} className="flex justify-between text-gray-600">
                                        <span>{item.qty}x {item.name}</span>
                                        <span>₹{item.price * item.qty}</span>
                                    </div>
                                ))
                            )}
                            <div className="border-t border-gray-100 pt-3 flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>₹{subTotal}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Delivery Fee</span>
                                <span className={deliveryOption === 'selfPickup' ? 'line-through text-gray-400' : ''}>
                                    ₹{deliveryOption === 'selfPickup' ? 0 : 40}
                                </span>
                            </div>
                            {deliveryOption === 'selfPickup' && (
                                <div className="flex justify-between text-green-600 font-medium">
                                    <span>Pickup Discount</span>
                                    <span>- ₹40</span>
                                </div>
                            )}
                            <div className="border-t border-gray-200 pt-3 flex justify-between font-extrabold text-gray-900 text-base">
                                <span>Total</span>
                                <span>₹{subTotal + (deliveryOption === 'selfPickup' ? 0 : 40)}</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            form="checkout-form"
                            onClick={handleSubmitOrder}
                            className="w-full bg-[#22c55e] text-white font-bold py-4 px-4 rounded-xl shadow-lg hover:bg-green-600 transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2"
                        >
                            <CheckCircle size={18} />
                            Place Order
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};
}

export default Checkout;
