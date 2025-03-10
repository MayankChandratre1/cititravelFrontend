import React from 'react'
import { Star } from 'lucide-react'
import useLandingPage from '../../../hooks/useLandingPage'

const filter = ["Bangkok", "Manila", "Tokyo", "Taipei", "Hong Kong", "Seoul"]

const PopularOffers = () => {
  const [activeFilter, setActiveFilter] = React.useState(filter[0]);
  const { popular, loading, error } = useLandingPage();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <section className='relative bg-none pb-20'>
        <div className='max-w-7xl mx-auto px-4 bg-[#065AF3]/5 py-10 rounded-xl'>
            <h2 className='text-2xl md:text-4xl font-semibold mb-4 text-black'>Popular Destinations</h2>
            <div className='mb-4 space-y-2'>
                {
                    filter.map((item, index) => (
                        <button
                        onClick={() =>setActiveFilter(item)}
                        key={index} className={` px-3 py-2 rounded-md  ml-2 shadow-md ${activeFilter == item ? "bg-blue-600 text-white font-semibold":"bg-white"}`}>{item}</button>
                    ))
                }
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                {popular.map((offer, index) => (
                    <OfferCard key={index} {...offer} />
                ))}
                
                {/* Explore More Card */}
                <div className='relative h-[350px] rounded-2xl overflow-hidden group cursor-pointer'>
                    <img 
                        src="/book_now_bg.png" 
                        alt="Explore More"
                        className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-110'
                    />
                    <div className='absolute  bottom-0  flex flex-col justify-end items-center pb-6 h-[50%]'>
                        <p className='text-white text-center font-bold text-lg px-8 py-2'>
                            Explore more popular destinations
                        </p>
                        <button className='bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-800 hover:text-white transition-colors w-5/6'>
                            Book Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </section>
  )
}

const OfferCard = ({ 
    title, 
    image, 
    labelForImage, 
    rating, 
    reviews, 
    specialDiscoundinPercent
}) => {
    return (
        <div className='bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow'>
            <div className='relative h-[50%] '>
                <div className='absolute w-full h-full bg-gradient-to-t from-black/40 to-transparent'/>
                <img 
                    src={image} 
                    alt={title}
                    className='w-full h-full object-cover object-center'
                />
                <span className='absolute bottom-4 left-4 bg-white px-3 py-1 rounded-full text-sm'>
                    {labelForImage}
                </span>
                {specialDiscoundinPercent > 0 && (
                    <span className='absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm'>
                        {specialDiscoundinPercent}% OFF
                    </span>
                )}
            </div>
            
            <div className='p-4'>
                <h3 className='text-xl font-semibold mb-2'>{title}</h3>
                
                <div className=' items-center gap-2 mb-4'>
                    <div className='space-y-3'>
                        <Star className='w-4 h-4 fill-yellow-400 text-yellow-400 mb-2' />
                    </div>
                   <div className='flex items-center gap-1'>
                   <span className='font-medium bg-blue-800 px-3 py-1 rounded-full text-white text-xs'>{rating}/5</span>
                   <span className='text-md text-blue-800'>{reviews} reviews</span>
                   </div>
                </div>
            </div>
        </div>
    )
}

export default PopularOffers