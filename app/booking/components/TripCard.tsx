
'use client';

import Link from 'next/link';
import {
    ArrowRight,
    BusFront,
} from 'lucide-react';

import type {
    PublicTripSearchResult,
} from '../types/booking-types';

type TripCardProps = {
    trip: PublicTripSearchResult;
};

// Định dạng thời gian khởi hành và đến nơi theo múi giờ Việt Nam.
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

// Hiển thị thông tin một chuyến xe và đường dẫn đến trang chọn ghế.
export default function TripCard({ trip }: TripCardProps) {
    const bookingParams = new URLSearchParams({
        direction: trip.direction,
        pickup: trip.pickup.tripRoutePointId,
        dropoff: trip.dropoff.tripRoutePointId,
        pickupRoutePointId: trip.pickup.routePointId,
        dropoffRoutePointId: trip.dropoff.routePointId,
        routeName: trip.route.title || trip.route.name,
        pickupName: trip.pickup.name,
        dropoffName: trip.dropoff.name,
        departureTime: trip.pickup.plannedTime,
    });

    return (
        <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-red-200 hover:shadow-md sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                            {trip.route.title || trip.route.name}
                        </span>

                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                            {trip.direction === 'OUTBOUND'
                                ? 'Chiều đi'
                                : 'Chiều về'}
                        </span>
                    </div>

                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                        <div className="min-w-0">
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

                        <div className="min-w-0 text-right">
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
                    <div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <BusFront className="h-4 w-4 text-red-600" />
                            <span>{trip.vehicle.name}</span>
                        </div>

                        <p className="mt-1 text-xs text-gray-400">
                            {trip.vehicle.vehicleType} ·{' '}
                            {trip.vehicle.seatCount} chỗ
                        </p>
                    </div>

                    <Link
                        href={`/dat-ve/${encodeURIComponent(trip.tripId)}?${bookingParams.toString()}`}
                        className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-red-600 px-5 text-sm font-bold text-white transition hover:bg-red-700 sm:w-auto"
                    >
                        Chọn chuyến
                    </Link>
                </div>
            </div>
        </article>
    );
}
