import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";

function getImageUrl(image) {
  if (!image) return null;

  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

  if (!apiUrl) return null;

  return `${apiUrl}${image.startsWith("/") ? image : `/${image}`}`;
}

export default function NewsCard({ article }) {
  const image = getImageUrl(article.coverImage);

  const date = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("vi-VN")
    : "";

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:rounded-3xl">
      <Link
        href={`/tin-tuc/${article.slug}`}
        className="flex h-full flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
      >
        <div className="relative aspect-[16/10] shrink-0 overflow-hidden bg-gray-100">
          {image ? (
            <img
              src={image}
              alt={article.title || "Tin tức Hải Định"}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">
              Chưa có ảnh bài viết
            </div>
          )}

          {article.category && (
            <span className="absolute left-3 top-3 max-w-[calc(100%-24px)] truncate rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-primary shadow-sm sm:left-4 sm:top-4 sm:text-xs">
              {article.category}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4 sm:p-5 lg:p-6">
          <h3 className="line-clamp-2 text-base font-bold leading-6 text-gray-900 transition-colors group-hover:text-primary sm:text-lg sm:leading-7 lg:text-xl">
            {article.title}
          </h3>

          <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600 sm:mt-4 sm:leading-7">
            {article.excerpt || ""}
          </p>

          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 sm:pt-5">
            {date ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 sm:text-sm">
                <CalendarDays className="h-4 w-4 shrink-0" />
                {date}
              </span>
            ) : (
              <span />
            )}

            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-primary">
              Đọc tiếp
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}