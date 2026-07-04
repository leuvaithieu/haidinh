import {
    CalendarDays,
    MapPin,
    Search,
    Users,
  } from "lucide-react";
  
  import BookingField from "./BookingField";
  
  export default function BookingForm() {
    return (
      <>
        {/* Header */}
        <div className="px-6 pt-8 lg:px-4 lg:pt-4">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            ĐẶT VÉ TRỰC TUYẾN
          </span>
  
          <h2 className="mt-2 text-3xl font-bold leading-tight text-gray-900 lg:text-4xl">
            Tìm chuyến xe
          </h2>
  
          <p className="mt-2 text-sm text-gray-500">
            Đặt vé chỉ trong vài bước.
          </p>
        </div>
  
        {/* Form */}
        <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_1fr_220px_180px_180px]">
          {/* Điểm đón */}
          <BookingField
            icon={<MapPin className="h-4 w-4" />}
            label="Điểm đón"
            placeholder="Nhập điểm đón..."
          />
  
          {/* Điểm trả */}
          <BookingField
            icon={<MapPin className="h-4 w-4" />}
            label="Điểm trả"
            placeholder="Nhập điểm trả..."
          />
  
          {/* Ngày đi */}
          <BookingField
            icon={<CalendarDays className="h-4 w-4" />}
            label="Ngày đi"
          >
            <button
              type="button"
              className="mt-1 text-left text-sm font-medium text-gray-400"
            >
              Chọn ngày đi
            </button>
          </BookingField>
  
          {/* Số khách */}
          <BookingField
            icon={<Users className="h-4 w-4" />}
            label="Số khách"
          >
            <button
              type="button"
              className="mt-1 text-left text-sm font-medium text-gray-900"
            >
              1 Người
            </button>
          </BookingField>
  
          {/* Button */}
          <button
            type="submit"
            className="flex h-14 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg lg:h-[72px] lg:rounded-2xl"
          >
            <Search className="h-4 w-4" />
            Tìm chuyến
          </button>
        </div>
      </>
    );
  }