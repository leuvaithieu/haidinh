"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import NewsCard from "./NewsCard";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function NewsSlider({ articles = [] }) {
  if (!articles.length) {
    return null;
  }

  return (
    <div className="news-slider-wrap relative min-w-0">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={14}
        slidesPerView={1.12}
        speed={600}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        navigation
        watchOverflow
        grabCursor
        breakpoints={{
          480: {
            slidesPerView: 1.35,
            spaceBetween: 16,
          },
          640: {
            slidesPerView: 2,
            spaceBetween: 18,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 24,
          },
          1440: {
            slidesPerView: 3,
            spaceBetween: 28,
          },
        }}
        className="news-swiper !overflow-visible pb-12 sm:!overflow-hidden"
      >
        {articles.map((article) => (
          <SwiperSlide key={article.id} className="!h-auto">
            <NewsCard article={article} />
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        .news-slider-wrap .swiper-pagination {
          bottom: 0 !important;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 3px;
        }

        .news-slider-wrap .swiper-pagination-bullet {
          width: 7px;
          height: 7px;
          background: #9ca3af;
          opacity: 0.65;
          transition: width 0.2s ease, opacity 0.2s ease;
        }

        .news-slider-wrap .swiper-pagination-bullet-active {
          width: 20px;
          border-radius: 999px;
          background: #dc2626;
          opacity: 1;
        }

        .news-slider-wrap .swiper-button-prev,
        .news-slider-wrap .swiper-button-next {
          width: 40px;
          height: 40px;
          border: 1px solid #e5e7eb;
          border-radius: 999px;
          background: #ffffff;
          color: #dc2626;
          box-shadow: 0 4px 14px rgb(0 0 0 / 8%);
        }

        .news-slider-wrap .swiper-button-prev::after,
        .news-slider-wrap .swiper-button-next::after {
          font-size: 14px;
          font-weight: 800;
        }

        @media (max-width: 639px) {
          .news-slider-wrap .swiper-button-prev,
          .news-slider-wrap .swiper-button-next {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}