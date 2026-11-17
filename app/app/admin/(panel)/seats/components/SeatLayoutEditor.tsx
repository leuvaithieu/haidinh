
'use client';

import { useCallback, useEffect, useState } from 'react';

import { apiFetch } from '@/lib/api';

import type { Seat, SeatLayout } from '../types';

import SeatGrid from './SeatGrid';
import SeatForm from './SeatForm';

// ==========================================
// PROPS
// ==========================================

type SeatLayoutEditorProps = {
    layout: SeatLayout;
    onClose: () => void;
    onSuccess: (message: string) => void;
};

// ==========================================
// COMPONENT
// ==========================================

export default function SeatLayoutEditor({
    layout,
    onClose,
    onSuccess,
}: SeatLayoutEditorProps) {

    // ==========================================
    // STATE
    // ==========================================

    const [currentLayout, setCurrentLayout] =
        useState<SeatLayout>(layout);

    const [seats, setSeats] = useState<Seat[]>([]);

    const [isLoading, setIsLoading] = useState(true);

    const [isActivating, setIsActivating] = useState(false);

    const [error, setError] = useState('');

    const [showSeatForm, setShowSeatForm] = useState(false);

    const [editingSeat, setEditingSeat] =
        useState<Seat | null>(null);

    const [deletingSeat, setDeletingSeat] =
        useState<Seat | null>(null);

    const [isDeleting, setIsDeleting] = useState(false);


    // ==========================================
    // LOAD DATA
    // ==========================================

    // Tải chi tiết sơ đồ và danh sách ghế từ Backend.
    const loadLayout = useCallback(async () => {

        setIsLoading(true);
        setError('');

        try {

            const response = await apiFetch(
                `/seat-layout/${layout.id}`,
            );

            if (!response.ok) {
                throw new Error('Không thể tải thông tin sơ đồ ghế.');
            }

            const data: SeatLayout = await response.json();

            setCurrentLayout(data);
            setSeats(data.seats ?? []);

        } catch (error) {

            setError(
                error instanceof Error
                    ? error.message
                    : 'Đã xảy ra lỗi khi tải sơ đồ.',
            );

        } finally {

            setIsLoading(false);

        }

    }, [layout.id]);


    useEffect(() => {

        loadLayout();

    }, [loadLayout]);


    // ==========================================
    // SEAT FORM
    // ==========================================

    // Mở form tạo mới một ghế.
    function handleCreateSeat() {

        setEditingSeat(null);
        setShowSeatForm(true);

    }


    // Mở form chỉnh sửa ghế đã chọn.
    function handleEditSeat(seat: Seat) {

        setEditingSeat(seat);
        setShowSeatForm(true);

    }


    // Đóng form ghế và tải lại dữ liệu mới nhất.
    async function handleSeatSuccess(message: string) {

        setShowSeatForm(false);
        setEditingSeat(null);

        await loadLayout();

        onSuccess(message);

    }


    // ==========================================
    // DELETE SEAT
    // ==========================================

    // Xóa ghế được chọn sau khi người dùng xác nhận.
    async function handleDeleteSeat() {

        if (!deletingSeat) return;

        setIsDeleting(true);
        setError('');

        try {

            const response = await apiFetch(
                `/seat-layout/${currentLayout.id}/seats/${deletingSeat.id}`,
                {
                    method: 'DELETE',
                },
            );

            if (!response.ok) {

                const data = await response
                    .json()
                    .catch(() => null);

                const message =
                    data &&
                    typeof data === 'object' &&
                    'message' in data
                        ? String(data.message)
                        : 'Không thể xóa ghế.';

                throw new Error(message);

            }

            setDeletingSeat(null);

            await loadLayout();

            onSuccess('Đã xóa ghế thành công.');

        } catch (error) {

            setError(
                error instanceof Error
                    ? error.message
                    : 'Đã xảy ra lỗi khi xóa ghế.',
            );

        } finally {

            setIsDeleting(false);

        }

    }


    // ==========================================
    // ACTIVATE LAYOUT
    // ==========================================

    // Kích hoạt sơ đồ sau khi Backend kiểm tra số lượng ghế.
    async function handleActivate() {

        setIsActivating(true);
        setError('');

        try {

            const response = await apiFetch(
                `/seat-layout/${currentLayout.id}/activate`,
                {
                    method: 'PATCH',
                },
            );

            if (!response.ok) {

                const data = await response
                    .json()
                    .catch(() => null);

                const message =
                    data &&
                    typeof data === 'object' &&
                    'message' in data
                        ? String(data.message)
                        : 'Không thể kích hoạt sơ đồ.';

                throw new Error(message);

            }

            const data: SeatLayout = await response.json();

            setCurrentLayout(data);

            await loadLayout();

            onSuccess('Đã kích hoạt sơ đồ ghế.');

        } catch (error) {

            setError(
                error instanceof Error
                    ? error.message
                    : 'Đã xảy ra lỗi khi kích hoạt.',
            );

        } finally {

            setIsActivating(false);

        }

    }


    // ==========================================
    // CALCULATE
    // ==========================================

    const activeSeats = seats.filter(
        (seat) => seat.isActive,
    ).length;

    const inactiveSeats = seats.length - activeSeats;

    const expectedSeats =
        currentLayout.vehicle?.seatCount ?? null;

    const isActive = currentLayout.status === 'ACTIVE';

    const isArchived = currentLayout.status === 'ARCHIVED';

    const canActivate =
        !isActive &&
        !isArchived &&
        seats.length > 0;


    // ==========================================
    // RENDER
    // ==========================================

    return (

        <div className="fixed inset-0 z-[65] flex flex-col bg-slate-100">

            {/* ==================================
                HEADER
            ================================== */}

            <div className="flex flex-col gap-4 border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">

                <div className="flex items-start gap-3">

                    <button
                        type="button"
                        onClick={onClose}
                        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100"
                        title="Quay lại"
                    >
                        ←
                    </button>

                    <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                                {currentLayout.name}
                            </h2>

                            <span
                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                    isActive
                                        ? 'bg-green-100 text-green-700'
                                        : isArchived
                                            ? 'bg-slate-200 text-slate-600'
                                            : 'bg-amber-100 text-amber-700'
                                }`}
                            >
                                {isActive
                                    ? 'Đang hoạt động'
                                    : isArchived
                                        ? 'Đã lưu trữ'
                                        : 'Bản nháp'}
                            </span>

                        </div>

                        <p className="mt-1 text-xs text-slate-500 sm:text-sm">

                            {currentLayout.isTemplate
                                ? 'Sơ đồ mẫu'
                                : currentLayout.vehicle
                                    ? `${currentLayout.vehicle.name} · ${currentLayout.vehicle.licensePlate}`
                                    : 'Sơ đồ chưa gắn với xe'}

                        </p>

                    </div>

                </div>


                <div className="flex flex-wrap items-center gap-2">

                    {!isActive && !isArchived && (

                        <button
                            type="button"
                            onClick={handleActivate}
                            disabled={isActivating || seats.length === 0}
                            className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >

                            {isActivating
                                ? 'Đang kích hoạt...'
                                : 'Kích hoạt sơ đồ'}

                        </button>

                    )}

                    <button
                        type="button"
                        onClick={handleCreateSeat}
                        disabled={isArchived || isActive}
                        className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        + Thêm ghế
                    </button>

                </div>

            </div>


            {/* ==================================
                MAIN CONTENT
            ================================== */}

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">

                <div className="mx-auto max-w-7xl space-y-5">

                    {/* ERROR */}

                    {error && (

                        <div className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                            <span>{error}</span>

                            <button
                                type="button"
                                onClick={() => setError('')}
                                className="font-bold"
                            >
                                ×
                            </button>

                        </div>

                    )}


                    {/* STATISTICS */}

                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

                        <div className="rounded-xl border border-slate-200 bg-white p-4">

                            <p className="text-xs font-medium text-slate-500">
                                Tổng số ghế
                            </p>

                            <p className="mt-2 text-2xl font-bold text-slate-900">
                                {seats.length}
                            </p>

                        </div>


                        <div className="rounded-xl border border-slate-200 bg-white p-4">

                            <p className="text-xs font-medium text-slate-500">
                                Ghế hoạt động
                            </p>

                            <p className="mt-2 text-2xl font-bold text-green-600">
                                {activeSeats}
                            </p>

                        </div>


                        <div className="rounded-xl border border-slate-200 bg-white p-4">

                            <p className="text-xs font-medium text-slate-500">
                                Ghế ngừng hoạt động
                            </p>

                            <p className="mt-2 text-2xl font-bold text-slate-500">
                                {inactiveSeats}
                            </p>

                        </div>


                        <div className="rounded-xl border border-slate-200 bg-white p-4">

                            <p className="text-xs font-medium text-slate-500">
                                Số ghế khai báo của xe
                            </p>

                            <p className="mt-2 text-2xl font-bold text-blue-600">
                                {expectedSeats ?? '—'}
                            </p>

                        </div>

                    </div>


                    {/* VALIDATION INFO */}

                    {expectedSeats !== null && (

                        <div className={`rounded-xl border px-4 py-3 text-sm ${
                            seats.length === expectedSeats
                                ? 'border-green-200 bg-green-50 text-green-700'
                                : 'border-amber-200 bg-amber-50 text-amber-700'
                        }`}>

                            {seats.length === expectedSeats
                                ? `Số ghế đã khớp với cấu hình xe (${expectedSeats} ghế).`
                                : `Sơ đồ hiện có ${seats.length}/${expectedSeats} ghế. Cần kiểm tra lại trước khi kích hoạt.`}

                        </div>

                    )}


                    {/* SEAT GRID */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">

                        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                            <div>

                                <h3 className="font-bold text-slate-900">
                                    Thiết kế sơ đồ ghế
                                </h3>

                                <p className="mt-1 text-xs text-slate-500">
                                    Chọn một ghế để chỉnh sửa thông tin.
                                </p>

                            </div>

                            <span className="text-xs text-slate-400">
                                {seats.length} vị trí
                            </span>

                        </div>


                        {isLoading ? (

                            <div className="flex min-h-64 items-center justify-center text-sm text-slate-500">
                                Đang tải sơ đồ ghế...
                            </div>

                        ) : (

                            <SeatGrid
                                seats={seats}
                                readOnly={isActive || isArchived}
                                onEdit={handleEditSeat}
                                onDelete={setDeletingSeat}
                            />

                        )}

                    </div>

                </div>

            </div>


            {/* ==================================
                SEAT FORM
            ================================== */}

            {showSeatForm && (

                <SeatForm
                    layoutId={currentLayout.id}
                    seat={editingSeat}
                    onSuccess={handleSeatSuccess}
                    onClose={() => {
                        setShowSeatForm(false);
                        setEditingSeat(null);
                    }}
                />

            )}


            {/* ==================================
                DELETE CONFIRMATION
            ================================== */}

            {deletingSeat && (

                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 p-4">

                    <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">

                        <h3 className="text-lg font-bold text-slate-900">
                            Xóa ghế?
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-500">

                            Mày có chắc muốn xóa ghế{' '}
                            <strong className="text-slate-800">
                                {deletingSeat.code}
                            </strong>
                            {' '}khỏi sơ đồ này không?

                        </p>

                        <div className="mt-5 flex justify-end gap-2">

                            <button
                                type="button"
                                onClick={() => setDeletingSeat(null)}
                                disabled={isDeleting}
                                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                Hủy
                            </button>

                            <button
                                type="button"
                                onClick={handleDeleteSeat}
                                disabled={isDeleting}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {isDeleting
                                    ? 'Đang xóa...'
                                    : 'Xác nhận xóa'}
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}
