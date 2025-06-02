import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Form, Input, Button, message, Spin, Steps, Row, Col } from 'antd';
import Container from '../../common/Container';
import { Fade } from 'react-awesome-reveal';
import { SvgIcon } from '../../common/SvgIcon';
import axios from 'axios';
import styled from 'styled-components';
import { init } from '@airwallex/components-sdk';
import { v4 as uuid } from 'uuid';
import { useHistory } from 'react-router-dom';

// Add window.Airwallex type and other globals for TypeScript
declare global {
  interface Window {
    Airwallex: any;
    USE_FALLBACK_MODE?: boolean;
    gtag: (command: string, action: string, params?: { [key: string]: any }) => void;
  }
}

const { Step } = Steps;

const CheckoutContainer = styled("div")`
  max-width: 800px;
  margin: 0 auto;
  padding: 2.5rem 0;
`;

const Title = styled("h1")`
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 2rem;
`;

const StepsContainer = styled("div")`
  margin-bottom: 2rem;
`;

const SectionTitle = styled("h2")`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
`;

const ButtonContainer = styled("div")`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
`;

const SuccessContainer = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem;
  
  h2 {
    margin: 1.5rem 0 1rem;
    font-size: 1.8rem;
  }
  
  p {
    margin-bottom: 1.5rem;
    font-size: 1.1rem;
    color: #555;
    max-width: 500px;
  }
`;

const SummaryItem = styled("div")`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const Total = styled("div")`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #eee;
  font-weight: bold;
  font-size: 1.2rem;
`;

const LoadingContainer = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  
  p {
    margin-top: 1rem;
    color: #666;
  }
`;

const TwoColumnLayout = styled("div")`
  display: flex;
  gap: 40px;
  
  @media only screen and (max-width: 992px) {
    flex-direction: column;
  }
`;

const SummaryColumn = styled("div")`
  flex: 1;
`;

const PaymentColumn = styled("div")`
  flex: 1.5;
`;

const ProductImage = styled("img")`
  width: 100px;
  height: 130px;
  object-fit: cover;
  margin-right: 20px;
`;

const ProductDetails = styled("div")`
  display: flex;
  margin-bottom: 20px;
`;

const ProductInfo = styled("div")`
  flex: 1;
`;

const ProductTitle = styled("h3")`
  font-size: 16px;
  margin: 0 0 8px 0;
  font-weight: 500;
`;

const CardInfoTitle = styled("h2")`
  font-size: 18px;
  margin-bottom: 20px;
  font-weight: 500;
`;

const Card = styled("div")`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 24px;
  margin-bottom: 24px;
`;

const AirwallexContainer = styled("div")`
  margin-top: 1rem;
  width: 100%;
