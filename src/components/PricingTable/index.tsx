import React, { useState } from "react";
import { Row, Col, Modal, Form, Input, message } from "antd";
import { Fade } from "react-awesome-reveal";
import { withTranslation } from "react-i18next";
import { SvgIcon } from "../../common/SvgIcon";
import { PricingTableProps, PlanProps } from "./types";
import {
  PricingSection,
  PricingContainer,
  PricingHeader,
  PricingCardsContainer,
  PricingCard,
  PlanTitle,
  PlanPrice,
  PlanPeriod,
  FeaturesList,
  Feature,
  PricingButton,
  PromoSection,
  PromoIcon,
  PromoText,
  HelpText,
} from "./styles";

const PricingTable = ({ title, content, id, t }: PricingTableProps) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openWhatsApp = () => {
    // Using WhatsApp API to open a chat with a pre-defined message
    const phoneNumber = "+60123456789"; // Replace with actual WhatsApp number
    const message = "Hi! I'm interested in the Done-For-You VEP Service.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const redirectToCheckout = () => {
    // Replace with actual checkout page URL
    window.location.href = "/checkout";
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const onFinish = async (values: any) => {
    setIsSubmitting(true);
    try {
      // Google Apps Script URL
      const appsScriptUrl = 'https://script.google.com/macros/s/AKfycbwV7yRB8AKBxnWEyqURfEUWcsQi9bF1ahcUDmA9XpiVYmmrXnTgpsPSburEY6TomFgbjA/exec';
      
      console.log('DEBUG - Form values being submitted:', values);
      
      // Use a direct HTML form submission approach to bypass CORS issues
      // Create an invisible form element
      const tempForm = document.createElement('form');
      tempForm.method = 'POST';
      tempForm.action = appsScriptUrl;
      tempForm.target = '_blank'; // Opens in a new tab, but will be hidden
      tempForm.style.display = 'none';
      
      // Add name input
      const nameInput = document.createElement('input');
      nameInput.type = 'hidden';
      nameInput.name = 'name';
      nameInput.value = values.name;
      tempForm.appendChild(nameInput);
      
      // Add email input
      const emailInput = document.createElement('input');
      emailInput.type = 'hidden';
      emailInput.name = 'email';
      emailInput.value = values.email;
      tempForm.appendChild(emailInput);
      
      // Add phone input if provided
      if (values.phone) {
        const phoneInput = document.createElement('input');
        phoneInput.type = 'hidden';
        phoneInput.name = 'phone';
        phoneInput.value = values.phone;
        tempForm.appendChild(phoneInput);
      }
      
      // Add the full JSON data for more complex processing in the Apps Script
      const jsonInput = document.createElement('input');
      jsonInput.type = 'hidden';
      jsonInput.name = 'json';
      jsonInput.value = JSON.stringify({
        name: values.name,
        email: values.email,
        phone: values.phone || ''
      });
      tempForm.appendChild(jsonInput);
      
      // Create a hidden iframe to handle the form submission without page redirect
      const iframe = document.createElement('iframe');
      iframe.name = 'hidden-form-target';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      
      // Set form to target the hidden iframe
      tempForm.target = 'hidden-form-target';
      document.body.appendChild(tempForm);
      
      // Submit the form - the response will load in the hidden iframe
      tempForm.submit();
      
      // Remove the form and iframe after submission
      setTimeout(() => {
        if (document.body.contains(tempForm)) {
          document.body.removeChild(tempForm);
        }
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2000);
      
      message.success("Thank you! The free VEP FAQ guide will be sent to your email shortly.");
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error("There was an error processing your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const planData: PlanProps[] = [
    {
      title: "VEP FAQ Guide",
      price: "Free Download",
      features: [
        "15+ FAQs answered",
        "Eligibility details",
        "Common pitfalls",
        "Checklist preview",
      ],
      buttonText: "Download Free FAQ",
      buttonAction: showModal,
      free: true,
    },
    {
      title: "DIY VEP E-Guide",
      price: "$47.00",
      period: "one-time",
      features: [
        "Step-by-step guide",
        "Screenshots & tips",
        "Insider tips",
        "Checklist templates",
      ],
      buttonText: "Get the E-Guide",
      buttonAction: redirectToCheckout,
    },
    {
      title: "Done-For-You VEP Service",
      price: "$120",
      period: "one-time",
      features: [
        "Full application handled",
        "Expert support",
        "Guaranteed approval",
        "Zero hassle, peace of mind",
      ],
      buttonText: "Let Us Handle It",
      buttonAction: openWhatsApp,
      highlight: true,
    },
  ];

  return (
    <PricingSection id={id}>
      <PricingContainer>
        <Fade direction="up" triggerOnce>
          <PricingHeader>
            <h2>{t(title)}</h2>
            <p>{t(content)}</p>
          </PricingHeader>

          <PricingCardsContainer>
            {planData.map((plan, index) => (
              <PricingCard key={index} highlight={plan.highlight}>
                <PlanTitle highlight={plan.highlight} free={plan.free}>
                  {t(plan.title)}
                </PlanTitle>
                <PlanPrice highlight={plan.highlight}>
                  {t(plan.price)}
                  {plan.period && <PlanPeriod highlight={plan.highlight}> ({t(plan.period)})</PlanPeriod>}
                </PlanPrice>
                <FeaturesList>
                  {plan.features.map((feature, idx) => (
                    <Feature key={idx} highlight={plan.highlight}>
                      {t(feature)}
                    </Feature>
                  ))}
                </FeaturesList>
                <PricingButton 
                  onClick={plan.buttonAction} 
                  highlight={plan.highlight}
                  free={plan.free}
                >
                  {t(plan.buttonText)}
                </PricingButton>
              </PricingCard>
            ))}
          </PricingCardsContainer>

          <PromoSection>
            <PromoIcon>
              <SvgIcon src="fire.svg" width="48px" height="48px" />
            </PromoIcon>
            <PromoText>
              <h3>Limited Time Offer!</h3>
              <p>Get 20% off our DIY VEP E-Guide or Done-For-You Service for the month of June!</p>
            </PromoText>
          </PromoSection>

          <HelpText>
            Need help deciding? Chat with us on WhatsApp!
          </HelpText>
        </Fade>
      </PricingContainer>

      <Modal
        title="Download Free VEP FAQ Guide"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <p style={{ marginBottom: "20px" }}>
          Get our free VEP FAQ guide to start your journey, but remember that this is just the basics. 
          For complete guidance and to avoid common pitfalls, consider our premium options.
        </p>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="name"
            label="Your Name"
            rules={[{ required: true, message: "Please enter your name" }]}
          >
            <Input placeholder="Enter your full name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" }
            ]}
          >
            <Input placeholder="Enter your email address" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone Number (Optional)"
          >
            <Input placeholder="Enter your phone number" />
          </Form.Item>
          <Row justify="end">
            <Col>
              <button
                type="submit"
                style={{
                  background: "#2e186a",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Me the Free Guide"}
              </button>
            </Col>
          </Row>
        </Form>
      </Modal>
    </PricingSection>
  );
};

export default withTranslation()(PricingTable);
