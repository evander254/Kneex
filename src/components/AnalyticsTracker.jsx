import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAnalytics } from '../hooks/useAnalytics';

const AnalyticsTracker = () => {
    const location = useLocation();
    const { trackPageView, initAnalytics } = useAnalytics();
    const exitPageRef = useRef(null);

    // Initialize analytics and listen for auth changes
    useEffect(() => {
        initAnalytics();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                // Link visitor ID to the new user
                initAnalytics();
            }
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    // Track page views on location change
    useEffect(() => {
        const currentPath = location.pathname + location.search;

        // Cleanup previous page view if it exists (set exited_at)
        if (exitPageRef.current) {
            exitPageRef.current();
        }

        // Start new page view
        // We use a promise wrapper to handle the async nature of trackPageView returning the clean up function
        // but useEffect cannot be async.
        let cleanupFn = null;
        trackPageView(currentPath).then(fn => {
            cleanupFn = fn;
            exitPageRef.current = fn;
        });

        return () => {
            // Logic for unmounting component or changing dependency is handled by the start of the next effect
            // But we also want to capture unmount of the app itself if possible.
            if (cleanupFn) cleanupFn();
        };
    }, [location, trackPageView]);

    // Track global clicks
    useEffect(() => {
        const handleGlobalClick = (e) => {
            // We can track generic clicks here.
            // To avoid double tracking with specific events, we might want to check data attributes
            // or just accept that "page_click" is a high level metric.
            // The requirement says "Interaction: Any click -> page_click".
            // We'll trust the specific events (product_click, etc.) are separate types in the events table
            // and "page_click" captures general engagement.

            // Optional: specific logic to ignore clicks we already track specifically?
            // e.g. if (e.target.closest('[data-track-event]')) return;

            // For now, implementing exactly as requested: "Any click"
            // Note: useAnalytics hook usage inside a listener might not work as expected because of closure if not careful.
            // Let's use the track function directly if we can, or just call it.
        };

        // We can't use the hook function inside the event listener added in useEffect easily without it being a dependency,
        // which would re-add the listener constantly.
        // It's better to import trackEvent directly for this listener or use a ref for the track function.
        // However, since we are inside the component that uses useAnalytics, we can just use the function instance
        // if we put it in dependencies, but that might be heavy.
        // Simpler approach:

        const clickHandler = () => {
            import('../utils/analytics').then(module => {
                module.trackEvent('page_click');
            });
        };

        document.addEventListener('click', clickHandler);
        return () => document.removeEventListener('click', clickHandler);
    }, []);

    return null;
};

export default AnalyticsTracker;
