
'use client';

import {
    BusFront,
    LoaderCircle,
    SearchX,
} from 'lucide-react';

import TripCard from './TripCard';

import type {
    PublicTripSearchResult,
} from '../types/booking-types';

type TripSearchResultsProps = {
    trips: PublicTripSearchResult[];
    isLoading: boolean;
    error: string;
    hasSearched: boolean;
};

// Hiển thị trạng thái và danh sách kết quả tìm chuyến công khai.
export default function TripSearchResults({
    trips,
    isLoading,
    error,
    hasSearched,
}: TripSearchResultsProps) {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white py-16">
                <LoaderCircle className="h-9 w-9 animate-spin text-red-600" />

                <p className="mt-4 text-sm font-bold text-gray-800">
                    Đang tìm chuyến xe...
                </p>

                <p className="mt-1 text-xs text-gray-400">
                    Vui lòng chờ trong giây lát
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                <div className="flex items-start gap-3">
                    <BusFront className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                    <div>
                        <h2 className="font-bold text-red-800">
                            Không thể tìm chuyến xe
                        </h2>

                        <p className="mt-1 text-sm leading-6 text-red-700">
                            {error}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!hasSearched) {
        return (
            <div className="py-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                    <SearchX className="h-6 w-6 text-gray-400" />
                </div>

                <p className="mt-4 text-sm font-semibold text-gray-700">
                    Chọn hành trình và ngày khởi hành
                </p>

                <p className="mt-1 text-xs text-gray-400">
                    Các chuyến xe phù hợp sẽ hiển thị tại đây.
                </p>
            </div>
        );
    }

    if (trips.length === 0) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white px-5 py-14 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                    <BusFront className="h-8 w-8 text-gray-400" />
                </div>

                <h2 className="mt-5 text-lg font-extrabold text-gray-900">
                    Chưa tìm thấy chuyến xe
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                    Hiện chưa có chuyến xe phù hợp với hành trình
                    và ngày khởi hành đã chọn. Hãy thử chọn ngày khác.
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-red-600">
                        Kết quả tìm kiếm
                    </p>

                    <h2 className="mt-1 text-xl font-extrabold text-gray-900 sm:text-2xl">
                        Tìm thấy {trips.length} chuyến xe
                    </h2>
                </div>

                <p className="text-sm text-gray-500">
                    Chọn chuyến xe để xem sơ đồ ghế
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
    );
}
