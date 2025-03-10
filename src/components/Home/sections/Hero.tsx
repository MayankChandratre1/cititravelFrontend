import React, { act } from 'react'
import Navbar from '../Navbar'
import Ticket from '../../../../public/svg/Ticket'
import SearchFormHotel from '../SearchFormHotel'
import SearchForm from '../SearchForm';

const menu = [
    {
        label: "Flights",
        icon: "/AIrplane.png"
    },
    {
        label: "Hotel",
        icon: "/Hotel.png"
    },
    {
        label: "Car",
        icon: "/Car.png"
    },
    {
        label: "Combo",
        icon: "/Car.png"
    }
];

const weeklyUpdates = [
  {
    title:"lorem ipsum",
    link:""
  },
  {
    title:"lorem ipsum dolor sit amet",
    link:""
  },
  {
    title:"lorem ipsum dolor sit amet",
    link:""
  },
  {
    title:"lorem ipsum dolor sit amet",
    link:""
  },
  {
    title:"lorem ipsum dolor sit amet",
    link:""
  },
  {
    title:"lorem ipsum dolor sit amet",
    link:""
  },
  {
    title:"lorem ipsum dolor sit amet",
    link:""
  },
]

const Hero = () => {

  const [activeTab, setActiveTab] = React.useState('Flights')

  return (
    <section className='relative bg-none pb-20'>
        <Navbar highlight={"[#ea0309]"} activeTab={"Home"} />
           {/* Weekly Updates Marquee */}
           <div className="relative w-full overflow-hidden bg-blue-600/20 backdrop-blur-sm my-8">
          <div className="flex space-x-12 animate-marquee whitespace-nowrap py-3">
            {weeklyUpdates.concat(weeklyUpdates).map((update, index) => (
              <span key={index} className="text-white font-medium mx-4 inline-flex items-center">
                <span className="h-2 w-2 bg-white rounded-full mr-2"></span>
                {update.title}
              </span>
            ))}
          </div>
        </div>

        <div className='flex items-center justify-center mt-12 md:mt-18 px-4'>
          <h1 className='text-white text-3xl md:text-6xl font-bold tracking-wider text-center'>
          BRINGING THE  
          {' '}
            <span className='relative inline-block'>
              <span className='relative z-10'>WORLD</span>
              <span className='absolute -left-12 md:left-5 -top-5 md:-top-0 -z-[1] scale-[0.7] md:scale-[1.15]'>
                <Ticket />
              </span>
            </span>
            {' '}CLOSER TO YOU 
          </h1>
        </div>

     
        
        {
          activeTab === 'Flights' && (<SearchForm menu={menu} activeTab={activeTab} setActiveTab={setActiveTab} />)
        }
        {
          activeTab === 'Hotel' && (<SearchFormHotel menu={menu} activeTab={activeTab} setActiveTab={setActiveTab} />)
        }
        {
          activeTab === 'Car' && (<SearchFormHotel menu={menu} activeTab={activeTab} setActiveTab={setActiveTab} />)
        }
        {
          activeTab === 'Combo' && (<SearchFormHotel menu={menu} activeTab={activeTab} setActiveTab={setActiveTab} />)
        }



        

        <img
            src='/HeroBackground.png'
            className='object-cover w-full h-full absolute inset-0 -z-10'
            alt="Background"
        />
    </section>
  )
}

export default Hero