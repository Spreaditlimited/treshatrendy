import { CollectionPage } from "../(collections)/collection-page";

export const metadata = {
  title: "Men's African Fashion | Treshatrendy",
  description:
    "Shop refined African menswear with comfort, craftsmanship and contemporary style.",
};

export default function MenPage() {
  return (
    <CollectionPage
      eyebrow="Men's Collection"
      title="Refined African Style for Men"
      description="Explore contemporary menswear shaped by comfort, craftsmanship and a confident modern perspective on African fashion."
      categorySlugs={["men"]}
      shopHref="/shop?category=men"
    />
  );
}
