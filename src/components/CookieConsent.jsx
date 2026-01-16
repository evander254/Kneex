import React, { useState, useEffect } from 'react';

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('kneex_cookie_consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('kneex_cookie_consent', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-fade-in-up">
            <div className="max-w-7xl mx-auto bg-greyDark/95 backdrop-blur-md border border-white/10 p-6 rounded-t-2xl md:rounded-xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-white flex-1">
                    <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                        <span className="text-2xl">🍪</span> We use cookies
                    </h3>
                    <p className="text-gray-300 text-sm">
                        Enhancing your experience with personalized content and analytics.
                        By continuing, you agree to our use of cookies.
                    </p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={handleAccept}
                        className="flex-1 md:flex-none px-6 py-2.5 bg-gradient-to-r from-pink to-purple hover:shadow-lg hover:shadow-purple/50 text-white font-bold rounded-lg transition transform active:scale-95"
                    >
                        Accept All
                    </button>
                    {/* Optional Decline Button if needed in future
                    <button 
                         onClick={() => setIsVisible(false)}
                         className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition"
                    >
                        Later
                    </button> 
                    */}
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;
