import React, { useState } from 'react';
import './StripeCheckout.css';
import config from '../src/config'; // Import configuration

/**
 * Stripe Checkout Button Component
 * 
 * This component provides a button that triggers the Stripe Checkout process
 * following the official Stripe documentation:
 * https://docs.stripe.com/checkout/quickstart?client=react&lang=node
 */
const StripeCheckout = ({ 
  amount = 47.00, 
  currency = 'SGD', 
  productName = 'DIY VEP E-Guide',
  customerName = '',
  customerEmail = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Prepare the payment details
      const paymentDetails = {
        amount,
        currency: currency.toLowerCase(),
        productName,
        customerName,
        customerEmail,
        // Optional metadata can be added here
        metadata: {
          source: 'react_component'
        }
      };
      
      // Call our backend API to create a Stripe checkout session
      const apiUrl = `${config.api.baseUrl}${config.api.endpoints.createCheckoutSession}`;
      console.log('Making API request to:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentDetails),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }
      
      const { url } = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (err) {
      console.error('Error creating checkout session:', err);
      setError(err.message || 'An error occurred while creating checkout session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="stripe-checkout-container">
      <button 
        className="checkout-button"
        onClick={handleCheckout}
        disabled={isLoading}
      >
        {isLoading ? 'Processing...' : `Pay ${amount} ${currency}`}
      </button>
      
      {error && (
        <div className="checkout-error">
          {error}
        </div>
      )}
      
      <div className="checkout-secure-badge">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        Secure payment via Stripe
      </div>
    </div>
  );
};

export default StripeCheckout;
