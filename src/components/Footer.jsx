import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-greyDark text-white mt-12">
            <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <h4 className="text-pink font-semibold mb-3">KNEEX</h4>
                    <p>Pay Online. Pick Instore.</p>
                </div>
                <div>
                    <h4 className="text-pink font-semibold mb-3">Help</h4>
                    <p>Customer Support</p>
                    <p>Returns</p>
                </div>
                <div>
                    <h4 className="text-pink font-semibold mb-3">Contact</h4>
                    <p>Nairobi, Kenya</p>
                    <p>+254 700 000 000</p>
                </div>
            </div>

            <div className="text-center text-sm text-gray-400 pb-4">
                © 2026 KNEEX. All Rights Reserved.
            </div>
        </footer>
    );
};

export default Footer;
