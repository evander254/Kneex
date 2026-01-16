import React from 'react';

const DealsSection = () => {
    const deals = [
        { title: "Running Sneakers", price: "Ksh 3,499", oldPrice: "6,999", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff" },
        { title: "Smart Watch", price: "Ksh 5,999", oldPrice: "10,999", img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30" }
    ];

    return (
        <section className="bg-white/70 backdrop-blur-lg rounded-xl overflow-hidden shadow">
            <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-pink to-purple text-white">
                <h3 className="font-semibold">Clearance Sale — Up to 60% Off</h3>
                <span className="text-sm cursor-pointer">See All</span>
            </div>

            <div className="flex gap-4 p-5 overflow-x-auto no-scrollbar">
                {deals.map((deal, index) => (
                    <div key={index} className="min-w-[180px] bg-white rounded-lg shadow cursor-pointer transition flex-shrink-0">
                        <img loading="lazy" className="h-40 w-full object-cover rounded-t-lg" src={deal.img} alt={deal.title} />
                        <div className="p-3">
                            <p className="text-sm font-medium">{deal.title}</p>
                            <span className="text-purple font-bold">Ksh {deal.price?.replace('Ksh ', '')}</span>
                            <span className="text-xs line-through text-gray-400 ml-2">{deal.oldPrice}</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default DealsSection;
