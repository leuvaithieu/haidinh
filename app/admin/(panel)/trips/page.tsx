
'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import TripList from './components/TripList';
import TripForm from './components/TripForm';
import ConfirmModal from '../../components/ConfirmModal';
import Toast from '../../components/Toast';

export type Trip = {
    id: string;
    routeId: string;
    vehicleId: string | null;
    driver1Id: string | null;
    driver2Id: string | null;
    assistant1Id: string | null;
    assistant2Id: string | null;
    seatLayoutId: string;
    scheduleType: 'NORMAL' | 'TET';
    plannedDeparture: string;
    returnPlannedDeparture: string;
    plannedArrival: string | null;
    status: string;

    route: {
        id: string;
        name: string;
    };

    vehicle: {
        id: string;
        name: string;
        licensePlate: string;
    } | null;

    driver1: {
        id: string;
        name: string;
    } | null;

    driver2: {
        id: string;
        name: string;
    } | null;

    assistant1: {
        id: string;
        name: string;
    } | null;

    assistant2: {
        id: string;
        name: string;
    } | null;
};

type ToastState = {
    message: string;
    type: 'success' | 'error';
} | null;

const statusOptions = [
    { value: 'ALL', label: 'Tất cả trạng thái' },
    { value: 'SCHEDULED', label: 'Đã lên lịch' },
    { value: 'DEPARTED', label: 'Đã khởi hành' },
    { value: 'AT_DESTINATION', label: 'Đã đến nơi' },
    { value: 'RETURNING', label: 'Đang quay về' },
    { value: 'COMPLETED', label: 'Hoàn thành' },
    { value: 'CANCELLED', label: 'Đã hủy' },
];

// Lấy ngày hiện tại theo múi giờ Việt Nam.
function getVietnamDateKey(date: Date = new Date()): string {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(date);

    const year = parts.find((part) => part.type === 'year')?.value ?? '';
    const month = parts.find((part) => part.type === 'month')?.value ?? '';
    const day = parts.find((part) => part.type === 'day')?.value ?? '';

    return `${year}-${month}-${day}`;
}

// Chuyển ngày dương lịch sang số ngày Julius.
function jdFromDate(day: number, month: number, year: number): number {
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;

    let jd =
        day +
        Math.floor((153 * m + 2) / 5) +
        365 * y +
        Math.floor(y / 4) -
        Math.floor(y / 100) +
        Math.floor(y / 400) -
        32045;

    if (jd < 2299161) {
        jd =
            day +
            Math.floor((153 * m + 2) / 5) +
            365 * y +
            Math.floor(y / 4) -
            32083;
    }

    return jd;
}

// Tính ngày sóc theo múi giờ Việt Nam.
function getNewMoonDay(k: number): number {
    const timeZone = 7;
    const t = k / 1236.85;
    const t2 = t * t;
    const t3 = t2 * t;
    const dr = Math.PI / 180;

    let jd1 =
        2415020.75933 +
        29.53058868 * k +
        0.0001178 * t2 -
        0.000000155 * t3;

    jd1 +=
        0.00033 *
        Math.sin((166.56 + 132.87 * t - 0.009173 * t2) * dr);

    const m =
        359.2242 +
        29.10535608 * k -
        0.0000333 * t2 -
        0.00000347 * t3;

    const mPrime =
        306.0253 +
        385.81691806 * k +
        0.0107306 * t2 +
        0.00001236 * t3;

    const f =
        21.2964 +
        390.67050646 * k -
        0.0016528 * t2 -
        0.00000239 * t3;

    let c1 =
        (0.1734 - 0.000393 * t) * Math.sin(m * dr) +
        0.0021 * Math.sin(2 * m * dr);

    c1 -=
        0.4068 * Math.sin(mPrime * dr) +
        0.0161 * Math.sin(2 * mPrime * dr);

    c1 -= 0.0004 * Math.sin(3 * mPrime * dr);
    c1 += 0.0104 * Math.sin(2 * f * dr);
    c1 -= 0.0051 * Math.sin((m + mPrime) * dr);
    c1 -= 0.0074 * Math.sin((m - mPrime) * dr);
    c1 += 0.0004 * Math.sin((2 * f + m) * dr);
    c1 -= 0.0004 * Math.sin((2 * f - m) * dr);
    c1 -= 0.0006 * Math.sin((2 * f + mPrime) * dr);
    c1 += 0.0010 * Math.sin((2 * f - mPrime) * dr);
    c1 += 0.0005 * Math.sin((2 * mPrime + m) * dr);

    let deltaT: number;

    if (t < -11) {
        deltaT =
            0.001 +
            0.000839 * t +
            0.0002261 * t2 -
            0.00000845 * t3 -
            0.000000081 * t * t3;
    } else {
        deltaT =
            -0.000278 +
            0.000265 * t +
            0.000262 * t2;
    }

    const jdNew = jd1 + c1 - deltaT;

    return Math.floor(jdNew + 0.5 + timeZone / 24);
}

