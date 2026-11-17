
'use client';

import type { SeatLayout } from '../types';

// ==========================================
// PROPS
// ==========================================

type SeatLayoutListProps = {
    layouts: SeatLayout[];

    onEdit: (layout: SeatLayout) => void;

    onOpen: (layout: SeatLayout) => void;

    onDelete: (layout: SeatLayout) => void;

    onCopy: (layout: SeatLayout) => void;
};


// ==========================================
// HELPERS
// ==========================================

// Trả về màu sắc tương ứng với trạng thái sơ đồ.
function getStatusStyle(status: SeatLayout['status']) {

    switch (status) {

        case 'ACTIVE':
            return 'bg-green-100 text-green-700';

        case 'ARCHIVED':
            return 'bg-slate-200 text-slate-600';

        case 'DRAFT':
        default:
            return 'bg-amber-100 text-amber-700';

    }

}


// Trả về tên trạng thái bằng tiếng Việt.
function getStatusLabel(status: SeatLayout['status']) {

    switch (status) {

        case 'ACTIVE':
            return 'Đang hoạt động';

        case 'ARCHIVED':
            return 'Đã lưu trữ';

        case 'DRAFT':
        default:
            return 'Bản nháp';

    }

}


// ==========================================
// COMPONENT
// ==========================================

