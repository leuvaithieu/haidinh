"use client";

import Image from "next/image";

import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards, Pagination, Autoplay } from "swiper/modules";

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
      pagination={{
        clickable: false,
      }}
      autoplay={{
        delay: 3500,
        disableOnInteraction: false,
      }}
      modules={[EffectCards, Pagination, Autoplay]}
      className="why-choose-swiper"
    >
      {images.map((item) => (
        <SwiperSlide key={item.id}>
          <Image
            src={item.image}
            alt=""
            fill
            className="object-cover"
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}