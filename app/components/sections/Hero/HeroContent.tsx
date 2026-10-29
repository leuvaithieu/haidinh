
import Link from "next/link";
import { CalendarDays, Phone, Ticket } from "lucide-react";

export default function HeroContent() {
  return (
    <div className="w-full py-8 sm:py-12 lg:py-16">
      <div className="max-w-2xl text-white">
        {/* Badge */}
        <div className="inline-flex max-w-full items-center rounded-full border border-white/20 bg-white/10 px-3 py-2 backdrop-blur-md">
          <span className="text-[10px] font-semibold uppercase leading-4 tracking-[0.12em] text-white/90 sm:text-xs sm:tracking-[0.16em]">
            Hơn 20 năm kết nối Thanh Hóa ↔ Bình Dương
          </span>
        </div>

        {/* Heading */}
        <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:mt-6 lg:text-7xl">
          Đồng hành trên
          <br />
          mọi hành trình
          <span className="mt-2 block text-red-500">
            Thanh Hóa ↔ Bình Dương
          </span>
        </h1>

        {/* Description */}
        <p className="mt-5 max-w-lg text-sm leading-6 text-white/85 sm:text-base sm:leading-7 lg:mt-6 lg:text-lg lg:leading-8">
          Đội xe THACO đời mới, khởi hành mỗi ngày.
          <span className="block">An toàn – Đúng giờ – Tận tâm.</span>
        </p>

        {/* Action buttons */}
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4 lg:mt-9">
          <Link
            href="/dat-ve"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-red-950/20 transition hover:bg-red-700 sm:w-auto sm:min-w-40 sm:text-base"
          >
            <Ticket className="h-5 w-5" />
            Đặt vé ngay
          </Link>

          <Link
            href="/lich-trinh"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white hover:text-neutral-900 sm:w-auto sm:min-w-40 sm:text-base"
          >
            <CalendarDays className="h-5 w-5" />
            Lịch trình
          </Link>
        </div>

        {/* Hotline */}
        <div className="mt-8 flex items-center gap-3 sm:mt-10">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-600">
            <Phone className="h-5 w-5 text-white" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-widest text-white/70">
              Hotline hỗ trợ
            </p>

            <a
              href="tel:0237xxxxxxxx"
              className="text-base font-bold transition hover:text-red-400 sm:text-lg"
            >
              0237 xxx xxxx
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
