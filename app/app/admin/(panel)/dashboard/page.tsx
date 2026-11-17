'use client';

import { useCallback, useEffect, useState } from 'react';
import { Activity, CalendarDays, RefreshCw } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import StatCard from './components/StartCard';

type DashboardTrip = {
    id: string;
    plannedDeparture: string;
    returnPlannedDeparture?: string | null;
    status: string;
    route?: { name: string } | null;
    vehicle?: { name: string; licensePlate: string } | null;
    driver1?: { name: string } | null;
    driver2?: { name: string } | null;
};

type DashboardDeparture = {
    rowId: string;
    tripId: string;
    directionLabel: 'Chiều đi' | 'Chiều về';
    departureAt: string;
    status: string;
    route?: { name: string } | null;
    vehicle?: { name: string; licensePlate: string } | null;
    driver1?: { name: string } | null;
    driver2?: { name: string } | null;
};

type DashboardBooking = {
    id: string;
    bookingCode: string;
    customerName: string;
    customerPhone: string;
    totalAmount: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
    seats: unknown[];
    trip?: { route?: { name: string } | null } | null;
};

type DashboardData = {
    vehicleCount: number;
    driverCount: number;
    assistantCount: number;
    routeCount: number;
    todayTrips: DashboardDeparture[];
    recentBookings: DashboardBooking[];
    totalBookings: number;
};

// Đọc lỗi API theo định dạng phản hồi của NestJS.
async function getDashboardError(response: Response, fallback: string): Promise<string> {
    const data = await response.json().catch(() => null);
    if (Array.isArray(data?.message)) return data.message.join(', ');
    return data?.message || fallback;
}

// Chuẩn hóa ngày theo múi giờ trên trình duyệt để lọc chuyến trong ngày.
function getLocalDateKey(value: Date): string {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Chuyển mã trạng thái chuyến thành nội dung tiếng Việt.
function getTripStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        SCHEDULED: 'Đã lên lịch',
        DEPARTED: 'Đã khởi hành',
        AT_DESTINATION: 'Đến điểm cuối',
        RETURNING: 'Đang quay về',
        COMPLETED: 'Hoàn thành',
        CANCELLED: 'Đã hủy',
    };
    return labels[status] || status;
}

// Chuyển mã trạng thái booking thành nội dung tiếng Việt.
function getBookingStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        PENDING: 'Chờ thanh toán',
        PAYMENT_REVIEW: 'Chờ xác nhận tiền',
        CONFIRMED: 'Đã xác nhận',
        EXPIRED: 'Hết hạn',
        CANCELLED: 'Đã hủy',
    };
    return labels[status] || status;
}

