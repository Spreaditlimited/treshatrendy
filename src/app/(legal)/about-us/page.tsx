import { LegalPage } from "../legal-page";

export const metadata = {
  title: "About Us | Treshatrendy",
  description:
    "Learn about House of Treshatrendy and our contemporary African fashion collections.",
};

export default function AboutUsPage() {
  return (
    <LegalPage
      eyebrow="About Us"
      title="House of Treshatrendy"
      description="Treshatrendy is a contemporary African fashion destination serving customers in Nigeria, Canada and the United States."
      sections={[
        {
          title: "Our Story",
          body: [
            "House of Treshatrendy curates African fashion for women, men and children who appreciate timeless style, expressive craftsmanship and clothing with cultural meaning.",
            "Our factory and creative foundation are in Nigeria, and we are building a North American market from Canada to make our collections more accessible to customers across Canada and the United States.",
          ],
        },
        {
          title: "What We Offer",
          body: [
            "We offer carefully selected African dresses, tops, bottoms, sets, menswear and childrenswear. Each collection is chosen with attention to quality, fit, colour and wearability.",
            "We also support boutiques, retailers and resellers through wholesale enquiries for customers who want to stock distinctive African fashion.",
          ],
        },
      ]}
    />
  );
}
