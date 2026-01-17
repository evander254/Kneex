import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAnalytics } from '../hooks/useAnalytics'; // Wait, I decided not to use hook? 
// The previous file content I wrote in step 40 used direct imports.
// But I saw existing code uses utils/analytics.
import { initAnalytics, trackPageView, trackEvent } from '../utils/analytics';

const AnalyticsTracker = () => {
    const location = useLocation();
    const exitPageRef = useRef(null);

    // Initialize analytics and listen for auth changes
    useEffect(() => {
        // Initial visitor setup
        initAnalytics();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                // Re-init visitor to link user_id
                initAnalytics();
            }
        });

        // Global click listener for "Page Clicks"
        const handleGlobalClick = (e) => {
            // We want to avoid double counting if a specific handler also tracks it,
            // but the requirement says "Insert rows... for Page clicks".
            // We can track a generic "page_click" event.
            // Ideally we debounce or filter, but "Any click" is requested.
            trackEvent('page_click');
        };

        document.addEventListener('click', handleGlobalClick);

        return () => {
            subscription?.unsubscribe();
            document.removeEventListener('click', handleGlobalClick);
        };
    }, []);

    // Track page views on location change
    useEffect(() => {
        const currentPath = location.pathname + location.search;

        // Cleanup previous page view (set exited_at)
        if (exitPageRef.current) {
            exitPageRef.current();
            exitPageRef.current = null;
        }

        // Start new page view
        trackPageView(currentPath).then(cleanup => {
            exitPageRef.current = cleanup;
        });

        return () => {
            if (exitPageRef.current) {
                exitPageRef.current();
            }
        };
    }, [location]);

    return null; // This component renders nothing
};

export default AnalyticsTracker;
