import {
  CalendarDays,
  MapPin,
  Search,
  Users,
} from "lucide-react";

import BookingField from "./BookingField";

export default function BookingForm() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-5 sm:mb-6 lg:flex lg:items-end lg:justify-between lg:gap-6">
        <div>
          <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-red-600 sm:text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
            Đặt vé trực tuyến
          </span>

          <h2 className="mt-2 text-2xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
            Tìm chuyến xe
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
            Chọn điểm đón, điểm trả và ngày khởi hành để tìm hành trình phù hợp.
          </p>
        </div>

        <div className="mt-4 hidden shrink-0 items-center gap-2 text-sm text-gray-500 lg:flex">
          <MapPin className="h-4 w-4 text-red-600" />
          <span>Thanh Hóa – Bình Dương</span>
        </div>
      </div>

      {/* Search fields */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1.25fr)_minmax(145px,0.9fr)_minmax(120px,0.7fr)_150px] lg:items-stretch lg:gap-3">
        <BookingField
          icon={<MapPin className="h-5 w-5" />}
          label="Điểm đón"
          placeholder="Nhập điểm đón..."
        />

        <BookingField
          icon={<MapPin className="h-5 w-5" />}
          label="Điểm trả"
          placeholder="Nhập điểm trả..."
        />

        <BookingField
          icon={<CalendarDays className="h-5 w-5" />}
          label="Ngày đi"
        >
          <button
            type="button"
            className="mt-1 min-h-6 w-full truncate text-left text-sm font-semibold text-gray-800 transition hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            Chọn ngày đi
          </button>
        </BookingField>

        <BookingField
          icon={<Users className="h-5 w-5" />}
          label="Số khách"
        >
          <button
            type="button"
            className="mt-1 min-h-6 w-full truncate text-left text-sm font-semibold text-gray-800 transition hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            1 người
          </button>
        </BookingField>

        <button
          type="button"
          className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-red-600/20 transition hover:bg-red-700 active:scale-[0.99] active:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 sm:col-span-2 lg:col-span-1 lg:min-h-[72px]"
        >
          <Search className="h-5 w-5 shrink-0" />
          <span>Tìm chuyến</span>
        </button>
      </div>

      <p className="mt-4 text-xs leading-5 text-gray-400">
        Cần hỗ trợ đặt vé? Liên hệ hotline của Hải Định để được tư vấn.
      </p>
    </div>
  );
}