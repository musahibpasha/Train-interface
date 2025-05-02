import React, { useState } from 'react';
import adaniImage from '../assests/adani one offers.jpg';
import offers from '../assests/offers.jpg';
import offers2 from '../assests/offers2.jpeg';

const sampleOffers = [
    {
        id: 'offer-1',
        
        description: 'This is a sample offer with a 20% discount.',
        discountPercentage: 20,
        code: 'SAMPLE20',
        validUntil: '2025-04-30',
        type: 'special',
        image: adaniImage,
    },
    {
        id: 'offer-2',
        
        description: 'This is another sample offer with a 15% discount.',
        discountPercentage: 15,
        code: 'SAMPLE15',
        validUntil: '2025-05-31',
        type: 'seasonal',
        image: offers,
    },
    {
        id: 'offer-3',
        
        description: 'Enjoy an exclusive deal with our special offer!',
        discountPercentage: 10,
        code: 'SAMPLE10',
        validUntil: '2025-06-30',
        type: 'exclusive',
        image: offers2,
    }
];

// Returns an array of random offers based on the initial count
const getRandomOffersLocal = (count) => {
    const shuffledOffers = [...sampleOffers].sort(() => 0.5 - Math.random());
    return shuffledOffers.slice(0, count).map((offer, index) => ({
        ...offer,
        // Append index to guarantee unique id
        id: `${offer.id}-${index}`
    }));
};

const OffersSecion = ({ initialCount = 3 }) => {
    const [offersList] = useState(getRandomOffersLocal(initialCount));

    return (
        <div className="py-10 px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-purple-700 tracking-tight text-center animate-fade-in">Exclusive Offers For You</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {offersList.map((offer, idx) => (
                    <div
                        key={offer.id}
                        className="bg-white rounded-xl shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-2xl animate-fade-in"
                        style={{ animationDelay: `${idx * 120}ms` }}
                    >
                        <img
                            src={offer.image}
                            alt={offer.title}
                            className="w-full h-40 object-cover"
                        />
                        <div className="p-5">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">{offer.title || `Special Offer`}</h3>
                            <p className="text-gray-600 mb-2">{offer.description}</p>
                            <div className="flex flex-wrap gap-2 text-sm mb-2">
                                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded font-medium">{offer.discountPercentage}% OFF</span>
                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">Code: {offer.code}</span>
                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-medium">Valid: {offer.validUntil}</span>
                                <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded font-medium capitalize">{offer.type}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OffersSecion;