
'use client';

import { useState } from 'react';
import {
    ArrowRight,
    BusFront,
    CalendarDays,
    Clock3,
    LoaderCircle,
    MapPin,
} from 'lucide-react';

import BookingSearchForm from '../booking/components/BookingSearchForm';
import { searchPublicTrips } from '../booking/lib/booking-api';

import TripCard from '../booking/components/TripCard';

import type {
    PublicTripSearchParams,
    PublicTripSearchResult,
} from '../booking/types/booking-types';

// Định dạng thời gian khởi hành theo múi giờ Việt Nam.
function formatTripDateTime(value: string): string {
    return new Intl.DateTimeFormat('vi-VN', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Ho_Chi_Minh',
    }).format(new Date(value));
}

// Hiển thị danh sách chuyến xe phù hợp với hành trình tìm kiếm.
function TripResults({
    trips,
}: {
    trips: PublicTripSearchResult[];
}) {
    return (
        <div className="space-y-4">
            {trips.map((trip) => (
                <article
                    key={trip.tripId}
                    className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-red-200 hover:shadow-md sm:p-6"
                >
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0 flex-1">
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                                    {trip.route.title}
                                </span>

                                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                                    {trip.direction === 'OUTBOUND'
                                        ? 'Chiều đi'
                                        : 'Chiều về'}
                                </span>
                            </div>

                            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                                <div>
                                    <p className="text-lg font-extrabold text-gray-900">
                                        {formatTripDateTime(
                                            trip.pickup.plannedTime,
                                        ).split(' ').slice(-2).join(' ')}
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-gray-800">
                                        {trip.pickup.name}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-400">
                                        {formatTripDateTime(
                                            trip.pickup.plannedTime,
                                        )}
                                    </p>
                                </div>

                                <div className="flex flex-col items-center gap-1 text-gray-300">
                                    <ArrowRight className="h-5 w-5 text-red-500" />
                                    <span className="text-[10px] font-medium text-gray-400">
                                        Hành trình
                                    </span>
                                </div>

                                <div className="text-right">
                                    <p className="text-lg font-extrabold text-gray-900">
                                        {formatTripDateTime(
                                            trip.dropoff.plannedTime,
                                        ).split(' ').slice(-2).join(' ')}
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-gray-800">
                                        {trip.dropoff.name}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-400">
                                        {formatTripDateTime(
                                            trip.dropoff.plannedTime,
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-gray-100 pt-4 sm:min-w-48 sm:flex-col sm:items-end sm:justify-center sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <BusFront className="h-4 w-4 text-red-600" />
                                <span>{trip.vehicle.name}</span>
                            </div>

                            <p className="mt-1 text-xs text-gray-400">
                                {trip.vehicle.vehicleType} ·{' '}
                                {trip.vehicle.seatCount} chỗ
                            </p>

                            <a
                                href={`/dat-ve/${trip.tripId}?${new URLSearchParams({
                                    direction: trip.direction,
                                    pickup: trip.pickup.tripRoutePointId,
                                    dropoff: trip.dropoff.tripRoutePointId,
                                    pickupRoutePointId: trip.pickup.routePointId,
                                    dropoffRoutePointId: trip.dropoff.routePointId,
                                    routeName: trip.route.title || trip.route.name,
                                    pickupName: trip.pickup.name,
                                    dropoffName: trip.dropoff.name,
                                    departureTime: trip.pickup.plannedTime,
                                }).toString()}`}
                                className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-red-600 px-5 text-sm font-bold text-white transition hover:bg-red-700 sm:w-auto"
                            >
                                Chọn chuyến
                            </a>
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
}

export default function BookingPage() {
    const [trips, setTrips] = useState<PublicTripSearchResult[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Gọi API tìm chuyến và cập nhật danh sách kết quả.
    async function handleSearch(params: PublicTripSearchParams) {
        setIsLoading(true);
        setError('');
        setHasSearched(true);
        setTrips([]);

        try {
            const data = await searchPublicTrips(params);
            setTrips(data);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Không thể tìm chuyến xe',
            );
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-gray-50">
            <section className="bg-gray-950 px-4 py-10 sm:py-14">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-6 max-w-2xl">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-500">
                            Hải Định Transport
                        </p>

                        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                            Tìm và đặt vé xe
                        </h1>

                        <p className="mt-3 text-sm leading-6 text-gray-400 sm:text-base">
                            Tra cứu lịch trình, lựa chọn chuyến xe và
                            đặt chỗ trực tuyến nhanh chóng.
                        </p>
                    </div>

                    <BookingSearchForm onSearch={handleSearch} />
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white py-16">
                        <LoaderCircle className="h-8 w-8 animate-spin text-red-600" />

                        <p className="mt-4 text-sm font-semibold text-gray-700">
                            Đang tìm chuyến xe...
                        </p>
                    </div>
                )}

                {!isLoading && error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {!isLoading && !error && hasSearched && trips.length === 0 && (
                    <div className="rounded-2xl border border-gray-200 bg-white px-5 py-14 text-center">
                        <BusFront className="mx-auto h-10 w-10 text-gray-300" />

                        <h2 className="mt-4 text-lg font-bold text-gray-900">
                            Chưa tìm thấy chuyến xe
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            Không có chuyến phù hợp với hành trình
                            bạn đã chọn. Hãy thử ngày khác.
                        </p>
                    </div>
                )}

                {!isLoading && !error && trips.length > 0 && (
                    <div>
                        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-red-600">
                                    Kết quả tìm kiếm
                                </p>

                                <h2 className="mt-1 text-xl font-extrabold text-gray-900 sm:text-2xl">
                                    Tìm thấy {trips.length} chuyến xe
                                </h2>
                            </div>

                            <p className="text-sm text-gray-500">
                                Chọn chuyến xe phù hợp với bạn
                            </p>
                        </div>

                        <div className="space-y-4">
                            {trips.map((trip) => (
                                <TripCard
                                    key={trip.tripId}
                                    trip={trip}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {!hasSearched && !isLoading && (
                    <div className="py-8 text-center text-sm text-gray-400">
                        <CalendarDays className="mx-auto mb-3 h-7 w-7" />
                        Chọn hành trình và ngày khởi hành để tìm chuyến xe.
                    </div>
                )}
            </section>
        </main>
    );
}
