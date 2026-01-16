import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState(() => {
        const localData = localStorage.getItem('kneex_cart');
        return localData ? JSON.parse(localData) : [];
    });

    // Sync with Supabase when user logs in
    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            // Load from local storage if guest
            const localData = localStorage.getItem('kneex_cart');
            if (localData) setCartItems(JSON.parse(localData));
        }
    }, [user]);

    // Persist to local storage for guests
    useEffect(() => {
        if (!user) {
            localStorage.setItem('kneex_cart', JSON.stringify(cartItems));
        }
    }, [cartItems, user]);

    const fetchCart = async () => {
        try {
            const { data, error } = await supabase
                .from('cart_items')
                .select('*, product:products(*)')
                .eq('user_id', user.id);

            if (error) throw error;

            // Format data to match internal structure
            const formattedItems = data.map(item => ({
                ...item.product,
                cart_item_id: item.id,
                quantity: item.quantity
            }));
            setCartItems(formattedItems);
        } catch (error) {
            console.error('Error fetching cart:', error);
        }
    };

    const addToCart = async (product) => {
        // Optimistic update
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === product.id);
            if (existingItem) {
                return prevItems.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prevItems, { ...product, quantity: 1 }];
        });

        if (user) {
            try {
                // Check if item exists in DB
                const { data: existingItems } = await supabase
                    .from('cart_items')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('product_id', product.id)
                    .single();

                if (existingItems) {
                    await supabase
                        .from('cart_items')
                        .update({ quantity: existingItems.quantity + 1 })
                        .eq('id', existingItems.id);
                } else {
                    await supabase
                        .from('cart_items')
                        .insert([{
                            user_id: user.id,
                            product_id: product.id,
                            quantity: 1
                        }]);
                }
            } catch (error) {
                console.error("Error syncing add to cart:", error);
                // Revert optimistic update if needed (omitted for brevity)
            }
        }
    };

    const removeFromCart = async (productId) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
        if (user) {
            try {
                await supabase
                    .from('cart_items')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('product_id', productId);
            } catch (error) {
                console.error("Error removing from cart:", error);
            }
        }
    };

    const updateQuantity = async (productId, quantity) => {
        if (quantity < 1) {
            removeFromCart(productId);
            return;
        }

        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === productId ? { ...item, quantity } : item
            )
        );

        if (user) {
            try {
                await supabase
                    .from('cart_items')
                    .update({ quantity })
                    .eq('user_id', user.id)
                    .eq('product_id', productId);
            } catch (error) {
                console.error("Error updating quantity:", error);
            }
        }
    };

    const clearCart = async () => {
        setCartItems([]);
        if (user) {
            try {
                await supabase
                    .from('cart_items')
                    .delete()
                    .eq('user_id', user.id);
            } catch (error) {
                console.error("Error clearing cart:", error);
            }
        }
    };

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartCount,
            cartTotal
        }}>
            {children}
        </CartContext.Provider>
    );
};
