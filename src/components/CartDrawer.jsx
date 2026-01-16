import React, { useRef, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CartDrawer = ({ isOpen, onClose }) => {
    const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const drawerRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (drawerRef.current && !drawerRef.current.contains(event.target) && isOpen) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex justify-end bg-black/50 backdrop-blur-sm transition-opacity">
            <div
                ref={drawerRef}
                className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right"
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-greyDark text-white">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <i className="fas fa-shopping-cart text-pink"></i>
                        Your Cart
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
                            <i className="fas fa-shopping-basket text-4xl text-gray-300"></i>
                            <p>Your cart is empty</p>
                            <button
                                onClick={onClose}
                                className="text-pink font-semibold hover:underline"
                            >
                                Start Shopping
                            </button>
                        </div>
                    ) : (
                        cartItems.map((item) => (
                            <div key={item.id} className="flex gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <img
                                    src={item.image_url || 'https://via.placeholder.com/80'}
                                    alt={item.name}
                                    className="w-20 h-20 object-cover rounded-md"
                                />
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-medium text-greyDark line-clamp-1">{item.name}</h3>
                                        <p className="text-pink font-bold">Ksh {item.price?.toLocaleString()}</p>
                                    </div>

                                    <div className="flex justify-between items-center mt-2">
                                        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded px-2 py-1">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="text-gray-500 hover:text-pink transition text-xs"
                                            >
                                                <i className="fas fa-minus"></i>
                                            </button>
                                            <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="text-gray-500 hover:text-pink transition text-xs"
                                            >
                                                <i className="fas fa-plus"></i>
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-gray-400 hover:text-red-500 transition"
                                        >
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-600">Total</span>
                            <span className="text-2xl font-bold text-greyDark">Ksh {cartTotal.toLocaleString()}</span>
                        </div>

                        <div className="space-y-3">
                            <button
                                className="w-full py-3 bg-gradient-to-r from-pink to-purple text-white font-bold rounded-lg shadow-lg hover:opacity-90 transition transform active:scale-[0.98]"
                                onClick={() => {
                                    onClose();
                                    navigate('/checkout');
                                }}
                            >
                                Proceed to Checkout
                            </button>

                            {!user && (
                                <p className="text-xs text-center text-gray-500">
                                    <span
                                        onClick={() => {
                                            onClose();
                                            // Ideally open user login, for now maybe just alert or rely on admin login (tho that's for admin)
                                            alert("User login functionality needed!");
                                        }}
                                        className="text-pink cursor-pointer hover:underline"
                                    >
                                        Log in
                                    </span> to save your cart across devices.
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartDrawer;
