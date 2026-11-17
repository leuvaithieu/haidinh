
'use client';

import { ConfirmPaymentModalProps } from './payment-types';

// Định dạng số tiền theo đơn vị tiền Việt Nam.
function formatCurrency(amount: number) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(amount);
}

// Hiển thị hộp thoại xác nhận đã nhận được tiền thanh toán.
export default function ConfirmPaymentModal({
    payment,
    open,
    loading,
    onConfirm,
    onClose,
}: ConfirmPaymentModalProps) {
    if (!open || !payment) {
        return null;
    }

    const remainingAmount = Math.max(
        payment.booking.totalAmount - payment.booking.paidAmount,
        0,
    );

    return (
        <div
            className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
            onClick={loading ? undefined : onClose}
        >
            <div
                className="w-full max-w-md overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                {/* Header */}
                <div className="border-b border-slate-100 px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="h-6 w-6 text-green-600"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m5 12 4 4L19 6"
                                />
                            </svg>
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                Xác nhận thanh toán
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Kiểm tra thông tin trước khi xác nhận.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Nội dung */}
                <div className="space-y-4 p-5">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-sm text-slate-500">
                                Mã booking
                            </span>

                            <span className="break-all text-right text-sm font-semibold text-slate-900">
                                {payment.booking.bookingCode}
                            </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3">
                            <span className="text-sm text-slate-500">
                                Khách hàng
                            </span>

                            <span className="text-right text-sm font-medium text-slate-800">
                                {payment.booking.customerName}
                            </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3">
                            <span className="text-sm text-slate-500">
                                Số điện thoại
                            </span>

                            <span className="text-right text-sm font-medium text-slate-800">
                                {payment.booking.customerPhone}
                            </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3">
                            <span className="text-sm text-slate-500">
                                Mã giao dịch
                            </span>

                            <span className="max-w-[60%] break-all text-right text-sm font-medium text-slate-800">
                                {payment.transactionCode || 'Không có'}
                            </span>
                        </div>
                    </div>

                    <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                        <p className="text-sm font-medium text-green-800">
                            Số tiền khách báo chuyển
                        </p>

                        <p className="mt-2 text-2xl font-bold text-green-700">
                            {formatCurrency(payment.amount)}
                        </p>

                        <div className="mt-4 space-y-2 border-t border-green-200 pt-3">
                            <div className="flex items-center justify-between gap-3 text-sm">
                                <span className="text-green-800">
                                    Tổng tiền booking
                                </span>

                                <span className="font-medium text-green-900">
                                    {formatCurrency(payment.booking.totalAmount)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-3 text-sm">
                                <span className="text-green-800">
                                    Đã thanh toán trước đó
                                </span>

                                <span className="font-medium text-green-900">
                                    {formatCurrency(payment.booking.paidAmount)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-3 text-sm">
                                <span className="font-semibold text-green-800">
                                    Còn phải thanh toán
                                </span>

                                <span className="font-bold text-green-900">
                                    {formatCurrency(remainingAmount)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v4m0 4h.01M10.3 3.86 2.4 17.5A1.7 1.7 0 0 0 3.87 20h16.26a1.7 1.7 0 0 0 1.47-2.5L13.7 3.86a1.96 1.96 0 0 0-3.4 0Z"
                            />
                        </svg>

                        <p className="text-sm leading-5 text-amber-800">
                            Chỉ xác nhận khi đã kiểm tra tiền thực tế vào tài khoản ngân hàng. Thao tác này sẽ cập nhật trạng thái thanh toán và booking.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-white p-5 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        disabled={loading}
                        onClick={onClose}
                        className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Hủy
                    </button>

                    <button
                        type="button"
                        disabled={loading}
                        onClick={onConfirm}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading && (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        )}

                        {loading ? 'Đang xác nhận...' : 'Xác nhận đã nhận tiền'}
                    </button>
                </div>
            </div>
        </div>
    );
}
