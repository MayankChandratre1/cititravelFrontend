import React, { useEffect, useState } from 'react';
import { Globe2, User, Menu, X, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({highlight, activeTab}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {user, loading} = useAuth();
  const [accountUrl, setAccountUrl] = useState('/login')
  const navigate = useNavigate()

  const navItems = ['Home', 'Flight', 'Hotel', 'Car', 'Combo', 'Special Offer'];

  useEffect(() => {
    if(user) {
      setAccountUrl('/account')
    }else{
      setAccountUrl('/login')
      
    }
  }, [user]);
  
  const renderAccountButton = () => {
    if (loading) return null;
    
    return (
        <button 
            onClick={() => navigate(accountUrl)}
            className='p-2 rounded-full group'
        >
            <User 
                size={24} 
                className={`${user ? 'text-green-400' : 'text-white'} stroke-[1.5] group-hover:scale-110 transition-all`}
            />
        </button>
    );
  };

  return (
    <nav className='w-5/6 mx-auto px-4 border-b border-gray-400 relative'>
      <div className='max-w-7xl mx-auto flex items-center justify-between h-[100px]'>
        {/* Logo */}
        <div className='flex-shrink-0'>
          <img
            src='/Logo.png'
            alt='CitiTravel Logo'
            className='h-[80px] object-contain'
          />
        </div>

        {/* Mobile Menu Button */}
        <button
          className='md:hidden p-2 z-50 fixed right-8 top-8'
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X size={24} className="text-gray-800" />
          ) : (
            <Menu size={24} className="text-white" />
          )}
        </button>

        {/* Navigation Items - Desktop */}
        <div className='hidden md:flex justify-between flex-grow mx-8 h-full'>
          <div className='flex items-center space-x-6 h-full'>
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => {
                  navigate(`/${item.toLowerCase() == 'home' ? '' : item.toLowerCase()}`)
                }}
                className={`px-4 h-full text-lg transition-colors ${
                  activeTab === item
                    ? `text-${highlight} border-b-4 border-${highlight}`
                    : 'text-gray-100 hover:text-gray-50'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Menu - Drawer */}
        <div className={`md:hidden fixed top-0 right-0 h-screen w-[80%] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-40 ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className='flex flex-col pt-24 px-6'>
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate(`/${item.toLowerCase() == 'home' ? '' : item.toLowerCase()}`)
                }}
                className={`py-4 px-4 text-lg border-b border-gray-100 text-left transition-colors ${
                  activeTab === item
                    ? 'text-[#ea0309] font-medium'
                    : 'text-gray-600'
                }`}
              >
                {item}
              </button>
            ))}
            
            {/* Mobile Menu Footer */}
            <div className='mt-8 flex items-center gap-4 px-4'>
              <button className='flex items-center gap-2 text-gray-600'>
                <Globe size={20} />
                <span>Language</span>
              </button>
              <button 
              disabled={loading}
              onClick={()=> {
                navigate(accountUrl)
              }}
              className='flex items-center gap-2 text-gray-600'>
                <User size={20} />
                <span>{user ? 'My Account' : 'Login/Register'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Overlay */}
        {isMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
        )}

        {/* Right Side Icons - Desktop */}
        <div className='hidden md:flex items-center space-x-4'>
          <button className='p-2 rounded-full'>
            <Globe size={24} className='text-white stroke-[1.5]' />
          </button>
          {renderAccountButton()}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;