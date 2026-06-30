import Link from "next/link";
import { CalendarDays, Phone, Ticket } from "lucide-react";

export default function HeroContent() {
  return (
    <div className="flex min-h-[420px] items-center py-12 lg:min-h-[760px] lg:py-24 mt-72px">
      <div className="max-w-[620px] text-white">
        {/* Badge */}
        <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 backdrop-blur-md">
          <span className="text-[9px] font-medium uppercase tracking-[0.15em] text-white/90 md:text-[10px] lg:text-xs">
            Hơn 20 năm kết nối Thanh Hóa ↔ Bình Dương
          </span>
        </div>

        {/* Heading */}
        <h1 className="mt-4 text-[30px] font-black leading-[1.05] sm:text-[34px] lg:mt-6 lg:text-7xl">
          Đồng hành trên
          <br />
          mọi hành trình
          <span className="mt-2 block text-red-500">
            Thanh Hóa ↔ Bình Dương
          </span>
        </h1>

        {/* Description */}
        <p className="mt-4 max-w-[310px] text-[13px] leading-5 text-white/80 lg:mt-8 lg:max-w-lg lg:text-lg lg:leading-8">
          Đội xe THACO đời mới, khởi hành mỗi ngày.
          An toàn – Đúng giờ – Tận tâm.
        </p>

        {/* Buttons */}
        <div className="mt-6 flex flex-wrap gap-3 lg:mt-10">
          <Link
            href="/dat-ve"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-red-600 px-4 text-[13px] font-semibold transition hover:bg-red-700 lg:h-14 lg:px-8 lg:text-base"
          >
            <Ticket className="h-3.5 w-3.5 lg:h-5 lg:w-5" />
            Đặt vé ngay
          </Link>

          <Link
            href="/lich-trinh"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-4 text-[13px] font-semibold backdrop-blur transition hover:bg-white hover:text-black lg:h-14 lg:px-8 lg:text-base"
          >
            <CalendarDays className="h-3.5 w-3.5 lg:h-5 lg:w-5" />
            Lịch trình
          </Link>
        </div>

        {/* Hotline - Desktop */}
        <div className="mt-10 hidden items-center gap-3 lg:flex">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600">
            <Phone className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-white/60">
              Hotline 24/7
            </p>

            <a
              href="tel:0237xxxxxxxx"
              className="text-lg font-bold transition hover:text-red-400"
            >
              0237 xxx xxxx
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}