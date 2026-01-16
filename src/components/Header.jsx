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
        trackEvent('product_click', { productId: id });
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
            <div className="max-w-7xl mx-auto px-2 md:px-4 py-3 md:py-4 flex items-center gap-1 md:gap-4 justify-between">

                {/* Mobile menu button */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden text-white text-lg md:text-xl shrink-0"
                >
                    <i className="fas fa-bars"></i>
                </button>

                {/* Logo */}
                <div
                    onClick={() => navigate('/')}
                    className="text-lg md:text-2xl font-bold bg-gradient-to-r from-pink to-purple bg-clip-text text-transparent shrink-0 cursor-pointer"
                >
                    KNEEX
                </div>

                {/* Search Bar - Visible on Mobile now */}
                <div className="flex-1 flex items-center max-w-xl mx-1 md:mx-2 relative min-w-0" ref={searchRef}>
                    <input
                        className="w-full px-2 py-1 md:px-3 md:py-2 rounded-l-md outline-none border-2 border-white bg-white/90 focus:bg-white text-greyDark text-xs md:text-base placeholder-gray-500 min-w-0"
                        placeholder="Search..."
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
                        className="px-2 py-1 md:px-4 md:py-2 bg-gradient-to-r from-pink to-purple text-white rounded-r-md border-y-2 border-r-2 border-transparent shrink-0"
                    >
                        <i className="fas fa-search text-xs md:text-base"></i>
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
                                                className="w-8 h-8 md:w-10 md:h-10 object-cover rounded"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs md:text-sm font-medium text-greyDark truncate">{product.name}</p>
                                                <p className="text-[10px] md:text-xs text-pink font-bold">Ksh {product.price?.toLocaleString()}</p>
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

                {/* Right Icons */}
                <div className="flex gap-2 md:gap-4 text-white items-center shrink-0">
                    <div className="relative" ref={userMenuRef}>
                        <i
                            className="fas fa-user cursor-pointer hover:text-pink transition text-base md:text-xl"
                            onClick={handleUserIconClick}
                        ></i>
                        {showUserDropdown && user && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 text-greyDark border border-gray-100">
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
                        <i className="fas fa-cart-shopping text-base md:text-xl"></i>
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
