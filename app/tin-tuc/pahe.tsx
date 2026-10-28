
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tin tức và kinh nghiệm di chuyển | Hải Định",
  description:
    "Cập nhật tin tức, thông tin dịch vụ và kinh nghiệm di chuyển cùng nhà xe Hải Định.",
};

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  category: string | null;
  publishedAt: string | null;
};

type ArticleResponse = {
  items: Article[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

type PageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

async function getArticles(page: number): Promise<ArticleResponse> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("Chưa cấu hình NEXT_PUBLIC_API_URL");
  }

  const response = await fetch(
    `${apiUrl}/public/articles?page=${page}&limit=9`,
    {
      next: { revalidate: 60 },
    },
  );

  if (!response.ok) {
    throw new Error("Không thể tải danh sách tin tức");
  }

  return response.json();
}

export default async function NewsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const parsedPage = Number(params.page ?? "1");

  const page =
    Number.isInteger(parsedPage) && parsedPage > 0
      ? parsedPage
      : 1;

  const result = await getArticles(page);
  const { items, meta } = result;

  return (
    <main className="min-h-screen bg-white">
      <section className="bg-gray-50 px-4 py-14 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="text-sm text-gray-500 transition hover:text-red-600"
          >
            Trang chủ
          </Link>

          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.25em] text-red-600">
            CẨM NANG HÀNH TRÌNH
          </p>

          <h1 className="mt-4 text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
            Tin tức & Chia sẻ
          </h1>

          <p className="mt-5 max-w-2xl leading-8 text-gray-600">
            Cập nhật thông tin dịch vụ, tin tức nhà xe và những kinh
            nghiệm hữu ích cho mỗi chuyến đi.
          </p>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:py-16">
        <div className="mx-auto max-w-7xl">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 px-6 py-16 text-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Chưa có bài viết
              </h2>

              <p className="mt-3 text-gray-600">
                Hiện chưa có tin tức nào được xuất bản.
              </p>

              <Link
                href="/"
                className="mt-6 inline-flex rounded-full bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
              >
                Về trang chủ
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Tổng cộng {meta.total} bài viết
                </p>
              </div>

              <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((article) => (
                  <article
                    key={article.id}
                    className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <Link href={`/tin-tuc/${article.slug}`}>
                      <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                        {article.coverImage ? (
                          <img
                            src={article.coverImage}
                            alt={article.title}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-gray-400">
                            Hải Định
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        {article.category && (
                          <p className="text-xs font-semibold uppercase tracking-wider text-red-600">
                            {article.category}
                          </p>
                        )}

                        <h2 className="mt-3 line-clamp-2 text-xl font-bold leading-8 text-gray-900 transition group-hover:text-red-600">
                          {article.title}
                        </h2>

                        {article.excerpt && (
                          <p className="mt-3 line-clamp-3 text-sm leading-7 text-gray-600">
                            {article.excerpt}
                          </p>
                        )}

                        <div className="mt-6 flex items-center justify-between">
                          <span className="text-sm text-gray-400">
                            {article.publishedAt
                              ? new Date(
                                  article.publishedAt,
                                ).toLocaleDateString("vi-VN", {
                                  timeZone: "Asia/Ho_Chi_Minh",
                                })
                              : ""}
                          </span>

                          <span className="font-semibold text-red-600">
                            Đọc tiếp →
                          </span>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>

              {meta.totalPages > 1 && (
                <nav
                  aria-label="Phân trang tin tức"
                  className="mt-12 flex items-center justify-center gap-5"
                >
                  {page > 1 ? (
                    <Link
                      href={`/tin-tuc?page=${page - 1}`}
                      className="rounded-full border border-gray-200 px-5 py-3 text-sm font-semibold transition hover:border-red-600 hover:text-red-600"
                    >
                      ← Trang trước
                    </Link>
                  ) : (
                    <span className="rounded-full border border-gray-100 px-5 py-3 text-sm text-gray-300">
                      ← Trang trước
                    </span>
                  )}

                  <span className="text-sm text-gray-600">
                    Trang {meta.page} / {meta.totalPages}
                  </span>

                  {page < meta.totalPages ? (
                    <Link
                      href={`/tin-tuc?page=${page + 1}`}
                      className="rounded-full border border-gray-200 px-5 py-3 text-sm font-semibold transition hover:border-red-600 hover:text-red-600"
                    >
                      Trang sau →
                    </Link>
                  ) : (
                    <span className="rounded-full border border-gray-100 px-5 py-3 text-sm text-gray-300">
                      Trang sau →
                    </span>
                  )}
                </nav>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
