import Image from "next/image";
import Link from "next/link";

import heroImage from "@/app/assets/images/hero/banner-hero-mobile.png";

export default function TripCard() {
  return (
    <article className="min-w-[82%] overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm snap-start lg:min-w-[360px]">
      {/* Image */}
      <div className="relative h-52">
        <Image
          src={heroImage}
          alt="Thanh Hóa - Bình Dương"
          fill
          className="object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Badge */}
        <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
          Tuyến chính
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-2xl font-bold text-gray-900">
          Thanh Hóa
        </h3>

        <p className="my-2 text-primary text-xl font-semibold">
          ⇄
        </p>

        <h3 className="text-2xl font-bold text-gray-900">
          Bình Dương
        </h3>

        <p className="mt-4 text-sm leading-6 text-gray-500">
          Đón trả nhiều điểm • Khởi hành mỗi ngày
        </p>

        <Link
          href="/tuyen/thanh-hoa-binh-duong"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary"
        >
          Xem lịch trình →
        </Link>
      </div>
    </article>
  );
}