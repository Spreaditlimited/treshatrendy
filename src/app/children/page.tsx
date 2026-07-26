import { CollectionPage } from "../(collections)/collection-page";

export const metadata = {
  title: "Children's African Fashion | Treshatrendy",
  description:
    "Shop beautifully made African outfits for children at Treshatrendy.",
};

export default function ChildrenPage() {
  return (
    <CollectionPage
      eyebrow="Children's Collection"
      title="Joyful African Fashion for Children"
      description="Beautifully made outfits designed to celebrate colour, culture and joyful self-expression for younger trendsetters."
      categorySlugs={["kids"]}
      shopHref="/shop?category=kids"
    />
  );
}
