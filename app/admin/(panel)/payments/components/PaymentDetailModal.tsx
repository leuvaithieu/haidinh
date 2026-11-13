
'use client';

import PaymentStatusBadge from './PaymentStatusBadge';

import {
    PaymentDetailModalProps,
    PaymentBookingSeat,
} from './payment-types';

// Định dạng số tiền theo đơn vị tiền Việt Nam.
function formatCurrency(amount: number) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(amount);
}

// Định dạng ngày giờ theo múi giờ Việt Nam.
function formatDateTime(value: string | null | undefined) {
    if (!value) {
        return 'Chưa có thông tin';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return 'Không hợp lệ';
    }

    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

// Lấy tên ghế từ thông tin phân bổ ghế trong booking.
function getSeatCode(seat: PaymentBookingSeat) {
    return seat.seatAllocation?.tripSeat?.seat?.code ?? 'Chưa xác định';
}

// Hiển thị thông tin từng ghế và hành trình của hành khách.
function BookingSeatCard({
    seat,
    index,
}: {
    seat: PaymentBookingSeat;
    index: number;
}) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-sm font-bold text-red-600">
                        {getSeatCode(seat)}
                    </div>

                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">
                            {seat.passengerName || `Hành khách ${index + 1}`}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                            {seat.passengerPhone || 'Chưa có số điện thoại'}
                        </p>
                    </div>
                </div>

                <p className="shrink-0 text-sm font-semibold text-slate-900">
                    {formatCurrency(seat.price)}
                </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">
                        Điểm đón
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-800">
                        {seat.pickupTripRoutePoint?.pointName || 'Chưa xác định'}
                    </p>

                    {seat.pickupTripRoutePoint && (
                        <p className="mt-1 text-xs text-slate-500">
                            Điểm thứ {seat.pickupTripRoutePoint.sequence}
                        </p>
                    )}
                </div>

                <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">
                        Điểm trả
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-800">
                        {seat.dropoffTripRoutePoint?.pointName || 'Chưa xác định'}
                    </p>

                    {seat.dropoffTripRoutePoint && (
                        <p className="mt-1 text-xs text-slate-500">
                            Điểm thứ {seat.dropoffTripRoutePoint.sequence}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

// Hiển thị chi tiết giao dịch thanh toán và booking liên quan.
export default function PaymentDetailModal({
    payment,
    open,
    onClose,
}: PaymentDetailModalProps) {
    if (!open) {
        return null;
    }

    if (!payment) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-xl">
                    <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-red-600" />

                    <p className="mt-4 text-sm font-medium text-slate-700">
                        Đang tải thông tin giao dịch...
                    </p>
                </div>
            </div>
        );
    }

    const booking = payment.booking;
    const trip = booking.trip;

    const remainingAmount = Math.max(
        booking.totalAmount - booking.paidAmount,
        0,
    );

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
            onClick={onClose}
        >
            <div
                className="flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl bg-slate-50 shadow-2xl sm:rounded-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            Chi tiết thanh toán
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Mã giao dịch: {payment.id}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Đóng"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="h-5 w-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m18 6-12 12M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Nội dung */}
                <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
                    {/* Tổng quan giao dịch */}
                    <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <p className="text-sm text-slate-500">
                                    Số tiền giao dịch
                                </p>

                                <p className="mt-2 text-2xl font-bold text-red-600">
                                    {formatCurrency(payment.amount)}
                                </p>
                            </div>

                            <PaymentStatusBadge status={payment.status} />
                        </div>

                        <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-3">
                            <div>
                                <p className="text-xs text-slate-500">
                                    Phương thức
                                </p>

                                <p className="mt-1 text-sm font-medium text-slate-800">
                                    {payment.method === 'BANK_TRANSFER'
                                        ? 'Chuyển khoản ngân hàng'
                                        : payment.method}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-500">
                                    Thời gian báo chuyển
                                </p>

                                <p className="mt-1 text-sm font-medium text-slate-800">
                                    {formatDateTime(payment.reportedAt)}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-500">
                                    Thời gian tạo giao dịch
                                </p>

                                <p className="mt-1 text-sm font-medium text-slate-800">
                                    {formatDateTime(payment.createdAt)}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="rounded-lg bg-slate-50 p-3">
                                <p className="text-xs text-slate-500">
                                    Mã giao dịch ngân hàng
                                </p>

                                <p className="mt-1 break-all text-sm font-semibold text-slate-900">
                                    {payment.transactionCode || 'Không có'}
                                </p>
                            </div>

                            <div className="rounded-lg bg-slate-50 p-3">
                                <p className="text-xs text-slate-500">
                                    Nội dung chuyển khoản
                                </p>

                                <p className="mt-1 break-words text-sm font-medium text-slate-900">
                                    {payment.transferContent || 'Không có'}
                                </p>
                            </div>
                        </div>

                        {payment.rejectionReason && (
                            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                                <p className="text-xs font-semibold text-red-700">
                                    Lý do từ chối
                                </p>

                                <p className="mt-1 text-sm text-red-800">
                                    {payment.rejectionReason}
                                </p>
                            </div>
                        )}

                        {payment.confirmedAt && (
                            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3">
                                <p className="text-xs font-semibold text-green-700">
                                    Thời gian xác nhận
                                </p>

                                <p className="mt-1 text-sm text-green-800">
                                    {formatDateTime(payment.confirmedAt)}
                                </p>
                            </div>
                        )}
                    </section>

                    {/* Thông tin booking */}
                    <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="text-base font-bold text-slate-900">
                                Thông tin booking
                            </h3>

                            <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-800">
                                {booking.bookingCode}
                            </span>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <p className="text-xs text-slate-500">
                                    Khách hàng
                                </p>

                                <p className="mt-1 text-sm font-semibold text-slate-900">
                                    {booking.customerName}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-500">
                                    Số điện thoại
                                </p>

                                <p className="mt-1 text-sm font-medium text-slate-800">
                                    {booking.customerPhone}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-500">
                                    Email
                                </p>

                                <p className="mt-1 break-all text-sm font-medium text-slate-800">
                                    {booking.customerEmail || 'Không có'}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-500">
                                    Chiều di chuyển
                                </p>

                                <p className="mt-1 text-sm font-medium text-slate-800">
                                    {booking.direction === 'OUTBOUND'
                                        ? 'Chiều đi'
                                        : 'Chiều về'}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Thông tin chuyến xe */}
                    <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                        <h3 className="text-base font-bold text-slate-900">
                            Thông tin chuyến xe
                        </h3>

                        <p className="mt-3 text-base font-semibold text-slate-900">
                            {trip.route?.name || 'Chưa xác định tuyến'}
                        </p>

                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <p className="text-xs text-slate-500">
                                    Biển số xe
                                </p>

                                <p className="mt-1 text-sm font-semibold text-slate-800">
                                    {trip.vehicle?.licensePlate || 'Chưa phân xe'}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-500">
                                    Tên xe
                                </p>

                                <p className="mt-1 text-sm font-medium text-slate-800">
                                    {trip.vehicle?.name || 'Chưa phân xe'}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-500">
                                    Khởi hành dự kiến
                                </p>

                                <p className="mt-1 text-sm font-medium text-slate-800">
                                    {formatDateTime(trip.plannedDeparture)}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-500">
                                    Đến nơi dự kiến
                                </p>

                                <p className="mt-1 text-sm font-medium text-slate-800">
                                    {formatDateTime(trip.plannedArrival)}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Danh sách ghế */}
                    <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                        <div className="flex items-center justify-between gap-3">
                            <h3 className="text-base font-bold text-slate-900">
                                Hành khách và ghế
                            </h3>

                            <span className="text-sm text-slate-500">
                                {booking.seats.length} ghế
                            </span>
                        </div>

                        <div className="mt-4 space-y-3">
                            {booking.seats.map((seat, index) => (
                                <BookingSeatCard
                                    key={seat.id}
                                    seat={seat}
                                    index={index}
                                />
                            ))}

                            {booking.seats.length === 0 && (
                                <p className="py-6 text-center text-sm text-slate-500">
                                    Booking chưa có thông tin ghế.
                                </p>
                            )}
                        </div>
                    </section>

                    {/* Tổng kết tiền booking */}
                    <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                        <h3 className="text-base font-bold text-slate-900">
                            Tổng kết thanh toán booking
                        </h3>

                        <div className="mt-4 space-y-3">
                            <div className="flex items-center justify-between gap-3 text-sm">
                                <span className="text-slate-500">
                                    Tổng tiền vé
                                </span>

                                <span className="font-semibold text-slate-900">
                                    {formatCurrency(booking.totalAmount)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-3 text-sm">
                                <span className="text-slate-500">
                                    Tiền đặt cọc yêu cầu
                                </span>

                                <span className="font-medium text-slate-800">
                                    {formatCurrency(booking.depositAmount)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-3 text-sm">
                                <span className="text-slate-500">
                                    Đã thanh toán
                                </span>

                                <span className="font-semibold text-green-700">
                                    {formatCurrency(booking.paidAmount)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                                <span className="text-sm font-semibold text-slate-700">
                                    Còn phải thanh toán
                                </span>

                                <span className="text-lg font-bold text-red-600">
                                    {formatCurrency(remainingAmount)}
                                </span>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="flex shrink-0 justify-end border-t border-slate-200 bg-white px-5 py-4 sm:px-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}
