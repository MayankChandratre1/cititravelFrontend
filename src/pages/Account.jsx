import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Home/Navbar';
import { LogOut, Mail, User, Calendar, Check } from 'lucide-react';

const Account = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(false);
    useEffect(()=>{
      if(!user){ 
        setLoading(true);
       }
      else{
        setLoading(false);
      }
    },[user])

    const formatDate = (dateString) => {
      console.log(dateString);
      
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if(loading){
      return <div>Loading..</div>
    }

    return (
        <main className="min-h-screen relative">
            <div className="bg-blue-600 py-4 fixed inset-0 h-fit z-20">
                <Navbar highlight="white" activeTab="Account" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 pt-44">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                                <span className="text-3xl font-bold text-blue-600">
                                    {user?.firstname?.[0]}{user?.lastname?.[0]}
                                </span>
                            </div>
                            <div className="text-white">
                                <h1 className="text-2xl font-bold">{user?.firstname} {user?.lastname}</h1>
                                <div className="flex items-center gap-2">
                                    {user?.verified && (
                                        <span className="flex items-center gap-1 bg-green-500 px-2 py-1 rounded-full text-sm">
                                            <Check size={14} />
                                            Verified
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* User Details */}
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                    <Mail className="text-blue-600" />
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium">{user?.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                    <User className="text-blue-600" />
                                    <div>
                                        <p className="text-sm text-gray-500">Full Name</p>
                                        <p className="font-medium">{user?.firstname} {user?.lastname}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                    <Calendar className="text-blue-600" />
                                    <div>
                                        <p className="text-sm text-gray-500">Member Since</p>
                                        <p className="font-medium">{formatDate(user?.createdAt)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                    <Calendar className="text-blue-600" />
                                    <div>
                                        <p className="text-sm text-gray-500">Verified On</p>
                                        <p className="font-medium">{user?.verifiedAt ? formatDate(user.verifiedAt) : 'Not verified'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-6 border-t">
                            <button
                                onClick={() => {
                                    logout();
                                    navigate('/login');
                                }}
                                className="w-full md:w-auto px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <LogOut size={18} />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Image */}
            <img
                src='/HeroBackground.png'
                className='object-cover w-full h-full absolute inset-0 -z-0'
                alt="Background"
            />
        </main>
    );
};

export default Account;