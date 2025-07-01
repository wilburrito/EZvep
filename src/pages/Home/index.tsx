import { lazy, useEffect } from "react";
import { Helmet } from "react-helmet";
import IntroContent from "../../content/IntroContent.json";
import MiddleBlockContent from "../../content/MiddleBlockContent.json";
import AboutContent from "../../content/AboutContent.json";
import PricingContent from "../../content/PricingContent.json";
import ContactContent from "../../content/ContactContent.json";
import Container from "../../common/Container";
import ScrollToTop from "../../common/ScrollToTop";
import { PureContentBlock } from "../../components/ContentBlock";
import { PureMiddleBlock } from "../../components/MiddleBlock";
import { PureContact } from "../../components/ContactForm";
import { useTranslation } from "react-i18next";
// const GoogleReviews = lazy(() => import("../../components/GoogleReviews"));

const MiddleBlock = PureMiddleBlock;
const Contact = PureContact;

const Home = () => {
  const { t } = useTranslation();

  useEffect(() => {
    const gtagScript = document.createElement("script");
    gtagScript.src = "https://www.googletagmanager.com/gtag/js?id=G-JB7SHJ56FT";
    gtagScript.async = true;
    document.head.appendChild(gtagScript);

    const inlineScript = document.createElement("script");
    inlineScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-JB7SHJ56FT');
    `;
    document.head.appendChild(inlineScript);
  }, []);

  return (
    <>
    <Helmet>
      {/* <meta name="google-site-verification" content="Gl2Rv_aKOdbwSfnI58EceXAOkBaWfQG3GetZh_T6wH8" /> */}
    </Helmet>
    <Container>
      <ScrollToTop />
      <PureContentBlock
        direction="right"
        title={IntroContent.title}
        content={IntroContent.text}
        icon="CAR.svg"
        id="intro"
        imageDescription="Picture of our customer with their VEP RFID on their headlights"
        t={t}
      />
      {/* <GoogleReviews
        title={GoogleReviewsContent.title}
        content={GoogleReviewsContent.text}
        id="reviews"
      /> */}
      <PureContentBlock
        direction="right"
        title={PricingContent.title}
        content={PricingContent.text}
        id="pricing"
        t={t}
        icon=""
      />
      <MiddleBlock
        title={MiddleBlockContent.title}
        content={MiddleBlockContent.text}
        button={MiddleBlockContent.button}
        t={t}
      />
      <PureContentBlock
        direction="left"
        title={AboutContent.title}
        content={AboutContent.text}
        section={AboutContent.section}
        icon="CHECK_MARK.svg"
        id="about"
        t={t}
      />
      <Contact
        title={ContactContent.title}
        content={ContactContent.text}
        id="contact"
        t={t}
      />
    </Container>
    </>
  );
};

export default Home;
