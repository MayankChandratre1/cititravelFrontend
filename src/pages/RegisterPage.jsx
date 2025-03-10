import React from 'react'
import Navbar from '../components/Home/Navbar'
import RegisterForm from '../components/RegisterPage/RegisterForm'

const RegisterPage = () => {
  return (
    <main className='min-h-screen relative'>  
        <div className='bg-blue-600 py-4'>
            <Navbar highlight={"white"} activeTab={"none"} />
        </div>

        <RegisterForm />

        <img
            src='/HeroBackground.png'
            className='object-cover w-full h-full absolute inset-0 -z-10'
            alt="Background"
        />
    </main> 
  )
}

export default RegisterPage