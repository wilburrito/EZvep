import { Row, Col, Button } from "antd";
import { withTranslation, TFunction } from "react-i18next";
import { SvgIcon } from "../../common/SvgIcon";
import Container from "../../common/Container";
import { useState } from "react";
import { Modal } from "antd";

import i18n from "i18next";
import {
  FooterSection,
  Title,
  NavLink,
  Extra,
  LogoContainer,
  Para,
  Large,
  Chat,
  Empty,
  FooterContainer,
  Language,
  Label,
  LanguageSwitch,
  LanguageSwitchContainer,
} from "./styles";

interface SocialLinkProps {
  href: string;
  src: string;
}

const Footer = ({ t }: { t: TFunction }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  }

  const handleOk = () => {
    setIsModalVisible(false);
  }

  const handleCancel = () => {
    setIsModalVisible(false);
  }

  const handleChange = (language: string) => {
    i18n.changeLanguage(language);
  };

  const SocialLink = ({ href, src }: SocialLinkProps) => {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        key={src}
        aria-label={src}
      >
        <SvgIcon src={src} width="25px" height="25px" />
      </a>
    );
  };

  return (
    <>
      <FooterSection>
        <Container>
          <Row justify="center">
            {/* <Col lg={10} md={10} sm={12} xs={12}>
              <Language>{t("Contact")}</Language>
              <Large to="/">{t("Tell us everything")}</Large>
              <Para>
                {t(`Do you have any question? Feel free to reach out.`)}
              </Para>
              <a href="mailto:l.qqbadze@gmail.com">
                <Chat>{t(`Let's Chat`)}</Chat>
              </a>
            </Col> */}
            <Col lg={8} md={8} sm={12} xs={12}>
              <Large as="button" onClick={showModal}>{t("Terms and Conditions")}</Large>
            </Col>
          </Row>
          {/* <Row justify="space-between">
            <Col lg={10} md={10} sm={12} xs={12}>
              <Empty />
              <Language>{t("Address")}</Language>
              <Para>Rancho Santa Margarita</Para>
              <Para>2131 Elk Street</Para>
              <Para>California</Para>
            </Col>
            <Col lg={8} md={8} sm={12} xs={12}>
              <Title>{t("Company")}</Title>
              <Large to="/">{t("About")}</Large>
              <Large to="/">{t("Blog")}</Large>
              <Large to="/">{t("Press")}</Large>
              <Large to="/">{t("Careers & Culture")}</Large>
            </Col>
            <Col lg={6} md={6} sm={12} xs={12}>
              <Label htmlFor="select-lang">{t("Language")}</Label>
              <LanguageSwitchContainer>
                <LanguageSwitch onClick={() => handleChange("en")}>
                  <SvgIcon
                    src="united-states.svg"
                    aria-label="homepage"
                    width="30px"
                    height="30px"
                  />
                </LanguageSwitch>
                <LanguageSwitch onClick={() => handleChange("es")}>
                  <SvgIcon
                    src="spain.svg"
                    aria-label="homepage"
                    width="30px"
                    height="30px"
                  />
                </LanguageSwitch>
              </LanguageSwitchContainer>
            </Col>
          </Row> */}
        </Container>
      </FooterSection>
      <Modal
        title={t("Terms and Conditions")}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="close" type="primary" onClick={handleOk}>
            {t("Close")}
          </Button>,
        ]}
        >
          <div style={{ maxHeight: "400px", overflowY: "auto", paddingRight: "10px" }}>
            <p><strong style={{ fontSize: "1.1em" }}>Payment Terms</strong><br />For headlamp tag placement, payment has to be made upon arrival of the tag. For windshield tag placement, payment has to be made on the day of your appointment.</p>
            <p><strong style={{ fontSize: "1.1em" }}>Processing Queue</strong><br />After payment is confirmed, your application will be added to our processing queue.</p>
            <p><strong style={{ fontSize: "1.1em" }}>Estimated Timelines</strong><br />Any estimated timelines provided for completing applications are only approximations. Processing times may vary for each application.</p>
            <p><strong style={{ fontSize: "1.1em" }}>Client Assistance</strong><br />To ensure smooth processing, clients should respond promptly to requests, such as checking emails, to help avoid delays.</p>
            <p><strong style={{ fontSize: "1.1em" }}>Application Failure and Refund Policy</strong><br />If an application fails due to an error on our part, we will attempt to resolve it up to three times. After three unsuccessful attempts, a full refund will be provided. By making a payment, you are engaging our services. After this point, refunds are not available except in cases of application failure (as detailed above). If an application fails due to inaccurate information or other client errors, no refunds will be issued. Our services are considered complete once an appointment for RFID tag installation has been scheduled, or payment has been made for postage to your home.</p>
            <p><strong style={{ fontSize: "1.1em" }}>RFID Tag Collection</strong><br />Clients must inform us if they prefer to collect the RFID tag in person at designated collection points or receive it by mail.</p>
            <p><strong style={{ fontSize: "1.1em" }}>RFID Tag Installation</strong><br />- <em>Self-Installation:</em> For clients receiving the RFID tag by mail, it must be self-installed on the headlight, and photos sent to us for verification. Refunds are not issued if verification is rejected due to improper installation. Reapplying for a new tag will require a new application and a full fee of $130. We can only install headlight RFID but are dependent on availability of our specialist.</p>
            <p><strong style={{ fontSize: "1.1em" }}>Appointment Booking</strong><br />Appointments should only be scheduled after coordinating with us via WhatsApp.</p>
            <p><strong style={{ fontSize: "1.1em" }}>Personal Data Protection</strong><br />By using our services, you agree to the collection, storage, and use of the documents and information you provide, strictly for VEP purposes. We will delete all data within three months after successful application completion.</p>
            <p><strong style={{ fontSize: "1.1em" }}>Information Disclaimer</strong><br />Please note that information regarding the use of an email VEP confirmation slip after October 1st is sourced from various references, including Motorist.sg and The Straits Times, and is intended as a guide. EZVEP is not responsible for any denied entries, fines, or issues that may arise. Clients should verify the latest requirements independently.</p>
            <p><strong style={{ fontSize: "1.1em" }}>Changes to Terms and Conditions</strong><br />Our terms and conditions are subject to change. By engaging our services, clients accept any updated terms as they are introduced.</p>
            <p>By using our services, you confirm that you have read, understood, and agree to these terms and conditions. If you have questions or need more information, please reach out to us.</p>
          </div>
      </Modal>
      <Extra>
        <Container border={true}>
          <Row
            justify="space-between"
            align="middle"
            style={{ paddingTop: "3rem" }}
          >
            <NavLink to="/">
              <LogoContainer>
                <SvgIcon
                  src="EZVEPLogo.svg"
                  aria-label="homepage"
                  width="101px"
                  height="101px"
                />
              </LogoContainer>
            </NavLink>
            <FooterContainer>
              <SocialLink
                href="https://wa.me/message/IIHKAYSMOHYFO1"
                src="whatsapp.svg"
              />
              <SocialLink
                href="https://www.instagram.com/ezvep.sg/"
                src="instagram.svg"
              />
              {/* <SocialLink
                href="https://www.linkedin.com/in/lasha-kakabadze/"
                src="linkedin.svg"
              />
              <SocialLink
                href="https://medium.com/@lashakakabadze/"
                src="medium.svg"
              /> */}
              {/* <a
                href="https://ko-fi.com/Y8Y7H8BNJ"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  height="36"
                  style={{ border: 0, height: 36 }}
                  src="https://storage.ko-fi.com/cdn/kofi3.png?v=3"
                  alt="Buy Me a Coffee at ko-fi.com"
                />
              </a> */}
            </FooterContainer>
          </Row>
        </Container>
      </Extra>
    </>
  );
};

export default withTranslation()(Footer);
