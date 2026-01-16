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
        <section className="strip-section">
            <div className="strip-header">
                <h3>Trending This Week</h3>
                <span>See All</span>
            </div>

            <div className="strip-products no-scrollbar">
                {products.map((product, index) => (
                    <div key={index} className="product">
                        <img loading="lazy" src={product.img} alt={product.name} />
                        <div className="product-body">
                            <p title={product.name}>{product.name}</p>
                            <span className="price">{product.price}</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default StripSection;
