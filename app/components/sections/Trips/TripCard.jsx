
import Image from "next/image";
import Link from "next/link";

import heroImage from "@/app/assets/images/hero/banner-hero-mobile.png";

export default function TripCard({ route, imageUrl }) {
  const title = route.title || route.route?.name || "Tuyến xe Hải Định";

  const description =
    route.shortDescription ||
    "Liên hệ Hải Định để biết thêm thông tin về tuyến xe.";

  return (
    <article className="flex h-full min-h-[420px] w-full max-w-[380px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:rounded-3xl">
      {/* Image */}
      <div className="relative h-[190px] min-h-[190px] w-full shrink-0 overflow-hidden bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 hover:scale-105"
          />
        ) : (
          <Image
            src={heroImage}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, 380px"
            className="object-cover transition duration-500 hover:scale-105"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-white/95 px-3 py-1.5 text-xs font-bold text-red-700 shadow-sm">
          Tuyến xe Hải Định
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="line-clamp-2 min-h-[3.5rem] text-lg font-bold leading-7 text-gray-900 sm:text-xl">
          {title}
        </h3>

        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-gray-600">
          {description}
        </p>

        <div className="mt-5 border-t border-gray-100 pt-4">
          <Link
            href="#quick-booking"
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
          >
            Đặt vé ngay
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
