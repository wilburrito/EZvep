import { useState } from "react";
import { useHistory } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import "../styles/checkout.css";

const CheckoutPage = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // State for customer information
  const [customerName, setCustomerName] = useState("Test Customer");
  const [customerEmail, setCustomerEmail] = useState("test@example.com");
  
  // Order details
  const orderDetails = {
    amount: 47.00,
    currency: "SGD"
  };

  const validateForm = () => {
    if (!customerName.trim()) {
      setError("Please enter your name");
      return false;
    }
    
    if (!customerEmail.trim()) {
      setError("Please enter your email address");
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      setError("Please enter a valid email address");
      return false;
    }
    
    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      console.log('Attempting payment with Stripe...');
      // Call our backend API to create a Stripe checkout session
      const response = await fetch("https://www.ezvep.com/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: orderDetails.amount, // Send raw amount, backend will convert to cents
          currency: orderDetails.currency.toLowerCase(),
          customerEmail: customerEmail,
          customerName: customerName,
          productName: "EZVEP DIY VEP Guide"
        })
      });

      const data = await response.json();

      if (data.url) {
        // If we got a successful response with checkout URL, redirect to Stripe
        window.location.href = data.url;
      } else {
        setError(data.error?.message || "Failed to create payment session");
      }
    } catch (err) {
      setError("Error connecting to payment service");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Checkout - EZVEP</title>
        <meta name="description" content="Complete your event planning purchase" />
      </Helmet>
      <div className="checkout-container">
        <div className="checkout-card">
          <h1 className="checkout-title">{t("Checkout")}</h1>
          
          <div className="order-summary">
            <h2>{t("Order Summary")}</h2>
            <div className="order-item">
              <span>EZVEP DIY VEP Guide</span>
              <span>${orderDetails.amount.toFixed(2)}</span>
            </div>
            <div className="divider"></div>
            <div className="order-total">
              <span>{t("Total")}</span>
              <span>${orderDetails.amount.toFixed(2)} {orderDetails.currency}</span>
            </div>
          </div>

          <div className="customer-info">
            <h2>{t("Customer Information")}</h2>
            <div className="form-group">
              <label htmlFor="customerName">{t("Name")}:</label>
              <input
                type="text"
                id="customerName"
                className="form-input"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="customerEmail">{t("Email")}:</label>
              <input
                type="email"
                id="customerEmail"
                className="form-input"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="button-group">
            <button
              className="checkout-button"
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  {t("Processing...")}
                </>
              ) : (
                t("Proceed to Payment")
              )}
            </button>
            <button
              className="cancel-button"
              onClick={() => history.push("/")}
              disabled={loading}
            >
              {t("Cancel")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
