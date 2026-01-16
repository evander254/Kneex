import { supabase } from '../supabaseClient';

const VISITOR_STORAGE_KEY = 'visitor_id';

/**
 * Get or create a visitor ID.
 * Persists in localStorage.
 * @returns {string} visitor_id
 */
export const getVisitorId = () => {
    let visitorId = localStorage.getItem(VISITOR_STORAGE_KEY);
    if (!visitorId) {
        visitorId = crypto.randomUUID();
        localStorage.setItem(VISITOR_STORAGE_KEY, visitorId);
    }
    return visitorId;
};

/**
 * Initialize analytics.
 * Checks for logged-in user and links visitor_id to profile.
 */
export const initAnalytics = async () => {
    const visitorId = getVisitorId();

    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();

    // Ensure visitor exists in DB (upsert)
    try {
        const { error } = await supabase
            .from('visitors')
            .upsert({
                id: visitorId,
                user_id: user ? user.id : null,
                user_agent: navigator.userAgent
            }, { onConflict: 'id' });

        if (error) throw error;
    } catch (err) {
        // Fail silently but log for debugging
        console.warn('Analytics init warning:', err);
    }
};

/**
 * Track a page view.
 * Returns a function to call when the page is exited (to update exited_at).
 * @param {string} pagePath 
 * @returns {Function} cleanup function for onExit
 */
export const trackPageView = async (pagePath) => {
    const visitorId = getVisitorId();
    const enteredAt = new Date().toISOString();

    try {
        const { data, error } = await supabase
            .from('page_views')
            .insert({
                visitor_id: visitorId,
                page_path: pagePath,
                entered_at: enteredAt
            })
            .select()
            .single();

        if (error) throw error;

        // Return cleanup function to update exited_at
        return async () => {
            if (!data?.id) return;
            try {
                await supabase
                    .from('page_views')
                    .update({ exited_at: new Date().toISOString() })
                    .eq('id', data.id);
            } catch (e) {
                // limit noise
            }
        };
    } catch (err) {
        console.warn('Track pageview warning:', err);
        return () => { };
    }
};

/**
 * Track a generic event.
 * @param {string} eventType 
 * @param {object} payload - { productId, searchQuery, etc. }
 */
export const trackEvent = async (eventType, payload = {}) => {
    const visitorId = getVisitorId();

    try {
        const { error } = await supabase
            .from('events')
            .insert({
                visitor_id: visitorId,
                event_type: eventType,
                product_id: payload.productId || null,
                search_query: payload.searchQuery || null,
                created_at: new Date().toISOString()
            });

        if (error) throw error;
    } catch (err) {
        console.warn('Track event warning:', err);
    }
};
