
'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, RefreshCw } from 'lucide-react';
import { apiFetch } from '@/lib/api';

import type { BookingByDateResponse } from './booking-by-date-types';

import {
    convertLunarToSolar,
    convertSolarToLunar,
    formatLunarDate,
    formatSolarDate,
} from './lunar-date-utils';

type BookingByDateProps = {
    onDataLoaded: (response: BookingByDateResponse) => void;
    refreshKey: number;
};

type CalendarMode = 'SOLAR' | 'LUNAR';

// Lấy ngày hiện tại theo múi giờ local của trình duyệt.
function getLocalDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export default function BookingByDate({
    onDataLoaded,
    refreshKey,
}: BookingByDateProps) {
    const [selectedDate, setSelectedDate] = useState(getLocalDate);
    const [calendarMode, setCalendarMode] = useState<CalendarMode>('SOLAR');

    const [lunarDay, setLunarDay] = useState(() => {
        return convertSolarToLunar(getLocalDate()).day;
    });

    const [lunarMonth, setLunarMonth] = useState(() => {
        return convertSolarToLunar(getLocalDate()).month;
    });

    const [lunarYear, setLunarYear] = useState(() => {
        return convertSolarToLunar(getLocalDate()).year;
    });

    const [isLeapMonth, setIsLeapMonth] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Tải danh sách booking theo ngày dương lịch từ API.
    async function fetchBookingsByDate(date: string) {
        if (!date) return;

        setIsLoading(true);
        setError('');

        try {
            const params = new URLSearchParams({ date });

            const response = await apiFetch(
                `/bookings/by-date?${params.toString()}`,
            );

            if (!response.ok) {
                const result = await response.json().catch(() => null);

                throw new Error(
                    Array.isArray(result?.message)
                        ? result.message.join(', ')
                        : result?.message ||
                              'Không thể tải booking theo ngày',
                );
            }

            const result: BookingByDateResponse = await response.json();

            if (
                !Array.isArray(result.data) ||
                typeof result.totalTrips !== 'number'
            ) {
                throw new Error('Dữ liệu booking theo ngày không hợp lệ');
            }

            onDataLoaded(result);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Không thể kết nối đến máy chủ',
            );

            onDataLoaded({
                date,
                totalTrips: 0,
                data: [],
            });
        } finally {
            setIsLoading(false);
        }
    }

    // Tải booking khi ngày được chọn hoặc dữ liệu cần làm mới.
    useEffect(() => {
        void fetchBookingsByDate(selectedDate);
    }, [selectedDate, refreshKey]);

    // Cập nhật ngày âm tương ứng khi người dùng chọn ngày dương.
    function handleSolarDateChange(date: string) {
        if (!date) return;

        try {
            const lunar = convertSolarToLunar(date);

            setSelectedDate(date);
            setLunarDay(lunar.day);
            setLunarMonth(lunar.month);
            setLunarYear(lunar.year);
            setIsLeapMonth(lunar.isLeap);
            setError('');
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Ngày dương lịch không hợp lệ',
            );
        }
    }

    // Chuyển ngày âm được chọn sang ngày dương để gọi API.
    function handleLunarDateChange(
        day: number,
        month: number,
        year: number,
        isLeap: boolean,
    ) {
        setLunarDay(day);
        setLunarMonth(month);
        setLunarYear(year);
        setIsLeapMonth(isLeap);

        try {
            const solarDate = convertLunarToSolar(
                day,
                month,
                year,
                isLeap,
            );

            setSelectedDate(solarDate);
            setError('');
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Ngày âm lịch không hợp lệ',
            );
        }
    }

    // Chuyển chế độ lịch và đồng bộ thông tin ngày đang chọn.
    function handleCalendarModeChange(mode: CalendarMode) {
        if (mode === 'LUNAR') {
            const lunar = convertSolarToLunar(selectedDate);

            setLunarDay(lunar.day);
            setLunarMonth(lunar.month);
            setLunarYear(lunar.year);
            setIsLeapMonth(lunar.isLeap);
        }

        setCalendarMode(mode);
        setError('');
    }

    const lunarInfo = convertSolarToLunar(selectedDate);

    return (
        <section className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-[220px_minmax(280px,1fr)_minmax(280px,1fr)] lg:gap-6">

                {/* Tiêu đề và chế độ lịch */}
                <div className="space-y-3">
                    <div>
                        <h2 className="text-sm font-bold text-slate-900">
                            Tra cứu chuyến
                        </h2>
                        <p className="mt-1 text-xs text-slate-500">
                            Chọn ngày khởi hành
                        </p>
                    </div>

                    <div className="inline-flex rounded-lg bg-slate-100 p-1">
                        <button
                            type="button"
                            onClick={() => handleCalendarModeChange('SOLAR')}
                            className={`rounded-md px-3 py-2 text-xs font-semibold transition ${
                                calendarMode === 'SOLAR'
                                    ? 'bg-white text-red-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            Dương lịch
                        </button>

                        <button
                            type="button"
                            onClick={() => handleCalendarModeChange('LUNAR')}
                            className={`rounded-md px-3 py-2 text-xs font-semibold transition ${
                                calendarMode === 'LUNAR'
                                    ? 'bg-white text-red-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            Âm lịch
                        </button>
                    </div>
                </div>

                {/* Khu vực nhập ngày */}
                <div className="min-w-0">
                    {calendarMode === 'SOLAR' ? (
                        <div className="max-w-sm">
                            <label
                                htmlFor="booking-departure-date"
                                className="mb-2 block text-xs font-semibold text-slate-600"
                            >
                                Ngày dương lịch
                            </label>

                            <input
                                id="booking-departure-date"
                                type="date"
                                value={selectedDate}
                                onChange={(event) =>
                                    handleSolarDateChange(event.target.value)
                                }
                                disabled={isLoading}
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-50 disabled:opacity-50"
                            />
                        </div>
                    ) : (
                        <>
                            <p className="mb-2 text-xs font-semibold text-slate-600">
                                Ngày âm lịch
                            </p>

                            <div className="flex flex-wrap items-end gap-2">
                                <div className="min-w-0 flex-1">
                                    <label htmlFor="lunar-day" className="mb-1 block text-[11px] text-slate-400">
                                        Ngày
                                    </label>
                                    <input
                                        id="lunar-day"
                                        type="number"
                                        min={1}
                                        max={30}
                                        value={lunarDay}
                                        onChange={(event) =>
                                            handleLunarDateChange(
                                                Number(event.target.value),
                                                lunarMonth,
                                                lunarYear,
                                                isLeapMonth,
                                            )
                                        }
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm outline-none focus:border-red-400"
                                    />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <label htmlFor="lunar-month" className="mb-1 block text-[11px] text-slate-400">
                                        Tháng
                                    </label>
                                    <input
                                        id="lunar-month"
                                        type="number"
                                        min={1}
                                        max={12}
                                        value={lunarMonth}
                                        onChange={(event) =>
                                            handleLunarDateChange(
                                                lunarDay,
                                                Number(event.target.value),
                                                lunarYear,
                                                isLeapMonth,
                                            )
                                        }
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm outline-none focus:border-red-400"
                                    />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <label htmlFor="lunar-year" className="mb-1 block text-[11px] text-slate-400">
                                        Năm
                                    </label>
                                    <input
                                        id="lunar-year"
                                        type="number"
                                        min={1800}
                                        max={2199}
                                        value={lunarYear}
                                        onChange={(event) =>
                                            handleLunarDateChange(
                                                lunarDay,
                                                lunarMonth,
                                                Number(event.target.value),
                                                isLeapMonth,
                                            )
                                        }
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm outline-none focus:border-red-400"
                                    />
                                </div>

                                <label className="flex h-9 cursor-pointer items-center gap-1.5 whitespace-nowrap text-xs text-slate-600">
                                    <input
                                        type="checkbox"
                                        checked={isLeapMonth}
                                        onChange={(event) =>
                                            handleLunarDateChange(
                                                lunarDay,
                                                lunarMonth,
                                                lunarYear,
                                                event.target.checked,
                                            )
                                        }
                                        className="h-4 w-4 accent-red-600"
                                    />
                                    Nhuận
                                </label>
                            </div>
                        </>
                    )}
                </div>

                {/* Ngày âm và dương tương ứng */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-red-100 bg-red-50/60 p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-red-500">
                            Âm lịch
                        </p>
                        <p className="mt-1 text-base font-bold text-red-700">
                            {formatLunarDate(lunarInfo)}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-500">
                            {lunarInfo.yearCanChi}
                        </p>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Dương lịch
                        </p>
                        <p className="mt-1 text-base font-bold text-slate-800">
                            {formatSolarDate(selectedDate)}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-500">
                            Ngày khởi hành
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                    <p className="text-xs text-red-700">{error}</p>
                    <button
                        type="button"
                        onClick={() => void fetchBookingsByDate(selectedDate)}
                        disabled={isLoading}
                        className="text-xs font-semibold text-red-700 underline"
                    >
                        Thử tải lại
                    </button>
                </div>
            )}

            {isLoading && (
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Đang tải booking...
                </div>
            )}
        </section>
    );
}
