
'use client';

import { useState } from 'react';
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

// Định dạng ngày giờ hiển thị theo múi giờ Việt Nam.
function formatDate(value?: string | Date | null): string {
    if (!value) return '—';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return '—';

    return date.toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

// Hiển thị trạng thái chuyến xe.
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

// Hiển thị loại lịch chạy.
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

// Hiển thị trạng thái phân công xe và nhân sự.
function AssignmentLabel({ value }: { value?: string | null }) {
    if (value) {
        return <span className="font-medium text-slate-800">{value}</span>;
    }

    return (
        <span className="font-medium text-amber-600">
            Chưa phân công
        </span>
    );
}

// Gom các chuyến theo tuyến đường.
function groupTripsByRoute(trips: Trip[]) {
    const groups = new Map<string, { routeName: string; trips: Trip[] }>();

    trips.forEach((trip) => {
        const routeId = trip.routeId || 'unknown';
        const routeName = trip.route?.name ?? 'Chưa gán tuyến';

        if (!groups.has(routeId)) {
            groups.set(routeId, {
                routeName,
                trips: [],
            });
        }

        groups.get(routeId)!.trips.push(trip);
    });

    return Array.from(groups.entries()).map(([routeId, group]) => ({
        routeId,
        ...group,
    }));
}

// Hiển thị thông tin nhân sự của chuyến.
function TripStaff({ trip }: { trip: Trip }) {
    return (
        <div className="space-y-1.5">
            <p className="text-xs text-slate-500">
                Tài xế 1: <AssignmentLabel value={trip.driver1?.name} />
            </p>
            <p className="text-xs text-slate-500">
                Tài xế 2: <AssignmentLabel value={trip.driver2?.name} />
            </p>
            <p className="text-xs text-slate-500">
                Phụ xe 1: <AssignmentLabel value={trip.assistant1?.name} />
            </p>
            <p className="text-xs text-slate-500">
                Phụ xe 2: <AssignmentLabel value={trip.assistant2?.name} />
            </p>
        </div>
    );
}

// Hiển thị các thao tác của chuyến.
function TripActions({
    trip,
    userRole,
    onEdit,
    onDelete,
}: {
    trip: Trip;
    userRole: string;
    onEdit: (trip: Trip) => void;
    onDelete: (trip: Trip) => void;
}) {
    return (
        <div className="flex shrink-0 justify-end gap-2">
            <button
                type="button"
                onClick={() => onEdit(trip)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-blue-600 transition hover:border-blue-200 hover:bg-blue-50"
            >
                Sửa
            </button>

            {userRole === 'ADMIN' && (
                <button
                    type="button"
                    onClick={() => onDelete(trip)}
                    className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                    Xóa
                </button>
            )}
        </div>
    );
}

// Hiển thị một chuyến xe trên giao diện desktop.
function DesktopTripRow({
    trip,
    userRole,
    onEdit,
    onDelete,
}: {
    trip: Trip;
    userRole: string;
    onEdit: (trip: Trip) => void;
    onDelete: (trip: Trip) => void;
}) {
    return (
        <tr className="transition-colors hover:bg-slate-50/80">
            <td className="whitespace-nowrap px-4 py-4">
                <p className="font-semibold text-slate-900">
                    #{trip.id.slice(0, 8)}
                </p>
                <p className="mt-1 text-xs text-slate-400">ID chuyến</p>
            </td>

            <td className="px-4 py-4">
                <AssignmentLabel value={trip.vehicle?.name} />
                <p className="mt-1 text-xs text-slate-500">
                    {trip.vehicle?.licensePlate ?? 'Chưa có biển số'}
                </p>
            </td>

            <td className="whitespace-nowrap px-4 py-4">
                <p className="font-medium text-slate-800">
                    {formatDate(trip.plannedDeparture)}
                </p>
            </td>

            <td className="whitespace-nowrap px-4 py-4">
                <p className="font-medium text-slate-800">
                    {formatDate(trip.returnPlannedDeparture)}
                </p>
            </td>

            <td className="px-4 py-4">
                <TripStaff trip={trip} />
            </td>

            <td className="px-4 py-4">
                <ScheduleBadge scheduleType={trip.scheduleType} />
            </td>

            <td className="px-4 py-4">
                <StatusBadge status={trip.status} />
            </td>

            <td className="whitespace-nowrap px-4 py-4">
                <TripActions
                    trip={trip}
                    userRole={userRole}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            </td>
        </tr>
    );
}

// Hiển thị một chuyến xe trên giao diện mobile.
function MobileTripCard({
    trip,
    userRole,
    onEdit,
    onDelete,
}: {
    trip: Trip;
    userRole: string;
    onEdit: (trip: Trip) => void;
    onDelete: (trip: Trip) => void;
}) {
    return (
        <article className="rounded-xl border border-slate-200 bg-white p-4">
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

            <div className="mt-4 rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-medium text-slate-500">
                    Phương tiện
                </p>
                <p className="mt-1 font-semibold text-slate-800">
                    <AssignmentLabel value={trip.vehicle?.name} />
                </p>
                <p className="mt-0.5 text-sm text-slate-500">
                    {trip.vehicle?.licensePlate ?? 'Chưa có biển số'}
                </p>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
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

            <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                <TripStaff trip={trip} />

                <div className="flex items-center justify-between gap-3 pt-2">
                    <span className="text-sm text-slate-500">Loại lịch</span>
                    <ScheduleBadge scheduleType={trip.scheduleType} />
                </div>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-3">
                <TripActions
                    trip={trip}
                    userRole={userRole}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            </div>
        </article>
    );
}

export default function TripList({
    trips,
    onEdit,
    onDelete,
    userRole,
}: TripListProps) {
    const [expandedRouteId, setExpandedRouteId] = useState<string | null>(
        null,
    );

    const routeGroups = groupTripsByRoute(trips);

    // Mở hoặc thu gọn danh sách chuyến của một tuyến.
    function toggleRoute(routeId: string) {
        setExpandedRouteId((currentId) =>
            currentId === routeId ? null : routeId,
        );
    }

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
                    Không tìm thấy chuyến phù hợp. Thử đổi ngày, từ khóa hoặc
                    tạo chuyến mới.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                        Danh sách chuyến xe
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Các chuyến được phân nhóm theo tuyến
                    </p>
                </div>

                <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                    {trips.length} chuyến
                </span>
            </div>

            <div className="space-y-3">
                {routeGroups.map((group, index) => {
                    const isExpanded = expandedRouteId === group.routeId;

                    return (
                        <section
                            key={group.routeId}
                            className={`overflow-hidden rounded-xl border bg-white transition ${
                                isExpanded
                                    ? 'border-red-200 shadow-md'
                                    : 'border-slate-200 shadow-sm hover:border-slate-300'
                            }`}
                        >
                            <div className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
                                <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold sm:h-12 sm:w-12 sm:text-base ${
                                        isExpanded
                                            ? 'bg-red-600 text-white'
                                            : 'bg-slate-100 text-slate-700'
                                    }`}
                                >
                                    {String(index + 1).padStart(2, '0')}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => toggleRoute(group.routeId)}
                                    aria-expanded={isExpanded}
                                    aria-label={`${
                                        isExpanded ? 'Thu gọn' : 'Mở'
                                    } tuyến ${group.routeName}`}
                                    className="flex min-w-0 flex-1 items-center gap-2 text-left sm:gap-3"
                                >
                                    <div className="min-w-0 flex-1">
                                        <h2 className="break-words text-sm font-bold text-slate-900 sm:text-base">
                                            {group.routeName}
                                        </h2>

                                        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                                            {group.trips.length} chuyến
                                        </p>
                                    </div>

                                    <svg
                                        className={`h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200 ${
                                            isExpanded ? 'rotate-180' : ''
                                        }`}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="m6 9 6 6 6-6"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </button>
                            </div>

                            {isExpanded && (
                                <div className="border-t border-slate-100 bg-slate-50/70 p-3 sm:p-5">
                                    <div className="hidden overflow-x-auto rounded-lg border border-slate-200 bg-white lg:block">
                                        <table className="w-full min-w-[1100px] text-left text-sm">
                                            <thead className="border-b border-slate-200 bg-slate-50">
                                                <tr>
                                                    <th className="px-4 py-3 font-semibold text-slate-600">
                                                        Chuyến xe
                                                    </th>
                                                    <th className="px-4 py-3 font-semibold text-slate-600">
                                                        Phương tiện
                                                    </th>
                                                    <th className="px-4 py-3 font-semibold text-slate-600">
                                                        Khởi hành
                                                    </th>
                                                    <th className="px-4 py-3 font-semibold text-slate-600">
                                                        Quay đầu
                                                    </th>
                                                    <th className="px-4 py-3 font-semibold text-slate-600">
                                                        Nhân sự
                                                    </th>
                                                    <th className="px-4 py-3 font-semibold text-slate-600">
                                                        Lịch chạy
                                                    </th>
                                                    <th className="px-4 py-3 font-semibold text-slate-600">
                                                        Trạng thái
                                                    </th>
                                                    <th className="px-4 py-3 text-right font-semibold text-slate-600">
                                                        Thao tác
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody className="divide-y divide-slate-100">
                                                {group.trips.map((trip) => (
                                                    <DesktopTripRow
                                                        key={trip.id}
                                                        trip={trip}
                                                        userRole={userRole}
                                                        onEdit={onEdit}
                                                        onDelete={onDelete}
                                                    />
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:hidden">
                                        {group.trips.map((trip) => (
                                            <MobileTripCard
                                                key={trip.id}
                                                trip={trip}
                                                userRole={userRole}
                                                onEdit={onEdit}
                                                onDelete={onDelete}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>
                    );
                })}
            </div>
        </div>
    );
}
