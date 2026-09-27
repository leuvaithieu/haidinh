type Trip = {
  id: number;
  route: string;
  vehicle: string;
  driver: string;
  departure: string;
  status: string;
};

const trips: Trip[] = [
  {
    id: 1,
    route: 'Thanh Hóa → Điện Biên',
    vehicle: '36B-12345',
    driver: 'Nguyễn Văn An',
    departure: '06:30',
    status: 'Đang chuẩn bị',
  },
  {
    id: 2,
    route: 'Thanh Hóa → Móng Cái',
    vehicle: '36B-23456',
    driver: 'Trần Văn Bình',
    departure: '07:00',
    status: 'Đã khởi hành',
  },
  {
    id: 3,
    route: 'Thanh Hóa → Lai Châu',
    vehicle: '36B-34567',
    driver: 'Lê Văn Cường',
    departure: '08:00',
    status: 'Đang chuẩn bị',
  },
  {
    id: 4,
    route: 'Thanh Hóa → Điện Biên',
    vehicle: '36B-45678',
    driver: 'Phạm Văn Dũng',
    departure: '09:30',
    status: 'Đang chuẩn bị',
  },
  {
    id: 5,
    route: 'Thanh Hóa → Móng Cái',
    vehicle: '36B-56789',
    driver: 'Hoàng Văn Đức',
    departure: '10:00',
    status: 'Đã khởi hành',
  },
];

export default function TodayTrips() {
  return (
    <>
        {/* Desktop */}
        <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="font-semibold text-slate-900">
                Chuyến xe hôm nay
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                Các chuyến xe đang được lên kế hoạch
                </p>
            </div>

            <div>
                <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                    <th className="px-6 py-3">Tuyến</th>
                    <th className="px-6 py-3">Xe</th>
                    <th className="px-6 py-3">Lái xe</th>
                    <th className="px-6 py-3">Giờ chạy</th>
                    <th className="px-6 py-3">Trạng thái</th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                    {trips.map((trip) => (
                    <tr
                        key={trip.id}
                        className="transition hover:bg-slate-50"
                    >
                        <td className="px-6 py-4 font-medium text-slate-800">
                        {trip.route}
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                        {trip.vehicle}
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                        {trip.driver}
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                        {trip.departure}
                        </td>

                        <td className="px-6 py-4">
                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                            {trip.status}
                        </span>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            </div>

            {/* Mobile */}
            <div className="md:hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-4">
                <h2 className="font-semibold text-slate-900">
                Chuyến xe hôm nay
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                Các chuyến xe đang được lên kế hoạch
                </p>
            </div>

            <div className="h-[220px] overflow-y-auto">
                <div className="divide-y divide-slate-100">
                {trips.map((trip) => (
                    <div
                    key={trip.id}
                    className="p-4"
                    >
                    <div className="flex items-start justify-between gap-3">
                        <div>
                        <p className="font-medium text-slate-900">
                            {trip.route}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                            {trip.vehicle}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                            {trip.driver}
                        </p>
                        </div>

                        <span className="shrink-0 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                        {trip.status}
                        </span>
                    </div>

                    <p className="mt-3 text-sm font-medium text-slate-700">
                        Giờ chạy: {trip.departure}
                    </p>
                    </div>
                ))}
                </div>
            </div>
        </div>
    </>
    );
}