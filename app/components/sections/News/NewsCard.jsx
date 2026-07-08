import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NewsCard({ article }) {
  return (
    <article
      className="
      group
      overflow-hidden
      rounded-3xl
      bg-white
      shadow-sm
      transition-all
      duration-300
      hover:-translate-y-1
      hover:shadow-lg
      "
    >
      <Link href={`/tin-tuc/${article.slug}`}>
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="
            object-cover
            transition-transform
            duration-500
            group-hover:scale-105
            "
          />
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Category */}
          <span
            className="
            text-primary
            text-xs
            font-semibold
            uppercase
            tracking-[0.2em]
            "
          >
            {article.category}
          </span>

          {/* Title */}
          <h3
            className="
            mt-3
            line-clamp-2
            text-xl
            font-bold
            leading-8
            text-gray-900
            transition-colors
            group-hover:text-primary
            "
          >
            {article.title}
          </h3>

          {/* Description */}
          <p
            className="
            mt-4
            line-clamp-2
            text-sm
            leading-7
            text-gray-600
            "
          >
            {article.description}
          </p>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-between">
            <span className="text-sm text-gray-400">
              {article.date}
            </span>

            <span
              className="
              inline-flex
              items-center
              gap-2
              text-sm
              font-semibold
              text-primary
              "
            >
              Đọc tiếp

              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}