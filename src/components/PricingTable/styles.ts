import styled from "styled-components";

export const PricingSection = styled("section")`
  position: relative;
  padding: 7.5rem 0 3rem;
  text-align: center;
  display: flex;
  justify-content: center;

  @media only screen and (max-width: 1024px) {
    padding: 4rem 0 4rem;
  }
`;

export const PricingContainer = styled("div")`
  width: 100%;
  max-width: 1200px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const PricingHeader = styled("div")`
  margin-bottom: 3rem;
  width: 80%;
  
  h2 {
    font-size: 2.5rem;
    margin-bottom: 1.5rem;
    color: #2e186a;
    
    @media only screen and (max-width: 768px) {
      font-size: 2rem;
    }
  }
  
  p {
    font-size: 1.125rem;
    margin-bottom: 2rem;
    
    @media only screen and (max-width: 768px) {
      font-size: 1rem;
    }
  }
`;

export const PricingCardsContainer = styled("div")`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  width: 100%;
  
  @media only screen and (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

export const PricingCard = styled("div")<{ highlight?: boolean }>`
  background: ${props => props.highlight ? '#18436B' : props.theme.background};
  color: ${props => props.highlight ? 'white' : 'inherit'};
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
  border: ${props => props.highlight ? 'none' : '1px solid #e8e8e8'};
  transform: ${props => props.highlight ? 'scale(1.05)' : 'scale(1)'};
  
  @media only screen and (max-width: 1024px) {
    transform: scale(1);
    margin-bottom: ${props => props.highlight ? '1.5rem' : '0'};
  }
  
  @media only screen and (max-width: 768px) {
    max-width: 90%;
    margin-bottom: 1.5rem;
  }
  
  &:hover {
    transform: ${props => props.highlight ? 'scale(1.08)' : 'scale(1.03)'};
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    
    @media only screen and (max-width: 1024px) {
      transform: ${props => props.highlight ? 'scale(1.03)' : 'scale(1.02)'};
    }
  }
`;

export const PlanTitle = styled("h3")<{ highlight?: boolean, free?: boolean }>`
  font-size: ${props => props.free ? '1.6rem' : '1.8rem'};
  font-weight: 600;
  margin-bottom: 1rem;
  color: ${props => props.highlight ? 'white' : '#2e186a'};
`;

export const PlanPrice = styled("div")<{ highlight?: boolean }>`
  font-size: 2.2rem;
  font-weight: 700;
  margin: 1rem 0;
  color: ${props => props.highlight ? 'white' : '#2e186a'};
`;

export const PlanPeriod = styled("span")<{ highlight?: boolean }>`
  font-size: 0.9rem;
  font-weight: 400;
  color: ${props => props.highlight ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.6)'};
`;

export const FeaturesList = styled("ul")`
  list-style-type: none;
  padding: 0;
  margin: 1.5rem 0;
  flex-grow: 1;
  text-align: left;
`;

export const Feature = styled("li")<{ highlight?: boolean }>`
  padding: 0.6rem 0;
  display: flex;
  align-items: flex-start;
  font-size: ${props => props.highlight ? '1.05rem' : '1rem'};
  color: ${props => props.highlight ? 'rgba(255, 255, 255, 0.9)' : 'inherit'};

  &:before {
    content: "•";
    margin-right: 0.5rem;
    color: ${props => props.highlight ? '#5FD068' : '#2e186a'};
    font-size: 1.2rem;
    line-height: 1;
  }
`;

export const PricingButton = styled("button")<{ highlight?: boolean, free?: boolean }>`
  background: ${props => {
    if (props.highlight) return '#5FD068';
    if (props.free) return '#4D5E6F';
    return '#AAD9EE';
  }};
  color: ${props => props.highlight || props.free ? 'white' : '#18436B'};
  font-size: ${props => props.highlight ? '1.1rem' : '1rem'};
  font-weight: 600;
  border: none;
  border-radius: 6px;
  padding: ${props => props.highlight ? '0.9rem 1.5rem' : '0.8rem 1.2rem'};
  cursor: pointer;
  width: 100%;
  margin-top: 1rem;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }
`;

export const PromoSection = styled("div")`
  background-color: #FFF8E1;
  border-radius: 8px;
  padding: 1.2rem 2rem;
  margin: 2.5rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 800px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  
  @media only screen and (max-width: 768px) {
    flex-direction: column;
    padding: 1.2rem 1rem;
    text-align: center;
  }
`;

export const PromoIcon = styled("div")`
  margin-right: 1.5rem;
  
  @media only screen and (max-width: 768px) {
    margin-right: 0;
    margin-bottom: 0.8rem;
  }
`;

export const PromoText = styled("div")`
  h3 {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 0.3rem;
    color: #2e186a;
  }
  
  p {
    font-size: 1rem;
    margin: 0;
    color: #333;
  }
`;

export const HelpText = styled("p")`
  font-size: 1.1rem;
  margin-top: 2rem;
  color: #555;
  font-weight: 500;
`;
