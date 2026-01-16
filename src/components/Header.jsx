import React, { useState, useEffect, useRef } from 'react';
import { trackEvent } from '../utils/analytics';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const Header = ({ onMenuClick, onCartClick }) => {
    const { cartCount } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const searchRef = useRef(null);
    const userMenuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query.trim()) {
                setResults([]);
                return;
            }
            setIsSearching(true);
            // Throttle search tracking? Or maybe just track on submit/explicit action? 
            // Requirement says "Search submit", which implies an explicit action.
            // However, this is instant search. Let's track when results are populated if we want "search"
            // OR better, track when they ACTUALLY type something substantial or we could just leave it for now
            // and track only if there was a "Submit" button but there isn't one that does a full page search.
            // Let's assume we want to track what they typed if they stop typing for a bit?
            // Actually requirement says "Search submit". This UI has a search button. Let's track that.

            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('id, name, image_url, price')
                    .ilike('name', `%${query}%`)
                    .limit(5);

                if (error) throw error;
                setResults(data || []);
            } catch (error) {
                console.error('Error searching products:', error);
            } finally {
                setIsSearching(false);
            }
        };

        const timeoutId = setTimeout(fetchResults, 300);
        return () => clearTimeout(timeoutId);
    }, [query]);

    const handleProductClick = (id) => {
        trackEvent('product_click', { productId: id }); // Track click from search results
        navigate(`/product/${id}`);
        setShowResults(false);
        setQuery('');
    };

    const handleUserIconClick = () => {
        if (user) {
            setShowUserDropdown(!showUserDropdown);
        } else {
            navigate('/login');
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setShowUserDropdown(false);
        navigate('/');
    };

    return (
        <header className="sticky top-0 z-50 backdrop-blur-md bg-greyDark/80 border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">

                {/* Mobile menu button */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden text-white text-xl shrink-0"
                >
                    <i className="fas fa-bars"></i>
                </button>

                <div
                    onClick={() => navigate('/')}
                    className="text-2xl font-bold bg-gradient-to-r from-pink to-purple bg-clip-text text-transparent shrink-0 cursor-pointer"
                >
                    KNEEX
                </div>

                <div className="flex-1 flex min-w-0 relative" ref={searchRef}>
                    <input
                        className="w-full px-4 py-2 rounded-l-md outline-none min-w-0 border border-white bg-white/10 text-white placeholder-gray-400 focus:bg-white/20 transition"
                        placeholder="Search products..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setShowResults(true);
                        }}
                        onFocus={() => setShowResults(true)}
                    />
                    <button
                        onClick={() => {
                            if (query) trackEvent('search', { searchQuery: query });
                        }}
                        className="px-4 bg-gradient-to-r from-pink to-purple text-white rounded-r-md shrink-0">
                        <i className="fas fa-search"></i>
                    </button>

                    {/* Search Results Dropdown */}
                    {showResults && (query.length > 0) && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-md shadow-lg overflow-hidden z-50">
                            {isSearching ? (
                                <div className="p-4 text-center text-gray-500 text-sm">Searching...</div>
                            ) : results.length > 0 ? (
                                <ul>
                                    {results.map((product) => (
                                        <li
                                            key={product.id}
                                            onClick={() => handleProductClick(product.id)}
                                            className="flex items-center gap-3 p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0 border-gray-100"
                                        >
                                            <img
                                                src={product.image_url || 'https://via.placeholder.com/50'}
                                                alt={product.name}
                                                className="w-10 h-10 object-cover rounded"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-greyDark truncate">{product.name}</p>
                                                <p className="text-xs text-pink font-bold">Ksh {product.price?.toLocaleString()}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="p-4 text-center text-gray-500 text-sm">No products found</div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex gap-4 text-white items-center shrink-0">
                    <div className="relative" ref={userMenuRef}>
                        <i
                            className="fas fa-user cursor-pointer hover:text-pink transition"
                            onClick={handleUserIconClick}
                        ></i>
                        {showUserDropdown && user && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 text-greyDark">
                                <div className="px-4 py-2 border-b border-gray-100">
                                    <p className="text-xs text-gray-500">Signed in as</p>
                                    <p className="text-sm font-bold truncate">{user.email}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                                >
                                    <i className="fas fa-sign-out-alt mr-2"></i>
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>

                    <div
                        onClick={onCartClick}
                        className="relative cursor-pointer hover:text-pink transition"
                    >
                        <i className="fas fa-cart-shopping"></i>
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-pink text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                {cartCount}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
