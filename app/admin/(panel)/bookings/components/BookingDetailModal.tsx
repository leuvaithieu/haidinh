
'use client';

import {
    X,
    UserRound,
    Phone,
    Mail,
    BusFront,
    CalendarDays,
    Armchair,
    MapPin,
    Clock,
    CreditCard,
    Hash,
} from 'lucide-react';

import BookingStatusBadge from './BookingStatusBadge';

import type {
    BookingDetail,
    BookingDetailModalProps,
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

// Lấy tên ghế từ dữ liệu phân bổ ghế của booking.
function getSeatCode(seat: BookingDetail['seats'][number]): string {
    return seat.seatAllocation?.tripSeat?.seat?.code || 'Chưa xác định';
}

// Hiển thị skeleton trong thời gian chờ API trả về chi tiết booking.
function BookingDetailLoading() {
    return (
        <div className="space-y-5 p-4 sm:p-6">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="space-y-2">
                            <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
                            <div className="h-6 w-36 animate-pulse rounded bg-gray-200" />
                        </div>
                    ))}
                </div>
            </div>

            {[1, 2, 3, 4].map((section) => (
                <section
                    key={section}
                    className="space-y-3"
                >
                    <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />

                    <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 p-4 sm:grid-cols-2">
                        {[1, 2, 3, 4].map((item) => (
                            <div key={item} className="space-y-2">
                                <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
                                <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
                            </div>
                        ))}
                    </div>
                </section>
            ))}

            <div className="flex items-center justify-center gap-2 py-3 text-sm text-gray-500">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-red-600" />
                Đang tải chi tiết booking...
            </div>
        </div>
    );
}

