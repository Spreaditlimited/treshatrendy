"use client";

import Image from "next/image";
import { useState } from "react";

type ProductImage = {
  url: string;
  altText: string | null;
};

type ProductImageGalleryProps = {
  images: ProductImage[];
  productName: string;
};

export function ProductImageGallery({
  images,
  productName,
}: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = images[selectedIndex];

  if (!selectedImage) {
    return null;
  }

  return (
    <div className="grid content-start gap-3">
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-[#eee3d8]">
        <Image
          src={selectedImage.url}
          alt={selectedImage.altText ?? productName}
          fill
          priority
          className="object-cover"
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
      </div>
      {images.length > 1 ? (
        <div
          aria-label="Product images"
          className="flex gap-3 overflow-x-auto pb-1"
          role="group"
        >
          {images.map((image, index) => (
            <button
              aria-label={`View image ${index + 1} of ${images.length}`}
              aria-pressed={selectedIndex === index}
              className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-md border-2 bg-[#eee3d8] transition sm:h-24 sm:w-20 ${
                selectedIndex === index
                  ? "border-[#8a3f2b]"
                  : "border-transparent hover:border-[#b99a50]"
              }`}
              key={`${image.url}-${index}`}
              onClick={() => setSelectedIndex(index)}
              type="button"
            >
              <Image
                src={image.url}
                alt=""
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
