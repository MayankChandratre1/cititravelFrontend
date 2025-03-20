import React, { useState } from 'react';
import { useCheckout } from '../context/CheckoutContext';
import Navbar from '../components/Home/Navbar';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/api';
import { useHotel } from '../context/HotelContext';

const HotelBookingConfirmation = () => {
    const { checkoutData } = useCheckout();
    const { state } = useHotel()
    const navigate = useNavigate();
    const [paymentStatus, setPaymentStatus] = useState(null);

    if (!checkoutData) {
        navigate('/hotel');
        return null;
    }

    const { hotelDetails, rate, formData } = checkoutData;
    const SERVICE_FEE = 5;
    const baseAmount = rate.AverageNightlyRate;
    const totalAmount = (parseFloat(baseAmount) + SERVICE_FEE).toFixed(2);
    const currency = rate.CurrencyCode;

    const formatHotelBookingPayload = () => {
        const [month, year] = formData.billing.expiryDate.split('/');
        const cardFirstName = formData.billing.cardHolderName.split(' ')[0];
        const cardLastName = formData.billing.cardHolderName.split(' ').slice(1).join(' ');

        // Get BookingKey and CountryCode from hotelDetails response
        const bookingKey = state?.hotelDetails?.hotel?.HotelPriceCheckRS?.PriceCheckInfo?.BookingKey;
        const countryCode = state?.hotelDetails?.hotel?.HotelPriceCheckRS?.PriceCheckInfo?.HotelInfo?.LocationInfo?.Address?.CountryName?.Code || 'US';

        if (!bookingKey) {
            throw new Error('Booking key not found');
        }

        const payload = {
            CreatePassengerNameRecordRQ: {
                version: "2.5.0",
                haltOnHotelBookError: true,
                TravelItineraryAddInfo: {
                    AgencyInfo: {
                        Address: {
                            AddressLine: "CITITRAVEL",
                            CityName: formData.address.city,
                            CountryCode: countryCode, // Use countryCode from hotel details
                            PostalCode: formData.address.zipCode,
                            StateCountyProv: {
                                StateCode: formData.address.state
                            },
                            StreetNmbr: formData.address.street
                        },
                        Ticketing: {
                            TicketType: "7TAW"
                        }
                    },
                    CustomerInfo: {
                        ContactNumbers: {
                            ContactNumber: [
                                {
                                    NameNumber: "1.1",
                                    Phone: formData.address.phone,
                                    PhoneUseType: "H"
                                }
                            ]
                        },
                        Email: [
                            {
                                Address: formData.address.email,
                                NameNumber: "1.1"
                            }
                        ],
                        PersonName: formData.guests.map((guest, index) => ({
                            NameNumber: `${index + 1}.1`,
                            PassengerType: "ADT",
                            GivenName: guest.firstName,
                            Surname: guest.lastName
                        }))
                    }
                },
                HotelBook: {
                    bookGDSviaCSL: false,
                    legacyIURforCSL: false,
                    BookingInfo: {
                        BookingKey: bookingKey  // Use the BookingKey from hotel details
                    },
                    Rooms: {
                        Room: [
                            {
                                RoomIndex: 1,
                                Guests: {
                                    Guest: formData.guests.map((guest, index) => ({
                                        Type: 10,
                                        Email: formData.address.email,
                                        Index: index + 1,
                                        LeadGuest: index === 0,
                                        FirstName: guest.firstName,
                                        LastName: guest.lastName,
                                        Contact: {
                                            Phone: formData.address.phone
                                        }
                                    }))
                                }
                            }
                        ]
                    },
                    PaymentInformation: {
                        Type: "GUARANTEE",
                        FormOfPayment: {
                            PaymentCard: {
                                PaymentType: "CC",
                                CardCode: getCardType(formData.billing.cardNumber),
                                CardNumber: formData.billing.cardNumber,
                                ExpiryMonth: parseInt(month),
                                ExpiryYear: `20${year}`,
                                FullCardHolderName: {
                                    FirstName: cardFirstName,
                                    LastName: cardLastName,
                                    Email: formData.address.email
                                },
                                CSC: formData.billing.cvv,
                                Address: {
                                    CityName: formData.address.city,
                                    CityCodes: {
                                        Code: [
                                            {
                                                codeContext: "IATA",
                                                content: formData.address.city
                                            }
                                        ]
                                    },
                                    StateProvince: {
                                        code: formData.address.state
                                    },
                                    PostCode: formData.address.zipCode,
                                    CountryCodes: {
                                        Code: [
                                            {
                                                content: countryCode // Use countryCode from hotel details
                                            }
                                        ]
                                    }
                                },
                                Phone: {
                                    PhoneNumber: formData.address.phone.replace(/\D/g, '')
                                }
                            }
                        }
                    }
                },
                SpecialReqDetails: {
                    AddRemark: {
                        RemarkInfo: {
                            FOP_Remark: [
                                {
                                    Type: "CHECK"
                                }
                            ]
                        }
                    },
                    SpecialService: {
                        SpecialServiceInfo: {
                            Service: [
                                {
                                    SSR_Code: "OTHS",
                                    Text: `CC ${formData.billing.cardHolderName}`
                                }
                            ]
                        }
                    }
                },
                PostProcessing: {
                    ARUNK: {},
                    EndTransaction: {
                        Source: {
                            ReceivedFrom: "CITITRAVEL WEB"
                        }
                    },
                    RedisplayReservation: {}
                }
            }
        };

        return payload;
    };

    const getCardType = (cardNumber) => {
        const firstDigit = cardNumber[0];
        switch (firstDigit) {
            case '4': return 'VI';
            case '5': return 'MS';
            case '3': return 'AX';
            default: return 'UNKNOWN';
        }
    };

    const handleDebugClick = async () => {
        const payload = formatHotelBookingPayload();
        console.log('Complete Booking Payload:', payload);
        setPaymentStatus({ message: 'Verifying your card...', success: true });
        
        try {
            // First verify the card with $5 charge
            const verificationResponse = await axiosInstance.post('/api/v1/payment/create-verification', {
                amount: 5, // Only charge $5 for verification
                currency: 'USD',
                cardDetails: {
                    cardNumber: formData.billing.cardNumber,
                    expiryDate: formData.billing.expiryDate,
                    cvv: formData.billing.cvv,
                    cardHolderName: formData.billing.cardHolderName
                }
            });

            if (verificationResponse.data.success) {
                // If card verification successful, proceed with booking
                const bookingResponse = await axiosInstance.post('/api/v1/sabre/hotels/createpnr', payload);
                
                if (bookingResponse.data.success) {
                    setPaymentStatus({
                        message: `Booking confirmed! PNR: ${bookingResponse.data.pnr}`,
                        success: true
                    });
                } else {
                    throw new Error(bookingResponse.data.message || 'Booking failed');
                }
            } else {
                throw new Error('Card verification failed');
            }
        } catch (error) {
            console.error('Error:', error);
            setPaymentStatus({
                message: `Failed: ${error.message}`,
                success: false
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-32">
            <div className="bg-blue-600 py-4 fixed inset-0 h-fit z-20">
                <Navbar highlight="white" activeTab="Hotel" />
            </div>

            <div className="max-w-2xl mx-auto px-4 pt-32">
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <h2 className="text-2xl font-bold mb-6">Booking Confirmation</h2>

                    {/* Status Message */}
                    {paymentStatus && (
                        <div className={`p-4 mb-6 rounded-lg ${
                            paymentStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {paymentStatus.message}
                        </div>
                    )}

                    {/* Price Breakdown */}
                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between">
                            <span>Room Rate:</span>
                            <span>{currency} {baseAmount}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Service Fee:</span>
                            <span>{currency} {SERVICE_FEE.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg pt-4 border-t">
                            <span>Total Amount:</span>
                            <span>{currency} {totalAmount}</span>
                        </div>
                        <div className="text-sm text-gray-500 mt-2 p-2 bg-gray-50 rounded">
                            Note: Only $5 will be charged initially to verify your card. The full amount will be charged at check-in.
                        </div>
                    </div>

                    {/* Hotel Details */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold mb-2">{hotelDetails.HotelInfo.HotelName}</h3>
                        <p className="text-gray-600">{hotelDetails.HotelInfo.LocationInfo.Address.AddressLine1}</p>
                        <p className="text-gray-600">{hotelDetails.HotelInfo.LocationInfo.Address.CityName.value}</p>
                    </div>

                    {/* Debug Button */}
                    <button
                        onClick={handleDebugClick}
                        className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm"
                    >
                        Confirm Booking
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HotelBookingConfirmation;
