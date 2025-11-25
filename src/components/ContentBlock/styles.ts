import { Row } from "antd";
import styled from "styled-components";

export const ImageDescription = styled("p")`
  font-size: 1.25em;
  margin-top: 0.5em;
  text-align: center;
`;

export const ContentSection = styled("section")`
  position: relative;
  padding: 10rem 0 8rem;

  @media only screen and (max-width: 1024px) {
    padding: 4rem 0 4rem;
  }
`;

export const Content = styled("p")`
  margin: 1.5rem 0 2rem 0;
`;

export const StyledRow = styled(Row)`
  flex-direction: ${({ direction }: { direction: string }) =>
    direction === "left" ? "row" : "row-reverse"};
`;

export const ContentWrapper = styled("div")`
  position: relative;
  max-width: 540px;

  @media only screen and (max-width: 575px) {
    padding-top: 4rem;
  }
`;

export const ServiceWrapper = styled("div")`
  display: flex;
  justify-content: space-between;
  max-width: 100%;
`;

export const MinTitle = styled("h6")`
  font-size: 15px;
  line-height: 1rem;
  padding: 0.5rem 0;
  text-transform: uppercase;
  color: #000;
  font-family: "Motiva Sans Light", sans-serif;
`;

export const MinPara = styled("p")`
  font-size: 13px;
`;

export const ButtonWrapper = styled("div")`
  display: flex;
  justify-content: space-between;
  max-width: 100%;

  @media screen and (min-width: 1024px) {
    max-width: 80%;
  }

  button:last-child {
    margin-left: 20px;
  }
`;

export const CenteredContentSection = styled(ContentSection)`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 6rem 0 6rem;

  .ant-col {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  @media only screen and (max-width: 1024px) {
    flex-direction: column;
    padding: 3rem 0 3rem;
  }
`;

export const PricingButtonWrapper = styled("div")`
  margin-top: 30px;
  display: inline-block;

  button {
    padding: 10px 25px !important;
    font-size: 1rem !important;
    max-width: none !important;
  }
`;