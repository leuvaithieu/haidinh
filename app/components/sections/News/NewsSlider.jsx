"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import NewsCard from "./NewsCard";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function NewsSlider({ articles }) {
  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      spaceBetween={20}
      slidesPerView={1.1}
      speed={2000}
      autoplay={{
        delay: 4000,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
      }}
      navigation
      breakpoints={{
        640: {
          slidesPerView: 1.3,
        },
        768: {
          slidesPerView: 2,
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 24,
        },
        1560: {
          slidesPerView: 4,
          spaceBetween: 24,
        }
      }}
      className="news-swiper"
    >
      {articles.map((article) => (
        <SwiperSlide key={article.id}>
          <NewsCard article={article} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}