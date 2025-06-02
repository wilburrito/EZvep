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

  const createCheckoutSession = async () => {
    try {
      // Format payment details according to what our backend expects
      const paymentDetails = {
        // Server expects amount directly, not line_items
        amount: amount,
        currency: 'sgd', // Singapore dollars
        // Backend expects these URL parameters with this naming
        successUrl: window.location.origin + '/payment-success?session_id={CHECKOUT_SESSION_ID}',
        cancelUrl: window.location.origin + '/payment-cancel',
        // Customer information
        customerEmail: customerEmail,
        customerName: customerName || 'EZVEP Customer',
        productName: productName,
        description: 'DIY VEP E-Guide with step-by-step instructions',
        // Additional metadata
        metadata: {
          product_name: productName,
          product_type: 'diy_vep_guide',
          source: 'react_component'
        }
      };
      
      // Select the appropriate API endpoint based on environment
      let apiUrl;
      const isProd = typeof window !== 'undefined' && 
        window.location.hostname !== 'localhost' && 
        window.location.hostname !== '127.0.0.1';
      
      if (isProd) {
        // Production environment - use the configured endpoint
        apiUrl = `${config.api.baseUrl}${config.api.endpoints.createCheckoutSession}`;
      } else {
        // Development environment - try direct endpoint with correct protocol
        apiUrl = 'http://localhost:3001/direct-api/create-checkout-session';
      }
      
      setError('Connecting to payment service...');
      
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paymentDetails),
        });
        
        const data = await response.json();
        
        if (response.ok && data.url) {
          setError(null);
          window.location.href = data.url;
        } else {
          throw new Error(`Payment service error: ${data.error || response.statusText}`);
        }
      } catch (err) {
        console.error('Error creating checkout session:', err);
        throw err;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setError(`Payment Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);
    await createCheckoutSession();
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
