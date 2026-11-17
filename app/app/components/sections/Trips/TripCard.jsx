import Image from "next/image";
import Link from "next/link";

import heroImage from "@/app/assets/images/hero/banner-hero-mobile.png";

export default function TripCard({ route, imageUrl }) {
  const title = route.title || route.route?.name || "Tuyến xe Hải Định";

  const description =
    route.shortDescription ||
    "Liên hệ Hải Định để biết thêm thông tin về tuyến xe.";

  return (
    <article className="group flex h-full min-h-[360px] w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:min-h-[400px] sm:rounded-3xl">
      {/* Route image */}
      <div className="relative h-[180px] shrink-0 overflow-hidden bg-gray-100 sm:h-[210px]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <Image
            src={heroImage}
            alt={title}
            fill
            sizes="(max-width: 640px) 84vw, (max-width: 1024px) 45vw, 380px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        <span className="absolute left-3 top-3 rounded-full border border-white/30 bg-white/95 px-3 py-1.5 text-[11px] font-bold text-red-700 shadow-sm sm:left-4 sm:top-4 sm:text-xs">
          Tuyến xe Hải Định
        </span>
      </div>

      {/* Route information */}
      <div className="flex flex-1 flex-col p-4 sm:p-5 lg:p-6">
        <h3 className="line-clamp-2 min-h-[3.25rem] text-lg font-extrabold leading-6 text-gray-900 transition-colors group-hover:text-red-700 sm:min-h-[3.5rem] sm:text-xl sm:leading-7">
          {title}
        </h3>

        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-gray-600">
          {description}
        </p>

        <div className="mt-4 border-t border-gray-100 pt-4 sm:mt-5">
          <Link
            href="#quick-booking"
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700 active:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
          >
            Đặt vé ngay
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}