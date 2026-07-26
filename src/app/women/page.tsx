import { CollectionPage } from "../(collections)/collection-page";

export const metadata = {
  title: "Women's African Fashion | Treshatrendy",
  description:
    "Explore elegant African dresses, tops, bottoms and sets for women at Treshatrendy.",
};

export default function WomenPage() {
  return (
    <CollectionPage
      eyebrow="Women's Collection"
      title="Elegant African Fashion for Every Occasion"
      description="Discover refined silhouettes, distinctive prints and timeless pieces curated for women who dress with confidence, culture and ease."
      categorySlugs={["dresses", "tops", "bottoms", "sets"]}
      shopHref="/shop?category=dresses"
    />
  );
}
