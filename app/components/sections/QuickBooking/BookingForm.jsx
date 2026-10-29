
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
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
          ĐẶT VÉ TRỰC TUYẾN
        </span>

        <h2 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
          Tìm chuyến xe
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-500 sm:text-base">
          Chọn hành trình phù hợp với chuyến đi của bạn.
        </p>
      </div>

      {/* Form fields */}
      <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1.3fr)_minmax(150px,0.9fr)_minmax(120px,0.7fr)_150px] lg:gap-3">
        {/* Điểm đón */}
        <BookingField
          icon={<MapPin className="h-5 w-5" />}
          label="Điểm đón"
          placeholder="Nhập điểm đón..."
        />

        {/* Điểm trả */}
        <BookingField
          icon={<MapPin className="h-5 w-5" />}
          label="Điểm trả"
          placeholder="Nhập điểm trả..."
        />

        {/* Ngày đi */}
        <BookingField
          icon={<CalendarDays className="h-5 w-5" />}
          label="Ngày đi"
        >
          <button
            type="button"
            className="mt-1 w-full truncate text-left text-sm font-semibold text-gray-800 transition hover:text-primary"
          >
            Chọn ngày đi
          </button>
        </BookingField>

        {/* Số khách */}
        <BookingField
          icon={<Users className="h-5 w-5" />}
          label="Số khách"
        >
          <button
            type="button"
            className="mt-1 w-full truncate text-left text-sm font-semibold text-gray-800 transition hover:text-primary"
          >
            1 Người
          </button>
        </BookingField>

        {/* Search button */}
        <button
          type="button"
          className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-bold text-white shadow-md shadow-red-600/20 transition-colors hover:bg-red-700 active:bg-red-800 sm:col-span-2 lg:col-span-1 lg:h-[72px]"
        >
          <Search className="h-5 w-5 shrink-0 text-white" />
          <span className="text-white">Tìm chuyến</span>
        </button>
      </div>
    </div>
  );
}