// Tính vị trí mặt trời để xác định tháng âm lịch.
function getSunLongitude(dayNumber: number): number {
    const timeZone = 7;
    const t = (dayNumber - 2451545.5 - timeZone / 24) / 36525;
    const t2 = t * t;
    const dr = Math.PI / 180;

    const m =
        357.52910 +
        35999.05030 * t -
        0.0001559 * t2 -
        0.00000048 * t * t2;

    const l0 =
        280.46645 +
        36000.76983 * t +
        0.0003032 * t2;

    let dl =
        (1.914600 - 0.004817 * t - 0.000014 * t2) *
        Math.sin(dr * m);

    dl +=
        (0.019993 - 0.000101 * t) *
        Math.sin(2 * dr * m);

    dl += 0.000290 * Math.sin(3 * dr * m);

    let longitude = l0 + dl;
    longitude = longitude * dr;

    longitude -=
        Math.PI * 2 * Math.floor(longitude / (Math.PI * 2));

    return Math.floor((longitude / Math.PI) * 6);
}

// Tìm tháng 11 âm lịch của một năm dương lịch.
function getLunarMonth11(year: number): number {
    const off = jdFromDate(31, 12, year) - 2415021;
    const k = Math.floor(off / 29.530588853);

    let monthStart = getNewMoonDay(k);

    if (getSunLongitude(monthStart) >= 9) {
        monthStart = getNewMoonDay(k - 1);
    }

    return monthStart;
}

// Xác định vị trí tháng nhuận trong năm âm lịch.
function getLeapMonthOffset(a11: number): number {
    const k = Math.floor(
        0.5 + (a11 - 2415021.076998695) / 29.530588853,
    );

    let last = 0;
    let i = 1;
    let arc = getSunLongitude(getNewMoonDay(k + i));

    do {
        last = arc;
        i++;
        arc = getSunLongitude(getNewMoonDay(k + i));
    } while (arc !== last && i < 14);

    return i - 1;
}

// Chuyển ngày dương lịch sang ngày âm lịch Việt Nam.
function convertSolarToLunar(
    day: number,
    month: number,
    year: number,
): { day: number; month: number; year: number; leap: boolean } {
    const dayNumber = jdFromDate(day, month, year);

    const k = Math.floor(
        (dayNumber - 2415021.076998695) / 29.530588853,
    );

    let monthStart = getNewMoonDay(k + 1);

    if (monthStart > dayNumber) {
        monthStart = getNewMoonDay(k);
    }

    let a11 = getLunarMonth11(year);
    let b11 = a11;
    let lunarYear: number;

    if (a11 >= monthStart) {
        lunarYear = year;
        a11 = getLunarMonth11(year - 1);
    } else {
        lunarYear = year + 1;
        b11 = getLunarMonth11(year + 1);
    }

    const lunarDay = dayNumber - monthStart + 1;
    const diff = Math.floor((monthStart - a11) / 29);

    let lunarMonth = diff + 11;
    let leap = false;

    if (b11 - a11 > 365) {
        const leapMonthDiff = getLeapMonthOffset(a11);

        if (diff >= leapMonthDiff) {
            lunarMonth = diff + 10;

            if (diff === leapMonthDiff) {
                leap = true;
            }
        }
    }

    if (lunarMonth > 12) {
        lunarMonth -= 12;
    }

    if (lunarMonth >= 11 && diff < 4) {
        lunarYear -= 1;
    }

    return {
        day: lunarDay,
        month: lunarMonth,
        year: lunarYear,
        leap,
    };
}

