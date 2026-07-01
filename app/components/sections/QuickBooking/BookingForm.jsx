import { CalendarDays, MapPin, Users } from "lucide-react";
import BookingField from "./BookingField";

export default function BookingForm() {
  return (
    <>
      <div className=" px-4 py-4">
        <span className="text-sm font-semibold  tracking-[0.2em] text-primary ">
          ĐẶT VÉ TRỰC TUYẾN
        </span>

        {/* <h2 className="mt-2 text-3xl font-bold text-gray-900 uppercase">
          Tìm chuyến xe phù hợp
        </h2> */}

        <p className="mt-2 text-sm text-gray-500">
          Nhập thông tin để tìm chuyến xe phù hợp với bạn.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr_220px_180px_180px] px-2">
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
        />

        <BookingField
          icon={<Users className="h-5 w-5" />}
          label="Số khách"
        />

        <button className="h-[72px] rounded-2xl bg-primary font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          Tìm chuyến
        </button>
      </div>
    </>
  );
}