`;

// These styled components will be used if we need to display payment method icons

const Checkout = ({ t }: { t: any }) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentIntentInfo, setPaymentIntentInfo] = useState<{ clientSecret: string, intentId: string } | null>(null);
  const [airwallexReady, setAirwallexReady] = useState(false);
  const [dropInMounted, setDropInMounted] = useState(false);
  const history = useHistory();
  const dropInContainerRef = useRef<HTMLDivElement>(null);
  
  // Handle successful payment from Airwallex Drop-in Element
  const handlePaymentSuccess = useCallback(async (formValues: any, paymentIntentId: string) => {
    setIsLoading(true);
    
    try {
      // Construct the customer information for the backend
      const customerInfo = {
        name: `${formValues.firstName} ${formValues.lastName}`,
        email: formValues.email,
        phone: formValues.phone || ''
      };
      
      // Call the backend to confirm the payment and send email
      const serverUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      console.log(`Confirming payment with server at: ${serverUrl}`);
      await axios.post(`${serverUrl}/api/confirm-payment`, {
        paymentIntentId,
        customerInfo
      });
      
      // Update UI to show success
      setIsSuccess(true);
      setIsLoading(false);
      
      // Reset form and steps
      form.resetFields();
      
      // Send analytics event for successful purchase
      if (window.gtag) {
        window.gtag('event', 'purchase', {
          transaction_id: paymentIntentId,
          value: 47.00,
          currency: 'SGD',
          items: [{ name: 'DIY VEP E-Guide', quantity: 1, price: 47.00 }]
        });
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      message.error("Payment was successful but we couldn't complete your order. Please contact support.");
      setIsLoading(false);
    }
  }, [form, setIsLoading, setIsSuccess]);
  
  // Initialize Airwallex SDK with proper error handling
  const initializeAirwallexSDK = useCallback(() => {
    try {
      // Set up event handlers for the global Airwallex object
      window.Airwallex.onReady(() => {
        console.log('Airwallex SDK is ready');
        setAirwallexReady(true);
      });
      
      window.Airwallex.onError((error: any) => {
        console.error('Airwallex SDK error:', error);
        message.error(`Payment system error: ${error?.message || 'Unknown error'}`);
      });
    } catch (error: any) {
      console.error('Error initializing Airwallex:', error);
      message.error(`Could not initialize payment system: ${error?.message || 'Unknown error'}`);
    }
  }, []);
  
  // Check if Airwallex is available
  const checkAirwallexAvailability = useCallback(() => {
    // Skip if we're in fallback mode
    if (window.USE_FALLBACK_MODE) {
      console.log('Using fallback mode, skipping Airwallex initialization');
      return;
    }
    
    if (window.Airwallex) {
      console.log('Airwallex SDK found, initializing...');
      initializeAirwallexSDK();
    } else {
      console.log('Airwallex SDK not found, waiting...');
      let attempts = 0;
      const maxAttempts = 10; // Limit retry attempts
      
      const interval = setInterval(() => {
        attempts++;
        if (window.Airwallex) {
          console.log('Airwallex SDK found after waiting, initializing...');
          clearInterval(interval);
          initializeAirwallexSDK();
        } else if (attempts >= maxAttempts) {
          console.warn('Airwallex SDK not found after multiple attempts');
          clearInterval(interval);
          message.warning('Payment system could not be loaded. Using fallback payment form.');
        }
      }, 1000); // Check every second
    }
  }, [initializeAirwallexSDK]);
  
  useEffect(() => {
    checkAirwallexAvailability();
    
    // Cleanup on unmount
    return () => {
      // If there's an Airwallex element mounted, clean it up
      if (window.Airwallex && dropInMounted) {
        try {
          window.Airwallex.destroyElement('dropIn');
        } catch (error) {
          console.error("Error destroying Airwallex element:", error);
        }
      }
    };
  }, [checkAirwallexAvailability, dropInMounted]);
  
  // Fallback payment form component that resembles Airwallex Drop-in Element
  const FallbackPaymentForm = () => {
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvc, setCvc] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await processPayment();
    };
    
    const processPayment = async () => {
      if (isSubmitting) return;
      
      // Validate required fields
      if (!cardNumber.trim()) {
        message.error('Please enter a valid card number');
        return;
      }
      if (!expiryDate.trim()) {
        message.error('Please enter a valid expiry date');
        return;
      }
      if (!cvc.trim()) {
        message.error('Please enter a valid CVC');
        return;
      }
      
      try {
        setIsSubmitting(true);
        // Get the form values and create a payment intent
        const formValues = form.getFieldsValue();
        // Use our modern Airwallex implementation
        await createPaymentIntent(formValues);
      } catch (error) {
        console.error('Payment processing error:', error);
        message.error('Payment processing failed. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    };
    
    return (
      <div style={{ border: '1px solid #e8e8e8', borderRadius: '4px', padding: '16px', marginBottom: '16px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#333' }}>Card number</label>
            <input 
              type="text" 
              placeholder="4242 4242 4242 4242" 
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #d9d9d9', borderRadius: '4px' }} 
            />
          </div>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#333' }}>Expiry date</label>
              <input 
                type="text" 
                placeholder="MM/YY" 
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #d9d9d9', borderRadius: '4px' }} 
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#333' }}>CVC</label>
              <input 
                type="text" 
                placeholder="123" 
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #d9d9d9', borderRadius: '4px' }} 
              />
            </div>
          </div>
          <button 
            type="submit"
            disabled={isSubmitting}
            style={{ 
              width: '100%', 
              padding: '12px 16px', 
              backgroundColor: isSubmitting ? '#a9d5ff' : '#1890ff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              fontSize: '16px', 
              fontWeight: '600', 
              cursor: isSubmitting ? 'not-allowed' : 'pointer' 
            }}
          >
            {isSubmitting ? 'Processing...' : 'Pay $47.00'}
          </button>
        </form>
      </div>
    );
  };
  
  useEffect(() => {
    // Only attempt to mount the Drop-in Element when on the payment step (step 1)
    // and if we have Airwallex SDK, payment intent, and a container reference
    if (currentStep === 1 && window.Airwallex && airwallexReady && paymentIntentInfo && dropInContainerRef.current && !dropInMounted) {
      try {
        console.log('Initializing Airwallex with:', {
          env: process.env.REACT_APP_AIRWALLEX_ENV || 'demo',
          intent: paymentIntentInfo,
        });
        
        // Initialize the Airwallex global to prepare for Drop-in Element
        // Following the official documentation pattern
        const airwallex = window.Airwallex.createElement({
          env: process.env.REACT_APP_AIRWALLEX_ENV || 'demo',
          // Add origin for additional security
          origin: window.location.origin,
        });
        
        // Mount the Drop-in Element to the container
        airwallex.createDropIn({
          // Required parameters
          element: dropInContainerRef.current,
          mode: 'payment', // Always use 'payment' for the Drop-in Element
          intent: {
            // Include both ID and client secret as recommended by docs
            id: paymentIntentInfo.intentId,
            client_secret: paymentIntentInfo.clientSecret,
          },
          // Ensure the Pay button is displayed
          submitButtonText: 'Pay $47.00',
          
          // Optional styling customization
          style: {
            // Base styles apply to all elements
            base: {
              backgroundColor: '#fff',
              color: '#333',
              fontSize: '16px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
            // Styles for the submit button
            button: {
              backgroundColor: '#1890ff',
              color: '#fff',
              fontSize: '16px',
              fontWeight: '600',
              borderRadius: '4px',
              border: 'none',
              padding: '12px 16px',
              marginTop: '16px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              ':hover': {
                backgroundColor: '#40a9ff',
              },
              ':active': {
                backgroundColor: '#096dd9',
              },
              ':focus': {
                outline: 'none',
              },
            }
          },
          
          // Payment complete callback
          onSuccess: (evt: any) => {
            // Get form values for customer information
            const formValues = form.getFieldsValue();
            handlePaymentSuccess(formValues, paymentIntentInfo.intentId);
          },
          
          // Payment error callback
          onError: (evt: any) => {
            message.error("Payment failed: " + (evt.message || "Please try again."));
            setIsLoading(false);
          },
          
          // User canceled callback
          onCancel: () => {
            message.info("Payment canceled");
            setIsLoading(false);
          },
        });
        
        setDropInMounted(true);
      } catch (error) {
        console.error("Error mounting Airwallex Drop-in Element:", error);
        message.error("Failed to load payment form. Please try again.");
      }
    }
    
    // Cleanup function to destroy Airwallex element when component unmounts or payment step changes
    return () => {
      if (window.Airwallex && dropInMounted) {
        try {
          window.Airwallex.destroyElement('dropIn');
          setDropInMounted(false);
        } catch (error) {
          console.error("Error destroying Airwallex element:", error);
        }
      }
    };
  }, [currentStep, airwallexReady, paymentIntentInfo, dropInMounted, form, handlePaymentSuccess]);
  
  const nextStep = () => {
    // For step 0 (customer info), validate the form first
    if (currentStep === 0) {
      form.validateFields(['firstName', 'lastName', 'email'])
        .then(values => {
          // Instead of going to our payment form, immediately create a payment intent
          // and redirect to Airwallex's hosted payment page
          message.loading('Preparing secure payment...', 1.5);
          createPaymentIntent(values);
          
          // Note: We're not setting current step here as we'll be redirecting away
          // If the redirect fails, the error handling in createPaymentIntent will show appropriate messages
        })
        .catch(err => {
          console.error("Validation failed:", err);
          message.error("Please fill in all required fields");
        });
    } else {
      setCurrentStep(currentStep + 1);
    }
  };
  
  // Create payment intent with Airwallex and redirect to hosted payment page
  const createPaymentIntent = async (formValues: any) => {
    setIsLoading(true);
    
    try {
      // Create the customer info object from form values
      const customerInfo = {
        name: `${formValues.firstName} ${formValues.lastName}`,
        email: formValues.email,
        phone: formValues.phone || ''
      };
      
      // Save customer info to sessionStorage to preserve it across redirects
      sessionStorage.setItem('ezvep_customer_info', JSON.stringify(customerInfo));
      
      // Generate a unique order ID
      const orderID = `order_${uuid()}`;
      
      // Log for debugging
      console.log('Creating payment with customer:', customerInfo);
      console.log('Order ID:', orderID);
      
      // Server URL for payment processing
      const serverUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      
      try {
        // Try the simplified direct payment route first (most reliable approach)
        console.log('Attempting simplified direct payment flow...');
        
        // Call the backend direct payment route
        const serverResponse = await axios.post(`${serverUrl}/direct-payment`, {
          request_id: uuid(), // Unique request ID for idempotency
          amount: 47.00,
          currency: 'SGD',
          order_id: orderID,
          descriptor: 'EZVEP DIY Guide',
          customerInfo: customerInfo,
          return_url: `${window.location.origin}/payment-success` // Where to redirect after payment
        });
        
        console.log('Server payment flow response:', serverResponse.data);
        
        // If we received a direct payment URL, redirect to it
        if (serverResponse.data.success && serverResponse.data.paymentUrl) {
          message.loading('Redirecting to secure payment page...');
          // Save payment timestamp
          sessionStorage.setItem('ezvep_redirect_started', Date.now().toString());
          // Redirect to the payment URL
          window.location.href = serverResponse.data.paymentUrl;
          return; // Exit function since we're redirecting
        }
        
        // If we get here, the server-side flow didn't provide a payment URL
        // Fall back to client-side flow
        console.log('Server-side payment flow did not return a payment URL, falling back to client-side flow');
      } catch (serverError) {
        console.error('Server-side payment flow failed:', serverError);
        message.warning('Unable to connect to payment service, trying alternative method...');
      }
      
      // Fallback to client-side SDK flow if server-side flow failed
      console.log('Falling back to client-side payment flow...');
      
      try {
        // Call the backend to create a payment intent
        const response = await axios.post(`${serverUrl}/api/create-payment-intent`, {
          request_id: uuid(), // Unique request ID for idempotency
          amount: 47.00,
          currency: 'SGD',
          order_id: orderID,
          descriptor: 'EZVEP DIY Guide',
          return_url: `${window.location.origin}/payment-success`, // Where to redirect after payment
          metadata: {
            customer_name: customerInfo.name,
            customer_email: customerInfo.email,
            customer_phone: customerInfo.phone
          },
          customerInfo
        });
        
        console.log('Payment intent response:', response.data);
        
        // Extract needed data from response
        const clientSecret = response.data.clientSecret || response.data.client_secret;
        const intentId = response.data.intentId || response.data.id;
        const currency = response.data.currency || 'SGD';
        const isDemoMode = response.data.demo === true || response.data.mock === true;
        
        // Validate response
        if (!clientSecret || !intentId) {
          throw new Error('Invalid payment intent response: missing required fields');
        }
        
        // Store payment information for later use
        const paymentInfo = {
          clientSecret,
          intentId,
          currency,
          isDemoMode
        };
        
        // Save to state and session storage
        setPaymentIntentInfo(paymentInfo);
        sessionStorage.setItem('ezvep_payment_intent', JSON.stringify(paymentInfo));
        
        // For demo/fallback mode, skip redirection
        if (isDemoMode) {
          console.log('Demo mode detected, showing local payment form');
          message.info('Using test payment mode');
          setCurrentStep(1); // Move to payment step
          setIsLoading(false);
          return;
        }
        
        // Redirect to Airwallex hosted payment page
        message.info('Redirecting to secure payment page...');
        
        // Initialize Airwallex SDK
        const { payments } = await init({
          env: (process.env.REACT_APP_AIRWALLEX_ENV as "demo" | "prod") || 'demo',
          origin: window.location.origin,
          enabledElements: ['payments']
        });
        
        // Verify SDK initialization
        if (!payments) {
          throw new Error('Airwallex payments module failed to initialize');
        }
        
        // Save redirect timestamp
        sessionStorage.setItem('ezvep_redirect_started', Date.now().toString());
        
        // Redirect to hosted payment page using only the core parameters
        // needed to avoid TypeScript errors with the SDK
        await payments.redirectToCheckout({
          intent_id: intentId,
          client_secret: clientSecret,
          currency: currency
        });
        
        // Note: With this implementation, after payment completion, Airwallex will redirect back
        // to the current page. We'll handle payment verification in the PaymentSuccess component.
        
        // If we get here, redirection failed
        console.warn('Redirect to payment page failed or was blocked');
        
        // Fallback after timeout
        setTimeout(() => {
          if (!isLoading) return;
          setIsLoading(false);
          setCurrentStep(1);
          message.warning('Could not redirect to payment page. Please try again or use an alternative payment method.');
        }, 2500);
      } catch (sdkError: any) {
        console.error('Airwallex SDK error:', sdkError);
        setCurrentStep(1);
        setIsLoading(false);
        message.error(`Payment initialization failed: ${sdkError?.message || 'Unknown SDK error'}`);
      }
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      setCurrentStep(1);
      setIsLoading(false);
      
      // Handle specific error codes
      if (error?.response?.status) {
        const statusCode = error.response.status;
        
        if (statusCode === 401) {
          message.error(
            <div>
              Payment service authentication error. Please contact support.
            </div>
          );
          return;
        }
        
        if (statusCode === 404) {
          message.error(
            <div>
              Payment service unavailable. <button 
                onClick={() => createPaymentIntent(formValues)} 
                style={{ 
                  textDecoration: 'underline', 
                  background: 'none',
                  border: 'none',
                  color: '#1890ff',
                  cursor: 'pointer',
                  padding: 0
                }}>
                Please try again
              </button>
            </div>
          );
          return;
        }
      }
      
      // Generic error message
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Unknown error occurred';
      
      message.error(
        <div>
          Payment initialization failed: {errorMessage}. <button 
            onClick={() => createPaymentIntent(formValues)} 
            style={{ 
              textDecoration: 'underline', 
              background: 'none',
              border: 'none',
              color: '#1890ff',
              cursor: 'pointer',
              padding: 0
            }}>
            Please try again
          </button>
        </div>
      );
    }
  };
  
  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // This section intentionally left empty after moving handlePaymentSuccess up above
  
  // Form submission handler
  const onFinish = (values: any) => {
    // This will be called when the form is submitted on step 2 (review)
    setIsLoading(true);
    
    // If we're on the confirmation step and already have payment intent,
    // just proceed to success
    if (currentStep === 2 && paymentIntentInfo) {
      setTimeout(() => {
        setIsSuccess(true);
        setIsLoading(false);
      }, 1500);
    } else {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Container>
        <CheckoutContainer>
          <Fade direction="up" triggerOnce>
            <SuccessContainer>
              <SvgIcon src="check-circle.svg" width="80px" height="80px" />
              <h2>Thank You for Your Purchase!</h2>
              <p>Your DIY VEP E-Guide has been sent to your email. Check your inbox (and spam folder) for instructions on how to access your guide.</p>
              <Button onClick={() => history.push("/")}>
                Return to Home
              </Button>
            </SuccessContainer>
          </Fade>
        </CheckoutContainer>
      </Container>
    );
  }

  // For steps 0 and 2, use the original layout
  if (currentStep === 0) {
    return (
      <Container>
        <CheckoutContainer>
          <Fade direction="up" triggerOnce>
            <Title>Checkout - DIY VEP E-Guide</Title>
            
            <StepsContainer>
              <Steps current={currentStep}>
                <Step title="Your Details" />
                <Step title="Payment" />
                <Step title="Confirmation" />
              </Steps>
            </StepsContainer>
            
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{ paymentMethod: "credit" }}
            >
              <Card>
                <SectionTitle>Your Information</SectionTitle>
                <Row gutter={24}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="firstName"
                      label="First Name"
                      rules={[{ required: true, message: "Please enter your first name" }]}
                    >
                      <Input placeholder="First Name" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="lastName"
                      label="Last Name"
                      rules={[{ required: true, message: "Please enter your last name" }]}
                    >
                      <Input placeholder="Last Name" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item
                  name="email"
                  label="Email Address"
                  rules={[
                    { required: true, message: "Please enter your email" },
                    { type: "email", message: "Please enter a valid email" }
                  ]}
                >
                  <Input placeholder="Email Address" />
                </Form.Item>
                <Form.Item
                  name="phone"
                  label="Phone Number (optional)"
                >
                  <Input placeholder="Phone Number" />
                </Form.Item>
                
                <ButtonContainer>
                  <div></div> {/* Empty div for spacing */}
                  <Button onClick={nextStep}>
                    Continue to Payment
                  </Button>
                </ButtonContainer>
              </Card>
            </Form>
          </Fade>
        </CheckoutContainer>
      </Container>
    );
  }
  
  // For step 1 (payment), use the two-column layout that matches the Airwallex demo store
  if (currentStep === 1) {
    return (
      <Container>
        <CheckoutContainer>
          <Fade direction="up" triggerOnce>
            <Title style={{ fontWeight: 500, color: '#333', fontSize: '24px', marginBottom: '40px' }}>Summary</Title>
            
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
            >
              <TwoColumnLayout>
                {/* Left Column - Order Summary */}
                <SummaryColumn>
                  <ProductDetails>
                    <ProductImage src="/img/svg/guidebook.jpg" alt="DIY VEP E-Guide" />
                    <ProductInfo>
                      <ProductTitle>Your Passport to Global Business</ProductTitle>
                      <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                        Comprehensive DIY guide for your VEP application
                      </div>
                    </ProductInfo>
                  </ProductDetails>
                  
                  <SummaryItem>
                    <span>Subtotal</span>
                    <span>$47.00</span>
                  </SummaryItem>
                  <SummaryItem>
                    <span>Shipping</span>
                    <span>$0</span>
                  </SummaryItem>
                  <Total>
                    <span>Total</span>
                    <span>$47.00</span>
                  </Total>
                </SummaryColumn>
                
                {/* Right Column - Payment Form */}
                <PaymentColumn>
                  <CardInfoTitle>Card information</CardInfoTitle>
                  <AirwallexContainer>
                    {isLoading ? (
                      <LoadingContainer>
                        <Spin size="large" />
                        <p>Loading payment system...</p>
                      </LoadingContainer>
                    ) : (!window.Airwallex || !airwallexReady || !paymentIntentInfo) ? (
                      // Show the fallback form when Airwallex is not available
                      <FallbackPaymentForm />
                    ) : (
                      // Container for the real Airwallex Drop-in Element
                      <div ref={dropInContainerRef} style={{ width: '100%' }}></div>
                    )}
                  </AirwallexContainer>
                  
                  <div style={{ fontSize: '0.85rem', marginTop: '1.5rem', color: '#666' }}>
                    Your card information is securely processed by Airwallex.
                  </div>
                  
                  {/* Demo card info box (like in the screenshot) */}
                  {!isLoading && (
                    <div style={{ 
                      marginTop: '24px', 
                      padding: '16px', 
                      backgroundColor: '#f9f9fb',
                      borderRadius: '8px',
                      border: '1px solid #eee'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <SvgIcon src="credit-card.svg" width="20px" height="20px" />
                        <span style={{ marginLeft: '8px', fontWeight: 500 }}>Demo card</span>
                      </div>
                      <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
                        Try card below to make a payment:
                      </p>
                      <div style={{ margin: '8px 0', fontSize: '14px', fontFamily: 'monospace' }}>
                        4242 4242 4242 4242
                      </div>
                    </div>
                  )}
                  
                  <ButtonContainer>
                    <Button onClick={prevStep}>
                      Back
                    </Button>
                  </ButtonContainer>
                </PaymentColumn>
              </TwoColumnLayout>
            </Form>
          </Fade>
        </CheckoutContainer>
      </Container>
    );
  }
  
  // For step 2 (confirmation), use the original layout
  return (
    <Container>
      <CheckoutContainer>
        <Fade direction="up" triggerOnce>
          <Title>Checkout - DIY VEP E-Guide</Title>
          
          <StepsContainer>
            <Steps current={currentStep}>
              <Step title="Your Details" />
              <Step title="Payment" />
              <Step title="Confirmation" />
            </Steps>
          </StepsContainer>
          
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
          >
            <Card>
              <SectionTitle>Order Summary</SectionTitle>
              <SummaryItem>
                <span>DIY VEP E-Guide</span>
                <span>SGD 47.00</span>
              </SummaryItem>
              <Total>
                <span>Total</span>
                <span>SGD 47.00</span>
              </Total>
              
              <ButtonContainer>
                <Button onClick={prevStep}>
                  Back
                </Button>
                <Button htmlType="submit">
                  {isLoading ? "Processing..." : "Complete Purchase"}
                </Button>
              </ButtonContainer>
            </Card>
          </Form>
        </Fade>
      </CheckoutContainer>
    </Container>
  );
};

export default Checkout;
