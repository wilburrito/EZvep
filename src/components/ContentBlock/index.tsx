import { Row, Col } from "antd";
import { Fade } from "react-awesome-reveal";
import { withTranslation } from "react-i18next";

import { ContentBlockProps } from "./types";
import { Button } from "../../common/Button";
import { SvgIcon } from "../../common/SvgIcon";
import {
  ContentSection,
  CenteredContentSection,
  Content,
  ContentWrapper,
  ServiceWrapper,
  MinTitle,
  MinPara,
  StyledRow,
  ButtonWrapper,
  ImageDescription,
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

  const SectionComponent = id === "pricing" ? CenteredContentSection : ContentSection;

  return (
    <SectionComponent>
      <Fade direction={direction} triggerOnce>
        {id === "pricing" ? (
          <Col xs={24} style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', maxWidth: 900, margin: '0 auto', gap: 40, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <h6 style={{ fontSize: '2.5rem', margin: 0 }}>{t(title)}</h6>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
              <Content style={{ marginTop: 0 }}>{t(content)}</Content>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', marginTop: 30 }}>
                <Button onClick={() => scrollTo("contact")}>{t("Contact Us!")}</Button>
              </div>
            </div>
          </Col>
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

export default withTranslation()(ContentBlock);
