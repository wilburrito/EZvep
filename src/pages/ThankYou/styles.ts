import styled from "styled-components";

export const ThankYouContainer = styled("section")`
  position: relative;
  padding: 7.5rem 0 3rem;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 300px);
`;

export const ThankYouContent = styled("div")`
  padding: 3rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
`;

export const Title = styled("h1")`
  font-size: 2.5rem;
  margin: 0.5rem 0;
  color: #2e186a;
`;

export const Subtitle = styled("p")`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: #4b4b4b;
`;
