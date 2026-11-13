
'use client';

import type {
    RouteSegment,
    RouteSegmentListProps,
} from './route-segment-types';

export default function RouteSegmentList({
    segments,
    isLoading,
    userRole,
    onEdit,
    onDelete,
}: RouteSegmentListProps) {
    const isAdmin = userRole === 'ADMIN';

    // Chuyển tổng số phút thành định dạng giờ và phút để dễ theo dõi.
    function formatDuration(minutes: number) {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        if (hours === 0) return `${remainingMinutes} phút`;
        if (remainingMinutes === 0) return `${hours} giờ`;

        return `${hours} giờ ${remainingMinutes} phút`;
    }

    // Trả về nhãn và màu sắc tương ứng với loại lịch trình.
    function getScheduleType(scheduleType: RouteSegment['scheduleType']) {
        if (scheduleType === 'TET') {
            return {
                label: 'Lịch trình Tết',
                className:
                    'inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700',
            };
        }

        return {
            label: 'Lịch trình thường',
            className:
                'inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700',
        };
    }

    if (isLoading) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-red-600" />
                <p className="mt-3 text-sm text-slate-500">
                    Đang tải danh sách chặng...
                </p>
            </div>
        );
    }

    return (
        <section className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                    Danh sách chặng tuyến
                </h2>

                <span className="text-sm text-slate-500">
                    {segments.length} chặng
                </span>
            </div>

            {segments.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            className="h-6 w-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 7h18M3 12h18M3 17h18"
                            />
                        </svg>
                    </div>

                    <h3 className="mt-3 font-semibold text-slate-800">
                        Chưa có chặng tuyến
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        Tuyến này chưa được cấu hình thời gian di chuyển giữa
                        các điểm.
                    </p>

                    {isAdmin && (
                        <p className="mt-2 text-sm text-slate-500">
                            Sử dụng nút Thêm chặng để bắt đầu cấu hình.
                        </p>
                    )}
                </div>
            ) : (
                <>
                    {/* Bảng danh sách dành cho desktop */}
                    <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] text-left text-sm">
                                <thead className="border-b border-slate-200 bg-slate-50">
                                    <tr>
                                        <th className="px-5 py-4 font-semibold text-slate-700">
                                            STT
                                        </th>
                                        <th className="px-5 py-4 font-semibold text-slate-700">
                                            Điểm đầu
                                        </th>
                                        <th className="px-5 py-4 font-semibold text-slate-700">
                                            Điểm cuối
                                        </th>
                                        <th className="px-5 py-4 font-semibold text-slate-700">
                                            Thời gian di chuyển
                                        </th>
                                        <th className="px-5 py-4 font-semibold text-slate-700">
                                            Lịch trình
                                        </th>

                                        {isAdmin && (
                                            <th className="px-5 py-4 text-right font-semibold text-slate-700">
                                                Thao tác
                                            </th>
                                        )}
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {segments.map((segment, index) => {
                                        const schedule = getScheduleType(
                                            segment.scheduleType,
                                        );

                                        return (
                                            <tr
                                                key={segment.id}
                                                className="transition hover:bg-slate-50"
                                            >
                                                <td className="px-5 py-4 font-medium text-slate-500">
                                                    {index + 1}
                                                </td>

                                                <td className="px-5 py-4 font-medium text-slate-900">
                                                    {segment.fromRoutePoint?.name || '—'}
                                                </td>

                                                <td className="px-5 py-4 font-medium text-slate-900">
                                                    {segment.toRoutePoint?.name || '—'}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="font-semibold text-slate-800">
                                                        {formatDuration(
                                                            segment.travelDurationMinutes,
                                                        )}
                                                    </span>
                                                    <span className="ml-2 text-xs text-slate-400">
                                                        ({segment.travelDurationMinutes} phút)
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className={schedule.className}>
                                                        {schedule.label}
                                                    </span>
                                                </td>

                                                {isAdmin && (
                                                    <td className="px-5 py-4">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => onEdit(segment)}
                                                                className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                                                            >
                                                                Sửa
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => onDelete(segment)}
                                                                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                                            >
                                                                Xóa
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Danh sách dạng thẻ dành cho mobile */}
                    <div className="space-y-3 md:hidden">
                        {segments.map((segment, index) => {
                            const schedule = getScheduleType(
                                segment.scheduleType,
                            );

                            return (
                                <article
                                    key={segment.id}
                                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium text-slate-400">
                                                CHẶNG {index + 1}
                                            </p>

                                            <h3 className="mt-1 break-words font-semibold text-slate-900">
                                                {segment.fromRoutePoint?.name || '—'}
                                            </h3>

                                            <div className="my-2 flex items-center gap-2 text-slate-400">
                                                <span className="h-px w-6 bg-slate-300" />
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    className="h-4 w-4"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M5 12h14m-6-6 6 6-6 6"
                                                    />
                                                </svg>
                                            </div>

                                            <h3 className="break-words font-semibold text-slate-900">
                                                {segment.toRoutePoint?.name || '—'}
                                            </h3>
                                        </div>

                                        <span className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                            #{index + 1}
                                        </span>
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                                        <div>
                                            <p className="text-xs text-slate-400">
                                                Thời gian di chuyển
                                            </p>
                                            <p className="mt-1 font-semibold text-slate-900">
                                                {formatDuration(
                                                    segment.travelDurationMinutes,
                                                )}
                                            </p>
                                            <p className="mt-0.5 text-xs text-slate-400">
                                                {segment.travelDurationMinutes} phút
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-400">
                                                Loại lịch trình
                                            </p>
                                            <div className="mt-1">
                                                <span className={schedule.className}>
                                                    {schedule.label}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {isAdmin && (
                                        <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3">
                                            <button
                                                type="button"
                                                onClick={() => onEdit(segment)}
                                                className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                                            >
                                                Sửa
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => onDelete(segment)}
                                                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                </>
            )}
        </section>
    );
}
