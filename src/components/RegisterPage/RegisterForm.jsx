import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/api';

const RegisterForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    emailOtp: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState({
    sendingOtp: false,
    verifyingOtp: false,
    registering: false
  });

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.emailOtp.trim()) {
      newErrors.emailOtp = 'OTP is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm() && otpVerified) {
      setLoading({ ...loading, registering: true });
      try {
        await registerUser();
      } finally {
        setLoading({ ...loading, registering: false });
      }
    }
  };

  const sendVerifyMail = async () => {
    if (formData.email) {
      setLoading({ ...loading, sendingOtp: true });
      try {
        await axiosInstance.post('/api/auth/send-verification-email', { email: formData.email });
        setOtpSent(true);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading({ ...loading, sendingOtp: false });
      }
    }
  };

  const verifyOtp = async () => {
    if (formData.email && formData.emailOtp) {
      setLoading({ ...loading, verifyingOtp: true });
      try {
        await axiosInstance.post('/api/auth/verify', { 
          email: formData.email, 
          otp: formData.emailOtp 
        });
        setOtpVerified(true);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading({ ...loading, verifyingOtp: false });
      }
    }
  };

  const registerUser = async () => {
    if(formData.email && formData.password && formData.firstName && formData.lastName){
        try{
            console.log('Register user:', formData);
            await axiosInstance.post('/api/auth/register', { email: formData.email, password: formData.password, firstname: formData.firstName, lastname: formData.lastName });
            navigate('/login');
        }catch(Err){
            console.log(Err)
        }
    }
  }

  return (
    <div className="min-h-[80vh] py-4 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-sm p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join us today
          </p>
        </div>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.firstName}
                onChange={handleChange}
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.lastName}
                onChange={handleChange}
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                disabled={otpSent}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            {!otpSent && (
              <button
                type="button"
                onClick={sendVerifyMail}
                disabled={!formData.email || loading.sendingOtp}
                className="mt-6 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-200 transition-colors duration-200"
              >
                {loading.sendingOtp ? 'Sending...' : 'Send OTP'}
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label htmlFor="emailOtp" className="block text-sm font-medium text-gray-700">Email OTP</label>
              <input
                id="emailOtp"
                name="emailOtp"
                type="text"
                required
                disabled={!otpSent || otpVerified}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                value={formData.emailOtp}
                onChange={handleChange}
              />
              {errors.emailOtp && <p className="text-red-500 text-xs mt-1">{errors.emailOtp}</p>}
            </div>
            {otpSent && !otpVerified && (
              <button
                type="button"
                onClick={verifyOtp}
                disabled={!formData.emailOtp || loading.verifyingOtp}
                className="mt-6 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-200 transition-colors duration-200"
              >
                {loading.verifyingOtp ? 'Verifying...' : 'Verify OTP'}
              </button>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          <div>
            <button
              type="submit"
              disabled={!otpVerified || loading.registering}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 transition-colors duration-200"
            >
              {loading.registering ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
        
        <div className="mt-4 text-sm text-center">
          <p>Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;