export default function SeatLayoutList({
    layouts,
    onEdit,
    onOpen,
    onDelete,
    onCopy,
}: SeatLayoutListProps) {

    // Nếu chưa có dữ liệu thì hiển thị trạng thái trống.
    if (layouts.length === 0) {

        return (

            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">

                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-slate-400"
                    >
                        <rect x="3" y="4" width="18" height="16" rx="2" />
                        <path d="M8 8h8M8 12h8M8 16h3" />
                    </svg>

                </div>

                <h3 className="mt-4 font-semibold text-slate-800">
                    Chưa có sơ đồ ghế
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                    Tạo sơ đồ mẫu hoặc tạo sơ đồ trực tiếp cho một xe.
                </p>

            </div>

        );

    }


    return (

        <>

            {/* ==================================
                DESKTOP TABLE
            ================================== */}

            <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:block">

                <div className="overflow-x-auto">

                    <table className="w-full min-w-[850px] text-left text-sm">

                        <thead className="bg-slate-50 text-xs uppercase text-slate-500">

                            <tr>

                                <th className="px-5 py-4 font-semibold">
                                    Sơ đồ ghế
                                </th>

                                <th className="px-5 py-4 font-semibold">
                                    Phân loại
                                </th>

                                <th className="px-5 py-4 font-semibold">
                                    Xe áp dụng
                                </th>

                                <th className="px-5 py-4 font-semibold">
                                    Số ghế
                                </th>

                                <th className="px-5 py-4 font-semibold">
                                    Trạng thái
                                </th>

                                <th className="px-5 py-4 text-right font-semibold">
                                    Thao tác
                                </th>

                            </tr>

                        </thead>


                        <tbody className="divide-y divide-slate-100">

                            {layouts.map((layout) => {

                                const seatCount =
                                    layout._count?.seats ??
                                    layout.seats?.length ??
                                    0;

                                return (

                                    <tr
                                        key={layout.id}
                                        className="transition hover:bg-slate-50"
                                    >

                                        {/* NAME */}

                                        <td className="px-5 py-4">

                                            <button
                                                type="button"
                                                onClick={() => onOpen(layout)}
                                                className="text-left font-semibold text-slate-900 transition hover:text-red-600"
                                            >
                                                {layout.name}
                                            </button>

                                            <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                                                {layout.description ||
                                                    'Không có mô tả'}
                                            </p>

                                        </td>


                                        {/* TYPE */}

                                        <td className="px-5 py-4">

                                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                                layout.isTemplate
                                                    ? 'bg-blue-50 text-blue-700'
                                                    : 'bg-purple-50 text-purple-700'
                                            }`}>
                                                {layout.isTemplate
                                                    ? 'Sơ đồ mẫu'
                                                    : 'Sơ đồ xe'}
                                            </span>

                                        </td>


                                        {/* VEHICLE */}

                                        <td className="px-5 py-4">

                                            {layout.vehicle ? (

                                                <>

                                                    <p className="font-medium text-slate-800">
                                                        {layout.vehicle.name}
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {layout.vehicle.licensePlate}
                                                    </p>

                                                </>

                                            ) : (

                                                <span className="text-slate-400">
                                                    Chưa gắn xe
                                                </span>

                                            )}

                                        </td>


                                        {/* SEAT COUNT */}

                                        <td className="px-5 py-4">

                                            <span className="font-semibold text-slate-800">
                                                {seatCount}
                                            </span>

                                            {layout.vehicle && (

                                                <span className="text-slate-400">
                                                    {' / '}
                                                    {layout.vehicle.seatCount}
                                                </span>

                                            )}

                                        </td>


                                        {/* STATUS */}

                                        <td className="px-5 py-4">

                                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyle(layout.status)}`}>
                                                {getStatusLabel(layout.status)}
                                            </span>

                                        </td>


                                        {/* ACTIONS */}

                                        <td className="px-5 py-4">

                                            <div className="flex items-center justify-end gap-1">

                                                <button
                                                    type="button"
                                                    onClick={() => onOpen(layout)}
                                                    className="rounded-lg px-2.5 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                                >
                                                    Thiết kế
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => onEdit(layout)}
                                                    className="rounded-lg px-2.5 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                                                >
                                                    Sửa
                                                </button>

                                                {layout.isTemplate &&
                                                    layout.status !== 'ARCHIVED' && (

                                                    <button
                                                        type="button"
                                                        onClick={() => onCopy(layout)}
                                                        className="rounded-lg px-2.5 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
                                                    >
                                                        Sao chép
                                                    </button>

                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() => onDelete(layout)}
                                                    className="rounded-lg px-2.5 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                                >
                                                    Xóa
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                );

                            })}

                        </tbody>

                    </table>

                </div>

            </div>


            {/* ==================================
                MOBILE CARDS
            ================================== */}

            <div className="space-y-3 lg:hidden">

                {layouts.map((layout) => {

                    const seatCount =
                        layout._count?.seats ??
                        layout.seats?.length ??
                        0;

                    return (

                        <article
                            key={layout.id}
                            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                        >

                            {/* HEADER */}

                            <div className="flex items-start justify-between gap-3">

                                <div className="min-w-0">

                                    <h3 className="truncate font-semibold text-slate-900">
                                        {layout.name}
                                    </h3>

                                    <p className="mt-1 text-xs text-slate-500">
                                        {layout.vehicle
                                            ? `${layout.vehicle.name} · ${layout.vehicle.licensePlate}`
                                            : 'Sơ đồ mẫu'}
                                    </p>

                                </div>


                                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusStyle(layout.status)}`}>
                                    {getStatusLabel(layout.status)}
                                </span>

                            </div>


                            {/* INFORMATION */}

                            <div className="mt-4 grid grid-cols-2 gap-2">

                                <div className="rounded-lg bg-slate-50 p-3">

                                    <p className="text-xs text-slate-500">
                                        Phân loại
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-slate-800">
                                        {layout.isTemplate
                                            ? 'Sơ đồ mẫu'
                                            : 'Sơ đồ xe'}
                                    </p>

                                </div>


                                <div className="rounded-lg bg-slate-50 p-3">

                                    <p className="text-xs text-slate-500">
                                        Số ghế
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-slate-800">
                                        {seatCount}

                                        {layout.vehicle &&
                                            ` / ${layout.vehicle.seatCount}`}
                                    </p>

                                </div>

                            </div>


                            {/* DESCRIPTION */}

                            {layout.description && (

                                <p className="mt-3 line-clamp-2 text-xs text-slate-500">
                                    {layout.description}
                                </p>

                            )}


                            {/* ACTIONS */}

                            <div className="mt-4 flex flex-wrap justify-end gap-1 border-t border-slate-100 pt-3">

                                <button
                                    type="button"
                                    onClick={() => onOpen(layout)}
                                    className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                                >
                                    Thiết kế
                                </button>

                                <button
                                    type="button"
                                    onClick={() => onEdit(layout)}
                                    className="rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                                >
                                    Sửa
                                </button>

                                {layout.isTemplate &&
                                    layout.status !== 'ARCHIVED' && (

                                    <button
                                        type="button"
                                        onClick={() => onCopy(layout)}
                                        className="rounded-lg px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                                    >
                                        Sao chép
                                    </button>

                                )}

                                <button
                                    type="button"
                                    onClick={() => onDelete(layout)}
                                    className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                                >
                                    Xóa
                                </button>

                            </div>

                        </article>

                    );

                })}

            </div>

        </>

    );

}
