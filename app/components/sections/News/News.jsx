import Link from "next/link";
import Container from "@/app/components/layout/Containers";
import NewsSlider from "./NewsSlider";

async function getArticles() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

  if (!apiUrl) {
    console.error("Chưa cấu hình NEXT_PUBLIC_API_URL");
    return [];
  }

  try {
    const response = await fetch(`${apiUrl}/public/articles?limit=5`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      console.error("Không lấy được danh sách bài viết");
      return [];
    }

    const result = await response.json();

    return Array.isArray(result.items) ? result.items : [];
  } catch (error) {
    console.error("Lỗi kết nối API bài viết:", error);
    return [];
  }
}

export default async function News() {
  const articles = await getArticles();

  return (
    <section
      id="tin-tuc"
      className="overflow-hidden bg-white py-10 sm:py-14 lg:py-20"
    >
      <Container>
        {/* Tiêu đề section */}
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 lg:mb-10 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-primary sm:tracking-[0.25em]">
              Cẩm nang hành trình
            </span>

            <h2 className="mt-2 text-2xl font-extrabold leading-tight tracking-tight text-gray-900 sm:mt-3 sm:text-3xl lg:mt-4 lg:text-5xl">
              Tin tức & Chia sẻ
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-600 sm:mt-4 sm:text-base sm:leading-7 lg:mt-5 lg:leading-8">
              Cập nhật những thông tin hữu ích, kinh nghiệm di chuyển và
              các hướng dẫn giúp hành trình của bạn thuận tiện hơn.
            </p>
          </div>

          <Link
            href="/tin-tuc"
            className="hidden min-h-11 shrink-0 items-center justify-center rounded-full border border-primary px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 lg:inline-flex"
          >
            Xem tất cả bài viết
          </Link>
        </div>

        {/* Danh sách bài viết */}
        {articles.length > 0 ? (
          <NewsSlider articles={articles} />
        ) : (
          <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-10 text-center sm:py-12">
            <p className="text-sm leading-6 text-gray-500 sm:text-base">
              Hiện chưa có bài viết được xuất bản.
            </p>
          </div>
        )}

        {/* Nút xem tất cả trên mobile */}
        <div className="mt-7 flex justify-center sm:mt-8 lg:hidden">
          <Link
            href="/tin-tuc"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-primary px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Xem tất cả bài viết
          </Link>
        </div>
      </Container>
    </section>
  );
}