
'use client';

import {
    ArrowDown,
    ArrowRight,
    Armchair,
    CalendarClock,
    Eye,
    Phone,
    UserRound,
    XCircle,
} from 'lucide-react';

import BookingStatusBadge from './BookingStatusBadge';

import type { BookingByDateGroup } from './booking-by-date-types';
import type { BookingListItem } from './booking-types';

type TripBookingGroupProps = {
    group: BookingByDateGroup;
    onView: (bookingId: string) => void;
    onCancel: (bookingId: string) => void;
    canCancelBooking: (bookingId: string) => boolean;
};

/**
 * Định dạng thời gian khởi hành theo múi giờ Việt Nam.
 */
function formatDeparture(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return 'Chưa có thông tin';
    }

    return new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
}

/**
 * Lấy danh sách mã ghế trong booking.
 */
function getSeatCodes(booking: BookingListItem): string {
    const codes = booking.seats
        .map((item) => item.seatAllocation?.tripSeat?.seat?.code)
        .filter((code): code is string => Boolean(code));

    return codes.length > 0 ? codes.join(', ') : 'Chưa có ghế';
}

/**
 * Định dạng số tiền theo đơn vị Việt Nam đồng.
 */
function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(amount);
}

export default function TripBookingGroup({
    group,
    onView,
    onCancel,
    canCancelBooking,
}: TripBookingGroupProps) {
    const { trip, bookings, direction, plannedDeparture } = group;

    const isOutbound = direction === 'OUTBOUND';

    return (
        <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 bg-gray-50 p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                                    isOutbound
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-orange-100 text-orange-700'
                                }`}
                            >
                                {isOutbound ? (
                                    <ArrowRight className="h-3.5 w-3.5" />
                                ) : (
                                    <ArrowDown className="h-3.5 w-3.5" />
                                )}

                                {isOutbound ? 'Chiều đi' : 'Chiều về'}
                            </span>

                            <span className="text-xs text-gray-500">
                                {trip.route?.name || 'Chưa có tuyến'}
                            </span>
                        </div>

                        <h3 className="mt-2 truncate text-base font-bold text-gray-900">
                            {trip.vehicle?.name || 'Chưa có tên xe'}
                        </h3>

                        <p className="mt-1 text-sm text-gray-600">
                            Biển số:{' '}
                            <span className="font-semibold text-gray-800">
                                {trip.vehicle?.licensePlate || 'Chưa có thông tin'}
                            </span>
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:min-w-64">
                        <div className="rounded-lg border border-gray-200 bg-white p-3">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <CalendarClock className="h-3.5 w-3.5" />
                                Khởi hành
                            </div>

                            <p className="mt-1 text-sm font-bold text-gray-900">
                                {formatDeparture(plannedDeparture)}
                            </p>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-white p-3">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <UserRound className="h-3.5 w-3.5" />
                                Booking
                            </div>

                            <p className="mt-1 text-sm font-bold text-gray-900">
                                {group.bookingCount}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 sm:p-5">
                {bookings.length === 0 ? (
                    <p className="py-5 text-center text-sm text-gray-500">
                        Chuyến xe chưa có booking nào.
                    </p>
                ) : (
                    <>
                        <div className="mb-3 flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-gray-800">
                                Danh sách hành khách
                            </h4>

                            <span className="text-xs text-gray-500">
                                {bookings.length} booking
                            </span>
                        </div>

                        <div className="space-y-3">
                            {bookings.map((booking) => {
                                const canCancel = canCancelBooking(booking.id);

                                return (
                                    <div
                                        key={booking.id}
                                        className="rounded-lg border border-gray-200 p-3 sm:p-4"
                                    >
                                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-sm font-bold text-gray-900">
                                                        {booking.bookingCode}
                                                    </span>

                                                    <BookingStatusBadge
                                                        status={booking.status}
                                                        type="booking"
                                                    />

                                                    <BookingStatusBadge
                                                        status={booking.paymentStatus}
                                                        type="payment"
                                                    />
                                                </div>

                                                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                    <div className="flex items-start gap-2">
                                                        <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-gray-800">
                                                                {booking.customerName}
                                                            </p>

                                                            <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                                                                <Phone className="h-3 w-3" />
                                                                {booking.customerPhone}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start gap-2">
                                                        <Armchair className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                                                        <div>
                                                            <p className="text-xs text-gray-500">
                                                                Ghế
                                                            </p>

                                                            <p className="mt-1 text-sm font-medium text-gray-800">
                                                                {getSeatCodes(booking)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3 lg:min-w-64 lg:justify-end lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
                                                <div>
                                                    <p className="text-xs text-gray-500">
                                                        Tổng tiền
                                                    </p>

                                                    <p className="mt-1 text-sm font-bold text-red-600">
                                                        {formatCurrency(booking.totalAmount)}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => onView(booking.id)}
                                                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 px-3 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        Xem
                                                    </button>

                                                    {canCancel && (
                                                        <button
                                                            type="button"
                                                            onClick={() => onCancel(booking.id)}
                                                            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-200 px-3 text-xs font-medium text-red-600 transition hover:bg-red-50"
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                            Hủy
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </article>
    );
}
