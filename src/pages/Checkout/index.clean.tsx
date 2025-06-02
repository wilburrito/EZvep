import './index.css';
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import { Form, Input, Button, Steps, Result, message, Spin, Row, Col } from 'antd';
import styled from 'styled-components';
import Container from '../../common/Container';
import { Fade } from 'react-awesome-reveal';

declare global {
  interface Window {
    gtag: (command: string, action: string, params?: { [key: string]: any }) => void;
  }
}

const { Step } = Steps;

const CheckoutContainer = styled('div')`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 5rem 0 3rem;
`;

const StepsContainer = styled('div')`
  width: 100%;
  max-width: 900px;
  margin-bottom: 2rem;
`;

const ContentContainer = styled('div')`
  width: 100%;
  max-width: 900px;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const FormItem = styled(Form.Item)`
  margin-bottom: 1.5rem;
`;

const LoadingContainer = styled('div')`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 3rem 0;
`;

const ButtonGroup = styled('div')`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
`;

const PaymentSuccessContainer = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem 0;
`;

const Checkout = () => {
  const [form] = Form.useForm();
  const history = useHistory();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId] = useState<string>(() => uuid());

  // Check for successful payment return from Stripe
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const canceled = urlParams.get('canceled');
    
    if (success === 'true') {
      // Track successful payment with Google Analytics
      if (window.gtag) {
        window.gtag('event', 'purchase', {
          transaction_id: orderId,
          value: 47.00,
          currency: 'SGD',
          items: [{ name: 'DIY VEP Guide', price: 47.00 }]
        });
      }
      
      setIsSuccess(true);
      setCurrentStep(2);
    } else if (canceled === 'true') {
      message.error('Payment was canceled. Please try again.');
      setCurrentStep(0);
    }
  }, [orderId]);

  const handleSubmit = async (values: any) => {
    try {
      setIsLoading(true);
      setError(null);

      // Save customer info to session storage for persistence across redirects
      sessionStorage.setItem('customer_info', JSON.stringify(values));
      
      // Try primary API endpoint first, then fallback
      const apiEndpoints = [
        '/direct-api/create-checkout-session',
        '/api/create-checkout-session'
      ];
      
      let response = null;
      let lastError = null;
      let errorMessage = 'Failed to initialize payment. Please try again.';
      
      // Try each endpoint until one succeeds
      for (const apiUrl of apiEndpoints) {
        try {
          const resp = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              customer_email: values.email,
              customer_name: values.name,
              product_name: 'DIY VEP Guide',
              product_price: 47.00,
              currency: 'SGD',
              order_id: orderId,
              success_url: window.location.origin + window.location.pathname + '?success=true',
              cancel_url: window.location.origin + window.location.pathname + '?canceled=true',
            }),
          });
          
          if (!resp.ok) {
            const errorData = await resp.json().catch(() => ({}));
            lastError = errorData.error || `HTTP error: ${resp.status}`;
            console.error(`API call to ${apiUrl} failed:`, lastError);
            continue; // Try next endpoint
          }
          
          response = await resp.json();
          break; // Success, exit loop
        } catch (err) {
          lastError = err instanceof Error ? err.message : 'Unknown error';
          console.error(`API call to ${apiUrl} failed:`, lastError);
        }
      }
      
      if (!response || !response.url) {
        console.error('All API endpoints failed:', lastError);
        setError(errorMessage);
        setIsLoading(false);
        return;
      }
      
      // Redirect to Stripe Checkout
      window.location.href = response.url;
      
    } catch (error) {
      console.error('Payment submission error:', error);
      setError('Failed to process your payment. Please try again.');
      setIsLoading(false);
    }
  };

  // Navigation happens via form submission or URL parameters

  const steps = [
    {
      title: 'Customer Details',
      content: (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={
            JSON.parse(sessionStorage.getItem('customer_info') || '{}')
          }
        >
          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <FormItem
                name="name"
                label="Full Name"
                rules={[{ required: true, message: 'Please enter your name' }]}
              >
                <Input placeholder="Enter your full name" size="large" />
              </FormItem>
            </Col>
            <Col xs={24} md={12}>
              <FormItem
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input placeholder="Enter your email" size="large" />
              </FormItem>
            </Col>
          </Row>

          <ButtonGroup>
            <Button type="default" onClick={() => history.push('/')}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              Proceed to Payment
            </Button>
          </ButtonGroup>
          
          {error && (
            <div style={{ marginTop: '1rem', color: 'red' }}>
              {error}
            </div>
          )}
        </Form>
      )
    },
    {
      title: 'Payment',
      content: (
        <LoadingContainer>
          <Spin size="large" />
          <p style={{ marginTop: '1rem' }}>
            Initializing payment, please wait...
          </p>
        </LoadingContainer>
      )
    },
    {
      title: 'Complete',
      content: (
        <PaymentSuccessContainer>
          {isSuccess ? (
            <Result
              status="success"
              title="Payment Successful!"
              subTitle="Thank you for your purchase. We've sent you an email with your DIY VEP Guide."
              extra={[
                <Button 
                  type="primary" 
                  key="home" 
                  onClick={() => history.push('/')}
                >
                  Back to Home
                </Button>
              ]}
            />
          ) : (
            <LoadingContainer>
              <Spin size="large" />
              <p style={{ marginTop: '1rem' }}>
                Processing your payment...
              </p>
            </LoadingContainer>
          )}
        </PaymentSuccessContainer>
      )
    }
  ];

  return (
    <Container>
      <Fade>
        <CheckoutContainer>
          <StepsContainer>
            <Steps current={currentStep}>
              {steps.map(item => (
                <Step key={item.title} title={item.title} />
              ))}
            </Steps>
          </StepsContainer>
          <ContentContainer>
            {steps[currentStep].content}
          </ContentContainer>
        </CheckoutContainer>
      </Fade>
    </Container>
  );
};

export default Checkout;
