import { useCar } from '../context/CarContext';

const useCars = () => {
    const { 
        state: { searchResults, searchParams, selectedCar }, 
        searchCars, 
        updateSearchParams,
        selectCar
    } = useCar();

    const formatPrice = (price, currency = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(price);
    };

    return {
        searchResults,
        searchParams,
        selectedCar,
        searchCars,
        updateSearchParams,
        selectCar,
        formatPrice
    };
};

export default useCars;
