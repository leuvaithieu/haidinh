import Link from "next/link";
import {
  CalendarDays,
  MapPin,
  Search,
  Ticket,
} from "lucide-react";

export default function BookingForm() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-red-600 sm:text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
            Đặt vé trực tuyến
          </span>

          <h2 className="mt-2 text-2xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-3xl">
            Tìm chuyến xe Hải Định
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
            Chọn tuyến đường, điểm đón, điểm trả và ngày khởi hành
            để tìm chuyến xe phù hợp.
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
            <MapPin className="h-5 w-5 shrink-0 text-red-600" />
            <span>Chọn điểm đón và điểm trả</span>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
            <CalendarDays className="h-5 w-5 shrink-0 text-red-600" />
            <span>Chọn ngày khởi hành</span>
          </div>
        </div>

        <Link
          href="/dat-ve"
          className="inline-flex min-h-14 shrink-0 items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-4 text-sm font-bold text-white shadow-md shadow-red-600/20 transition hover:bg-red-700 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
        >
          <Search className="h-5 w-5" />
          <span>Tìm chuyến</span>
          <Ticket className="ml-1 h-5 w-5" />
        </Link>
      </div>

      <p className="mt-5 border-t border-gray-100 pt-4 text-xs leading-5 text-gray-400">
        Bạn cần hỗ trợ đặt vé? Liên hệ hotline Hải Định để được tư vấn.
      </p>
    </div>
  );
}
