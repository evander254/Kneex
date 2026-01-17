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
    const [similarProducts, setSimilarProducts] = useState([]);
    const [showShareMenu, setShowShareMenu] = useState(false);

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

            // Fetch similar products
            const { data: similarData } = await supabase
                .from('products')
                .select('*')
                .neq('id', id)
                .limit(4);

            if (similarData) {
                setSimilarProducts(similarData);
            }
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-16">
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

                        <button
                            onClick={() => {
                                // Try native share first
                                if (navigator.share) {
                                    navigator.share({
                                        title: product.name,
                                        text: `Check out ${product.name} on Kneex!`,
                                        url: window.location.href,
                                    })
                                        .catch((err) => {
                                            console.log('Error sharing via native api', err);
                                            // Fallback to menu if user cancelled or failed
                                            // setShowShareMenu(!showShareMenu); // Optional: decide if we show menu on cancel. usually not needed if cancelled.
                                        });
                                } else {
                                    // Fallback for desktop/unsupported
                                    setShowShareMenu(!showShareMenu);
                                }
                            }}
                            className="w-full py-3 border-2 border-purple text-purple rounded-xl font-bold text-lg hover:bg-purple hover:text-white transition-all duration-200 flex items-center justify-center gap-3"
                        >
                            <i className="fas fa-share-alt"></i>
                            Share Product
                        </button>

                        {/* Social Share Menu Fallback */}
                        {showShareMenu && (
                            <div className="grid grid-cols-4 gap-2 p-4 bg-gray-50 rounded-xl border border-gray-100 animate-fade-in">
                                <a
                                    href={`https://wa.me/?text=${encodeURIComponent(`Check out ${product.name} on Kneex! ${window.location.href}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-col items-center gap-1 text-green-500 hover:opacity-80 transition"
                                >
                                    <div className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-xl">
                                        <i className="fab fa-whatsapp"></i>
                                    </div>
                                    <span className="text-xs font-medium text-gray-600">WhatsApp</span>
                                </a>
                                <a
                                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-col items-center gap-1 text-blue-600 hover:opacity-80 transition"
                                >
                                    <div className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-xl">
                                        <i className="fab fa-facebook-f"></i>
                                    </div>
                                    <span className="text-xs font-medium text-gray-600">Facebook</span>
                                </a>
                                <a
                                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${product.name} on Kneex!`)}&url=${encodeURIComponent(window.location.href)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-col items-center gap-1 text-black hover:opacity-80 transition"
                                >
                                    <div className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-xl">
                                        <i className="fab fa-x-twitter"></i>
                                    </div>
                                    <span className="text-xs font-medium text-gray-600">X</span>
                                </a>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(window.location.href);
                                        alert('Link copied to clipboard!');
                                        setShowShareMenu(false);
                                    }}
                                    className="flex flex-col items-center gap-1 text-gray-600 hover:opacity-80 transition"
                                >
                                    <div className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-xl">
                                        <i className="fas fa-link"></i>
                                    </div>
                                    <span className="text-xs font-medium text-gray-600">Copy</span>
                                </button>
                            </div>
                        )}

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

            {/* Similar Products */}
            {similarProducts.length > 0 && (
                <div className="mt-16 pt-8 border-t border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">You May Also Like</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                        {similarProducts.map((simProduct) => (
                            <Link
                                to={`/product/${simProduct.id}`}
                                key={simProduct.id}
                                className="bg-white/70 backdrop-blur rounded-lg shadow hover:-translate-y-1 transition block"
                                onClick={() => {
                                    // Scroll to top when clicking a similar product since it's the same page route
                                    window.scrollTo(0, 0);
                                }}
                            >
                                <img
                                    loading="lazy"
                                    className="h-40 w-full object-cover rounded-t-lg"
                                    src={simProduct.image_url || 'https://via.placeholder.com/300'}
                                    alt={simProduct.name}
                                />
                                <div className="p-4">
                                    <p className="text-sm font-medium text-gray-800 truncate">{simProduct.name}</p>
                                    <span className="text-purple font-bold block mt-1">
                                        Ksh {simProduct.price?.toLocaleString()}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
};

export default ProductDetails;
