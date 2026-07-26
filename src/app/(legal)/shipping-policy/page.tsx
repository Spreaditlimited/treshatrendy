import { LegalPage } from "../legal-page";

export const metadata = {
  title: "Shipping Policy | Treshatrendy",
  description: "Read the shipping policy for House of Treshatrendy orders.",
};

export default function ShippingPolicyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Shipping Policy"
      description="House of Treshatrendy currently serves customers in Nigeria, Canada and the United States."
      sections={[
        {
          title: "Shipping Locations",
          body: [
            "We currently arrange shipping for Nigeria, Canada and the United States.",
            "If you are outside these locations, please contact us before ordering so we can confirm whether delivery is available.",
          ],
        },
        {
          title: "Shipping Fees",
          body: [
            "Shipping fees are calculated manually after checkout based on delivery location, order size and available carrier options.",
            "After your order is received, we will contact you with shipping details, estimated cost and next steps.",
          ],
        },
        {
          title: "Delivery Timing",
          body: [
            "Delivery timelines may vary based on location, product availability, carrier schedules and customs processing where applicable.",
            "Please ensure your delivery address and contact details are accurate to avoid delays.",
          ],
        },
      ]}
    />
  );
}