// Hiển thị ngày âm lịch theo cách gọi tháng của Việt Nam.
function formatLunarDate(dateKey: string): string {
    if (!dateKey) return '';

    const [year, month, day] = dateKey.split('-').map(Number);

    if (!year || !month || !day) return '';

    const lunar = convertSolarToLunar(day, month, year);

    const monthNames: Record<number, string> = {
        1: 'Giêng',
        2: 'Hai',
        3: 'Ba',
        4: 'Tư',
        5: 'Năm',
        6: 'Sáu',
        7: 'Bảy',
        8: 'Tám',
        9: 'Chín',
        10: 'Mười',
        11: 'Một',
        12: 'Chạp',
    };

    return `${lunar.day} tháng ${monthNames[lunar.month]}${
        lunar.leap ? ' (nhuận)' : ''
    }`;
}

// Lấy ngày dương lịch của một chuyến theo múi giờ Việt Nam.
function getTripDateKey(value: string): string {
    if (!value) return '';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return '';

    return getVietnamDateKey(date);
}

// Định dạng ngày dương lịch để hiển thị bên cạnh ngày âm lịch.
function formatGregorianDate(dateKey: string): string {
    if (!dateKey) return '';

    const [year, month, day] = dateKey.split('-').map(Number);

    if (!year || !month || !day) return '';

    return `${String(day).padStart(2, '0')}/${String(month).padStart(
        2,
        '0',
    )}/${year}`;
}

