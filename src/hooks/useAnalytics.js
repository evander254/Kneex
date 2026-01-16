import { useCallback } from 'react';
import { trackEvent, trackPageView, initAnalytics } from '../utils/analytics';

export const useAnalytics = () => {
    const track = useCallback((eventType, payload) => {
        trackEvent(eventType, payload);
    }, []);

    return {
        track,
        trackPageView,
        initAnalytics
    };
};
