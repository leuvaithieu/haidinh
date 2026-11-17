import Link from "next/link";
import { ArrowRight, CalendarDays, Phone, Ticket } from "lucide-react";

export default function HeroContent() {
  return (
    <div className="w-full py-5 sm:py-8 lg:py-10">
      <div className="max-w-2xl text-white">
        <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/25 bg-black/20 px-3 py-2 backdrop-blur-md sm:px-4">
          <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />

          <span className="text-[10px] font-bold uppercase leading-4 tracking-[0.1em] text-white/95 sm:text-xs sm:tracking-[0.14em]">
            Hơn 20 năm kết nối Thanh Hóa ↔ Bình Dương
          </span>
        </div>

        <h1 className="mt-5 max-w-[620px] text-[2.35rem] font-black leading-[1.04] tracking-tight sm:mt-6 sm:text-5xl lg:text-6xl xl:text-7xl">
          Đồng hành trên
          <br />
          mọi hành trình
          <span className="mt-2 block text-red-500">
            Thanh Hóa <span className="text-white/90">↔</span> Bình Dương
          </span>
        </h1>

        <p className="mt-4 max-w-lg text-sm leading-6 text-white/90 sm:mt-5 sm:text-base sm:leading-7 lg:text-lg">
          Đội xe THACO đời mới, khởi hành mỗi ngày.
          <span className="block font-medium text-white">
            An toàn – Đúng giờ – Tận tâm.
          </span>
        </p>

        <div className="mt-6 flex flex-col gap-3 min-[420px]:flex-row sm:mt-8 sm:flex-wrap sm:gap-4">
          <Link
            href="/dat-ve"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-950/30 transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-red-600 min-[420px]:w-auto sm:min-w-40 sm:text-base"
          >
            <Ticket className="h-5 w-5" />
            Đặt vé ngay
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>

          <Link
            href="/lich-trinh"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/35 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white hover:text-neutral-900 min-[420px]:w-auto sm:min-w-40 sm:text-base"
          >
            <CalendarDays className="h-5 w-5" />
            Xem lịch trình
          </Link>
        </div>

        <a
          href="tel:0237xxxxxxxx"
          className="mt-6 inline-flex max-w-full items-center gap-3 rounded-2xl border border-white/15 bg-black/20 p-3 pr-5 backdrop-blur-md transition hover:bg-black/35 sm:mt-8 sm:p-3.5"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-600">
            <Phone className="h-5 w-5 text-white" />
          </span>

          <span className="min-w-0">
            <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-white/70 sm:text-xs">
              Hotline hỗ trợ
            </span>

            <span className="mt-0.5 block text-base font-extrabold text-white sm:text-lg">
              0237 xxx xxxx
            </span>
          </span>
        </a>
      </div>
    </div>
  );
}