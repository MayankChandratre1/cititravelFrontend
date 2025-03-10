import './App.css'
import {Route, Routes} from 'react-router-dom'
import Home from './pages/Home'
import Flights from './pages/Flights'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import { AuthProvider, ProtectedRoute } from './context/AuthContext';
import { CheckoutProvider } from './context/CheckoutContext';
import { HotelProvider } from './context/HotelContext';
import Account from './pages/Account'
import RandomPage from './pages/RandomPage'
import RevalidationPage from './pages/RevalidationPage'
import Checkout from './pages/Checkout'
import PaymentConfirmation from './pages/PaymentConfirmation'
import Hotel from './pages/Hotel'
import { CarProvider } from './context/CarContext'
import Car from './pages/Car'

function App() {
  return (
    <AuthProvider>
      <CarProvider>
      <HotelProvider>
        <CheckoutProvider>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/flight' element={<Flights />} />
            <Route path='/hotel' element={<Hotel />} />
            <Route path='/car' element={<Car />} />
            <Route path='/login' element={<LoginPage />} />
            <Route path='/register' element={<RegisterPage />} />
            <Route path='/account' element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            } />
            <Route path='/random' element={<RandomPage />} />
            <Route path='/revalidated' element={<RevalidationPage />} />
            <Route path='/checkout' element={<Checkout />} />
            <Route path='/payment-confirmation' element={<PaymentConfirmation />} />
          </Routes>
        </CheckoutProvider>
      </HotelProvider>
      </CarProvider>
    </AuthProvider>
  )
}

export default App
