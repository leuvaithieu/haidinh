
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { lookupPublicBooking } from '@/app/booking/lib/booking-api';
import type { PublicBookingLookupResponse } from '@/app/booking/lib/booking-api';

// Định dạng số tiền theo đơn vị tiền tệ Việt Nam.
function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
}

// Chuyển trạng thái booking thành nội dung dễ hiểu.
function getBookingStatus(status: string): string {
    const statuses: Record<string, string> = {
        PENDING: 'Chờ xác nhận',
        CONFIRMED: 'Đã xác nhận',
        CANCELLED: 'Đã hủy',
        EXPIRED: 'Đã hết hạn',
        COMPLETED: 'Đã hoàn thành',
    };

    return statuses[status] || status;
}

// Chuyển trạng thái thanh toán thành nội dung dễ hiểu.
function getPaymentStatus(status: string): string {
    const statuses: Record<string, string> = {
        UNPAID: 'Chưa thanh toán',
        PARTIALLY_PAID: 'Đã thanh toán một phần',
        PAID: 'Đã thanh toán đủ',
        FAILED: 'Thanh toán thất bại',
        REFUNDED: 'Đã hoàn tiền',
    };

    return statuses[status] || status;
}

// Trang tra cứu thông tin đặt vé bằng mã booking và số điện thoại.
export default function LookupTicketPage() {
    const [bookingCode, setBookingCode] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [booking, setBooking] =
        useState<PublicBookingLookupResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Gửi yêu cầu tra cứu booking đến API công khai.
    async function handleLookup(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!bookingCode.trim() || !customerPhone.trim()) {
            setError('Vui lòng nhập mã đặt vé và số điện thoại.');
            return;
        }

        setLoading(true);
        setError('');
        setBooking(null);

        try {
            const result = await lookupPublicBooking(
                bookingCode.trim(),
                customerPhone.trim(),
            );

            setBooking(result);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Không thể tra cứu thông tin đặt vé.',
            );
        } finally {
            setLoading(false);
        }
    }

    const remainingAmount = booking
        ? Math.max(0, booking.totalAmount - booking.paidAmount)
        : 0;

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-10 sm:py-14">
            <div className="mx-auto max-w-2xl">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                        Tra cứu vé xe
                    </h1>
                    <p className="mt-3 text-sm leading-6 text-gray-600">
                        Nhập mã đặt vé và số điện thoại người đặt để xem
                        thông tin đặt vé của bạn.
                    </p>
                </div>

                <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
                    <form onSubmit={handleLookup} className="space-y-5">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Mã đặt vé
                            </label>
                            <input
                                type="text"
                                required
                                value={bookingCode}
                                onChange={(event) =>
                                    setBookingCode(event.target.value)
                                }
                                placeholder="Nhập mã đặt vé"
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Số điện thoại người đặt
                            </label>
                            <input
                                type="tel"
                                required
                                value={customerPhone}
                                onChange={(event) =>
                                    setCustomerPhone(event.target.value)
                                }
                                placeholder="Nhập số điện thoại đã dùng khi đặt vé"
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                            />
                        </div>

                        {error && (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-red-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                        >
                            {loading ? 'Đang tra cứu...' : 'Tra cứu vé'}
                        </button>
                    </form>
                </section>

                {booking && (
                    <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-100 bg-gray-50 p-5 sm:p-6">
                            <p className="text-sm text-gray-500">
                                Mã đặt vé
                            </p>
                            <p className="mt-1 text-xl font-bold text-red-600">
                                {booking.bookingCode}
                            </p>
                        </div>

                        <div className="space-y-5 p-5 sm:p-6">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-xs text-gray-500">
                                        Người đặt
                                    </p>
                                    <p className="mt-1 font-semibold text-gray-900">
                                        {booking.customerName}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Số điện thoại
                                    </p>
                                    <p className="mt-1 font-semibold text-gray-900">
                                        {booking.customerPhone}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Trạng thái đặt vé
                                    </p>
                                    <p className="mt-1 font-semibold text-gray-900">
                                        {getBookingStatus(booking.status)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Trạng thái thanh toán
                                    </p>
                                    <p className="mt-1 font-semibold text-gray-900">
                                        {getPaymentStatus(booking.paymentStatus)}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-5">
                                <div className="flex justify-between gap-4 text-sm">
                                    <span className="text-gray-600">
                                        Tổng tiền vé
                                    </span>
                                    <span className="font-semibold text-gray-900">
                                        {formatCurrency(booking.totalAmount)}
                                    </span>
                                </div>

                                <div className="mt-3 flex justify-between gap-4 text-sm">
                                    <span className="text-gray-600">
                                        Đã thanh toán
                                    </span>
                                    <span className="font-semibold text-green-700">
                                        {formatCurrency(booking.paidAmount)}
                                    </span>
                                </div>

                                <div className="mt-3 flex justify-between gap-4 text-sm">
                                    <span className="text-gray-600">
                                        Còn phải thanh toán
                                    </span>
                                    <span className="font-semibold text-red-600">
                                        {formatCurrency(remainingAmount)}
                                    </span>
                                </div>

                                {booking.holdExpiresAt && (
                                    <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                                        Thời hạn giữ ghế:{' '}
                                        {new Date(
                                            booking.holdExpiresAt,
                                        ).toLocaleString('vi-VN')}
                                    </div>
                                )}
                            </div>

                            <Link
                                href={`/dat-ve/thanh-toan/${encodeURIComponent(booking.bookingCode)}`}
                                className="block w-full rounded-xl bg-red-600 px-5 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-red-700"
                            >
                                Xem thanh toán và báo chuyển khoản
                            </Link>
                        </div>
                    </section>
                )}

                <p className="mt-6 text-center text-sm text-gray-500">
                    Cần hỗ trợ? Liên hệ hotline Hải Định để được hướng dẫn.
                </p>
            </div>
        </main>
    );
}
