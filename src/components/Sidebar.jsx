import React from 'react';

const Sidebar = ({ isOpen, onClose }) => {
    return (
        <>
            {/* Overlay (mobile) */}
            <div
                className={`fixed inset-0 bg-black/40 z-30 lg:hidden transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                onClick={onClose}
            ></div>

            <aside
                className={`fixed lg:static inset-y-0 left-0 w-64 bg-white/70 backdrop-blur-xl shadow-lg p-5
          transform transition-transform duration-300 z-40
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
            >
                <h3 className="text-lg font-semibold text-purple mb-4">Categories</h3>
                <ul className="space-y-3 text-sm">
                    {["Phones & Tablets", "Electronics", "Fashion", "Home & Kitchen", "Computing", "Gaming", "Supermarket"].map((category) => (
                        <li key={category} className="hover:text-pink cursor-pointer transition-colors">
                            {category}
                        </li>
                    ))}
                </ul>
            </aside>
        </>
    );
};

export default Sidebar;
