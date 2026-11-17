
'use client';

import PaymentStatusBadge from './PaymentStatusBadge';

import {
    PaymentListProps,
    PaymentListItem,
} from './payment-types';

// Định dạng số tiền theo đơn vị tiền Việt Nam.
function formatCurrency(amount: number) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(amount);
}

// Định dạng thời gian theo múi giờ Việt Nam.
function formatDateTime(value: string | null) {
    if (!value) {
        return 'Chưa có thông tin';
    }

    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
}

// Lấy danh sách mã ghế từ thông tin phân bổ ghế của booking.
function getSeatCodes(payment: PaymentListItem) {
    const seats = payment.booking.seats
        .map((item) => item.seatAllocation?.tripSeat?.seat?.code)
        .filter((code): code is string => Boolean(code));

    return seats.length > 0 ? seats.join(', ') : 'Chưa có thông tin';
}

// Lấy tên tuyến đường và chiều di chuyển của booking.
function getTripInformation(payment: PaymentListItem) {
    const routeName = payment.booking.trip?.route?.name ?? 'Chưa xác định tuyến';

    const direction =
        payment.booking.direction === 'OUTBOUND'
            ? 'Chiều đi'
            : 'Chiều về';

    return `${routeName} (${direction})`;
}

// Hiển thị thông tin thời gian chờ xác nhận thanh toán.
function PaymentReviewTime({
    payment,
}: {
    payment: PaymentListItem;
}) {
    if (payment.isOverdue) {
        return (
            <div className="flex flex-col gap-1">
                <span className="inline-flex w-fit items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                    Quá hạn xác nhận
                </span>

                <span className="text-xs text-red-600">
                    Đã chờ {payment.elapsedMinutes ?? 0} phút
                </span>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-slate-700">
                {payment.elapsedMinutes ?? 0} phút
            </span>

            <span className="text-xs text-slate-500">
                Thời hạn: {payment.reviewTimeoutMinutes} phút
            </span>
        </div>
    );
}

// Hiển thị một giao dịch thanh toán trên giao diện mobile.
function PaymentCard({
    payment,
    onView,
    onConfirm,
    onReject,
}: {
    payment: PaymentListItem;
    onView: (payment: PaymentListItem) => void;
    onConfirm: (payment: PaymentListItem) => void;
    onReject: (payment: PaymentListItem) => void;
}) {
    return (
        <div
            className={`rounded-xl border bg-white p-4 shadow-sm ${
                payment.isOverdue
                    ? 'border-red-200'
                    : 'border-slate-200'
            }`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="break-all text-sm font-bold text-slate-900">
                        {payment.booking.bookingCode}
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                        {payment.booking.customerName}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                        {payment.booking.customerPhone}
                    </p>
                </div>

                <PaymentStatusBadge status={payment.status} />
            </div>

            <div className="my-4 border-t border-slate-100" />

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-xs text-slate-500">
                        Số tiền báo chuyển
                    </p>

                    <p className="mt-1 text-base font-bold text-red-600">
                        {formatCurrency(payment.amount)}
                    </p>
                </div>

                <div>
                    <p className="text-xs text-slate-500">
                        Thời gian báo
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-800">
                        {formatDateTime(payment.reportedAt)}
                    </p>
                </div>
            </div>

            <div className="mt-4 space-y-2 rounded-lg bg-slate-50 p-3">
                <div>
                    <p className="text-xs text-slate-500">
                        Tuyến xe
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-800">
                        {getTripInformation(payment)}
                    </p>
                </div>

                <div>
                    <p className="text-xs text-slate-500">
                        Ghế
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-800">
                        {getSeatCodes(payment)}
                    </p>
                </div>

                <div>
                    <p className="text-xs text-slate-500">
                        Mã giao dịch ngân hàng
                    </p>

                    <p className="mt-1 break-all text-sm font-medium text-slate-800">
                        {payment.transactionCode || 'Không có'}
                    </p>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
                <PaymentReviewTime payment={payment} />

                <button
                    type="button"
                    onClick={() => onView(payment)}
                    className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                    Chi tiết
                </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                    type="button"
                    onClick={() => onConfirm(payment)}
                    className="rounded-lg bg-green-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                >
                    Xác nhận
                </button>

                <button
                    type="button"
                    onClick={() => onReject(payment)}
                    className="rounded-lg border border-red-200 bg-white px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                    Từ chối
                </button>
            </div>
        </div>
    );
}

// Hiển thị danh sách giao dịch đang chờ nhân viên xử lý.
export default function PaymentList({
    payments,
    loading,
    onView,
    onConfirm,
    onReject,
}: PaymentListProps) {
    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                    <div
                        key={item}
                        className="h-32 animate-pulse rounded-xl bg-slate-100"
                    />
                ))}
            </div>
        );
    }

    if (payments.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        className="h-6 w-6 text-slate-400"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 8v4m0 4h.01M4.93 19h14.14c1.54 0 2.5-1.67 1.73-3L13.73 3.8c-.77-1.33-2.69-1.33-3.46 0L3.2 16c-.77 1.33.19 3 1.73 3Z"
                        />
                    </svg>
                </div>

                <h3 className="mt-4 text-base font-semibold text-slate-800">
                    Chưa có giao dịch chờ xác nhận
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                    Các giao dịch khách hàng báo chuyển khoản sẽ xuất hiện tại đây.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-slate-600">
                    Có <span className="font-semibold text-slate-900">{payments.length}</span> giao dịch đang chờ xử lý
                </p>

                <p className="text-xs text-slate-500">
                    Sắp xếp theo thời gian báo chuyển khoản
                </p>
            </div>

            {/* Giao diện mobile */}
            <div className="grid grid-cols-1 gap-3 lg:hidden">
                {payments.map((payment) => (
                    <PaymentCard
                        key={payment.id}
                        payment={payment}
                        onView={onView}
                        onConfirm={onConfirm}
                        onReject={onReject}
                    />
                ))}
            </div>

            {/* Giao diện desktop */}
            <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white lg:block">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1100px] border-collapse text-left">
                        <thead className="bg-slate-50">
                            <tr className="border-b border-slate-200">
                                <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Booking / Khách hàng
                                </th>

                                <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Tuyến / Ghế
                                </th>

                                <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Số tiền
                                </th>

                                <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Giao dịch
                                </th>

                                <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Thời gian
                                </th>

                                <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Trạng thái
                                </th>

                                <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {payments.map((payment) => (
                                <tr
                                    key={payment.id}
                                    className={`transition hover:bg-slate-50 ${
                                        payment.isOverdue ? 'bg-red-50/40' : ''
                                    }`}
                                >
                                    <td className="px-4 py-4">
                                        <p className="text-sm font-semibold text-slate-900">
                                            {payment.booking.bookingCode}
                                        </p>

                                        <p className="mt-1 text-sm text-slate-700">
                                            {payment.booking.customerName}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            {payment.booking.customerPhone}
                                        </p>
                                    </td>

                                    <td className="px-4 py-4">
                                        <p className="max-w-[220px] text-sm font-medium text-slate-800">
                                            {getTripInformation(payment)}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            Ghế: {getSeatCodes(payment)}
                                        </p>
                                    </td>

                                    <td className="px-4 py-4">
                                        <p className="whitespace-nowrap text-sm font-bold text-slate-900">
                                            {formatCurrency(payment.amount)}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            Booking: {formatCurrency(payment.booking.totalAmount)}
                                        </p>
                                    </td>

                                    <td className="px-4 py-4">
                                        <p className="max-w-[180px] break-all text-sm text-slate-800">
                                            {payment.transactionCode || 'Không có mã'}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            {payment.method === 'BANK_TRANSFER'
                                                ? 'Chuyển khoản ngân hàng'
                                                : payment.method}
                                        </p>
                                    </td>

                                    <td className="px-4 py-4">
                                        <p className="whitespace-nowrap text-sm text-slate-700">
                                            {formatDateTime(payment.reportedAt)}
                                        </p>

                                        <div className="mt-2">
                                            <PaymentReviewTime payment={payment} />
                                        </div>
                                    </td>

                                    <td className="px-4 py-4">
                                        <PaymentStatusBadge status={payment.status} />
                                    </td>

                                    <td className="px-4 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => onView(payment)}
                                                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                                            >
                                                Chi tiết
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => onConfirm(payment)}
                                                className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-700"
                                            >
                                                Xác nhận
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => onReject(payment)}
                                                className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                            >
                                                Từ chối
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
