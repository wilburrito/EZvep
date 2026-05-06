import { useState } from "react";
import { Row, Col, Drawer } from "antd";
import { withTranslation, TFunction } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";
import Container from "../../common/Container";
import { SvgIcon } from "../../common/SvgIcon";
import { Button } from "../../common/Button";
import {
  HeaderSection,
  LogoContainer,
  Burger,
  NotHidden,
  Menu,
  CustomNavLinkSmall,
  Label,
  Span,
} from "./styles";

const Header = ({ t }: { t: TFunction }) => {
  const history = useHistory();
  const location = useLocation();
  const [visible, setVisibility] = useState(false);

  const toggleButton = () => {
    setVisibility(!visible);
  };

  const scrollToTop = () => {
    // If we're not on the home page, navigate to home first
    if (location.pathname !== '/' && location.pathname !== '/home') {
      history.push('/');
    }
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const MenuItem = () => {
    const scrollTo = (id: string) => {
      const scrollToSection = () => {
        const element = document.getElementById(id);
        if (!element) return false;

        // Offset for sticky header so section title is not hidden.
        const headerOffset = 72;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = Math.max(elementPosition - headerOffset, 0);

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
        return true;
      };

      // If we're not on the home page, navigate to home first
      if (location.pathname !== '/' && location.pathname !== '/home') {
        history.push('/');
        // Wait for home render, then scroll with a retry for lazy-loaded content.
        setTimeout(() => {
          if (!scrollToSection()) {
            setTimeout(() => {
              scrollToSection();
            }, 350);
          }
        }, 500);
      } else {
        scrollToSection();
      }
      setVisibility(false);
    };
    return (
      <>
        <CustomNavLinkSmall onClick={() => scrollTo("reviews")}>
          <Span>{t("Reviews")}</Span>
        </CustomNavLinkSmall>
        <CustomNavLinkSmall onClick={() => scrollTo("pricing")}>
          <Span>{t("Pricing")}</Span>
        </CustomNavLinkSmall>
        <CustomNavLinkSmall onClick={() => scrollTo("about")}>
          <Span>{t("About")}</Span>
        </CustomNavLinkSmall>
        <CustomNavLinkSmall
          style={{ width: "180px" }}
          onClick={() => scrollTo("contact")}
        >
          <Span>
            <Button>{t("Contact Us!")}</Button>
          </Span>
        </CustomNavLinkSmall>
      </>
    );
  };

  return (
    <HeaderSection>
      <Container>
        <Row justify="space-between">
          <LogoContainer to="/" aria-label="homepage" onClick={scrollToTop}>
            <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
              <SvgIcon
                src="EZVEP_By_Seeq_Blue_Logo_NoBG.svg"
                width="130px"
                height="52px"
              />
            </div>
          </LogoContainer>
          <NotHidden>
            <MenuItem />
          </NotHidden>
          <Burger onClick={toggleButton}>
            <div className="menu-icon">☰</div>
          </Burger>
        </Row>
        <Drawer closable={false} open={visible} onClose={toggleButton}>
          <Col style={{ marginBottom: "2.5rem" }}>
            <Label onClick={toggleButton}>
              <Col span={12}>
                <Menu>Menu</Menu>
              </Col>
              <Col span={12}>
                <div className="menu-icon">☰</div>
              </Col>
            </Label>
          </Col>
          <MenuItem />
        </Drawer>
      </Container>
    </HeaderSection>
  );
};

export default withTranslation()(Header);
