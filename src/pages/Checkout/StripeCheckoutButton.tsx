import React, { useState } from 'react';
import { Button } from 'antd';

interface StripeCheckoutButtonProps {
  customerName: string;
  customerEmail: string;
  isLoading: boolean;
  onError: (message: string) => void;
}

/**
 * A simplified Stripe checkout button that redirects directly to Stripe's hosted checkout page
 * This avoids all client-side Stripe.js integration issues
 */
const StripeCheckoutButton: React.FC<StripeCheckoutButtonProps> = ({ 
  customerName, 
  customerEmail, 
  isLoading, 
  onError 
}) => {
  const [localLoading, setLocalLoading] = useState(false);
  
  const handleCheckout = () => {
    setLocalLoading(true);
    try {
      // Save customer details to sessionStorage for later use
      sessionStorage.setItem('customer_name', customerName);
      sessionStorage.setItem('customer_email', customerEmail);
      
      // Direct to Stripe's hosted checkout page using your price ID
      // This is a more reliable approach than using Stripe.js client-side
      window.location.href = 'https://checkout.stripe.com/pmd_1RVZAdKgKAyHWkDiVnWGaWig'; // Replace with your actual Stripe hosted checkout URL
    } catch (error) {
      console.error('Checkout error:', error);
      onError(error instanceof Error ? error.message : 'Failed to initialize payment');
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
      Checkout Directly with Stripe
    </Button>
  );
};

export default StripeCheckoutButton;
