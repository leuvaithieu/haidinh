
'use client';

import { useState, type FormEvent } from 'react';
import { apiFetch } from '@/lib/api';

import type {
    Route,
    RoutePoint,
    RouteSegment,
    RouteSegmentFormProps,
    RouteSegmentPayload,
} from './route-segment-types';

export default function RouteSegmentForm({
    route,
    segment,
    onSuccess,
    onCancel,
}: RouteSegmentFormProps) {
    const sortedRoutePoints = [...route.routePoints].sort(
        (a, b) => a.sequence - b.sequence,
    );

    const initialFromPointId =
        segment?.fromRoutePointId || sortedRoutePoints[0]?.id || '';

    const initialFromPointIndex = sortedRoutePoints.findIndex(
        (point) => point.id === initialFromPointId,
    );

    const initialToPointId =
        segment?.toRoutePointId ||
        sortedRoutePoints[initialFromPointIndex + 1]?.id ||
        '';

    const [fromRoutePointId, setFromRoutePointId] =
        useState(initialFromPointId);

    const [toRoutePointId, setToRoutePointId] =
        useState(initialToPointId);

    const [travelDurationMinutes, setTravelDurationMinutes] = useState(
        segment?.travelDurationMinutes.toString() || '',
    );

    const [scheduleType, setScheduleType] = useState<
        RouteSegment['scheduleType']
    >(segment?.scheduleType || 'NORMAL');

    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fromPointIndex = sortedRoutePoints.findIndex(
        (point) => point.id === fromRoutePointId,
    );

    const adjacentToPoint = sortedRoutePoints[fromPointIndex + 1];

    const isExistingNonAdjacentSegment =
        Boolean(segment) &&
        Boolean(
            sortedRoutePoints.find(
                (point) => point.id === segment?.toRoutePointId,
            ),
        ) &&
        adjacentToPoint?.id !== segment?.toRoutePointId;

    // Lấy danh sách điểm cuối hợp lệ theo điểm đầu đang chọn.
    function getAvailableToPoints(): RoutePoint[] {
        if (fromPointIndex < 0) {
            return [];
        }

        const availablePoints: RoutePoint[] = [];

        if (adjacentToPoint) {
            availablePoints.push(adjacentToPoint);
        }

        // Giữ điểm cuối cũ để không làm thay đổi dữ liệu khi sửa chặng không liền kề.
        if (
            segment &&
            segment.fromRoutePointId === fromRoutePointId &&
            segment.toRoutePointId !== adjacentToPoint?.id
        ) {
            const existingToPoint = sortedRoutePoints.find(
                (point) => point.id === segment.toRoutePointId,
            );

            if (
                existingToPoint &&
                !availablePoints.some(
                    (point) => point.id === existingToPoint.id,
                )
            ) {
                availablePoints.push(existingToPoint);
            }
        }

        return availablePoints;
    }

    const availableToPoints = getAvailableToPoints();

    // Kiểm tra dữ liệu biểu mẫu trước khi gửi yêu cầu đến BE.
    function validateForm(): string {
        if (!fromRoutePointId || !toRoutePointId) {
            return 'Vui lòng chọn điểm đầu và điểm cuối';
        }

        const fromPoint = sortedRoutePoints.find(
            (point) => point.id === fromRoutePointId,
        );

        const toPoint = sortedRoutePoints.find(
            (point) => point.id === toRoutePointId,
        );

        if (!fromPoint || !toPoint) {
            return 'Điểm tuyến không hợp lệ';
        }

        if (fromPoint.sequence >= toPoint.sequence) {
            return 'Điểm đầu phải đứng trước điểm cuối';
        }

        const isAdjacent = toPoint.sequence === fromPoint.sequence + 1;

        const isKeepingExistingSegment =
            segment?.fromRoutePointId === fromRoutePointId &&
            segment?.toRoutePointId === toRoutePointId;

        if (!isAdjacent && !isKeepingExistingSegment) {
            return 'Chặng mới phải nối hai điểm liên tiếp trên tuyến';
        }

        const duration = Number(travelDurationMinutes);

        if (!Number.isInteger(duration) || duration <= 0) {
            return 'Thời gian di chuyển phải là số phút nguyên lớn hơn 0';
        }

        if (!['NORMAL', 'TET'].includes(scheduleType)) {
            return 'Loại lịch trình không hợp lệ';
        }

        return '';
    }

    // Gửi dữ liệu tạo mới hoặc cập nhật chặng tuyến đến BE.
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError('');

        const validationError = validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        setIsSubmitting(true);

        try {
            const payload: RouteSegmentPayload = {
                routeId: route.id,
                fromRoutePointId,
                toRoutePointId,
                travelDurationMinutes: Number(travelDurationMinutes),
                scheduleType,
            };

            const response = await apiFetch(
                segment
                    ? `/route-segments/${segment.id}`
                    : '/route-segments',
                {
                    method: segment ? 'PATCH' : 'POST',
                    body: JSON.stringify(payload),
                },
            );

            if (!response.ok) {
                const data = await response.json().catch(() => null);

                setError(
                    Array.isArray(data?.message)
                        ? data.message.join(', ')
                        : data?.message ||
                              (segment
                                  ? 'Cập nhật chặng tuyến thất bại'
                                  : 'Thêm chặng tuyến thất bại'),
                );

                return;
            }

            await onSuccess(
                segment
                    ? 'Cập nhật chặng tuyến thành công!'
                    : 'Thêm chặng tuyến thành công!',
            );
        } catch {
            setError('Không thể kết nối đến máy chủ');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Điểm đầu */}
            <div>
                <label
                    htmlFor="from-route-point"
                    className="mb-2 block text-sm font-medium text-slate-700"
                >
                    Điểm đầu
                </label>

                <select
                    id="from-route-point"
                    value={fromRoutePointId}
                    onChange={(event) => {
                        const newFromPointId = event.target.value;

                        const newIndex = sortedRoutePoints.findIndex(
                            (point) => point.id === newFromPointId,
                        );

                        setFromRoutePointId(newFromPointId);
                        setToRoutePointId(
                            sortedRoutePoints[newIndex + 1]?.id || '',
                        );
                        setError('');
                    }}
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:bg-slate-100"
                >
                    <option value="">Chọn điểm đầu</option>

                    {sortedRoutePoints.slice(0, -1).map((point) => (
                        <option key={point.id} value={point.id}>
                            {point.sequence}. {point.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Điểm cuối */}
            <div>
                <label
                    htmlFor="to-route-point"
                    className="mb-2 block text-sm font-medium text-slate-700"
                >
                    Điểm cuối
                </label>

                <select
                    id="to-route-point"
                    value={toRoutePointId}
                    onChange={(event) => {
                        setToRoutePointId(event.target.value);
                        setError('');
                    }}
                    disabled={
                        isSubmitting ||
                        !fromRoutePointId ||
                        availableToPoints.length === 0
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:bg-slate-100"
                >
                    <option value="">Chọn điểm cuối</option>

                    {availableToPoints.map((point) => (
                        <option key={point.id} value={point.id}>
                            {point.sequence}. {point.name}
                            {segment?.toRoutePointId === point.id &&
                            !(
                                point.sequence ===
                                (sortedRoutePoints[fromPointIndex]?.sequence ??
                                    -1) +
                                    1
                            )
                                ? ' (chặng hiện tại)'
                                : ''}
                        </option>
                    ))}
                </select>

                <p className="mt-1.5 text-xs text-slate-500">
                    Mỗi chặng mới nên nối hai điểm liên tiếp trên tuyến.
                </p>

                {isExistingNonAdjacentSegment && (
                    <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                        Chặng hiện tại không nối hai điểm liền kề. Hệ thống
                        giữ lựa chọn cũ để mày có thể cập nhật thời gian hoặc
                        loại lịch trình mà không thay đổi hai điểm.
                    </p>
                )}
            </div>

            {/* Thời gian di chuyển */}
            <div>
                <label
                    htmlFor="travel-duration"
                    className="mb-2 block text-sm font-medium text-slate-700"
                >
                    Thời gian di chuyển
                </label>

                <div className="relative">
                    <input
                        id="travel-duration"
                        type="number"
                        min="1"
                        step="1"
                        value={travelDurationMinutes}
                        onChange={(event) =>
                            setTravelDurationMinutes(event.target.value)
                        }
                        placeholder="Ví dụ: 120"
                        disabled={isSubmitting}
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 pr-16 text-sm text-slate-800 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:bg-slate-100"
                    />

                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                        Phút
                    </span>
                </div>

                <p className="mt-1.5 text-xs text-slate-500">
                    Nhập tổng thời gian di chuyển dự kiến của chặng.
                </p>

                {Number.isInteger(Number(travelDurationMinutes)) &&
                    Number(travelDurationMinutes) > 0 && (
                        <p className="mt-2 text-sm font-medium text-red-600">
                            {Math.floor(
                                Number(travelDurationMinutes) / 60,
                            ) > 0
                                ? `${Math.floor(
                                      Number(travelDurationMinutes) / 60,
                                  )} giờ `
                                : ''}
                            {Number(travelDurationMinutes) % 60 > 0
                                ? `${Number(travelDurationMinutes) % 60} phút`
                                : ''}
                        </p>
                    )}
            </div>

            {/* Loại lịch trình */}
            <div>
                <label
                    htmlFor="schedule-type"
                    className="mb-2 block text-sm font-medium text-slate-700"
                >
                    Loại lịch trình
                </label>

                <select
                    id="schedule-type"
                    value={scheduleType}
                    onChange={(event) =>
                        setScheduleType(
                            event.target.value as RouteSegment['scheduleType'],
                        )
                    }
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:bg-slate-100"
                >
                    <option value="NORMAL">Lịch trình thường</option>
                    <option value="TET">Lịch trình Tết</option>
                </select>

                <p className="mt-1.5 text-xs text-slate-500">
                    Một cặp điểm có thể có thời gian di chuyển riêng cho lịch
                    trình thường và lịch trình Tết.
                </p>
            </div>

            {/* Thông báo lỗi */}
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Các nút thao tác */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                    Hủy
                </button>

                <button
                    type="submit"
                    disabled={isSubmitting || sortedRoutePoints.length < 2}
                    className="w-full rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                    {isSubmitting
                        ? 'Đang lưu...'
                        : segment
                          ? 'Cập nhật chặng'
                          : 'Thêm chặng'}
                </button>
            </div>
        </form>
    );
}
