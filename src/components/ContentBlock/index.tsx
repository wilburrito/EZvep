import { Row, Col } from "antd";
import { Fade } from "react-awesome-reveal";
import { withTranslation } from "react-i18next";

import { ContentBlockProps } from "./types";
import { Button } from "../../common/Button";
import { SvgIcon } from "../../common/SvgIcon";
import {
  ContentSection,
  Content,
  ContentWrapper,
  ServiceWrapper,
  MinTitle,
  MinPara,
  StyledRow,
  ButtonWrapper,
  ImageDescription,
  PricingButtonWrapper,
} from "./styles";

const ContentBlock = ({
  icon,
  title,
  content,
  section,
  button,
  t,
  id,
  direction,
  imageDescription,
  oldPrice = 150,
}: ContentBlockProps) => {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id) as HTMLDivElement;
    element.scrollIntoView({
      behavior: "smooth",
    });
  };

  const SectionComponent = ContentSection;

  return (
    <SectionComponent>
      <Fade direction={direction} triggerOnce>
        {id === "pricing" ? (
          <>
            {/* Promo Badge - Full Width */}
            <Row>
              <Col span={24} style={{ textAlign: "center", marginBottom: "20px" }}>
                <div
                  style={{
                    background: "#ff5c5c",
                    color: "white",
                    padding: "6px 14px",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: "1.2rem",
                    textTransform: "uppercase",
                    display: "inline-block",
                  }}
                >
                  Year-End Offer · Ends 24 Dec
                </div>
              </Col>
            </Row>

            {/* Two Column Layout: Title/Image on Left, Content on Right */}
            <StyledRow
              justify="space-between"
              align="middle"
              id={id}
              direction="left"
            >
              {/* Left Column: Styled Title, Strikethrough Price, and Discount Icon */}
              <Col lg={11} md={11} sm={12} xs={24}>
                <div style={{ textAlign: "center" }}>
                  {/* Styled Title */}
                  <h6 style={{ fontSize: "2.5rem", marginBottom: "10px" }}>
                    <span style={{ fontSize: "2rem", fontWeight: "bold" }}>
                    Limited-Time: VEP at <span style={{ color: "#FF5C5C" }}>$130 Nett</span>
                    </span>
                  </h6>
                  {/* Strikethrough Price */}
                  <div style={{ marginBottom: "20px" }}>
                    <span
                      style={{
                        textDecoration: "line-through",
                        fontSize: "1.5rem",
                        color: "#777",
                      }}
                    >
                      {`(usual $${oldPrice})`}
                    </span>
                  </div>
                  {/* Discount Icon as img */}
                  <img 
                    src="/img/svg/discount-icon.svg" 
                    alt="Discount Offer" 
                    style={{ width: "100%", maxWidth: "450px", height: "auto" }}
                  />
                </div>
              </Col>

              {/* Right Column: Content Only */}
              <Col lg={11} md={11} sm={11} xs={24}>
                <ContentWrapper>
                  <Content style={{ marginTop: 0 }}>
                    {/* Content from JSON - Larger text with highlights */}
                    <div style={{ fontSize: "1.25rem", lineHeight: "1.6" }}>
                      <p style={{ marginBottom: "1.5rem" }}>
                        For a limited time only, get your VEP done for{" "}
                        <strong style={{ color: "#FF5C5C" }}>$130 nett</strong> (usual $150) when you sign up before{" "}
                        <strong style={{ color: "#FF5C5C" }}>24 December</strong>.{" "}
                        <strong>Same fast processing, same dedicated support</strong> – just at a better price.
                      </p>
                      <p style={{ marginBottom: 0 }}>
                        Have friends or family driving up too? Refer them or add another car and enjoy our{" "}
                        <strong style={{ color: "#FF5C5C" }}>referral savings</strong> together.
                      </p>
                    </div>
                  </Content>
                  <PricingButtonWrapper>
                    <Button onClick={() => scrollTo("contact")}>
                      {t("Contact Us!")}
                    </Button>
                  </PricingButtonWrapper>
                </ContentWrapper>
              </Col>
            </StyledRow>
          </>
        ) : (
          <StyledRow
            justify="space-between"
            align="middle"
            id={id}
            direction={direction}
          >
            <Col lg={11} md={11} sm={12} xs={24}>
              {icon && <SvgIcon src={icon} width="100%" height="100%" />}
              {imageDescription && <ImageDescription>{imageDescription}</ImageDescription>}
            </Col>
            <Col lg={11} md={11} sm={11} xs={24}>
              <ContentWrapper>
                <h6>{t(title)}</h6>
                <Content>{t(content)}</Content>
                {direction === "right" ? (
                  <ButtonWrapper>
                    {typeof button === "object" &&
                      button.map(
                        (
                          item: {
                            color?: string;
                            title: string;
                          },
                          id: number
                        ) => {
                          return (
                            <Button
                              key={id}
                              color={item.color}
                              onClick={() => scrollTo("about")}
                            >
                              {t(item.title)}
                            </Button>
                          );
                        }
                      )}
                  </ButtonWrapper>
                ) : (
                  <ServiceWrapper>
                    <Row justify="space-between">
                      {typeof section === "object" &&
                        section.map(
                          (
                            item: {
                              title: string;
                              content: string;
                              icon: string;
                            },
                            id: number
                          ) => {
                            return (
                              <Col key={id} span={11}>
                                <SvgIcon
                                  src={item.icon}
                                  width="150px"
                                  height="150px"
                                />
                                <MinTitle>{t(item.title)}</MinTitle>
                                <MinPara>{t(item.content)}</MinPara>
                              </Col>
                            );
                          }
                        )}
                    </Row>
                  </ServiceWrapper>
                )}
                <ButtonWrapper style={{ marginTop: '30px' }}>
                  <Button onClick={() => scrollTo("contact")}>{t("Contact Us!")}</Button>
                </ButtonWrapper>
              </ContentWrapper>
            </Col>
          </StyledRow>
        )}
      </Fade>
    </SectionComponent>
  );
};

export const PureContentBlock = ContentBlock;
export default withTranslation()(ContentBlock);
