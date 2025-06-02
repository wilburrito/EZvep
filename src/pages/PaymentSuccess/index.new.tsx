import React from 'react';
import styled from 'styled-components';
import Container from '../../common/Container';

// This comment ensures the file is treated as a module
// TypeScript requires files to be modules to use JSX with --isolatedModules

const StyledContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 2rem;
`;

// Define component as React.FC type
const PaymentSuccess: React.FC = () => {
  // Simplified implementation without unused state variables
  return (
    <Container>
      <StyledContainer>
        <div>Payment Successful!</div>
        <div>Thank you for your purchase.</div>
      </StyledContainer>
    </Container>
  );
};

export default PaymentSuccess;
