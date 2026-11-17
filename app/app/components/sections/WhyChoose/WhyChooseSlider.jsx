"use client";

import Image from "next/image";
import { useState } from "react";

import { images } from "./data";

export default function WhyChooseSlider() {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) {
    return null;
  }

  const activeImage = images[activeIndex];

  return (
    <div className="w-full min-w-0">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gray-100 shadow-lg sm:aspect-[5/4] sm:rounded-3xl lg:aspect-[4/5]">
        <Image
          src={activeImage.src}
          alt={activeImage.alt || "Hình ảnh dịch vụ vận tải Hải Định"}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 50vw"
          className="object-cover transition-opacity duration-300"
        />

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-4 sm:p-6">
          <p className="text-sm font-semibold text-white sm:text-base">
            Hải Định – đồng hành trên mọi hành trình
          </p>
        </div>
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 sm:mt-4 sm:gap-3">
          {images.map((image, index) => (
            <button
              key={image.src || index}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Xem ảnh ${index + 1}`}
              aria-pressed={activeIndex === index}
              className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition sm:h-16 sm:w-24 sm:rounded-xl ${
                activeIndex === index
                  ? "border-red-600 ring-2 ring-red-600/20"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={image.src}
                alt={image.alt || `Ảnh ${index + 1}`}
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}