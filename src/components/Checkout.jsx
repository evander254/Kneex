import { useState, useEffect } from 'react'
import { trackEvent } from '../utils/analytics'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Checkout = () => {
    const { cartItems, cartTotal } = useCart()
    const { user } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [mpesaNumber, setMpesaNumber] = useState('')
    const [location, setLocation] = useState('')

    useEffect(() => {
        // Track checkout initiation when they land on this page
        if (cartItems.length > 0) {
            trackEvent('checkout', {
                cartTotal,
                itemCount: cartItems.length
            });
        }
    }, [])

    const handleCheckout = async (e) => {
        e.preventDefault()
        setLoading(true)

        // Simulate payment process
        setTimeout(() => {
            setLoading(false)
            alert('Order placed successfully! Please check your phone for the M-Pesa prompt.')
            navigate('/') // Redirect to home or order confirmation
        }, 2000)
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-greyDark mb-4">Your cart is empty</h2>
                    <button
                        onClick={() => navigate('/')}
                        className="text-pink hover:underline"
                    >
                        Go back to shopping
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Order Summary */}
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <h2 className="text-xl font-bold mb-6 text-greyDark border-b pb-4">Order Summary</h2>
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {cartItems.map((item) => (
                            <div key={item.id} className="flex gap-4">
                                <img
                                    src={item.image_url || 'https://via.placeholder.com/60'}
                                    alt={item.name}
                                    className="w-16 h-16 object-cover rounded-md"
                                />
                                <div className="flex-1">
                                    <h3 className="font-medium text-greyDark text-sm">{item.name}</h3>
                                    <div className="flex justify-between items-center mt-1">
                                        <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                                        <p className="text-pink font-bold text-sm">Ksh {(item.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="border-t mt-6 pt-4 flex justify-between items-center text-lg font-bold text-greyDark">
                        <span>Total</span>
                        <span>Ksh {cartTotal.toLocaleString()}</span>
                    </div>
                </div>

                {/* Checkout Form */}
                <div className="bg-white p-6 rounded-2xl shadow-lg h-fit">
                    <h2 className="text-xl font-bold mb-6 text-greyDark border-b pb-4">Checkout Details</h2>
                    <form onSubmit={handleCheckout} className="space-y-6">

                        {/* Contact Info (Read-only if logged in) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="w-full px-4 py-2 rounded-lg bg-gray-100 border border-gray-300 text-gray-500 cursor-not-allowed"
                                placeholder="Guest Checkout"
                            />
                        </div>

                        {/* M-Pesa Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">M-Pesa Phone Number</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">+254</span>
                                <input
                                    type="tel"
                                    required
                                    value={mpesaNumber}
                                    onChange={(e) => setMpesaNumber(e.target.value)}
                                    placeholder="712345678"
                                    className="w-full pl-12 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink focus:border-transparent outline-none transition"
                                    pattern="[0-9]{9}"
                                    title="Please enter a valid 9-digit phone number (e.g., 712345678)"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Enter your number without the leading 0</p>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Location</label>
                            <textarea
                                required
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                rows="3"
                                placeholder="Enter your detailed delivery address (e.g., Street, Building, Apartment No.)"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink focus:border-transparent outline-none transition resize-none"
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 rounded-lg text-white font-bold tracking-wide shadow-lg transition duration-200 transform hover:scale-[1.02] ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-pink to-purple hover:shadow-purple/50'
                                }`}
                        >
                            {loading ? 'Processing...' : `Pay Ksh ${cartTotal.toLocaleString()}`}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Checkout
