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
}: ContentBlockProps) => {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id) as HTMLDivElement;
    element.scrollIntoView({
      behavior: "smooth",
    });
  };

  const SectionComponent = ContentSection;

  return (
    <SectionComponent style={id === "pricing" ? { padding: "4rem 0 2rem" } : undefined}>
      <Fade direction={direction} triggerOnce>
        {id === "pricing" ? (
          <StyledRow
            justify="center"
            align="middle"
            id={id}
            direction="left"
          >
            <Col lg={24} md={24} sm={24} xs={24}>
              <ContentWrapper style={{ textAlign: "center", maxWidth: "100%", margin: "0 auto" }}>
                <div
                  style={{
                    border: "1px solid #e9edff",
                    borderRadius: "18px",
                    background: "linear-gradient(180deg, #ffffff 0%, #f8faff 100%)",
                    padding: "1.25rem",
                    boxShadow: "0 10px 24px rgba(46, 24, 106, 0.08)",
                    maxWidth: "980px",
                    margin: "0 auto",
                  }}
                >
                  <Row gutter={[20, 20]} align="middle">
                    <Col lg={14} md={14} sm={24} xs={24}>
                      <div style={{ marginBottom: "0.6rem", color: "#4d4d4d", fontWeight: 600 }}>
                        Service & Booking Fee
                      </div>
                      <div
                        style={{
                          fontSize: "3.1rem",
                          fontWeight: 900,
                          color: "#3D63FF",
                          lineHeight: 1,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        S$130
                      </div>
                      <div style={{ marginTop: "0.5rem", fontWeight: 600 }}>
                        Per vehicle · all-inclusive
                      </div>
                      <div
                        style={{
                          marginTop: "0.8rem",
                          background: "#fff6df",
                          borderLeft: "4px solid #f5a623",
                          borderRadius: "8px",
                          padding: "0.55rem 0.75rem",
                          color: "#555",
                          fontSize: "0.92rem",
                        }}
                      >
                        *Woodlands VEP Centre tag installation is excluded (no additional charge for other branches)
                      </div>
                    </Col>
                    <Col lg={10} md={10} sm={24} xs={24}>
                      <div
                        style={{
                          border: "1px solid #dbe3ff",
                          borderRadius: "14px",
                          padding: "1rem",
                          textAlign: "center",
                          background: "#f3f7ff",
                          height: "100%",
                        }}
                      >
                        <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#5c6fae" }}>
                          Typical Processing Speed
                        </div>
                        <div style={{ fontSize: "2.15rem", fontWeight: 900, color: "#2f59ff", marginTop: "0.2rem" }}>
                          As fast as
                        </div>
                        <div style={{ fontSize: "2.35rem", fontWeight: 900, color: "#2f59ff", lineHeight: 1 }}>
                          2 days
                        </div>
                        <div style={{ marginTop: "0.3rem", fontWeight: 700, color: "#5c6fae" }}>
                          for qualified submissions
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>

                <Content style={{ margin: "0.9rem auto 0", maxWidth: "800px" }}>{t(content)}</Content>

                <div
                  style={{
                    margin: "0.8rem auto 0",
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(260px, 1fr))",
                    gap: "0.8rem",
                    maxWidth: "980px",
                  }}
                >
                  <div style={{ border: "1px solid #e6f6ea", borderRadius: "12px", padding: "0.85rem", background: "#f9fffb" }}>
                    <strong>Full application handling</strong>
                    <div>We handle submission, appointment booking, and documentation.</div>
                  </div>
                  <div style={{ border: "1px solid #e8efff", borderRadius: "12px", padding: "0.85rem", background: "#f8fbff" }}>
                    <strong>Touch 'n Go setup support</strong>
                    <div>Guided setup so your e-wallet is ready for use.</div>
                  </div>
                  <div style={{ border: "1px solid #fff0dc", borderRadius: "12px", padding: "0.85rem", background: "#fffaf2" }}>
                    <strong>Document retrieval guidance</strong>
                    <div>Exact checklist and steps to retrieve what you need.</div>
                  </div>
                  <div style={{ border: "1px solid #ece8ff", borderRadius: "12px", padding: "0.85rem", background: "#faf9ff" }}>
                    <strong>After-sales WhatsApp support</strong>
                    <div>Ongoing help if you need follow-up assistance.</div>
                  </div>
                </div>

                <PricingButtonWrapper>
                  <Button onClick={() => scrollTo("contact")}>
                    {t("Contact Us!")}
                  </Button>
                </PricingButtonWrapper>
              </ContentWrapper>
            </Col>
          </StyledRow>
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
