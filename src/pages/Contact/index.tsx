import ContactContent from '../../content/ContactContent.json';
import { lazy } from "react";

const Container = lazy(() => import("../../common/Container"));
const ContactForm = lazy(() => import("../../components/ContactForm"));

const Contact = () => {
    return (
    <Container>
        <ContactForm
            title={ContactContent.title}
            content={ContactContent.text}
            id="contact"
        />
    </Container>
    );
  };
  
export default Contact;
  