import React, { useState, useEffect } from 'react';
import adaniImage from '../assests/adani one offers.jpg';
import offers from '../assests/offers.jpg';
import offers2 from '../assests/offers2.jpeg';

const sampleOffers = [
    {
        id: 'offer-1',
        title: 'Sample Offer 1',
        description: 'This is a sample offer with a 20% discount.',
        discountPercentage: 20,
        code: 'SAMPLE20',
        validUntil: '2025-04-30',
        type: 'special',
        image: adaniImage,
    },
    {
        id: 'offer-2',
        title: 'offer2',
        description: 'This is another sample offer with a 15% discount.',
        discountPercentage: 15,
        code: 'SAMPLE15',
        validUntil: '2025-05-31',
        type: 'seasonal',
        image: offers,
    },
    {
        id: 'offer-3',
        title: 'Sample Offer 3',
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
    const [offersList, setOffers] = useState(getRandomOffersLocal(initialCount));

    // Hide offers after 5 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setOffers([]);
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h2>Offers Section</h2>
            {offersList.length > 0 ? (
                <div 
                    style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(3, 1fr)', 
                        gap: '20px'
                    }}
                >
                    {offersList.map((offer) => (
                        <div 
                            key={offer.id} 
                            style={{
                                border: '1px solid #ccc', 
                                borderRadius: '8px', 
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <img 
                                src={offer.image} 
                                alt={offer.title} 
                                style={{
                                    width: '100%', 
                                    height: '150px', 
                                    objectFit: 'cover'
                                }}
                            />
                            <div style={{ padding: '10px' }}>
                                <h3>{offer.title}</h3>
                                <p>{offer.description}</p>
                                <p><strong>Discount:</strong> {offer.discountPercentage}%</p>
                                <p><strong>Code:</strong> {offer.code}</p>
                                <p><strong>Valid Until:</strong> {offer.validUntil}</p>
                                <p><strong>Type:</strong> {offer.type}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No offers available</p>
            )}
        </div>
    );
};

export default OffersSecion;