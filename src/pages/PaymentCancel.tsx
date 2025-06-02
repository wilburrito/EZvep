import React from "react";
import { useHistory } from "react-router-dom";
import { Helmet } from "react-helmet";
import "../styles/PaymentCancel.css";

const PaymentCancel = () => {
  const history = useHistory();
  
  return (
    <>
      <Helmet>
        <title>Payment Cancelled - EZVEP</title>
        <meta name="description" content="Your payment was cancelled" />
      </Helmet>
      <div className="payment-cancel-container">
        <div className="cancel-card">
          <div className="cancel-icon">
            <span>✕</span>
          </div>
          <h1>Payment Cancelled</h1>
          <p className="cancel-message">
            Your payment process has been cancelled. No charges have been made to your card.
          </p>
          
          <div className="action-buttons">
            <button 
              className="retry-button"
              onClick={() => history.push("/checkout")}
            >
              Try Again
            </button>
            <button 
              className="home-button-secondary"
              onClick={() => history.push("/")}
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentCancel;