// Hiển thị dashboard từ dữ liệu vận hành thực tế của Backend.
export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Tải số liệu đội xe, nhân sự, tuyến, chuyến hôm nay và booking mới nhất.
    const loadDashboard = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const endpoints = [
                '/vehicles',
                '/drivers',
                '/assistants',
                '/routes',
                '/trips',
                '/bookings?page=1&limit=10',
            ];
            const responses = await Promise.all(endpoints.map((endpoint) => apiFetch(endpoint)));
            const failedIndex = responses.findIndex((response) => !response.ok);
            if (failedIndex >= 0) {
                throw new Error(await getDashboardError(responses[failedIndex], 'Không thể tải dữ liệu dashboard.'));
            }

            const [vehicles, drivers, assistants, routes, trips, bookingResult] = await Promise.all(
                responses.map((response) => response.json()),
            );

            const todayKey = getLocalDateKey(new Date());
            const todayTrips: DashboardDeparture[] = (Array.isArray(trips) ? trips : [])
                .flatMap((trip: DashboardTrip) => {
                    const departures: DashboardDeparture[] = [];
                    if (trip.plannedDeparture && getLocalDateKey(new Date(trip.plannedDeparture)) === todayKey) {
                        departures.push({
                            ...trip,
                            rowId: `${trip.id}-OUTBOUND`,
                            tripId: trip.id,
                            directionLabel: 'Chiều đi',
                            departureAt: trip.plannedDeparture,
                        });
                    }
                    if (trip.returnPlannedDeparture && getLocalDateKey(new Date(trip.returnPlannedDeparture)) === todayKey) {
                        departures.push({
                            ...trip,
                            rowId: `${trip.id}-RETURN`,
                            tripId: trip.id,
                            directionLabel: 'Chiều về',
                            departureAt: trip.returnPlannedDeparture,
                        });
                    }
                    return departures;
                })
                .sort((a, b) => new Date(a.departureAt).getTime() - new Date(b.departureAt).getTime());

            const recentBookings: DashboardBooking[] = Array.isArray(bookingResult?.data)
                ? bookingResult.data
                : [];

            setData({
                vehicleCount: Array.isArray(vehicles) ? vehicles.length : 0,
                driverCount: Array.isArray(drivers) ? drivers.length : 0,
                assistantCount: Array.isArray(assistants) ? assistants.length : 0,
                routeCount: Array.isArray(routes) ? routes.length : 0,
                todayTrips,
                recentBookings,
                totalBookings: Number(bookingResult?.pagination?.total ?? recentBookings.length),
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu dashboard.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadDashboard();
    }, [loadDashboard]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                    <p className="mt-1 text-sm text-slate-500">Tổng quan dữ liệu vận hành Hải Định</p>
                </div>
                <button type="button" onClick={() => void loadDashboard()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60">
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Làm mới dữ liệu
                </button>
            </div>

            {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard title="Tổng số xe" value={data?.vehicleCount ?? 0} description="Phương tiện trong hệ thống" />
                <StatCard title="Lái xe" value={data?.driverCount ?? 0} description="Hồ sơ tài xế" />
                <StatCard title="Phụ xe" value={data?.assistantCount ?? 0} description="Hồ sơ phụ xe" />
                <StatCard title="Tuyến đường" value={data?.routeCount ?? 0} description="Tuyến đang quản lý" />
            </div>

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div><h2 className="font-semibold text-slate-900">Chuyến xe hôm nay</h2><p className="mt-1 text-sm text-slate-500">Bao gồm lịch xuất phát chiều đi và chiều về</p></div>
                    <CalendarDays size={19} className="text-slate-400" />
                </div>
                {loading && !data ? (
                    <div className="flex items-center justify-center gap-2 p-10 text-sm text-slate-500"><RefreshCw size={16} className="animate-spin" /> Đang tải chuyến xe...</div>
                ) : data?.todayTrips.length ? (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px] text-left text-sm">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Giờ chạy</th><th className="px-5 py-3">Chiều</th><th className="px-5 py-3">Tuyến</th><th className="px-5 py-3">Xe</th><th className="px-5 py-3">Lái xe</th><th className="px-5 py-3">Trạng thái</th></tr></thead>
                            <tbody className="divide-y divide-slate-100">
                                {data.todayTrips.map((trip) => (
                                    <tr key={trip.rowId} className="hover:bg-slate-50"><td className="px-5 py-4 font-semibold text-slate-900">{new Date(trip.departureAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</td><td className="px-5 py-4 text-slate-600">{trip.directionLabel}</td><td className="px-5 py-4 text-slate-700">{trip.route?.name || 'Chưa có tuyến'}</td><td className="px-5 py-4 text-slate-600">{trip.vehicle?.licensePlate || trip.vehicle?.name || '—'}</td><td className="px-5 py-4 text-slate-600">{[trip.driver1?.name, trip.driver2?.name].filter(Boolean).join(' / ') || '—'}</td><td className="px-5 py-4"><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{getTripStatusLabel(trip.status)}</span></td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-10 text-center text-sm text-slate-500">Không có chuyến xe nào được lên lịch hôm nay.</div>
                )}
            </section>

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div><h2 className="font-semibold text-slate-900">Booking gần đây</h2><p className="mt-1 text-sm text-slate-500">{data?.totalBookings ?? 0} booking trong hệ thống · hiển thị 10 booking mới nhất</p></div>
                    <Activity size={19} className="text-slate-400" />
                </div>
                {loading && !data ? (
                    <div className="flex items-center justify-center gap-2 p-10 text-sm text-slate-500"><RefreshCw size={16} className="animate-spin" /> Đang tải booking...</div>
                ) : data?.recentBookings.length ? (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-left text-sm">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Mã booking</th><th className="px-5 py-3">Khách hàng</th><th className="px-5 py-3">Tuyến</th><th className="px-5 py-3">Ghế</th><th className="px-5 py-3">Tổng tiền</th><th className="px-5 py-3">Trạng thái</th></tr></thead>
                            <tbody className="divide-y divide-slate-100">
                                {data.recentBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-slate-50"><td className="px-5 py-4 font-semibold text-slate-900">{booking.bookingCode}</td><td className="px-5 py-4"><p className="font-medium text-slate-800">{booking.customerName}</p><p className="mt-0.5 text-xs text-slate-500">{booking.customerPhone}</p></td><td className="px-5 py-4 text-slate-600">{booking.trip?.route?.name || '—'}</td><td className="px-5 py-4 text-slate-600">{booking.seats?.length ?? 0}</td><td className="px-5 py-4 font-medium text-slate-800">{Number(booking.totalAmount).toLocaleString('vi-VN')}đ</td><td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{getBookingStatusLabel(booking.status)}</span></td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-10 text-center text-sm text-slate-500">Chưa có booking nào.</div>
                )}
            </section>
        </div>
    );
}
