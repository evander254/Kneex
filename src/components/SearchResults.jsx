import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useCart } from '../context/CartContext';
import { trackEvent } from '../utils/analytics';

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSearchResults = async () => {
            setLoading(true);
            try {
                // Search in name or description
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
                    .gt('stock_quantity', 0); // Optional: only show available items

                if (error) throw error;
                setProducts(data || []);

                // Track search result count
                if (query) {
                    trackEvent('search_results_view', { query, count: data?.length || 0 });
                }
            } catch (error) {
                console.error('Error fetching search results:', error);
            } finally {
                setLoading(false);
            }
        };

        if (query) {
            fetchSearchResults();
        } else {
            setProducts([]);
            setLoading(false);
        }
    }, [query]);

    const handleProductClick = (id) => {
        trackEvent('product_click', { productId: id });
        navigate(`/product/${id}`);
    };

    const handleAddToCart = (e, product) => {
        e.stopPropagation();
        addToCart(product);
    };

    return (
        <section className="max-w-7xl mx-auto px-4 py-8 min-h-[60vh]">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                    Search Results for <span className="text-pink">"{query}"</span>
                </h1>
                <span className="text-gray-500">{products.length} results found</span>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <p className="text-gray-500 text-lg">Searching...</p>
                </div>
            ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-60 text-center">
                    <div className="text-6xl text-gray-200 mb-4">
                        <i className="fas fa-search"></i>
                    </div>
                    <p className="text-xl text-gray-500 mb-4">No results found for "{query}"</p>
                    <p className="text-gray-400">Try checking your spelling or using different keywords.</p>
                    <Link to="/" className="mt-6 px-6 py-2 bg-gradient-to-r from-pink to-purple text-white rounded-lg hover:opacity-90 transition">
                        Browse All Products
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            onClick={() => handleProductClick(product.id)}
                            className="bg-white/70 backdrop-blur rounded-lg shadow hover:-translate-y-1 transition cursor-pointer"
                        >
                            <img
                                loading="lazy"
                                className="h-44 w-full object-cover rounded-t-lg"
                                src={product.image_url || 'https://via.placeholder.com/300'}
                                alt={product.name}
                            />
                            <div className="p-4">
                                <p className="text-sm font-medium truncate">{product.name}</p>
                                <span className="text-purple font-bold block">
                                    Ksh {product.price?.toLocaleString()}
                                </span>
                                <button
                                    onClick={(e) => handleAddToCart(e, product)}
                                    className="mt-3 w-full py-2 bg-gradient-to-r from-pink to-purple text-white rounded hover:opacity-90 transition"
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};

export default SearchResults;
