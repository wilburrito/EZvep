import { Row, Col } from "antd";
import { withTranslation } from "react-i18next";
import { useEffect } from "react";
import { SvgIcon } from "../../common/SvgIcon";
import { Button } from "../../common/Button";
import Container from "../../common/Container";
import { ThankYouContainer, ThankYouContent, Title, Subtitle } from "./styles";

interface ThankYouProps {
  t: any;
}

const ThankYou = ({ t }: ThankYouProps) => {
  // Capture URL parameters for analytics
  useEffect(() => {
    // This helps with Google Ads conversion tracking
    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get('source');
    const campaign = urlParams.get('campaign');

    // You can send this data to your analytics platform if needed
    if (window.gtag) {
      // Standard event tracking
      window.gtag('event', 'form_submission', {
        'event_category': 'contact',
        'event_label': source || 'form_submission',
        'value': 1
      });
      
      // Google Ads Conversion tracking
      window.gtag('event', 'conversion', {
        'send_to': 'AW-16913080207', // Replace with your actual Google Ads conversion ID and label
        'event_category': source || 'form_submission',
        'event_label': campaign || 'contact_form',
        'value': 1,
        'transaction_id': Date.now().toString()
      });
      
      // Optional: Send to Google Tag Manager dataLayer
      if (window.dataLayer) {
        window.dataLayer.push({
          'event': 'formSubmission',
          'formName': 'contactForm',
          'formSource': source,
          'formCampaign': campaign
        });
      }
    }
  }, []);

  return (
    <ThankYouContainer>
      <Container>
        <Row justify="center" align="middle" style={{ height: "100%" }}>
          <Col lg={12} md={12} sm={24} xs={24}>
            <div className="fade-in">
              <ThankYouContent>
                <SvgIcon src="check-circle.svg" width="64px" height="64px" />
                <Title>{t("Thank You!")}</Title>
                <Subtitle>
                  {t("Your submission has been received. We'll contact you shortly.")}
                </Subtitle>
                <Button onClick={() => window.location.href = "/"}>
                  {t("Return to Homepage")}
                </Button>
              </ThankYouContent>
            </div>
          </Col>
        </Row>
      </Container>
    </ThankYouContainer>
  );
};

export default withTranslation()(ThankYou);
