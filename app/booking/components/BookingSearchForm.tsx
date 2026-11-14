
'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    CalendarDays,
    MapPin,
    Route,
    Search,
} from 'lucide-react';

import { getPublishedRoutes } from '../lib/booking-api';

import type {
    PublishedRoute,
    PublicTripSearchParams,
    TripDirection,
} from '../types/booking-types';

type BookingSearchFormProps = {
    onSearch: (params: PublicTripSearchParams) => void;
};

// Chuyển ngày hiện tại thành chuỗi YYYY-MM-DD theo múi giờ thiết bị.
function getLocalDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export default function BookingSearchForm({
    onSearch,
}: BookingSearchFormProps) {
    const [routes, setRoutes] = useState<PublishedRoute[]>([]);
    const [selectedRouteId, setSelectedRouteId] = useState('');

    const [direction, setDirection] =
        useState<TripDirection>('OUTBOUND');

    const [pickupId, setPickupId] = useState('');
    const [dropoffId, setDropoffId] = useState('');

    const [date, setDate] = useState(
        () => getLocalDateString(new Date()),
    );

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const selectedRoute = useMemo(
        () =>
            routes.find(
                (item) => item.route.id === selectedRouteId,
            ) ?? null,
        [routes, selectedRouteId],
    );

    const orderedRoutePoints = useMemo(() => {
        const points = [
            ...(selectedRoute?.route.routePoints ?? []),
        ];

        return points.sort((a, b) =>
            direction === 'OUTBOUND'
                ? a.sequence - b.sequence
                : b.sequence - a.sequence,
        );
    }, [selectedRoute, direction]);

    const pickupPoint = orderedRoutePoints.find(
        (point) => point.id === pickupId,
    );

    const dropoffOptions = useMemo(() => {
        const pickupIndex = orderedRoutePoints.findIndex(
            (point) => point.id === pickupId,
        );

        if (pickupIndex < 0) {
            return [];
        }

        return orderedRoutePoints.slice(pickupIndex + 1);
    }, [orderedRoutePoints, pickupId]);

    // Tải danh sách tuyến đã được công khai trên website.
    async function loadRoutes() {
        setIsLoading(true);
        setError('');

        try {
            const data = await getPublishedRoutes();

            setRoutes(data);

            if (data.length > 0) {
                setSelectedRouteId(data[0].route.id);
            }
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Không thể tải danh sách tuyến',
            );
        } finally {
            setIsLoading(false);
        }
    }

    // Khởi tạo dữ liệu tuyến khi component được hiển thị.
    useEffect(() => {
        void loadRoutes();
    }, []);

    // Chọn tuyến và thiết lập lại hai điểm đón trả.
    function handleRouteChange(routeId: string) {
        setSelectedRouteId(routeId);

        const route = routes.find(
            (item) => item.route.id === routeId,
        );

        const points = [...(route?.route.routePoints ?? [])];

        points.sort((a, b) =>
            direction === 'OUTBOUND'
                ? a.sequence - b.sequence
                : b.sequence - a.sequence,
        );

        setPickupId(points[0]?.id ?? '');
        setDropoffId(points[1]?.id ?? '');
    }

    // Đổi chiều di chuyển và đảo thứ tự các điểm tuyến tương ứng.
    function handleDirectionChange(
        nextDirection: TripDirection,
    ) {
        setDirection(nextDirection);

        const points = [
            ...(selectedRoute?.route.routePoints ?? []),
        ];

        points.sort((a, b) =>
            nextDirection === 'OUTBOUND'
                ? a.sequence - b.sequence
                : b.sequence - a.sequence,
        );

        setPickupId(points[0]?.id ?? '');
        setDropoffId(points[1]?.id ?? '');
    }

    // Chọn điểm đón và tự điều chỉnh điểm trả hợp lệ tiếp theo.
    function handlePickupChange(nextPickupId: string) {
        setPickupId(nextPickupId);

        const pickupIndex = orderedRoutePoints.findIndex(
            (point) => point.id === nextPickupId,
        );

        const nextDropoff = orderedRoutePoints[pickupIndex + 1];

        setDropoffId(nextDropoff?.id ?? '');
    }

    // Kiểm tra dữ liệu và gửi yêu cầu tìm chuyến cho component cha.
    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!selectedRouteId) {
            setError('Vui lòng chọn tuyến đường');
            return;
        }

        if (!pickupId || !dropoffId) {
            setError('Vui lòng chọn điểm đón và điểm trả');
            return;
        }

        if (pickupId === dropoffId) {
            setError('Điểm đón và điểm trả không được trùng nhau');
            return;
        }

        if (!date) {
            setError('Vui lòng chọn ngày khởi hành');
            return;
        }

        setError('');

        onSearch({
            fromRoutePointId: pickupId,
            toRoutePointId: dropoffId,
            date,
            direction,
        });
    }

    return (
        <section className="rounded-2xl bg-white p-4 shadow-xl shadow-black/5 sm:p-6 lg:p-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                        Đặt vé trực tuyến
                    </span>

                    <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                        Tìm chuyến xe
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        Lựa chọn hành trình phù hợp với bạn.
                    </p>
                </div>

                <div className="flex rounded-xl bg-gray-100 p-1">
                    <button
                        type="button"
                        onClick={() =>
                            handleDirectionChange('OUTBOUND')
                        }
                        className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                            direction === 'OUTBOUND'
                                ? 'bg-red-600 text-white shadow'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Chiều đi
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            handleDirectionChange('RETURN')
                        }
                        className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                            direction === 'RETURN'
                                ? 'bg-red-600 text-white shadow'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Chiều về
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Route className="h-4 w-4 text-red-600" />
                            Tuyến đường
                        </label>

                        <select
                            value={selectedRouteId}
                            onChange={(event) =>
                                handleRouteChange(event.target.value)
                            }
                            disabled={isLoading || routes.length === 0}
                            className="min-h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm font-semibold text-gray-800 outline-none transition focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <option value="">
                                {isLoading
                                    ? 'Đang tải tuyến đường...'
                                    : 'Chọn tuyến đường'}
                            </option>

                            {routes.map((route) => (
                                <option
                                    key={route.route.id}
                                    value={route.route.id}
                                >
                                    {route.title || route.route.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <MapPin className="h-4 w-4 text-red-600" />
                            Điểm đón
                        </label>

                        <select
                            value={pickupId}
                            onChange={(event) =>
                                handlePickupChange(event.target.value)
                            }
                            disabled={!selectedRoute || orderedRoutePoints.length === 0}
                            className="min-h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm font-semibold text-gray-800 outline-none transition focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <option value="">Chọn điểm đón</option>

                            {orderedRoutePoints.map((point) => (
                                <option key={point.id} value={point.id}>
                                    {point.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <MapPin className="h-4 w-4 text-red-600" />
                            Điểm trả
                        </label>

                        <select
                            value={dropoffId}
                            onChange={(event) =>
                                setDropoffId(event.target.value)
                            }
                            disabled={!pickupPoint || dropoffOptions.length === 0}
                            className="min-h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm font-semibold text-gray-800 outline-none transition focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <option value="">Chọn điểm trả</option>

                            {dropoffOptions.map((point) => (
                                <option key={point.id} value={point.id}>
                                    {point.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="sm:col-span-2">
                        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <CalendarDays className="h-4 w-4 text-red-600" />
                            Ngày khởi hành
                        </label>

                        <input
                            type="date"
                            value={date}
                            min={getLocalDateString(new Date())}
                            onChange={(event) =>
                                setDate(event.target.value)
                            }
                            className="min-h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm font-semibold text-gray-800 outline-none transition focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10"
                        />
                    </div>
                </div>

                {error && (
                    <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={
                        isLoading ||
                        routes.length === 0 ||
                        !pickupId ||
                        !dropoffId
                    }
                    className="flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Search className="h-5 w-5" />
                    Tìm chuyến xe
                </button>
            </form>

            <p className="mt-4 text-center text-xs leading-5 text-gray-400">
                Cần hỗ trợ đặt vé? Liên hệ hotline Hải Định để được tư vấn.
            </p>
        </section>
    );
}