export default function BookingDetailModal({
    booking,
    open,
    onClose,
}: BookingDetailModalProps) {
    if (!open) return null;

    const trip = booking?.trip;

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="booking-detail-title"
                className="flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-6">
                    <div className="min-w-0">
                        <h2
                            id="booking-detail-title"
                            className="text-lg font-bold text-gray-900"
                        >
                            Chi tiết booking
                        </h2>

                        <p className="mt-1 truncate text-sm text-gray-500">
                            {booking
                                ? `Mã booking: ${booking.bookingCode}`
                                : 'Đang lấy thông tin booking...'}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Đóng chi tiết booking"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Nội dung */}
                <div className="flex-1 overflow-y-auto">
                    {!booking ? (
                        <BookingDetailLoading />
                    ) : (
                        <div className="space-y-5 p-4 sm:p-6">
                            {/* Trạng thái booking và thanh toán */}
                            <section className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">
                                            Trạng thái booking
                                        </p>

                                        <div className="mt-2">
                                            <BookingStatusBadge
                                                status={booking.status}
                                                type="booking"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium text-gray-500">
                                            Trạng thái thanh toán
                                        </p>

                                        <div className="mt-2">
                                            <BookingStatusBadge
                                                status={booking.paymentStatus}
                                                type="payment"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium text-gray-500">
                                            Ngày tạo booking
                                        </p>

                                        <p className="mt-2 text-sm font-semibold text-gray-800">
                                            {formatDateTime(booking.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                {booking.holdExpiresAt && (
                                    <div className="mt-4 flex items-start gap-2 border-t border-gray-200 pt-3">
                                        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />

                                        <div>
                                            <p className="text-xs font-medium text-gray-500">
                                                Thời hạn giữ chỗ
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-amber-700">
                                                {formatDateTime(booking.holdExpiresAt)}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </section>

                            {/* Thông tin khách hàng */}
                            <section>
                                <div className="mb-3 flex items-center gap-2">
                                    <UserRound className="h-5 w-5 text-red-600" />

                                    <h3 className="text-sm font-bold text-gray-900">
                                        Thông tin khách hàng
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 p-4 sm:grid-cols-2">
                                    <div>
                                        <p className="text-xs text-gray-500">
                                            Họ và tên
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-gray-900">
                                            {booking.customerName}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-500">
                                            Số điện thoại
                                        </p>

                                        <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-gray-800">
                                            <Phone className="h-3.5 w-3.5 text-gray-400" />
                                            {booking.customerPhone}
                                        </p>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <p className="text-xs text-gray-500">
                                            Email
                                        </p>

                                        <p className="mt-1 flex items-center gap-1.5 break-all text-sm text-gray-800">
                                            <Mail className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                                            {booking.customerEmail || 'Không cung cấp'}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Thông tin chuyến xe */}
                            <section>
                                <div className="mb-3 flex items-center gap-2">
                                    <BusFront className="h-5 w-5 text-red-600" />

                                    <h3 className="text-sm font-bold text-gray-900">
                                        Thông tin chuyến xe
                                    </h3>
                                </div>

                                <div className="space-y-3 rounded-xl border border-gray-200 p-4">
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Tuyến xe
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-gray-900">
                                                {trip?.route?.name || 'Chưa có thông tin'}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Biển số xe
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-gray-900">
                                                {trip?.vehicle?.licensePlate || 'Chưa có thông tin'}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Chiều chạy
                                            </p>

                                            <p className="mt-1 text-sm font-medium text-gray-800">
                                                {booking.direction === 'OUTBOUND'
                                                    ? 'Chiều đi'
                                                    : 'Chiều về'}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Ngày giờ khởi hành
                                            </p>

                                            <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-gray-800">
                                                <CalendarDays className="h-4 w-4 text-gray-400" />
                                                {formatDateTime(trip?.plannedDeparture)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Danh sách ghế */}
                            <section>
                                <div className="mb-3 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <Armchair className="h-5 w-5 text-red-600" />

                                        <h3 className="text-sm font-bold text-gray-900">
                                            Chi tiết ghế đã đặt
                                        </h3>
                                    </div>

                                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                                        {booking.seats.length} ghế
                                    </span>
                                </div>

                                {booking.seats.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                                        Không có thông tin ghế.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {booking.seats.map((seat, index) => (
                                            <div
                                                key={seat.id}
                                                className="rounded-xl border border-gray-200 p-4"
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
                                                            <Armchair className="h-5 w-5" />
                                                        </div>

                                                        <div>
                                                            <p className="text-xs text-gray-500">
                                                                Ghế {index + 1}
                                                            </p>

                                                            <p className="text-sm font-bold text-gray-900">
                                                                {getSeatCode(seat)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <p className="text-sm font-bold text-red-600">
                                                        {formatCurrency(seat.price)}
                                                    </p>
                                                </div>

                                                <div className="mt-4 grid grid-cols-1 gap-3 border-t border-gray-100 pt-3 sm:grid-cols-2">
                                                    <div>
                                                        <p className="text-xs text-gray-500">
                                                            Hành khách
                                                        </p>

                                                        <p className="mt-1 text-sm font-medium text-gray-800">
                                                            {seat.passengerName || booking.customerName}
                                                        </p>

                                                        <p className="mt-1 text-xs text-gray-500">
                                                            {seat.passengerPhone || booking.customerPhone}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs text-gray-500">
                                                            Điểm đón
                                                        </p>

                                                        <p className="mt-1 flex items-start gap-1.5 text-sm font-medium text-gray-800">
                                                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                                            {seat.pickupTripRoutePoint?.pointName || 'Chưa có thông tin'}
                                                        </p>

                                                        <p className="mt-1 text-xs text-gray-500">
                                                            {formatDateTime(seat.pickupTripRoutePoint?.plannedTime)}
                                                        </p>
                                                    </div>

                                                    <div className="sm:col-span-2">
                                                        <p className="text-xs text-gray-500">
                                                            Điểm trả
                                                        </p>

                                                        <p className="mt-1 flex items-start gap-1.5 text-sm font-medium text-gray-800">
                                                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                                                            {seat.dropoffTripRoutePoint?.pointName || 'Chưa có thông tin'}
                                                        </p>

                                                        <p className="mt-1 text-xs text-gray-500">
                                                            {formatDateTime(seat.dropoffTripRoutePoint?.plannedTime)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* Tổng kết thanh toán */}
                            <section>
                                <div className="mb-3 flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-red-600" />

                                    <h3 className="text-sm font-bold text-gray-900">
                                        Tổng kết thanh toán
                                    </h3>
                                </div>

                                <div className="space-y-3 rounded-xl border border-gray-200 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-sm text-gray-500">
                                            Tổng tiền vé
                                        </span>

                                        <span className="text-sm font-semibold text-gray-900">
                                            {formatCurrency(booking.totalAmount)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-sm text-gray-500">
                                            Tiền đặt cọc
                                        </span>

                                        <span className="text-sm font-medium text-gray-800">
                                            {formatCurrency(booking.depositAmount)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-sm text-gray-500">
                                            Đã thanh toán
                                        </span>

                                        <span className="text-sm font-semibold text-emerald-700">
                                            {formatCurrency(booking.paidAmount)}
                                        </span>
                                    </div>

                                    <div className="border-t border-dashed border-gray-200 pt-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-sm font-semibold text-gray-700">
                                                Còn phải thanh toán
                                            </span>

                                            <span className="text-base font-bold text-red-600">
                                                {formatCurrency(
                                                    Math.max(
                                                        0,
                                                        booking.totalAmount - booking.paidAmount,
                                                    ),
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-3 text-xs leading-5 text-blue-700">
                                <Hash className="h-4 w-4 shrink-0" />
                                Thông tin chi tiết được lấy từ booking và dữ liệu chuyến xe hiện tại.
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex shrink-0 justify-end border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-10 rounded-lg bg-gray-900 px-5 text-sm font-semibold text-white transition hover:bg-gray-700"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}
