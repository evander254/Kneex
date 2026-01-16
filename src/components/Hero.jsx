import React, { useState, useEffect } from 'react';

const Hero = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            title: <>Shop Smart. <span className="text-pink">Pay Online</span>. Pick Instore.</>,
            text: "Kneex combines convenience, security and speed with our Pay & Pick shopping model.",
            btnText: "Shop Now",
            image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d"
        },
        {
            title: <>Secure Payments. <span className="text-pink">Fast Pickup</span>.</>,
            text: "Pay online and collect your item instantly from trusted sellers.",
            btnText: "Browse Deals",
            image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3"
        },
        {
            title: <>Deals You’ll <span className="text-pink">Love</span>.</>,
            text: "Enjoy clearance sales and exclusive discounts every week.",
            btnText: "View Offers",
            image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da"
        }
    ];

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    };

    // Auto-scroll
    useEffect(() => {
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="hero-carousel relative rounded-xl overflow-hidden h-[320px] md:h-[420px] group bg-cover bg-center">
            {/* Background Images Layer */}
            {slides.map((slide, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                        }`}
                    style={{ backgroundImage: `url('${slide.image}')` }}
                >
                    <div className="absolute inset-0 bg-greyDark/80"></div>
                </div>
            ))}

            {/* Content Layer */}
            <div className="relative z-10 h-full flex items-center px-6 md:px-12">
                <div className="max-w-xl text-white">
                    {slides.map((slide, index) => (
                        <div
                            key={index}
                            className={`transition-all duration-700 absolute inset-0 flex flex-col justify-center px-6 md:px-12 ${index === currentSlide
                                ? 'opacity-100 translate-y-0 visible'
                                : 'opacity-0 translate-y-4 invisible'
                                }`}
                        >
                            <h1 className="text-3xl md:text-4xl font-bold mb-4">
                                {slide.title}
                            </h1>
                            <p className="mb-6">
                                {slide.text}
                            </p>
                            <div>
                                <a href="#" className="inline-block px-6 py-3 bg-gradient-to-r from-pink to-purple rounded-md font-semibold">
                                    {slide.btnText}
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Buttons (kept for functionality, though not in user snippet they are implicitly allowed as it's a carousel) */}
            <button
                onClick={prevSlide}
                className="carousel-btn left absolute top-1/2 left-4 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 z-20"
            >
                &#10094;
            </button>
            <button
                onClick={nextSlide}
                className="carousel-btn right absolute top-1/2 right-4 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 z-20"
            >
                &#10095;
            </button>

            {/* Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-pink w-6' : 'bg-white/50 hover:bg-white'
                            }`}
                    />
                ))}
            </div>
        </section>
    );
};

export default Hero;
