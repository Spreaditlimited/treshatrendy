import { LegalPage } from "../legal-page";

export const metadata = {
  title: "Terms and Conditions | Treshatrendy",
  description: "Read the terms and conditions for shopping with House of Treshatrendy.",
};

export default function TermsAndConditionsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms and Conditions"
      description="These terms explain how customers use the Treshatrendy website and place orders with House of Treshatrendy."
      sections={[
        {
          title: "Use of This Website",
          body: [
            "By using this website, you agree to use it for lawful purposes and to provide accurate information when placing an order or making an enquiry.",
            "We may update product information, prices, policies and website content from time to time without prior notice.",
          ],
        },
        {
          title: "Products and Pricing",
          body: [
            "Product colours, fabrics and details may appear slightly different depending on screen settings, lighting and image display.",
            "Prices may be shown in NGN, CAD or USD depending on customer location or selected currency. Shipping fees are calculated manually after checkout.",
          ],
        },
        {
          title: "Orders and Payment",
          body: [
            "Orders are reviewed after checkout. If a product is unavailable, we will contact you with available options.",
            "Payment processing may be handled by third-party providers such as PayPal. We do not control third-party payment processing systems.",
          ],
        },
        {
          title: "Limitation",
          body: [
            "House of Treshatrendy is not responsible for delays caused by shipping carriers, customs processes, incorrect customer information or events outside our reasonable control.",
          ],
        },
      ]}
    />
  );
}
