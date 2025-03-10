import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import useLandingPage from '../../../hooks/useLandingPage'

const TimeToTravel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const { banners, loading, error } = useLandingPage();

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    const next = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex + 1 >= banners.length ? 0 : prevIndex + 1
        );
    };

    const prev = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex - 1 < 0 ? banners.length - 2 : prevIndex - 1
        );
    };

    return (
        <section className='relative bg-none py-20 overflow-hidden'>
            <div className='max-w-7xl mx-auto px-4 relative'>
                {/* Slider container */}
                <div className='relative flex items-center'>
                    {/* Left Arrow */}
                    <button 
                        onClick={prev}
                        className='absolute left-0 z-10 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100'
                    >
                        <ChevronLeft className='w-6 h-6 text-blue-500' />
                    </button>

                    {/* Images container */}
                    <div className='flex gap-4 transition-transform duration-300 ease-in-out w-full justify-start relative left-5'
                    >
                       
                            <div 
                                className='w-full md:w-[48%] flex-shrink-0'
                            >
                                <img
                                    src={banners[currentIndex].image}
                                    alt={banners[currentIndex].title}
                                    className='w-full h-auto rounded-lg object-cover'
                                />
                            </div>
                            {
                                currentIndex + 1 < banners.length && (
                                    <div 
                                className='w-full md:w-[48%] flex-shrink-0'
                            >
                                <img
                                    src={banners[currentIndex+1].image}
                                    alt={banners[currentIndex+1].title}
                                    className='w-full h-auto rounded-lg object-cover'
                                />
                            </div>
                                )
                            }
                        
                    </div>

                    {/* Right Arrow */}
                    <button 
                        onClick={next}
                        className='absolute right-0 z-10 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100'
                    >
                        <ChevronRight className='w-6 h-6 text-blue-500' />
                    </button>
                </div>
            </div>
        </section>
    )
}

export default TimeToTravel