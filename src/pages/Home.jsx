import React from 'react'
import Hero from '../components/Home/sections/Hero'
import TimeToTravel from '../components/Home/sections/TimeToTravel'
import BestOffers from '../components/Home/sections/BestOffers'
import PopularOffers from '../components/Home/sections/PopularOffers'
import FeaturedProperties from '../components/Home/sections/FeaturedProperties'
import Footer from '../components/Home/Footer'

const Home = () => {
  return (
    <main>
        <Hero />
        <TimeToTravel />
        <BestOffers />
        <PopularOffers />
        <FeaturedProperties />
        <Footer/>
    </main>
  )
}




export default Home