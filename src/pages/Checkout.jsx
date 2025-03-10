import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useFlightSearch from '../hooks/useFlightSearch';
import Navbar from '../components/Home/Navbar';
import { CreditCard, MapPin, Users, ChevronRight } from 'lucide-react';
import CardDetailsForm from '../components/Checkout/CardDetailsForm';
import BillingAddressForm from '../components/Checkout/BillingAddressForm';
import PassengerForm from '../components/Checkout/PassengerForm';
import { useCheckout } from '../context/CheckoutContext';

const Checkout = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { revalidationResults, searchParams } = useFlightSearch();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        billing: {
            cardNumber: '',
            expiryDate: '',
            cvv: '',
            cardHolderName: ''
        },
        address: {
            email: user?.email || '',
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: '',
            phone: ''
        },
        passengers: []
    });
    const { setCheckoutData } = useCheckout();

    useEffect(() => {
        if (!revalidationResults) {
            navigate('/flight');
            return;
        }

        // Initialize passengers array based on count
        const passengerCount = searchParams?.PassengerTypeQuantity.reduce(
            (acc, curr) => acc + curr.Quantity, 0
        ) || 0;

        setFormData(prev => ({
            ...prev,
            passengers: Array(passengerCount).fill({
                type: '',
                firstName: '',
                lastName: '',
                dob: '',
                nationality: '',
                passportNumber: '',
                passportExpiry: ''
            })
        }));
    }, [revalidationResults, searchParams]);

    if (!revalidationResults) return null;

    const steps = [
        { id: 1, title: 'Card Details', icon: CreditCard },
        { id: 2, title: 'Billing Address', icon: MapPin },
        { id: 3, title: 'Passenger Information', icon: Users }
    ];

    const currentItinerary = revalidationResults.groupedItineraryResponse.itineraryGroups[0].groupDescription.legDescriptions;
    const fare = revalidationResults.groupedItineraryResponse.itineraryGroups[0].itineraries[0].pricingInformation[0].fare;

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return <CardDetailsForm formData={formData} setFormData={setFormData} />;
            case 2:
                return <BillingAddressForm formData={formData} setFormData={setFormData} />;
            case 3:
                return <PassengerForm formData={formData} setFormData={setFormData} searchParams={searchParams} />;
            default:
                return null;
        }
    };

    const formatPNRPayload = () => {
        const currentItinerary = revalidationResults.groupedItineraryResponse.itineraryGroups[0].itineraries[0];
        const segments = currentItinerary.legs.flatMap(leg => {
            const legDesc = revalidationResults.groupedItineraryResponse.legDescs.find(
                desc => desc.id === leg.ref
            );
            return legDesc.schedules.map(schedule => {
                const flight = revalidationResults.groupedItineraryResponse.scheduleDescs.find(
                    s => s.id === schedule.ref
                );
                let depDate =revalidationResults.groupedItineraryResponse.itineraryGroups[0].groupDescription.legDescriptions[0].departureDate;
                if (flight.departureDateAdjustment) {
                    const adjustedDate = new Date(depDate);
                    adjustedDate.setDate(adjustedDate.getDate() + flight.departureDateAdjustment);
                    depDate = adjustedDate.toISOString().split('T')[0];
                }
                let arrDate = new Date(depDate + 'T' + (flight.departure.time.includes("+") 
                    ? flight.departure.time.split("+")[0] 
                    : flight.departure.time.split("-")[0]));
                arrDate.setMinutes(arrDate.getMinutes() + flight.elapsedTime);
                arrDate = arrDate.toISOString().split('T')[0];

                return {
                    departureDateTime: depDate + "T" + flight.departure.time,
                    arrivalDateTime: arrDate + "T" + flight.arrival.time,
                    flightNumber: flight.carrier.marketingFlightNumber,
                    airlineCode: flight.carrier.marketing,
                    origin: flight.departure.airport,
                    destination: flight.arrival.airport,
                    bookingClass: flight.carrier.booking || "Y" // Default to Y if not specified
                };
            });
        });

        const payload = {
            CreatePassengerNameRecordRQ: {
                version: "2.4.0",
                TravelItineraryAddInfo: {
                    CustomerInfo: {
                        PersonName: formData.passengers.map((passenger, index) => ({
                            NameNumber: `${index + 1}.1`,
                            GivenName: passenger.firstName + (passenger.middleName ? ` ${passenger.middleName}` : ''),
                            Surname: passenger.lastName
                        })),
                        ContactNumbers: {
                            ContactNumber: [{
                                Phone: formData.address.phone,
                                PhoneUseType: "H"
                            }]
                        },
                        Email: [{
                            Address: formData.address.email,
                            Type: "BC"
                        }]
                    }
                },
                AirBook: {
                    RetryRebook: {
                        Option: true
                    },
                    OriginDestinationInformation: {
                        FlightSegment: segments.map(segment => ({
                            DepartureDateTime: segment.departureDateTime,
                            ArrivalDateTime: segment.arrivalDateTime,
                            FlightNumber: segment.flightNumber,
                            NumberInParty: formData.passengers.length.toString(),
                            ResBookDesigCode: segment.bookingClass,
                            Status: "NN",
                            MarketingAirline: {
                                Code: segment.airlineCode,
                                FlightNumber: segment.flightNumber
                            },
                            OriginLocation: {
                                LocationCode: segment.origin
                            },
                            DestinationLocation: {
                                LocationCode: segment.destination
                            }
                        }))
                    }
                },
                AirPrice: [{
                    PriceRequestInformation: {
                        Retain: true,
                        OptionalQualifiers: {
                            PricingQualifiers: {
                                PassengerType: formData.passengers.map(passenger => ({
                                    Code: getPassengerType(passenger)
                                }))
                            }
                        }
                    }
                }],
                PostProcessing: {
                    EndTransaction: {
                        Source: {
                            ReceivedFrom: "CITITRAVEL WEB"
                        }
                    }
                }
            }
        };

        // Add payment information
        payload.CreatePassengerNameRecordRQ.FormOfPayment = {
            PaymentInfo: {
                Payment: {
                    CC_Info: {
                        PaymentCard: {
                            CardCode: getCardType(formData.billing.cardNumber),
                            CardNumber: formData.billing.cardNumber,
                            ExpiryDate: formatExpiryDate(formData.billing.expiryDate)
                        }
                    }
                }
            }
        };

        return payload;
    };

    const getCardType = (cardNumber) => {
        // Simple card type detection
        const firstDigit = cardNumber[0];
        switch (firstDigit) {
            case '4': return 'VI'; // Visa
            case '5': return 'MC'; // MasterCard
            case '3': return 'AX'; // American Express
            default: return 'VI'; // Default to Visa
        }
    };

    const formatExpiryDate = (mmyy) => {
        const [month, year] = mmyy.split('/');
        return `20${year}-${month}`;
    };

    const getPassengerType = (passenger) => {
        // Add logic to determine passenger type based on age or existing type
        return "ADT"; // Default to adult
    };

    const handleConfirmBooking = () => {
        if (currentStep === steps.length) {
            const pnrPayload = formatPNRPayload();
            // Save all relevant data to context
            setCheckoutData({
                pnrPayload,
                formData,
                fare,
                itinerary: currentItinerary,
                searchParams
            });
            navigate('/payment-confirmation');
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    return (
        <div className="min-h-screen ">
            <div className="bg-blue-600 py-4 fixed inset-0 h-fit z-20">
                <Navbar highlight="white" activeTab="Flight" />
            </div>

            <div className="max-w-7xl mx-auto  px-4 pt-44">
                {/* Booking Summary */}
                <div className="bg-gray-50 border border-black rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
                    <div className="flex justify-between items-start">
                        <div>
                            {/* <p className="text-gray-600">From: {currentItinerary[0].departureLocation}</p>
                            <p className="text-gray-600">To: {currentItinerary[currentItinerary.length-1].arrivalLocation}</p> */}
                            <p className="text-gray-600">
                                Passengers: {searchParams.PassengerTypeQuantity.reduce((acc, curr) => acc + curr.Quantity, 0)}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600">
                                {fare.totalFare.currency} {fare.totalFare.totalPrice}
                            </p>
                            <p className="text-sm text-gray-500">Total Price</p>
                        </div>
                    </div>
                </div>

                {/* Checkout Steps */}
                <div className="flex justify-between mb-8 ">
                    {steps.map((step, idx) => (
                        <div key={step.id} className="flex items-center">
                            <div
                                className={`flex items-center ${
                                    step.id === currentStep 
                                        ? 'text-blue-600' 
                                        : step.id < currentStep 
                                            ? 'text-green-500' 
                                            : 'text-gray-400'
                                }`}
                            >
                                <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 mr-2">
                                    <step.icon size={16} />
                                </div>
                                <span className="hidden sm:inline">{step.title}</span>
                            </div>
                            {idx < steps.length - 1 && (
                                <ChevronRight className="mx-4 text-gray-400" />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <div className=" rounded-lg shadow-md p-6 mb-8 bg-gray-50 border border-black">
                    {renderStepContent()}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between mb-8">
                    <button
                        onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                        className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                        disabled={currentStep === 1}
                    >
                        Previous
                    </button>
                    <button
                        onClick={handleConfirmBooking}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        {currentStep === steps.length ? 'Confirm Booking' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
