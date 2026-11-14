
'use client';

import type { PublicTripSeat } from '../types/booking-types';

type SeatMapProps = {
    seats: PublicTripSeat[];
    selectedSeatIds: string[];
    onToggleSeat: (seatId: string) => void;
};

// Hiển thị sơ đồ ghế và cho phép khách chọn hoặc bỏ chọn ghế còn trống.
export default function SeatMap({
    seats,
    selectedSeatIds,
    onToggleSeat,
}: SeatMapProps) {
    const levels = Array.from(
        new Set(seats.map((seat) => seat.level)),
    ).sort((a, b) => a - b);

    const selectedCount = selectedSeatIds.length;
    const availableCount = seats.filter((seat) => seat.isAvailable).length;

    console.table(
        seats.map((seat) => ({
            code: seat.code,
            row: seat.row,
            column: seat.column,
            level: seat.level,
        })),
    );

    return (
        <section className="w-full rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">
                        Chọn vị trí ghế
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Chọn ghế còn trống trên sơ đồ xe
                    </p>
                </div>

                <div className="text-sm text-gray-600">
                    Còn trống:{' '}
                    <span className="font-semibold text-green-700">
                        {availableCount}
                    </span>
                </div>
            </div>

            <div className="mb-5 flex flex-wrap gap-x-5 gap-y-3 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded border border-gray-300 bg-white" />
                    Còn trống
                </div>

                <div className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded border border-red-600 bg-red-600" />
                    Đang chọn
                </div>

                <div className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded border border-gray-300 bg-gray-200" />
                    Đã có khách
                </div>
            </div>

            {seats.length === 0 ? (
                <div className="rounded-xl bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
                    Chuyến xe chưa có dữ liệu sơ đồ ghế.
                </div>
            ) : (
                <div className="space-y-8">
                    {levels.map((level) => {
                        const levelSeats = seats.filter(
                            (seat) => seat.level === level,
                        );

                        const rows = Array.from(
                            new Set(levelSeats.map((seat) => seat.row)),
                        ).sort((a, b) => a - b);

                        const maxColumn = Math.max(
                            ...levelSeats.map((seat) => seat.column),
                        );

                        const gridColumns =
                            maxColumn > 2
                                ? `repeat(2, minmax(0, 1fr)) minmax(1.5rem, 0.35fr) repeat(${maxColumn - 2}, minmax(0, 1fr))`
                                : `repeat(${maxColumn}, minmax(0, 1fr))`;

                        return (
                            <div key={level}>
                                <div className="mb-3 flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-800">
                                        {levels.length > 1
                                            ? `Tầng ${level}`
                                            : 'Sơ đồ ghế'}
                                    </h3>

                                    <span className="text-xs text-gray-400">
                                        {levelSeats.length} vị trí
                                    </span>
                                </div>

                                <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-gray-50 p-3 sm:p-5">
                                    <div className="mb-5 flex items-center justify-center">
                                        <div className="w-24 rounded-lg border border-gray-300 bg-white px-3 py-2 text-center text-xs font-medium text-gray-500">
                                            ĐẦU XE
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {rows.map((row) => {
                                            const rowSeats = levelSeats
                                                .filter(
                                                    (seat) => seat.row === row,
                                                )
                                                .sort(
                                                    (a, b) =>
                                                        a.column - b.column,
                                                );

                                            return (
                                                <div
                                                    key={`${level}-${row}`}
                                                    className="grid gap-2"
                                                    style={{
                                                        gridTemplateColumns: `repeat(${rowSeats.length}, minmax(0, 1fr))`,
                                                    }}
                                                >
                                                    {rowSeats.map((seat) => {
                                                        const isSelected =
                                                            selectedSeatIds.includes(seat.id);
                                                        const isAvailable = seat.isAvailable;
                                                        const seatLabel = seat.label || seat.code;

                                                        let seatClass =
                                                            'border-gray-300 bg-white text-gray-700 hover:border-red-400 hover:bg-red-50';

                                                        if (!isAvailable) {
                                                            seatClass =
                                                                'cursor-not-allowed border-gray-200 bg-gray-200 text-gray-400';
                                                        } else if (isSelected) {
                                                            seatClass =
                                                                'border-red-600 bg-red-600 text-white shadow-sm';
                                                        }

                                                        return (
                                                            <button
                                                                key={seat.id}
                                                                type="button"
                                                                disabled={!isAvailable}
                                                                aria-pressed={isSelected}
                                                                aria-label={`Ghế ${seatLabel}${!isAvailable ? ', đã có khách' : isSelected ? ', đang chọn' : ', còn trống'}`}
                                                                onClick={() => onToggleSeat(seat.id)}
                                                                className={`flex min-h-12 min-w-0 items-center justify-center rounded-lg border px-1 py-2 text-xs font-semibold transition sm:min-h-14 sm:text-sm ${seatClass}`}
                                                            >
                                                                <span className="truncate">{seatLabel}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-5 border-t border-dashed border-gray-300 pt-3 text-center text-xs text-gray-400">
                                        CUỐI XE
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="mt-5 flex items-center justify-between rounded-xl bg-red-50 px-4 py-3">
                <span className="text-sm font-medium text-gray-700">
                    Ghế đã chọn
                </span>

                <span className="text-sm font-bold text-red-700">
                    {selectedCount} ghế
                </span>
            </div>
        </section>
    );
}
