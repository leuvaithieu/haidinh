import Container from "@/app/components/layout/Containers";

import NewsSlider from "./NewsSlider";

export default function News() {
  return (
    <section className="bg-white py-16 lg:py-24">
      <Container>
        <div className="mb-10 flex items-end justify-between">
          <div>
            <span className="text-primary text-xs font-semibold uppercase tracking-[0.25em]">
              CẨM NANG HÀNH TRÌNH
            </span>

            <h2 className="mt-4 text-3xl font-bold text-gray-900 lg:text-5xl">
              Tin tức & Chia sẻ
            </h2>

            <p className="mt-5 max-w-xl leading-8 text-gray-600">
              Cập nhật những thông tin hữu ích, kinh nghiệm di chuyển và
              các hướng dẫn giúp hành trình của bạn thuận tiện hơn.
            </p>
          </div>

          <button
            className="
            hidden
            rounded-full
            border
            border-primary
            px-6
            py-3
            text-sm
            font-semibold
            text-primary
            transition-all
            hover:bg-primary
            hover:text-white
            lg:block
            "
          >
            Xem tất cả
          </button>
        </div>

        <NewsSlider />

        <div className="mt-10 flex justify-center lg:hidden">
          <button
            className="
            rounded-full
            border
            border-primary
            px-6
            py-3
            text-sm
            font-semibold
            text-primary
            "
          >
            Xem tất cả
          </button>
        </div>
      </Container>
    </section>
  );
}