"use client";

import Image from "next/image";

import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards, Autoplay, Pagination } from "swiper/modules";

import { images } from "./data";

import "swiper/css";
import "swiper/css/effect-cards";
import "swiper/css/pagination";

export default function WhyChooseSlider() {
  return (
    <Swiper
      effect="cards"
      grabCursor
      loop
      modules={[EffectCards, Pagination, Autoplay]}
      pagination={{
        clickable: true,
      }}
      autoplay={{
        delay: 3500,
        disableOnInteraction: false,
      }}
      className="why-choose-swiper"
    >
      {images.map((item) => (
        <SwiperSlide key={item.id}>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[28px]">
            <Image
              src={item.image}
              alt=""
              fill
              className="object-cover"
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}