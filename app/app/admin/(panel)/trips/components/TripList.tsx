
'use client';

import type { Trip } from '../page';

type TripListProps = {
    trips: Trip[];
    onEdit: (trip: Trip) => void;
    onDelete: (trip: Trip) => void;
    userRole: string;
};

const statusConfig: Record<string, { label: string; className: string }> = {
    SCHEDULED: {
        label: 'Đã lên lịch',
        className: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    },
    DEPARTED: {
        label: 'Đã khởi hành',
        className: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    },
    AT_DESTINATION: {
        label: 'Đã đến nơi',
        className: 'bg-purple-50 text-purple-700 ring-purple-600/20',
    },
    RETURNING: {
        label: 'Đang quay về',
        className: 'bg-sky-50 text-sky-700 ring-sky-600/20',
    },
    COMPLETED: {
        label: 'Hoàn thành',
        className: 'bg-green-50 text-green-700 ring-green-600/20',
    },
    CANCELLED: {
        label: 'Đã hủy',
        className: 'bg-red-50 text-red-700 ring-red-600/20',
    },
};

function formatDate(value?: string | Date | null): string {
    if (!value) return '—';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return '—';

    return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function StatusBadge({ status }: { status: string }) {
    const config = statusConfig[status] ?? {
        label: status || 'Không xác định',
        className: 'bg-slate-100 text-slate-600 ring-slate-500/20',
    };

    return (
        <span
            className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${config.className}`}
        >
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
            {config.label}
        </span>
    );
}

function ScheduleBadge({ scheduleType }: { scheduleType: string }) {
    const isTet = scheduleType === 'TET';

    return (
        <span
            className={
                isTet
                    ? 'inline-flex whitespace-nowrap rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-600/20'
                    : 'inline-flex whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600'
            }
        >
            {isTet ? 'Lịch Tết' : 'Thông thường'}
        </span>
    );
}

export default function TripList({
    trips,
    onEdit,
    onDelete,
    userRole,
}: TripListProps) {
    if (trips.length === 0) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="h-7 w-7"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8 7h8M8 12h8M8 17h5M5 3.75h14A1.25 1.25 0 0 1 20.25 5v14A1.25 1.25 0 0 1 19 20.25H5A1.25 1.25 0 0 1 3.75 19V5A1.25 1.25 0 0 1 5 3.75Z"
                        />
                    </svg>
                </div>

                <h3 className="mt-4 text-base font-semibold text-slate-900">
                    Chưa có chuyến xe
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                    Không tìm thấy chuyến phù hợp. Thử đổi bộ lọc hoặc tạo chuyến mới.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Tiêu đề danh sách */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                        Danh sách chuyến xe
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Thông tin lịch chạy và nhân sự phụ trách
                    </p>
                </div>

                <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                    {trips.length} chuyến
                </span>
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:block">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1100px] text-left text-sm">
                        <thead className="border-b border-slate-200 bg-slate-50">
                            <tr>
                                <th className="px-5 py-4 font-semibold text-slate-600">
                                    Chuyến xe
                                </th>
                                <th className="px-5 py-4 font-semibold text-slate-600">
                                    Tuyến
                                </th>
                                <th className="px-5 py-4 font-semibold text-slate-600">
                                    Phương tiện
                                </th>
                                <th className="px-5 py-4 font-semibold text-slate-600">
                                    Khởi hành
                                </th>
                                <th className="px-5 py-4 font-semibold text-slate-600">
                                    Quay đầu
                                </th>
                                <th className="px-5 py-4 font-semibold text-slate-600">
                                    Tài xế
                                </th>
                                <th className="px-5 py-4 font-semibold text-slate-600">
                                    Lịch chạy
                                </th>
                                <th className="px-5 py-4 font-semibold text-slate-600">
                                    Trạng thái
                                </th>
                                <th className="px-5 py-4 text-right font-semibold text-slate-600">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {trips.map((trip) => (
                                <tr
                                    key={trip.id}
                                    className="transition-colors hover:bg-slate-50/80"
                                >
                                    <td className="whitespace-nowrap px-5 py-4">
                                        <p className="font-semibold text-slate-900">
                                            #{trip.id.slice(0, 8)}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-400">
                                            ID chuyến
                                        </p>
                                    </td>

                                    <td className="px-5 py-4">
                                        <p className="max-w-48 font-medium text-slate-800">
                                            {trip.route?.name ?? 'Chưa gán tuyến'}
                                        </p>
                                    </td>

                                    <td className="px-5 py-4">
                                        <p className="font-medium text-slate-800">
                                            {trip.vehicle?.name ?? 'Chưa gán xe'}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {trip.vehicle?.licensePlate ?? '—'}
                                        </p>
                                    </td>

                                    <td className="whitespace-nowrap px-5 py-4">
                                        <p className="font-medium text-slate-800">
                                            {formatDate(trip.plannedDeparture)}
                                        </p>
                                    </td>

                                    <td className="whitespace-nowrap px-5 py-4">
                                        <p className="font-medium text-slate-800">
                                            {formatDate(trip.returnPlannedDeparture)}
                                        </p>
                                    </td>

                                    <td className="px-5 py-4">
                                        <p className="font-medium text-slate-800">
                                            {trip.driver1?.name ?? '—'}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {trip.driver2?.name
                                                ? `Tài xế 2: ${trip.driver2.name}`
                                                : 'Chưa có tài xế 2'}
                                        </p>
                                    </td>

                                    <td className="px-5 py-4">
                                        <ScheduleBadge
                                            scheduleType={trip.scheduleType}
                                        />
                                    </td>

                                    <td className="px-5 py-4">
                                        <StatusBadge status={trip.status} />
                                    </td>

                                    <td className="whitespace-nowrap px-5 py-4">
                                        <div className="flex justify-end gap-1">
                                            <button
                                                type="button"
                                                onClick={() => onEdit(trip)}
                                                className="rounded-lg px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                                            >
                                                Sửa
                                            </button>

                                            {userRole === 'ADMIN' && (
                                                <button
                                                    type="button"
                                                    onClick={() => onDelete(trip)}
                                                    className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                                                >
                                                    Xóa
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Tablet và mobile cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:hidden">
                {trips.map((trip) => (
                    <article
                        key={trip.id}
                        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-slate-400">
                                    MÃ CHUYẾN
                                </p>
                                <p className="mt-1 font-semibold text-slate-900">
                                    #{trip.id.slice(0, 8)}
                                </p>
                            </div>

                            <StatusBadge status={trip.status} />
                        </div>

                        <div className="mt-4 border-t border-slate-100 pt-4">
                            <p className="text-xs font-medium text-slate-500">
                                Tuyến xe
                            </p>
                            <h3 className="mt-1 text-base font-bold text-slate-900">
                                {trip.route?.name ?? 'Chưa gán tuyến'}
                            </h3>

                            <div className="mt-3 flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-slate-600 ring-1 ring-slate-200">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M5 17V6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5V17M5 12h14M7 17v2m10-2v2M8 8h.01M16 8h.01M7 17h10"
                                        />
                                    </svg>
                                </div>

                                <div className="min-w-0">
                                    <p className="font-semibold text-slate-800">
                                        {trip.vehicle?.name ?? 'Chưa gán xe'}
                                    </p>
                                    <p className="mt-0.5 text-sm text-slate-500">
                                        {trip.vehicle?.licensePlate ?? 'Chưa có biển số'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-3">
                            <div className="rounded-lg border border-slate-100 p-3">
                                <p className="text-xs font-medium text-slate-500">
                                    Khởi hành
                                </p>
                                <p className="mt-1 text-sm font-semibold text-slate-800">
                                    {formatDate(trip.plannedDeparture)}
                                </p>
                            </div>

                            <div className="rounded-lg border border-slate-100 p-3">
                                <p className="text-xs font-medium text-slate-500">
                                    Quay đầu
                                </p>
                                <p className="mt-1 text-sm font-semibold text-slate-800">
                                    {formatDate(trip.returnPlannedDeparture)}
                                </p>
                            </div>
                        </div>

                        <div className="mt-3 space-y-2">
                            <div className="flex items-start justify-between gap-3 text-sm">
                                <span className="text-slate-500">Tài xế 1</span>
                                <span className="text-right font-medium text-slate-800">
                                    {trip.driver1?.name ?? '—'}
                                </span>
                            </div>

                            <div className="flex items-start justify-between gap-3 text-sm">
                                <span className="text-slate-500">Tài xế 2</span>
                                <span className="text-right font-medium text-slate-800">
                                    {trip.driver2?.name ?? '—'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-3 pt-1">
                                <span className="text-sm text-slate-500">
                                    Loại lịch
                                </span>
                                <ScheduleBadge
                                    scheduleType={trip.scheduleType}
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3">
                            <button
                                type="button"
                                onClick={() => onEdit(trip)}
                                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:border-blue-200 hover:bg-blue-50"
                            >
                                Sửa chuyến
                            </button>

                            {userRole === 'ADMIN' && (
                                <button
                                    type="button"
                                    onClick={() => onDelete(trip)}
                                    className="rounded-lg border border-red-100 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                                >
                                    Xóa
                                </button>
                            )}
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}
