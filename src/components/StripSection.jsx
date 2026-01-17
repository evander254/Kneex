import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { trackEvent } from '../utils/analytics';
import { useNavigate } from 'react-router-dom';

const StripSection = () => {
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTrending();
    }, []);

    const fetchTrending = async () => {
        try {
            // Fetch trending products based on click_count from product_analytics
            // We join with products table
            const { data, error } = await supabase
                .from('product_analytics')
                .select(`
                    click_count,
                    search_count,
                    products (
                        id,
                        name,
                        price,
                        image_url
                    )
                `)
                .order('click_count', { ascending: false })
                .limit(20); // Fetch top 20 by clicks first to get a candidate pool

            if (error) throw error;

            // Transform and Sort by (click_count + search_count)
            const formattedProducts = data
                .map(item => ({
                    ...item.products,
                    total_score: (item.click_count || 0) + (item.search_count || 0)
                }))
                .filter(product => product.id)
                .sort((a, b) => b.total_score - a.total_score)
                .slice(0, 10); // Take top 10 after combined sort


            if (formattedProducts.length > 0) {
                setProducts(formattedProducts);
            } else {
                // Fallback to latest products if no analytics data yet
                fetchFallbackProducts();
            }
        } catch (error) {
            console.error('Error fetching trending:', error);
            fetchFallbackProducts();
        }
    };

    const fetchFallbackProducts = async () => {
        const { data } = await supabase
            .from('products')
            .select('id, name, price, image_url')
            .order('created_at', { ascending: false })
            .limit(10);

        if (data) setProducts(data);
    };

    const handleProductClick = (product) => {
        trackEvent('product_click', { productId: product.id });
        navigate(`/product/${product.id}`);
    };

    return (
        <section className="bg-white/70 backdrop-blur-lg rounded-xl overflow-hidden shadow mb-6">
            <div className="flex justify-between items-center px-5 py-3 border-b border-gray-100 pb-2">
                <h3 className="text-lg font-semibold text-greyDark">Trending This Week</h3>
                {/* Could link to a full trending page if implemented */}
                <span className="text-sm text-pink font-medium cursor-pointer uppercase hover:text-purple transition-colors">See All</span>
            </div>

            {products.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">Loading trending items...</div>
            ) : (
                <div className="flex overflow-x-auto gap-4 p-4 snap-x no-scrollbar">
                    {products.map((product, index) => (
                        <div
                            key={product.id || index}
                            onClick={() => handleProductClick(product)}
                            className="min-w-[130px] md:min-w-[200px] flex-shrink-0 flex flex-col hover:shadow-md transition-shadow rounded-md overflow-hidden bg-white p-2 border border-gray-100 snap-start cursor-pointer"
                        >
                            <img
                                loading="lazy"
                                src={product.image_url || 'https://via.placeholder.com/300'}
                                alt={product.name}
                                className="w-full h-28 md:h-40 object-cover rounded-md mb-2"
                            />
                            <div className="flex flex-col">
                                <p title={product.name} className="text-sm text-greyDark truncate mb-1">{product.name}</p>
                                <span className="text-base font-bold text-greyDark">
                                    Ksh {typeof product.price === 'number' ? product.price.toLocaleString() : product.price}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};

export default StripSection;