export default function TripsPage() {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const [selectedDate, setSelectedDate] = useState(
        () => getVietnamDateKey(),
    );

    const [isTripFormOpen, setIsTripFormOpen] = useState(false);
    const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
    const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);

    const [currentuserRole, setCurrentUserRole] = useState('');
    const [toast, setToast] = useState<ToastState>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Tải danh sách chuyến từ API.
    async function getTrips() {
        setIsLoading(true);

        try {
            const response = await apiFetch('/trips');

            if (!response.ok) {
                setToast({
                    message: 'Không thể tải danh sách chuyến xe!',
                    type: 'error',
                });
                return;
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                setToast({
                    message: 'Dữ liệu chuyến xe không hợp lệ!',
                    type: 'error',
                });
                return;
            }

            setTrips(data);
        } catch {
            setToast({
                message: 'Không thể kết nối máy chủ!',
                type: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    }

    // Lấy vai trò người dùng hiện tại.
    async function getCurrentUser() {
        try {
            const response = await apiFetch('/auth/me');

            if (!response.ok) return;

            const data = await response.json();

            setCurrentUserRole(data.role ?? '');
        } catch {
            setCurrentUserRole('');
        }
    }

    useEffect(() => {
        void getTrips();
        void getCurrentUser();
    }, []);

    // Mở form tạo chuyến mới.
    function handleTripAdd() {
        setEditingTrip(null);
        setIsTripFormOpen(true);
    }

    // Mở form chỉnh sửa chuyến.
    function handleTripEdit(trip: Trip) {
        setEditingTrip(trip);
        setIsTripFormOpen(true);
    }

    // Đóng form chuyến xe.
    function handleCloseForm() {
        setIsTripFormOpen(false);
        setEditingTrip(null);
    }

    // Mở hộp thoại xác nhận xóa chuyến.
    function handleTripDelete(trip: Trip) {
        setTripToDelete(trip);
    }

    // Gửi yêu cầu xóa chuyến lên máy chủ.
    async function confirmDeleteTrip() {
        if (!tripToDelete) return;

        try {
            const response = await apiFetch(`/trips/${tripToDelete.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json().catch(() => null);

                setToast({
                    message: Array.isArray(data?.message)
                        ? data.message.join(', ')
                        : data?.message ?? 'Xóa chuyến thất bại',
                    type: 'error',
                });
                return;
            }

            const deletedTrip = tripToDelete;
            setTripToDelete(null);

            await getTrips();

            setToast({
                message: `Đã xóa chuyến ${deletedTrip.id}`,
                type: 'success',
            });
        } catch {
            setToast({
                message: 'Không thể kết nối máy chủ!',
                type: 'error',
            });
        }
    }

    const filteredTrips = trips.filter((trip) => {
        const keyword = search.trim().toLocaleLowerCase('vi');

        const matchesSearch = [
            trip.id,
            trip.route?.name,
            trip.vehicle?.name,
            trip.vehicle?.licensePlate,
            trip.driver1?.name,
            trip.driver2?.name,
        ].some((value) =>
            value?.toLocaleLowerCase('vi').includes(keyword),
        );

        const matchesStatus =
            statusFilter === 'ALL' || trip.status === statusFilter;

        const matchesDate =
            getTripDateKey(trip.plannedDeparture) === selectedDate;

        return matchesSearch && matchesStatus && matchesDate;
    });

    const lunarDate = formatLunarDate(selectedDate);
    const gregorianDate = formatGregorianDate(selectedDate);

    return (
        <div className="space-y-6">
            {/* Tiêu đề trang */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Quản lý chuyến xe
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Theo dõi lịch chạy, phương tiện và nhân sự trên từng chuyến
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleTripAdd}
                    className="w-full rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 active:bg-red-800 sm:w-auto"
                >
                    + Thêm chuyến
                </button>
            </div>

            {/* Bộ lọc ngày và tìm kiếm */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                    {/* Chọn ngày khởi hành */}
                    <div className="lg:col-span-4">
                        <label
                            htmlFor="trip-date-filter"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Ngày khởi hành
                        </label>

                        <div className="flex items-center gap-3">
                            <input
                                id="trip-date-filter"
                                type="date"
                                value={selectedDate}
                                onChange={(e) =>
                                    setSelectedDate(e.target.value)
                                }
                                className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedDate(getVietnamDateKey())
                                }
                                className="shrink-0 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            >
                                Hôm nay
                            </button>
                        </div>

                        <div className="mt-2 rounded-lg bg-red-50 px-3 py-2">
                            <p className="text-sm font-bold text-red-700">
                                {lunarDate}
                            </p>
                            <p className="mt-0.5 text-xs text-red-600">
                                Ngày dương lịch: {gregorianDate}
                            </p>
                        </div>
                    </div>

                    {/* Tìm kiếm */}
                    <div className="lg:col-span-5">
                        <label
                            htmlFor="trip-search"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Tìm kiếm chuyến
                        </label>

                        <div className="relative">
                            <svg
                                className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                aria-hidden="true"
                            >
                                <circle cx="11" cy="11" r="7" />
                                <path
                                    d="m16 16 4 4"
                                    strokeLinecap="round"
                                />
                            </svg>

                            <input
                                id="trip-search"
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Tìm mã chuyến, tuyến, xe, tài xế..."
                                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                            />
                        </div>
                    </div>

                    {/* Lọc trạng thái */}
                    <div className="lg:col-span-3">
                        <label
                            htmlFor="trip-status-filter"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Trạng thái chuyến
                        </label>

                        <select
                            id="trip-status-filter"
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(e.target.value)
                            }
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        >
                            {statusOptions.map((option) => (
                                <option
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Thông tin ngày đang xem */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">
                        Chuyến xe ngày {lunarDate}
                    </h2>
                    <p className="text-sm text-slate-500">
                        {gregorianDate} · Hiển thị theo ngày khởi hành
                    </p>
                </div>

                <span className="w-fit rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                    {filteredTrips.length} chuyến
                </span>
            </div>

            {/* Danh sách chuyến */}
            {isLoading ? (
                <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-red-600" />
                    <p className="mt-3 text-sm text-slate-500">
                        Đang tải danh sách chuyến...
                    </p>
                </div>
            ) : (
                <TripList
                    trips={filteredTrips}
                    onEdit={handleTripEdit}
                    onDelete={handleTripDelete}
                    userRole={currentuserRole}
                />
            )}

            {/* Form thêm và chỉnh sửa chuyến */}
            {isTripFormOpen && (
                <TripForm
                    trip={editingTrip}
                    onSuccess={async (message) => {
                        setIsTripFormOpen(false);
                        setEditingTrip(null);
                        await getTrips();
                        setToast({ message, type: 'success' });
                    }}
                    onClose={handleCloseForm}
                />
            )}

            {/* Xác nhận xóa chuyến */}
            {tripToDelete && (
                <ConfirmModal
                    isOpen={tripToDelete !== null}
                    title="Xóa chuyến xe"
                    message="Bạn có chắc muốn xóa chuyến xe này không?"
                    onCancel={() => setTripToDelete(null)}
                    onConfirm={confirmDeleteTrip}
                />
            )}

            {/* Thông báo */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
