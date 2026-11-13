
'use client';

import {
    Eye,
    XCircle,
    CalendarDays,
    UserRound,
    BusFront,
    Armchair,
    Phone,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

import BookingStatusBadge from './BookingStatusBadge';

import type {
    BookingListItem,
    BookingListProps,
} from './booking-types';

// Định dạng số tiền theo đơn vị Việt Nam đồng.
function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(amount);
}

// Định dạng ngày giờ theo múi giờ Việt Nam.
function formatDateTime(value?: string | Date | null): string {
    if (!value) return 'Chưa có thông tin';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return 'Chưa có thông tin';

    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

// Lấy danh sách mã ghế từ dữ liệu BookingSeat.
function getSeatCodes(booking: BookingListItem): string {
    const codes = booking.seats
        .map((item) => item.seatAllocation?.tripSeat?.seat?.code)
        .filter((code): code is string => Boolean(code));

    return codes.length > 0 ? codes.join(', ') : 'Chưa có ghế';
}

// Hiển thị thông tin tuyến và phương tiện của booking.
function getTripInformation(booking: BookingListItem): string {
    const routeName = booking.trip?.route?.name || 'Chưa có tuyến';
    const vehicleName = booking.trip?.vehicle?.name || '';

    return vehicleName
        ? `${routeName} · ${vehicleName}`
        : routeName;
}

// Hiển thị một booking dưới dạng thẻ trên màn hình nhỏ.
function BookingCard({
    booking,
    onView,
    onCancel,
    canCancelBooking,
}: {
    booking: BookingListItem;
    onView: (booking: BookingListItem) => void;
    onCancel: (booking: BookingListItem) => void;
    canCancelBooking: (booking: BookingListItem) => boolean;
}) {
    const canCancel = canCancelBooking(booking);

    return (
        <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500">
                        Mã booking
                    </p>

                    <p className="mt-1 break-all text-sm font-bold text-gray-900">
                        {booking.bookingCode}
                    </p>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                    <BookingStatusBadge
                        status={booking.status}
                        type="booking"
                    />

                    <BookingStatusBadge
                        status={booking.paymentStatus}
                        type="payment"
                    />
                </div>
            </div>

            <div className="my-4 border-t border-dashed border-gray-200" />

            <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                    <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900">
                            {booking.customerName}
                        </p>

                        <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                            <Phone className="h-3 w-3" />
                            {booking.customerPhone}
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-2.5">
                    <BusFront className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                    <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800">
                            {getTripInformation(booking)}
                        </p>

                        <p className="mt-0.5 text-xs text-gray-500">
                            {formatDateTime(booking.trip?.plannedDeparture)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <Armchair className="h-4 w-4 shrink-0 text-gray-400" />

                    <p className="text-sm text-gray-700">
                        Ghế: <span className="font-medium">{getSeatCodes(booking)}</span>
                    </p>
                </div>
            </div>

            <div className="my-4 border-t border-gray-100" />

            <div className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs text-gray-500">Tổng tiền</p>

                    <p className="mt-1 text-base font-bold text-red-600">
                        {formatCurrency(booking.totalAmount)}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                        Đã thanh toán: {formatCurrency(booking.paidAmount)}
                    </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    <button
                        type="button"
                        onClick={() => onView(booking)}
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                        <Eye className="h-4 w-4" />
                        Xem
                    </button>

                    {canCancel && (
                        <button
                            type="button"
                            onClick={() => onCancel(booking)}
                            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-red-200 px-3 text-xs font-medium text-red-600 transition hover:bg-red-50"
                        >
                            <XCircle className="h-4 w-4" />
                            Hủy
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}

export default function BookingList({
    bookings,
    loading,
    pagination,
    onView,
    onCancel,
    canCancelBooking,
    onPageChange,
}: BookingListProps) {
    const currentPage = pagination?.page ?? 1;
    const totalPages = pagination?.totalPages ?? 1;
    const total = pagination?.total ?? bookings.length;

    return (
        <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <h2 className="text-base font-semibold text-gray-900">
                        Danh sách booking
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Tổng cộng {total.toLocaleString('vi-VN')} booking
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-gray-200 bg-white">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-red-600" />

                    <p className="mt-3 text-sm text-gray-500">
                        Đang tải danh sách booking...
                    </p>
                </div>
            ) : bookings.length === 0 ? (
                <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white px-4 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                        <BusFront className="h-6 w-6 text-gray-400" />
                    </div>

                    <p className="mt-3 text-sm font-semibold text-gray-700">
                        Chưa có booking nào
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                        Booking sẽ xuất hiện tại đây khi có khách đặt vé.
                    </p>
                </div>
            ) : (
                <>
                    {/* Hiển thị dạng thẻ trên mobile */}
                    <div className="space-y-3 lg:hidden">
                        {bookings.map((booking) => (
                            <BookingCard
                                key={booking.id}
                                booking={booking}
                                onView={onView}
                                onCancel={onCancel}
                                canCancelBooking={canCancelBooking}
                            />
                        ))}
                    </div>

                    {/* Hiển thị dạng bảng trên desktop */}
                    <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white lg:block">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1100px] border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50">
                                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Booking
                                        </th>

                                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Khách hàng
                                        </th>

                                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Chuyến xe
                                        </th>

                                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Ghế
                                        </th>

                                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Thanh toán
                                        </th>

                                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Trạng thái
                                        </th>

                                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {bookings.map((booking) => {
                                        const canCancel = canCancelBooking(booking);

                                        return (
                                            <tr
                                                key={booking.id}
                                                className="transition hover:bg-gray-50/70"
                                            >
                                                <td className="px-4 py-4">
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {booking.bookingCode}
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {formatDateTime(booking.createdAt)}
                                                    </p>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <p className="text-sm font-medium text-gray-800">
                                                        {booking.customerName}
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {booking.customerPhone}
                                                    </p>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <p className="max-w-52 truncate text-sm font-medium text-gray-800">
                                                        {booking.trip?.route?.name || 'Chưa có tuyến'}
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {formatDateTime(booking.trip?.plannedDeparture)}
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {booking.trip?.vehicle?.licensePlate || ''}
                                                    </p>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <p className="max-w-36 text-sm text-gray-700">
                                                        {getSeatCodes(booking)}
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {booking.seats.length} ghế
                                                    </p>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <p className="whitespace-nowrap text-sm font-semibold text-gray-900">
                                                        {formatCurrency(booking.totalAmount)}
                                                    </p>

                                                    <p className="mt-1 whitespace-nowrap text-xs text-gray-500">
                                                        Đã trả: {formatCurrency(booking.paidAmount)}
                                                    </p>

                                                    <BookingStatusBadge
                                                        status={booking.paymentStatus}
                                                        type="payment"
                                                    />
                                                </td>

                                                <td className="px-4 py-4">
                                                    <BookingStatusBadge
                                                        status={booking.status}
                                                        type="booking"
                                                    />
                                                </td>

                                                <td className="px-4 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => onView(booking)}
                                                            title="Xem chi tiết"
                                                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>

                                                        {canCancel && (
                                                            <button
                                                                type="button"
                                                                onClick={() => onCancel(booking)}
                                                                title="Hủy booking"
                                                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                                            >
                                                                <XCircle className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Phân trang */}
                    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-gray-500">
                            Trang <span className="font-semibold text-gray-800">{currentPage}</span>
                            {' '} / {' '}
                            <span className="font-semibold text-gray-800">{totalPages}</span>
                        </p>

                        <div className="flex items-center justify-end gap-2">
                            <button
                                type="button"
                                disabled={currentPage <= 1}
                                onClick={() => onPageChange(currentPage - 1)}
                                className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Trước
                            </button>

                            <button
                                type="button"
                                disabled={currentPage >= totalPages}
                                onClick={() => onPageChange(currentPage + 1)}
                                className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Sau
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </section>
    );
}
