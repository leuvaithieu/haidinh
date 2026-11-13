
'use client';

import { useEffect, useState } from 'react';
import type { RejectPaymentModalProps } from './payment-types';

// Hiển thị hộp thoại từ chối giao dịch thanh toán.
export default function RejectPaymentModal({
    payment,
    open,
    loading,
    onReject,
    onClose,
}: RejectPaymentModalProps) {
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        if (open) {
            setRejectionReason('');
        }
    }, [open, payment?.id]);

    // Gửi yêu cầu từ chối thanh toán sau khi kiểm tra lý do.
    function handleSubmit() {
        const reason = rejectionReason.trim();

        if (!reason || reason.length > 255 || loading) {
            return;
        }

        onReject({ rejectionReason: reason });
    }

    if (!open || !payment) {
        return null;
    }

    const trimmedReason = rejectionReason.trim();
    const isValid = trimmedReason.length > 0 && trimmedReason.length <= 255;

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
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="h-6 w-6 text-red-600"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M18 6 6 18M6 6l12 12"
                                />
                            </svg>
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                Từ chối thanh toán
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Nhập lý do để lưu lại thông tin giao dịch bị từ chối.
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
                                Số tiền báo chuyển
                            </span>

                            <span className="text-right text-sm font-semibold text-slate-900">
                                {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                    maximumFractionDigits: 0,
                                }).format(payment.amount)}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="rejectionReason"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Lý do từ chối
                            <span className="ml-1 text-red-500">*</span>
                        </label>

                        <textarea
                            id="rejectionReason"
                            value={rejectionReason}
                            onChange={(event) =>
                                setRejectionReason(event.target.value)
                            }
                            maxLength={255}
                            rows={4}
                            placeholder="Ví dụ: Không tìm thấy giao dịch tương ứng trong tài khoản ngân hàng..."
                            disabled={loading}
                            className="w-full resize-none rounded-xl border border-slate-300 px-3 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:bg-slate-100"
                        />

                        <div className="mt-1 flex items-center justify-between gap-3">
                            <p className="text-xs text-slate-500">
                                Lý do này sẽ được lưu trong lịch sử thanh toán.
                            </p>

                            <span
                                className={`shrink-0 text-xs ${
                                    rejectionReason.length >= 255
                                        ? 'text-red-600'
                                        : 'text-slate-400'
                                }`}
                            >
                                {rejectionReason.length}/255
                            </span>
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
                            Hãy kiểm tra kỹ giao dịch trước khi từ chối. Trạng thái
                            booking sẽ được cập nhật theo quy tắc xử lý thanh toán
                            của hệ thống.
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
                        disabled={loading || !isValid}
                        onClick={handleSubmit}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading && (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        )}

                        {loading ? 'Đang xử lý...' : 'Xác nhận từ chối'}
                    </button>
                </div>
            </div>
        </div>
    );
}
