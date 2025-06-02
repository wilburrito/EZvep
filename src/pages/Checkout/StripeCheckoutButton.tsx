import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from 'antd';

// Your Stripe publishable key from Vercel environment variables
// We're using the live key from the previous console output
const stripePromise = loadStripe('pk_live_51RVFITKgKAyHWkDiISRAtIOOiLE5VI332VyoYieeZkVqcGNZMb6JijppzcgQtfhx4s6ToHSnP1Y6xtjMalz9Q9Nb00PZRr8FXS');

interface StripeCheckoutButtonProps {
  customerName: string;
  customerEmail: string;
  isLoading: boolean;
  onError: (message: string) => void;
}

const StripeCheckoutButton: React.FC<StripeCheckoutButtonProps> = ({ 
  customerName, 
  customerEmail, 
  isLoading, 
  onError 
}) => {
  const [localLoading, setLocalLoading] = useState(false);
  
  const handleCheckout = async () => {
    setLocalLoading(true);
    
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Could not initialize Stripe');
      }
      
      // Option 1: Create checkout session on the client side
      // This is a fallback approach for when the server API isn't working
      const { error } = await stripe.redirectToCheckout({
        lineItems: [
          {
            price_data: {
              currency: 'sgd',
              product_data: {
                name: 'DIY VEP Guide',
              },
              unit_amount: 4700, // $47.00 in cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        successUrl: `${window.location.origin}?success=true`,
        cancelUrl: `${window.location.origin}?canceled=true`,
        customerEmail: customerEmail,
      });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Stripe checkout error:', error);
      onError(error instanceof Error ? error.message : 'Failed to initialize payment');
    } finally {
      setLocalLoading(false);
    }
  };
  
  return (
    <Button
      type="primary"
      onClick={handleCheckout}
      loading={isLoading || localLoading}
      block
      size="large"
    >
      Proceed to Payment
    </Button>
  );
};

export default StripeCheckoutButton;
