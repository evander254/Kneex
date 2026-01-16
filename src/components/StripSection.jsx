import React from 'react';

const StripSection = () => {
    const products = [
        { name: "Leather Backpack", price: "Ksh 4,299", img: "https://images.unsplash.com/photo-1585386959984-a4155224a1a0" },
        { name: "DSLR Camera", price: "Ksh 39,999", img: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f" },
        { name: "Gaming Controller", price: "Ksh 6,499", img: "https://images.unsplash.com/photo-1598327105666-5b89351aff97" },
        { name: "Wireless Headphones", price: "Ksh 12,500", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e" },
        { name: "Smart Watch", price: "Ksh 8,999", img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30" },
        { name: "Running Shoes", price: "Ksh 5,400", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff" },
        { name: "Sunglasses", price: "Ksh 2,500", img: "https://images.unsplash.com/photo-1572635196237-14b3f281503f" },
        { name: "Bluetooth Speaker", price: "Ksh 3,200", img: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1" }
    ];

    return (
        <section className="bg-white/70 backdrop-blur-lg rounded-xl overflow-hidden shadow mb-6">
            <div className="flex justify-between items-center px-5 py-3 border-b border-gray-100 pb-2">
                <h3 className="text-lg font-semibold text-greyDark">Trending This Week</h3>
                <span className="text-sm text-pink font-medium cursor-pointer uppercase hover:text-purple transition-colors">See All</span>
            </div>

            <div className="flex overflow-x-auto gap-4 p-4 snap-x no-scrollbar">
                {products.map((product, index) => (
                    <div key={index} className="min-w-[130px] md:min-w-[200px] flex-shrink-0 flex flex-col hover:shadow-md transition-shadow rounded-md overflow-hidden bg-white p-2 border border-gray-100 snap-start">
                        <img loading="lazy" src={product.img} alt={product.name} className="w-full h-28 md:h-40 object-cover rounded-md mb-2" />
                        <div className="flex flex-col">
                            <p title={product.name} className="text-sm text-greyDark truncate mb-1">{product.name}</p>
                            <span className="text-base font-bold text-greyDark">{product.price}</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default StripSection;
