
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  category: string | null;
  tags: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: string | null;
};


async function getArticle(slug: string): Promise<Article | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("Chưa cấu hình NEXT_PUBLIC_API_URL");
  }

  const response = await fetch(
    `${apiUrl}/public/articles/${encodeURIComponent(slug)}`,
    {
      next: { revalidate: 60 },
    },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Không thể tải bài viết");
  }

  return response.json();
}

type PageProps = {
  params: Promise<{ slug: string }>;
};



export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return {
      title: "Không tìm thấy bài viết | Hải Định",
    };
  }

  return {
    title: article.seoTitle || article.title,
    description:
      article.seoDescription ||
      article.excerpt ||
      article.title,
    alternates: {
      canonical: `/tin-tuc/${article.slug}`,
    },
    openGraph: {
      title: article.seoTitle || article.title,
      description:
        article.seoDescription ||
        article.excerpt ||
        article.title,
      images: article.coverImage
        ? [getImageUrl(article.coverImage)]
        : [],
      type: "article",
      publishedTime: article.publishedAt || undefined,
    },
  };
}

function getImageUrl(image: string | null): string {
  if (!image) return "/images/news-placeholder.png";

  if (/^https?:\/\//i.test(image)) return image;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

  return apiUrl
    ? `${apiUrl}${image.startsWith("/") ? image : `/${image}`}`
    : "/images/news-placeholder.png";
}

export default async function ArticleDetailPage({
  params,
}: PageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  const publishedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "Asia/Ho_Chi_Minh",
      })
    : null;

  return (
    <main className="min-h-screen bg-white">
      <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:py-16">
        <nav
          aria-label="Điều hướng"
          className="mb-8 text-sm text-gray-500"
        >
          <Link href="/" className="hover:text-red-600">
            Trang chủ
          </Link>
          {" / "}
          <Link href="/tin-tuc" className="hover:text-red-600">
            Tin tức
          </Link>
          {" / "}
          <span className="text-gray-800">{article.title}</span>
        </nav>

        {article.category && (
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-red-600">
            {article.category}
          </p>
        )}

        <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
          {article.title}
        </h1>

        {publishedDate && (
          <p className="mt-5 text-sm text-gray-500">
            Ngày đăng: {publishedDate}
          </p>
        )}

        {article.excerpt && (
          <p className="mt-8 text-lg leading-8 text-gray-600">
            {article.excerpt}
          </p>
        )}

        {article.coverImage && (
          <img
            src={getImageUrl(article.coverImage)}
            alt={article.title}
            className="mt-8 aspect-video w-full rounded-2xl object-cover"
          />
        )}

        <div className="mt-10 whitespace-pre-wrap break-words text-base leading-8 text-gray-800">
          {article.content}
        </div>

        {article.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2 border-t border-gray-200 pt-6">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-12 border-t border-gray-200 pt-6">
          <Link
            href="/tin-tuc"
            className="inline-flex items-center rounded-full border border-red-600 px-6 py-3 font-semibold text-red-600 transition hover:bg-red-600 hover:text-white"
          >
            Xem thêm tin tức
          </Link>
        </div>
      </article>
    </main>
  );
}
