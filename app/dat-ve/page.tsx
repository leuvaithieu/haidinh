
'use client';

import { useState } from 'react';

import BookingSearchForm from '../booking/components/BookingSearchForm';
import TripSearchResults from '../booking/components/TripSearchResults';
import { searchPublicTrips } from '../booking/lib/booking-api';

import type {
    PublicTripSearchParams,
    PublicTripSearchResult,
} from '../booking/types/booking-types';

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
                    : 'Không thể tìm chuyến xe. Vui lòng thử lại.',
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
                <TripSearchResults
                    trips={trips}
                    isLoading={isLoading}
                    error={error}
                    hasSearched={hasSearched}
                />
            </section>
        </main>
    );
}
