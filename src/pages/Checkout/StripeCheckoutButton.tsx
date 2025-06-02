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
      
      // Direct to a live Stripe's hosted checkout page for the SGD 47.00 product
      // Using the standard hosted checkout URL format for your live key
      window.location.href = 'https://buy.stripe.com/live_cN26SdgIk8da0LK144'; // Live checkout URL for SGD 47.00 product
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
