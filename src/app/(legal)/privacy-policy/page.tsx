import { LegalPage } from "../legal-page";

export const metadata = {
  title: "Privacy Policy | Treshatrendy",
  description: "Read the privacy policy for House of Treshatrendy.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      description="This policy explains the basic ways House of Treshatrendy handles customer information."
      sections={[
        {
          title: "Information We Collect",
          body: [
            "We may collect information you provide when placing an order, creating an enquiry or contacting us. This may include your name, email address, phone number, delivery address and order details.",
            "Payment information may be processed by third-party payment providers. We do not intentionally store full card details on our website.",
          ],
        },
        {
          title: "How We Use Information",
          body: [
            "We use customer information to process orders, arrange shipping, respond to enquiries, provide customer support and improve our services.",
            "We may contact you about your order, shipping fees, product availability or wholesale enquiries.",
          ],
        },
        {
          title: "Sharing Information",
          body: [
            "We may share necessary order and delivery information with payment processors, shipping partners or service providers who help us operate the business.",
            "We do not sell customer personal information.",
          ],
        },
        {
          title: "Contact",
          body: [
            "For privacy questions, contact hello@treshatrendy.com.",
          ],
        },
      ]}
    />
  );
}
