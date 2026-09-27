type Booking ={
    id:number,
    customer:string,
    phone:string,
    route:string,
    seats:number,
    amount:number,
    status:string,
}

const bookings: Booking[] = [
  {
    id: 1,
    customer: 'Nguyễn Văn An',
    phone: '0988123456',
    route: 'Thanh Hóa → Bình Dương',
    seats: 2,
    amount: 1400000,
    status: 'Đã đặt',
  },
  {
    id: 2,
    customer: 'Trần Văn Bình',
    phone: '0977123456',
    route: 'Thanh Hóa → Bình Dương',
    seats: 1,
    amount: 700000,
    status: 'Chờ thanh toán',
  },
  {
    id: 3,
    customer: 'Lê Văn Cường',
    phone: '0966123456',
    route: 'Thanh Hóa → TP.HCM',
    seats: 3,
    amount: 2100000,
    status: 'Đã đặt',
  },
  {
    id: 4,
    customer: 'Phạm Thị Dung',
    phone: '0912345678',
    route: 'Thanh Hóa → Bình Dương',
    seats: 1,
    amount: 700000,
    status: 'Đã đặt',
  },
  {
    id: 5,
    customer: 'Hoàng Văn Đức',
    phone: '0901234567',
    route: 'Thanh Hóa → Đồng Nai',
    seats: 2,
    amount: 1500000,
    status: 'Đã đặt',
  },
  {
    id: 6,
    customer: 'Vũ Thị Hà',
    phone: '0934567890',
    route: 'Thanh Hóa → Bình Dương',
    seats: 1,
    amount: 700000,
    status: 'Chờ thanh toán',
  },
  {
    id: 7,
    customer: 'Đỗ Văn Hùng',
    phone: '0945678901',
    route: 'Thanh Hóa → TP.HCM',
    seats: 2,
    amount: 1400000,
    status: 'Đã đặt',
  },
  {
    id: 8,
    customer: 'Bùi Thị Lan',
    phone: '0978567890',
    route: 'Thanh Hóa → Bình Dương',
    seats: 3,
    amount: 2100000,
    status: 'Đã đặt',
  },
  {
    id: 9,
    customer: 'Ngô Văn Minh',
    phone: '0923456789',
    route: 'Thanh Hóa → Đồng Nai',
    seats: 1,
    amount: 750000,
    status: 'Chờ thanh toán',
  },
  {
    id: 10,
    customer: 'Đặng Thị Ngọc',
    phone: '0987654321',
    route: 'Thanh Hóa → Bình Dương',
    seats: 2,
    amount: 1400000,
    status: 'Đã đặt',
  },
];

export default function RecentBookings(){
    return (
    <>
        {/* Desktop */}
        <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="font-semibold text-slate-900">
                Đặt vé gần đây
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                Các đơn đặt vé mới nhất
                </p>
            </div>

            <div className="h-[220px] overflow-y-auto">
                <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                    <th className="px-6 py-3">Khách hàng</th>
                    <th className="px-6 py-3">Số điện thoại</th>
                    <th className="px-6 py-3">Tuyến</th>
                    <th className="px-6 py-3">Số vé</th>
                    <th className="px-6 py-3">Số tiền</th>
                    <th className="px-6 py-3">Trạng thái</th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                    {bookings.map((booking) => (
                    <tr
                        key={booking.id}
                        className="transition hover:bg-slate-50"
                    >
                        <td className="px-6 py-4 font-medium text-slate-800">
                        {booking.customer}
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                        {booking.phone}
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                        {booking.route}
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                        {booking.seats}
                        </td>

                        <td className="px-6 py-4 font-medium text-slate-800">
                        {booking.amount.toLocaleString('vi-VN')}đ
                        </td>

                        <td className="px-6 py-4">
                        <span
                            className={
                            booking.status === 'Đã đặt'
                                ? 'rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700'
                                : 'rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700'
                            }
                        >
                            {booking.status}
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
                Đặt vé gần đây
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                Các đơn đặt vé mới nhất
                </p>
            </div>

            <div className="h-[220px] overflow-y-auto">
                <div className="divide-y divide-slate-100">
                {bookings.map((booking) => (
                    <div
                    key={booking.id}
                    className="p-4"
                    >
                    <div className="flex items-start justify-between gap-3">
                        <div>
                        <p className="font-medium text-slate-900">
                            {booking.customer}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                            {booking.phone}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                            {booking.route}
                        </p>
                        </div>

                        <span
                        className={
                            booking.status === 'Đã đặt'
                            ? 'shrink-0 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700'
                            : 'shrink-0 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700'
                        }
                        >
                        {booking.status}
                        </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="text-slate-500">
                        {booking.seats} vé
                        </span>

                        <span className="font-medium text-slate-800">
                        {booking.amount.toLocaleString('vi-VN')}đ
                        </span>
                    </div>
                    </div>
                ))}
                </div>
            </div>
        </div>
    </>
);
}