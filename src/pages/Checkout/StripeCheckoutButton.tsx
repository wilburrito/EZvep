import React, { useState } from 'react';
import { Button } from 'antd';

// TypeScript declarations for Stripe
declare namespace Stripe {
  interface StripeObject {
    redirectToCheckout(options: RedirectToCheckoutOptions): Promise<{ error?: Error }>;
  }
  
  interface RedirectToCheckoutOptions {
    lineItems: Array<{
      price: string;
      quantity: number;
    }>;
    mode: 'payment' | 'subscription';
    successUrl: string;
    cancelUrl: string;
    customerEmail?: string;
  }
  
  interface Error {
    message: string;
  }
}

// Helper function to load Stripe
declare function loadStripe(publishableKey: string): Promise<Stripe.StripeObject | null>;

// Load Stripe instance with our publishable key

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
      
      // Create a Checkout Session with the proper line items format
      // For client-side redirects, we need to use the pre-defined price ID
      // from your Stripe dashboard rather than creating products on-the-fly
      const { error } = await stripe.redirectToCheckout({
        lineItems: [
          {
            // Using a price ID from your Stripe dashboard
            price: 'price_1RVFITKgKAyHWkDiF2YdFX6X', // Replace with your actual price ID
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
