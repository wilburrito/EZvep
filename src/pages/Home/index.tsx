import { lazy, useEffect } from "react";
import { Helmet } from "react-helmet";
import IntroContent from "../../content/IntroContent.json";
import MiddleBlockContent from "../../content/MiddleBlockContent.json";
import AboutContent from "../../content/AboutContent.json";
import PricingContent from "../../content/PricingContent.json";
import GoogleReviewsContent from "../../content/GoogleReviewsContent.json";
import ContactContent from "../../content/ContactContent.json";

const Contact = lazy(() => import("../../components/ContactForm"));
const MiddleBlock = lazy(() => import("../../components/MiddleBlock"));
const Container = lazy(() => import("../../common/Container"));
const ScrollToTop = lazy(() => import("../../common/ScrollToTop"));
const ContentBlock = lazy(() => import("../../components/ContentBlock"));
const GoogleReviews = lazy(() => import("../../components/GoogleReviews"));

const Home = () => {

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
      <meta name="google-site-verification" content="Gl2Rv_aKOdbwSfnI58EceXAOkBaWfQG3GetZh_T6wH8" />
    </Helmet>
    <Container>
      <ScrollToTop />
      <ContentBlock
        direction="right"
        title={IntroContent.title}
        content={IntroContent.text}
        icon="CAR.svg"
        id="intro"
        imageDescription="Picture of our customer with their VEP RFID on their headlights"
      />
      {/* <GoogleReviews
        title={GoogleReviewsContent.title}
        content={GoogleReviewsContent.text}
        id="reviews"
      /> */}
      <ContentBlock
        direction="right"
        title={PricingContent.title}
        content={PricingContent.text}
        id="pricing"
      />
      <MiddleBlock
        title={MiddleBlockContent.title}
        content={MiddleBlockContent.text}
        button={MiddleBlockContent.button}
      />
      <ContentBlock
        direction="left"
        title={AboutContent.title}
        content={AboutContent.text}
        section={AboutContent.section}
        icon="CHECK_MARK.svg"
        id="about"
      />
      <Contact
        title={ContactContent.title}
        content={ContactContent.text}
        id="contact"
      />
    </Container>
    </>
  );
};

export default Home;
