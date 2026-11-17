
'use client';

import { useMemo } from 'react';

import type { Seat } from '../types';

// ==========================================
// PROPS
// ==========================================

type SeatGridProps = {
    seats: Seat[];
    readOnly?: boolean;
    onEdit: (seat: Seat) => void;
    onDelete: (seat: Seat) => void;
};

// ==========================================
// HELPER
// ==========================================

// Trả về tên loại ghế để hiển thị trên giao diện.
function getSeatTypeLabel(type: Seat['type']) {
    const labels: Record<Seat['type'], string> = {
        BERTH: 'Giường nằm',
        SEAT: 'Ghế ngồi',
        PRIVATE_ROOM: 'Phòng riêng',
        OTHER: 'Khác',
    };

    return labels[type] ?? 'Khác';
}


// Trả về màu sắc tương ứng với loại ghế.
function getSeatTypeStyle(type: Seat['type']) {
    const styles: Record<Seat['type'], string> = {
        BERTH: 'border-blue-200 bg-blue-50 text-blue-700',
        SEAT: 'border-purple-200 bg-purple-50 text-purple-700',
        PRIVATE_ROOM: 'border-amber-200 bg-amber-50 text-amber-700',
        OTHER: 'border-slate-200 bg-slate-50 text-slate-700',
    };

    return styles[type] ?? styles.OTHER;
}


// Trả về màu sắc theo trạng thái hoạt động của ghế.
function getSeatStatusStyle(isActive: boolean) {
    return isActive
        ? 'border-green-300 bg-green-50 text-green-700'
        : 'border-slate-300 bg-slate-100 text-slate-400';
}


// ==========================================
// COMPONENT
// ==========================================

export default function SeatGrid({
    seats,
    readOnly = false,
    onEdit,
    onDelete,
}: SeatGridProps) {

    // ==========================================
    // GROUP SEATS
    // ==========================================

    // Nhóm ghế theo tầng và hàng, đồng thời sắp xếp theo vị trí.
    const levels = useMemo(() => {

        const levelMap = new Map<
            number,
            Map<number, Seat[]>
        >();

        seats.forEach((seat) => {

            if (!levelMap.has(seat.level)) {
                levelMap.set(seat.level, new Map());
            }

            const rowMap = levelMap.get(seat.level)!;

            if (!rowMap.has(seat.row)) {
                rowMap.set(seat.row, []);
            }

            rowMap.get(seat.row)!.push(seat);

        });

        return Array.from(levelMap.entries())
            .sort(([levelA], [levelB]) => levelA - levelB)
            .map(([level, rowMap]) => ({

                level,

                rows: Array.from(rowMap.entries())
                    .sort(([rowA], [rowB]) => rowA - rowB)
                    .map(([row, rowSeats]) => ({

                        row,

                        seats: rowSeats.sort(
                            (a, b) => a.column - b.column,
                        ),

                    })),

            }));

    }, [seats]);


    // ==========================================
    // EMPTY STATE
    // ==========================================

    if (seats.length === 0) {

        return (

            <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 px-4 text-center">

                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
                    🚌
                </div>

                <h3 className="mt-4 font-semibold text-slate-800">
                    Chưa có ghế nào
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                    Sơ đồ này chưa được cấu hình ghế. Hãy thêm ghế để bắt đầu thiết kế sơ đồ.
                </p>

            </div>

        );

    }


    // ==========================================
    // RENDER
    // ==========================================

    return (

        <div className="space-y-8">

            {/* ==================================
                LEGEND
            ================================== */}

            <div className="flex flex-wrap gap-x-5 gap-y-3">

                <div className="flex items-center gap-2 text-xs text-slate-600">

                    <span className="h-3.5 w-3.5 rounded border border-green-300 bg-green-50" />

                    Đang hoạt động

                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600">

                    <span className="h-3.5 w-3.5 rounded border border-slate-300 bg-slate-100" />

                    Ngừng hoạt động

                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600">

                    <span className="h-3.5 w-3.5 rounded border border-blue-200 bg-blue-50" />

                    Giường nằm

                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600">

                    <span className="h-3.5 w-3.5 rounded border border-purple-200 bg-purple-50" />

                    Ghế ngồi

                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600">

                    <span className="h-3.5 w-3.5 rounded border border-amber-200 bg-amber-50" />

                    Phòng riêng

                </div>

            </div>


            {/* ==================================
                LEVELS
            ================================== */}

            {levels.map((levelData) => (

                <section
                    key={levelData.level}
                    className="overflow-hidden rounded-xl border border-slate-200"
                >

                    {/* LEVEL HEADER */}

                    <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">

                        <h4 className="font-bold text-slate-800">
                            Tầng {levelData.level}
                        </h4>

                        <span className="text-xs text-slate-500">
                            {levelData.rows.reduce(
                                (total, row) => total + row.seats.length,
                                0,
                            )} ghế
                        </span>

                    </div>


                    {/* LEVEL CONTENT */}

                    <div className="space-y-6 p-4 sm:p-6">

                        {levelData.rows.map((rowData) => (

                            <div
                                key={rowData.row}
                                className="flex items-start gap-3"
                            >

                                {/* ROW LABEL */}

                                <div className="flex h-20 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-semibold text-slate-500">
                                    {rowData.row}
                                </div>


                                {/* SEATS */}

                                <div className="grid min-w-0 flex-1 gap-2 sm:gap-3">

                                    <div
                                        className="grid gap-2 sm:gap-3"
                                        style={{
                                            gridTemplateColumns: `repeat(${Math.max(
                                                ...rowData.seats.map(
                                                    (seat) => seat.column,
                                                ),
                                            )}, minmax(0, 1fr))`,
                                        }}
                                    >

                                        {rowData.seats.map((seat) => (

                                            <div
                                                key={seat.id}
                                                className="group relative min-w-0"
                                            >

                                                <button
                                                    type="button"
                                                    disabled={readOnly}
                                                    onClick={() => onEdit(seat)}
                                                    title={`${seat.code} - ${getSeatTypeLabel(seat.type)}`}
                                                    className={`flex min-h-16 w-full flex-col items-center justify-center rounded-lg border p-2 transition sm:min-h-20 ${
                                                        getSeatStatusStyle(seat.isActive)
                                                    } ${
                                                        readOnly
                                                            ? 'cursor-default'
                                                            : 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md'
                                                    }`}
                                                >

                                                    <span className="max-w-full truncate text-xs font-bold sm:text-sm">
                                                        {seat.code}
                                                    </span>

                                                    <span className="mt-1 max-w-full truncate text-[10px] sm:text-xs">
                                                        {seat.isActive
                                                            ? 'Hoạt động'
                                                            : 'Ngừng'}
                                                    </span>

                                                </button>


                                                {/* DELETE BUTTON */}

                                                {!readOnly && (

                                                    <button
                                                        type="button"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            onDelete(seat);
                                                        }}
                                                        title={`Xóa ghế ${seat.code}`}
                                                        className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-red-200 bg-white text-xs font-bold text-red-600 opacity-100 shadow-sm transition hover:bg-red-600 hover:text-white sm:opacity-0 sm:group-hover:opacity-100"
                                                    >
                                                        ×
                                                    </button>

                                                )}

                                            </div>

                                        ))}

                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                </section>

            ))}


            {/* ==================================
                FOOTER NOTE
            ================================== */}

            <p className="text-xs leading-5 text-slate-400">

                Chọn một ghế để xem hoặc chỉnh sửa thông tin. Vị trí ghế được xác định bằng tầng, hàng và cột.

            </p>

        </div>

    );

}
