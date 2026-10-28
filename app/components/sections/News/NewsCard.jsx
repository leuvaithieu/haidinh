import Link from "next/link";
import { ArrowRight } from "lucide-react";


function getImageUrl(image) {
  if (!image) return "/images/news-placeholder.png";

  if (/^https?:\/\//i.test(image)) return image;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

  return apiUrl
    ? `${apiUrl}${image.startsWith("/") ? image : `/${image}`}`
    : "/images/news-placeholder.png";
}

export default function NewsCard({ article }) {
  const image = getImageUrl(article.coverImage);

  const description = article.excerpt || "";
  const date = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("vi-VN")
    : "";

  return (
    <article className="group overflow-hidden rounded-3xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/tin-tuc/${article.slug}`}>
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={image}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div className="p-6">
          {article.category && (
            <span className="text-primary text-xs font-semibold uppercase tracking-[0.2em]">
              {article.category}
            </span>
          )}

          <h3 className="mt-3 line-clamp-2 text-xl font-bold leading-8 text-gray-900 transition-colors group-hover:text-primary">
            {article.title}
          </h3>

          <p className="mt-4 line-clamp-2 text-sm leading-7 text-gray-600">
            {description}
          </p>

          <div className="mt-6 flex items-center justify-between">
            <span className="text-sm text-gray-400">
              {date}
            </span>

            <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
              Đọc tiếp
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}