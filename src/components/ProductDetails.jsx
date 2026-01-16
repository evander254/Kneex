import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useCart } from '../context/CartContext';

const ProductDetails = () => {
    const { id } = useParams();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setProduct(data);
            setSelectedImage(data.image_url);
        } catch (error) {
            console.error('Error fetching product details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="text-xl text-gray-500">Loading details...</div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[50vh] gap-4">
                <div className="text-xl text-gray-500">Product not found.</div>
                <Link to="/" className="text-pink hover:text-purple font-medium">Back to Home</Link>
            </div>
        );
    }

    // Parse gallery if string or use directly if array (handling potential JSON variation)
    // Supabase often returns JSONB as object/array, but we stored stringified JSON in AddProduct? 
    // Let's check how we stored it. AddProduct.jsx: gallery: JSON.stringify(galleryUrls)
    // So it might come back as a string if the column type is text, or array if JSONB.
    let gallery = [];
    try {
        if (typeof product.gallery === 'string') {
            gallery = JSON.parse(product.gallery);
        } else if (Array.isArray(product.gallery)) {
            gallery = product.gallery;
        }
    } catch (e) {
        console.error("Error parsing gallery images", e);
    }

    // Add cover image to gallery list for selection
    const allImages = [product.image_url, ...gallery].filter(Boolean);

    return (
        <section className="max-w-7xl mx-auto px-4 py-8">
            <Link to="/" className="inline-flex items-center text-gray-500 hover:text-pink mb-6 transition">
                <i className="fas fa-arrow-left mr-2"></i> Back to Products
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                {/* Image Gallery */}
                <div className="space-y-4">
                    <div className="aspect-square bg-white rounded-2xl shadow-lg overflow-hidden flex items-center justify-center p-2">
                        <img
                            src={selectedImage || 'https://via.placeholder.com/600'}
                            alt={product.name}
                            className="w-full h-full object-contain"
                        />
                    </div>
                    {allImages.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {allImages.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(img)}
                                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${selectedImage === img ? 'border-pink' : 'border-transparent hover:border-gray-300'}`}
                                >
                                    <img src={img} alt={`View ${index}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="flex flex-col">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{product.name}</h1>
                    <div className="text-2xl font-bold bg-gradient-to-r from-pink to-purple bg-clip-text text-transparent mb-6">
                        Ksh {typeof product.price === 'number' ? product.price.toLocaleString() : product.price}
                    </div>

                    <div className="prose prose-sm md:prose-base text-gray-600 mb-8 max-w-none">
                        <p>{product.description}</p>
                    </div>

                    <div className="mt-auto space-y-4">
                        <button
                            onClick={() => addToCart(product)}
                            className="w-full py-4 bg-gradient-to-r from-pink to-purple text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3"
                        >
                            <i className="fas fa-shopping-cart"></i>
                            Add to Cart
                        </button>

                        <div className="flex items-center gap-4 text-sm text-gray-500 justify-center">
                            <span className="flex items-center gap-1">
                                <i className="fas fa-shield-alt text-green-500"></i> Secure Payment
                            </span>
                            <span className="flex items-center gap-1">
                                <i className="fas fa-truck text-blue-500"></i> Fast Delivery
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProductDetails;
