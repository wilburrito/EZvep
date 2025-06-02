// Force module mode
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Result, Button, Spin } from 'antd';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import Container from '../../common/Container';

const StyledContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 2rem;
`;

// Define component explicitly with React FC type
const PaymentSuccess: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'error' | 'processing'>('processing');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const history = useHistory();

  useEffect(() => {
    // Parse the URL parameters from the Airwallex redirect or our mock payment
    const params = new URLSearchParams(window.location.search);
    let paymentIntentId = params.get('payment_intent_id');
    const status = params.get('status');
    const orderId = params.get('order_id');
    
    // For mock payments, there might be a different parameter format
    if (!paymentIntentId && params.has('payment_intent_id')) {
      paymentIntentId = params.get('payment_intent_id');
    }
    
    // Log for debugging
    console.log('Payment redirect received:', { paymentIntentId, status });

    // Try to retrieve customer info from session storage
    let customerInfo: any = null;
    try {
      const savedCustomerInfo = sessionStorage.getItem('ezvep_customer_info');
      if (savedCustomerInfo) {
        customerInfo = JSON.parse(savedCustomerInfo);
        console.log('Retrieved customer info from session:', customerInfo);
      }
    } catch (e) {
      console.error('Error retrieving customer info from session:', e);
    }

    // Try to retrieve payment intent info from session storage
    let paymentIntentInfo: any = null;
    try {
      const savedPaymentIntent = sessionStorage.getItem('ezvep_payment_intent');
      if (savedPaymentIntent) {
        paymentIntentInfo = JSON.parse(savedPaymentIntent);
        console.log('Retrieved payment intent from session:', paymentIntentInfo);
        
        // If no paymentIntentId in URL but we have it in session, use that
        if (!paymentIntentId && paymentIntentInfo?.intentId) {
          console.log('Using payment intent ID from session storage');
          paymentIntentId = paymentIntentInfo.intentId;
        }
      }
    } catch (e) {
      console.error('Error retrieving payment intent from session:', e);
    }

    const verifyPayment = async () => {
      // Log all URL parameters for debugging
      console.log('All URL parameters:', Object.fromEntries(params.entries()));
      
      // Extract session_id from URL parameters (for Stripe checkout)
      const sessionId = params.get('session_id');
      console.log('Session ID from URL:', sessionId);
      
      // Check if we have a Stripe session ID
      if (sessionId) {
        try {
          // Call the Stripe payment status API
          const serverUrl = process.env.REACT_APP_API_URL || window.location.origin;
          console.log(`Verifying Stripe payment with server at: ${serverUrl}`);
          
          const response = await axios.get(`${serverUrl}/api/payment-status`, {
            params: { sessionId }
          });
          
          console.log('Stripe payment verification response:', response.data);
          
          // Clear session storage on successful payment
          try {
            sessionStorage.removeItem('ezvep_customer_info');
            sessionStorage.removeItem('ezvep_payment_intent');
            sessionStorage.removeItem('ezvep_redirect_started');
          } catch (e) {
            console.error('Error clearing session storage:', e);
          }
          
          setPaymentStatus('success');
          setPaymentDetails(response.data);
        } catch (error: any) {
          console.error('Error verifying Stripe payment:', error);
          setPaymentStatus('error');
        } finally {
          setLoading(false);
        }
        return;
      }
      
      // Legacy payment verification logic (for non-Stripe payments)
      
      // Check if status is directly provided in URL parameters (from mock payment)
      if (status === 'success') {
        console.log('Success status detected in URL parameters');
        // We can consider this a successful payment without API verification
        setPaymentStatus('success');
        setPaymentDetails({
          success: true,
          orderId: orderId || 'unknown',
          paymentIntentId: paymentIntentId || 'mock_payment',
          timestamp: new Date().toISOString(),
          isMock: true
        });
        
        // Clear session storage
        try {
          sessionStorage.removeItem('ezvep_customer_info');
          sessionStorage.removeItem('ezvep_payment_intent');
          sessionStorage.removeItem('ezvep_redirect_started');
        } catch (e) {
          console.error('Error clearing session storage:', e);
        }
        
        setLoading(false);
        return;
      }
      
      // Handle cases where we have orderId but not paymentIntentId (mock payments)
      if (!paymentIntentId && orderId) {
        console.log('Using order ID for verification:', orderId);
        paymentIntentId = `mock_payment_${orderId}`;
      }
      
      // If we still don't have a payment identifier, show error
      if (!paymentIntentId && !orderId) {
        console.error('No payment intent ID or order ID available');
        setPaymentStatus('error');
        setLoading(false);
        return;
      }

      try {
        // Call backend to verify payment status with customer info if available
        // Use window.location.origin to ensure compatibility with different environments
        const serverUrl = process.env.REACT_APP_API_URL || window.location.origin;
        console.log(`Verifying payment with server at: ${serverUrl}`);
        console.log('Sending verification request with:', { paymentIntentId, orderId, status, customerInfo });
        
        const response = await axios.post(`${serverUrl}/api/payment-success`, {
          paymentIntentId,
          order_id: orderId,
          customerInfo, // Include customer info for email sending
          status: status || 'success' // Include status from URL params
        });

        console.log('Payment verification response:', response.data);

        // Update state based on response
        if (response.data.success) {
          // Clear session storage on successful payment
          try {
            sessionStorage.removeItem('ezvep_customer_info');
            sessionStorage.removeItem('ezvep_payment_intent');
            sessionStorage.removeItem('ezvep_redirect_started');
          } catch (e) {
            console.error('Error clearing session storage:', e);
          }
          
          setPaymentStatus('success');
          setPaymentDetails(response.data);
        } else {
          setPaymentStatus('error');
        }
      } catch (error: any) {
        console.error('Error verifying payment:', error);
        
        // Handle specific error cases
        if (error?.response?.status === 400) {
          // Payment not completed or declined
          console.error('Payment verification failed:', error.response.data);
        }
        
        setPaymentStatus('error');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <p style={{ marginTop: '20px' }}>Verifying your payment...</p>
        </div>
      );
    }

    if (paymentStatus === 'success') {
      // Format payment details for display
      const formatAmount = (amount: number, currency: string) => {
        // No conversion needed - just format the currency
        // Server provides amount in dollars, not cents
        return new Intl.NumberFormat('en-SG', { 
          style: 'currency', 
          currency: currency?.toUpperCase() || 'SGD' 
        }).format(amount);
      };

      return (
        <Result
          status="success"
          title="Payment Successful!"
          subTitle={
            <div style={{ fontSize: '18px', marginTop: '10px' }}>
              {paymentDetails?.currency && paymentDetails?.amount && (
                <p>
                  Amount Paid: {formatAmount(paymentDetails.amount, paymentDetails.currency)}
                </p>
              )}
              <p>Transaction ID: {paymentDetails?.id || paymentDetails?.sessionId || 'N/A'}</p>
              <p>Date: {new Date().toLocaleDateString()}</p>
            </div>
          }
          extra={[
            <Button type="primary" key="home" onClick={() => history.push('/')}>
              Return to Home
            </Button>
          ]}
        />
      );
    }

    return (
      <Result
        status="error"
        title="Payment Verification Failed"
        subTitle="We couldn't verify your payment. If you believe this is an error, please contact support."
        extra={[
          <Button type="primary" key="home" onClick={() => history.push('/')}>
            Return to Home
          </Button>,
          <Button key="retry" onClick={() => window.location.reload()}>
            Retry Verification
          </Button>
        ]}
      />
    );
  };

  return (
    <Container>
      <StyledContainer>
        {renderContent()}
      </StyledContainer>
    </Container>
  );
};

// Export the component as default
export default PaymentSuccess;
