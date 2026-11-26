
'use client';

import { useEffect, useState } from 'react';
import { ConfirmPaymentModalProps } from './payment-types';

// Định dạng số tiền theo đơn vị tiền Việt Nam.
function formatCurrency(amount: number) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(amount);
}

// Chuyển chuỗi nhập liệu thành số tiền nguyên.
function parseAmount(value: string) {
    const amount = Number(value.replace(/[^\d]/g, ''));
    return Number.isFinite(amount) ? amount : 0;
}

// Hiển thị hộp thoại nhập tổng tiền lũy kế thực tế đã nhận.
export default function ConfirmPaymentModal({
    payment,
    open,
    loading,
    onConfirm,
    onClose,
}: ConfirmPaymentModalProps) {
    const [paidAmountInput, setPaidAmountInput] = useState('');

    useEffect(() => {
        if (open && payment) {
            const currentPaidAmount = payment.booking.paidAmount ?? 0;
            const suggestedAmount =
                currentPaidAmount > 0
                    ? currentPaidAmount
                    : payment.booking.depositAmount;

            setPaidAmountInput(String(suggestedAmount));
        }
    }, [open, payment]);

    if (!open || !payment) {
        return null;
    }

    const booking = payment.booking;
    const currentPaidAmount = booking.paidAmount ?? 0;
    const totalAmount = booking.totalAmount;
    const depositAmount = booking.depositAmount;
    const newPaidAmount = parseAmount(paidAmountInput);

    const remainingAmount = Math.max(totalAmount - currentPaidAmount, 0);
    const newRemainingAmount = Math.max(totalAmount - newPaidAmount, 0);
    const additionalAmount = Math.max(newPaidAmount - currentPaidAmount, 0);

    const isBelowCurrentPaid = newPaidAmount < currentPaidAmount;
    const isBelowDeposit =
        currentPaidAmount === 0 && newPaidAmount < depositAmount;
    const isAboveTotal = newPaidAmount > totalAmount;

    const validationMessage = isBelowCurrentPaid
        ? 'Tổng tiền mới không được thấp hơn số tiền đã ghi nhận.'
        : isBelowDeposit
            ? `Số tiền xác nhận lần đầu phải tối thiểu ${formatCurrency(depositAmount)}.`
            : isAboveTotal
                ? 'Tổng tiền xác nhận không được vượt quá tổng tiền booking.'
                : '';

    const canConfirm =
        newPaidAmount > 0 &&
        !validationMessage &&
        additionalAmount > 0 &&
        !loading;

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
                                Nhập tổng số tiền thực tế đã nhận từ khách.
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
                                {booking.bookingCode}
                            </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3">
                            <span className="text-sm text-slate-500">
                                Khách hàng
                            </span>
                            <span className="text-right text-sm font-medium text-slate-800">
                                {booking.customerName}
                            </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3">
                            <span className="text-sm text-slate-500">
                                Số điện thoại
                            </span>
                            <span className="text-right text-sm font-medium text-slate-800">
                                {booking.customerPhone}
                            </span>
                        </div>
                    </div>

                    {/* Tổng quan thanh toán */}
                    <div className="rounded-xl border border-slate-200 p-4">
                        <p className="mb-3 text-sm font-semibold text-slate-800">
                            Tổng quan booking
                        </p>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between gap-3 text-sm">
                                <span className="text-slate-500">
                                    Tổng tiền booking
                                </span>
                                <span className="font-semibold text-slate-900">
                                    {formatCurrency(totalAmount)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-3 text-sm">
                                <span className="text-slate-500">
                                    Tiền cọc tối thiểu
                                </span>
                                <span className="font-medium text-slate-800">
                                    {formatCurrency(depositAmount)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-3 text-sm">
                                <span className="text-slate-500">
                                    Đã ghi nhận trước đó
                                </span>
                                <span className="font-semibold text-green-700">
                                    {formatCurrency(currentPaidAmount)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 text-sm">
                                <span className="font-medium text-slate-700">
                                    Còn phải thu
                                </span>
                                <span className="font-bold text-amber-700">
                                    {formatCurrency(remainingAmount)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Nhập tổng tiền lũy kế */}
                    <div className="space-y-2">
                        <label
                            htmlFor="cumulative-paid-amount"
                            className="block text-sm font-semibold text-slate-800"
                        >
                            Số tiền đã thanh toán thực tế
                        </label>

                        <div className="relative">
                            <input
                                id="cumulative-paid-amount"
                                type="text"
                                inputMode="numeric"
                                value={paidAmountInput.replace(
                                    /\B(?=(\d{3})+(?!\d))/g,
                                    ',',
                                )}
                                onChange={(event) => {
                                    setPaidAmountInput(
                                        event.target.value.replace(/\D/g, ''),
                                    );
                                }}
                                placeholder="Nhập tổng tiền đã nhận"
                                disabled={loading}
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-16 text-lg font-bold text-slate-900 outline-none transition placeholder:text-sm placeholder:font-normal focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-slate-100"
                            />

                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">
                                VNĐ
                            </span>
                        </div>

                        <p className="text-xs leading-5 text-slate-500">
                            Nhập tổng tiền đã nhận từ trước đến hiện tại, bao gồm
                            tất cả các lần khách chuyển khoản. Không nhập riêng
                            số tiền của lần chuyển mới nhất.
                        </p>

                        {validationMessage && (
                            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                {validationMessage}
                            </p>
                        )}
                    </div>

                    {/* Kết quả sau xác nhận */}
                    <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                        <p className="text-sm font-semibold text-green-800">
                            Dự kiến sau khi xác nhận
                        </p>

                        <div className="mt-3 space-y-2">
                            <div className="flex items-center justify-between gap-3 text-sm">
                                <span className="text-green-800">
                                    Tổng tiền đã nhận
                                </span>
                                <span className="font-bold text-green-900">
                                    {formatCurrency(newPaidAmount)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-3 text-sm">
                                <span className="text-green-800">
                                    Số tiền ghi nhận thêm
                                </span>
                                <span className="font-semibold text-green-900">
                                    {formatCurrency(additionalAmount)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-3 border-t border-green-200 pt-2 text-sm">
                                <span className="font-semibold text-green-800">
                                    Còn phải thanh toán
                                </span>
                                <span className="font-bold text-green-900">
                                    {formatCurrency(newRemainingAmount)}
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
                            Chỉ xác nhận sau khi kiểm tra tiền thực tế đã vào tài
                            khoản ngân hàng. Hệ thống sẽ cập nhật số tiền đã thanh
                            toán, trạng thái booking và xuất vé nếu đủ điều kiện.
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
                        disabled={!canConfirm}
                        onClick={() => onConfirm(newPaidAmount)}
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
