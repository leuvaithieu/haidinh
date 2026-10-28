import Link from "next/link";
import Container from "@/app/components/layout/Containers";
import NewsSlider from "./NewsSlider";

async function getArticles() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    console.error("Chưa cấu hình NEXT_PUBLIC_API_URL");
    return [];
  }

  try {
    const response = await fetch(`${apiUrl}/public/articles?limit=5`,
    {
      next: { revalidate: 60 },
    });
    if (!response.ok) {
      console.error("Không lấy được danh sách bài viết");
      return [];
    }

    const result = await response.json();

    return result.items ?? [];
  } catch (error) {
    console.error("Lỗi kết nối API bài viết:", error);
    return [];
  }
}

export default async function News() {
  const articles = await getArticles();

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

          <Link
            href="/tin-tuc"
            className="hidden rounded-full border border-primary px-6 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-white lg:block"
          >
            Xem tất cả
          </Link>
        </div>

        {articles.length > 0 ? (
          <NewsSlider articles={articles} />
        ) : (
          <p className="py-10 text-center text-gray-500">
            Hiện chưa có bài viết được xuất bản.
          </p>
        )}

        <div className="mt-10 flex justify-center lg:hidden">
          <Link
            href="/tin-tuc"
            className="rounded-full border border-primary px-6 py-3 text-sm font-semibold text-primary"
          >
            Xem tất cả
          </Link>
        </div>
      </Container>
    </section>
  );
}