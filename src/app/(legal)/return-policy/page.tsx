import { LegalPage } from "../legal-page";

export const metadata = {
  title: "Return Policy | Treshatrendy",
  description: "Read the return policy for House of Treshatrendy orders.",
};

export default function ReturnPolicyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Return Policy"
      description="Customers may request a return or exchange within 14 days, subject to the conditions below."
      sections={[
        {
          title: "Return Window",
          body: [
            "Return or exchange requests must be made within 14 days of receiving your order.",
            "Items must be unworn, unused, unwashed and returned with original packaging where possible.",
          ],
        },
        {
          title: "Items Not Eligible",
          body: [
            "Items may not be eligible for return if they have been worn, damaged after delivery, altered, washed or returned outside the 14-day window.",
            "Custom, final sale or specially sourced wholesale items may not be eligible for return unless they arrive damaged or incorrect.",
          ],
        },
        {
          title: "How to Request a Return",
          body: [
            "Email hello@treshatrendy.com or contact us on WhatsApp with your order details, item name and reason for the request.",
            "We will review the request and provide next steps. Customers are responsible for return shipping unless the item received was incorrect or damaged.",
          ],
        },
      ]}
    />
  );
}
