import React from 'react';
import { supabase } from '../supabaseClient';

import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ProductGrid = () => {
    const [products, setProducts] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const navigate = useNavigate();
    const { addToCart } = useCart();

    React.useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .gt('stock_quantity', 0)
                .is('is_clearance', false) // assuming we want regular products, maybe remove this filter if we want everything
                .order('created_at', { ascending: false })
                .limit(8);

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProductClick = (id) => {
        navigate(`/product/${id}`);
    };

    const handleAddToCart = (e, product) => {
        e.stopPropagation(); // Prevent navigating to details page
        addToCart(product);
    };

    return (
        <section>
            <h2 className="text-xl font-semibold mb-4">Available Products</h2>

            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <p className="text-gray-500">Loading products...</p>
                </div>
            ) : products.length === 0 ? (
                <div className="flex justify-center items-center h-40">
                    <p className="text-gray-500">No products available.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            onClick={() => handleProductClick(product.id)}
                            className="bg-white/70 backdrop-blur rounded-lg shadow hover:-translate-y-1 transition cursor-pointer group"
                        >
                            <img
                                loading="lazy"
                                className="h-32 md:h-44 w-full object-cover rounded-t-lg group-hover:opacity-90 transition"
                                src={product.image_url || 'https://via.placeholder.com/300'}
                                alt={product.name}
                            />
                            <div className="p-2 md:p-4">
                                <p className="text-xs md:text-sm font-medium truncate group-hover:text-pink transition">{product.name}</p>
                                <span className="text-purple font-bold block text-sm md:text-base">
                                    Ksh {product.price?.toLocaleString()}
                                </span>
                                <button
                                    onClick={(e) => handleAddToCart(e, product)}
                                    className="mt-2 md:mt-3 w-full py-1.5 md:py-2 bg-gradient-to-r from-pink to-purple text-white rounded text-xs md:text-sm hover:opacity-90 transition active:scale-95"
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

export default ProductGrid;
