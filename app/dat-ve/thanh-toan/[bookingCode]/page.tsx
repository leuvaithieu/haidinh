
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

import {
    lookupPublicBooking,
    reportBookingPayment,
    getPublicBankInfo,
    type PublicBankInfo,
    type PublicBookingLookupResponse,
} from '@/app/booking/lib/booking-api';

// Định dạng số tiền theo đơn vị tiền tệ Việt Nam.
function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
}

// Kiểm tra booking có đủ điều kiện báo thanh toán lần đầu hay không.
function isInitialPaymentAllowed(
    booking: PublicBookingLookupResponse,
): boolean {
    return (
        booking.status === 'PENDING' &&
        ['UNPAID', 'FAILED', 'REJECTED'].includes(booking.paymentStatus)
    );
}

// Kiểm tra booking có đủ điều kiện thanh toán bổ sung hay không.
function isAdditionalPaymentAllowed(
    booking: PublicBookingLookupResponse,
): boolean {
    return (
        booking.status === 'CONFIRMED' &&
        booking.paymentStatus === 'PARTIALLY_PAID'
    );
}

// Hiển thị trang tra cứu booking và báo thông tin chuyển khoản.
export default function BookingPaymentPage() {
    const params = useParams<{ bookingCode: string }>();
    const bookingCode = params.bookingCode;

    const [customerPhone, setCustomerPhone] = useState('');
    const [booking, setBooking] =
        useState<PublicBookingLookupResponse | null>(null);

    const [bankInfo, setBankInfo] = useState<PublicBankInfo | null>(null);
    const [loadingBankInfo, setLoadingBankInfo] = useState(true);
    const [bankInfoError, setBankInfoError] = useState('');

    const [amount, setAmount] = useState('');
    const [transactionCode, setTransactionCode] = useState('');
    const [transferContent, setTransferContent] = useState(
        `HAIDINH ${bookingCode}`,
    );

    const [loadingLookup, setLoadingLookup] = useState(false);
    const [loadingPayment, setLoadingPayment] = useState(false);
    const [reported, setReported] = useState(false);
    const [error, setError] = useState('');

    const isInitialPayment =
        booking !== null && isInitialPaymentAllowed(booking);

    const isAdditionalPayment =
        booking !== null && isAdditionalPaymentAllowed(booking);

    const remainingAmount = booking
        ? Math.max(0, booking.totalAmount - booking.paidAmount)
        : 0;

    const minimumAmount = isInitialPayment
        ? booking?.depositAmount ?? 0
        : 1;

    const enteredAmount = Number(amount);

const qrAmount =
    Number.isInteger(enteredAmount) &&
    enteredAmount >= minimumAmount &&
    enteredAmount <= remainingAmount
        ? enteredAmount
        : isInitialPayment
            ? minimumAmount
            : remainingAmount;

    const qrImageUrl = bankInfo
        ? `https://img.vietqr.io/image/${encodeURIComponent(
            bankInfo.bankCode,
        )}-${encodeURIComponent(bankInfo.accountNumber)}-qr_only.png?${new URLSearchParams(
            {
                amount: String(qrAmount),
                addInfo: transferContent,
                accountName: bankInfo.accountName,
            },
        ).toString()}`
        : '';

    const isHoldExpired =
        isInitialPayment &&
        (
            !booking?.holdExpiresAt ||
            new Date(booking.holdExpiresAt).getTime() <= Date.now()
        );

    const canReportPayment =
        booking !== null &&
        !isHoldExpired &&
        (isInitialPayment || isAdditionalPayment) &&
        remainingAmount > 0;

    // Tải thông tin tài khoản ngân hàng công khai khi khách mở trang thanh toán.
    useEffect(() => {
        let isMounted = true;

        getPublicBankInfo()
            .then((data) => {
                if (isMounted) {
                    setBankInfo(data);
                    setBankInfoError('');
                }
            })
            .catch((err) => {
                if (isMounted) {
                    setBankInfoError(
                        err instanceof Error
                            ? err.message
                            : 'Không thể tải thông tin ngân hàng.',
                    );
                }
            })
            .finally(() => {
                if (isMounted) {
                    setLoadingBankInfo(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    // Tra cứu booking bằng mã đặt vé và số điện thoại người đặt.
    async function handleLookup(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setLoadingLookup(true);
        setError('');
        setBooking(null);
        setReported(false);
        setAmount('');

        try {
            const result = await lookupPublicBooking(
                bookingCode,
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
            setLoadingLookup(false);
        }
    }

    // Gửi thông tin khách đã chuyển khoản đến hệ thống.
    async function handleReportPayment(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (!booking || !canReportPayment || loadingPayment) {
            return;
        }

        const paymentAmount = Number(amount);

        if (!Number.isInteger(paymentAmount) || paymentAmount <= 0) {
            setError('Vui lòng nhập số tiền chuyển hợp lệ.');
            return;
        }

        if (paymentAmount < minimumAmount) {
            setError(
                `Số tiền thanh toán tối thiểu là ${formatCurrency(minimumAmount)}.`,
            );
            return;
        }

        if (paymentAmount > remainingAmount) {
            setError(
                `Số tiền không được vượt quá ${formatCurrency(remainingAmount)}.`,
            );
            return;
        }

        setLoadingPayment(true);
        setError('');

        try {
            await reportBookingPayment(booking.id, {
                amount: paymentAmount,
                ...(transactionCode.trim()
                    ? { transactionCode: transactionCode.trim() }
                    : {}),
                ...(transferContent.trim()
                    ? { transferContent: transferContent.trim() }
                    : {}),
            });

            setReported(true);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Không thể gửi thông tin thanh toán.',
            );
        } finally {
            setLoadingPayment(false);
        }
    }

    // Sao chép nội dung chuyển khoản để khách sử dụng.
    async function handleCopyContent() {
        try {
            await navigator.clipboard.writeText(transferContent);
        } catch {
            setError('Không thể sao chép nội dung chuyển khoản.');
        }
    }

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-8">
            <div className="mx-auto max-w-2xl">
                <div className="mb-7 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                        Thanh toán đặt vé
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Tra cứu booking để xem thông tin thanh toán.
                    </p>
                </div>

                <section className="mb-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-4">
                        <p className="text-xs text-gray-500">
                            Mã đặt vé
                        </p>
                        <p className="mt-1 text-lg font-bold text-red-600">
                            {bookingCode}
                        </p>
                    </div>

                    <form onSubmit={handleLookup} className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Số điện thoại người đặt
                            </label>
                            <input
                                type="tel"
                                required
                                maxLength={20}
                                value={customerPhone}
                                onChange={(event) =>
                                    setCustomerPhone(event.target.value)
                                }
                                placeholder="Nhập số điện thoại đã dùng khi đặt vé"
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loadingLookup || !customerPhone.trim()}
                            className="w-full rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                        >
                            {loadingLookup
                                ? 'Đang tra cứu...'
                                : 'Tra cứu booking'}
                        </button>
                    </form>
                </section>

                {error && (
                    <div
                        role="alert"
                        className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                        {error}
                    </div>
                )}

                {booking && (
                    <>
                        <section className="mb-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <h2 className="font-bold text-gray-900">
                                    Thông tin booking
                                </h2>

                                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                                    {booking.status}
                                </span>
                            </div>

                            <div className="mt-5 space-y-4">
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
                                        Mã đặt vé
                                    </p>
                                    <p className="mt-1 font-semibold text-gray-900">
                                        {booking.bookingCode}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                                    <div>
                                        <p className="text-xs text-gray-500">
                                            Tổng tiền
                                        </p>
                                        <p className="mt-1 font-semibold text-gray-900">
                                            {formatCurrency(booking.totalAmount)}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-500">
                                            Đã thanh toán
                                        </p>
                                        <p className="mt-1 font-semibold text-green-700">
                                            {formatCurrency(booking.paidAmount)}
                                        </p>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-4">
                                    <p className="text-xs text-gray-500">
                                        Còn phải thanh toán
                                    </p>
                                    <p className="mt-1 text-2xl font-bold text-red-600">
                                        {formatCurrency(remainingAmount)}
                                    </p>
                                </div>

                                {isInitialPayment && (
                                    <div className="rounded-xl bg-amber-50 p-4">
                                        <p className="text-xs text-amber-800">
                                            Số tiền đặt cọc tối thiểu
                                        </p>
                                        <p className="mt-1 text-lg font-bold text-amber-900">
                                            {formatCurrency(booking.depositAmount)}
                                        </p>
                                    </div>
                                )}

                                {booking.holdExpiresAt && (
                                    <div className="border-t border-gray-100 pt-4">
                                        <p className="text-xs text-gray-500">
                                            Thời hạn giữ ghế
                                        </p>
                                        <p className="mt-1 text-sm font-medium text-gray-800">
                                            {new Date(
                                                booking.holdExpiresAt,
                                            ).toLocaleString('vi-VN')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {reported ? (
                            <section className="rounded-2xl border border-green-200 bg-white p-6 text-center shadow-sm">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl text-green-700">
                                    ✓
                                </div>
                                <h2 className="mt-4 text-lg font-bold text-gray-900">
                                    Đã ghi nhận thông tin chuyển khoản
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-gray-600">
                                    Giao dịch đang chờ nhân viên Hải Định kiểm
                                    tra và xác nhận. Việc gửi thông tin chưa
                                    đồng nghĩa với việc thanh toán đã thành công.
                                </p>
                            </section>
                        ) : booking.status === 'EXPIRED' || isHoldExpired ? (
                            <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
                                <h2 className="font-bold text-red-800">
                                    Booking đã hết hạn
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-red-700">
                                    Thời gian giữ ghế đã kết thúc. Vui lòng
                                    quay lại tìm chuyến và đặt vé mới.
                                </p>
                            </section>
                        ) : booking.paymentStatus === 'PAID' ? (
                            <section className="rounded-2xl border border-green-200 bg-green-50 p-5">
                                <h2 className="font-bold text-green-800">
                                    Booking đã thanh toán đầy đủ
                                </h2>
                                <p className="mt-2 text-sm text-green-700">
                                    Hải Định đã xác nhận thanh toán cho booking này.
                                </p>
                            </section>
                        ) : booking.status === 'PAYMENT_REVIEW' ? (
                            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                                <h2 className="font-bold text-amber-900">
                                    Đang chờ xác nhận thanh toán
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-amber-800">
                                    Hải Định đã tiếp nhận thông tin chuyển khoản.
                                    Vui lòng không chuyển thêm tiền cho đến khi
                                    giao dịch hiện tại được xử lý.
                                </p>
                            </section>
                        ) : canReportPayment ? (
                            <section className="space-y-5">
                                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                                    <h2 className="font-bold text-amber-900">
                                        Hướng dẫn chuyển khoản
                                    </h2>

                                    {loadingBankInfo ? (
                                        <p className="mt-3 text-sm text-gray-600">
                                            Đang tải thông tin ngân hàng...
                                        </p>
                                    ) : bankInfo ? (
                                        <>
                                            <div className="mt-4 rounded-xl border border-amber-200 bg-white p-4">
                                                <p className="text-xs text-gray-500">Ngân hàng</p>
                                                <p className="mt-1 font-semibold text-gray-900">
                                                    {bankInfo.bankName}
                                                </p>

                                                <p className="mt-3 text-xs text-gray-500">
                                                    Số tài khoản
                                                </p>
                                                <p className="mt-1 text-lg font-bold tracking-wide text-gray-900">
                                                    {bankInfo.accountNumber}
                                                </p>

                                                <p className="mt-3 text-xs text-gray-500">
                                                    Chủ tài khoản
                                                </p>
                                                <p className="mt-1 font-semibold text-gray-900">
                                                    {bankInfo.accountName}
                                                </p>
                                            </div>

                                            <div className="mt-4 rounded-xl border border-amber-200 bg-white p-4 text-center">
                                                <p className="font-semibold text-gray-900">
                                                    Quét mã QR để chuyển khoản
                                                </p>

                                                <p className="mt-2 text-sm text-gray-600">
                                                    Số tiền: {formatCurrency(qrAmount)}
                                                </p>

                                                <img
                                                    src={qrImageUrl}
                                                    alt="Mã QR thanh toán Hải Định"
                                                    className="mx-auto mt-3 h-64 w-64 max-w-full object-contain"
                                                />

                                                <p className="mt-2 text-xs text-gray-500">
                                                    Kiểm tra đúng số tiền và nội dung trước khi xác nhận chuyển khoản.
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="mt-3 text-sm text-red-700">
                                            {bankInfoError || 'Không thể tải thông tin ngân hàng. Vui lòng liên hệ Hải Định.'}
                                        </p>
                                    )}

                                    <div className="mt-4 rounded-xl border border-amber-200 bg-white p-4">
                                        <p className="text-xs text-gray-500">
                                            Nội dung chuyển khoản
                                        </p>

                                        <div className="mt-2 flex items-center gap-2">
                                            <p className="min-w-0 flex-1 break-all text-sm font-bold text-gray-900">
                                                {transferContent}
                                            </p>

                                            <button
                                                type="button"
                                                onClick={handleCopyContent}
                                                className="shrink-0 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                            >
                                                Sao chép
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <form
                                    onSubmit={handleReportPayment}
                                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
                                >
                                    <h2 className="font-bold text-gray-900">
                                        Báo đã chuyển khoản
                                    </h2>

                                    {isAdditionalPayment && (
                                        <p className="mt-2 text-sm text-gray-500">
                                            Đây là khoản thanh toán bổ sung.
                                            Số tiền không được vượt quá số tiền
                                            còn lại.
                                        </p>
                                    )}

                                    <div className="mt-5 space-y-4">
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                                Số tiền đã chuyển (VND)
                                                <span className="text-red-600"> *</span>
                                            </label>
                                            <input
                                                type="number"
                                                min={minimumAmount}
                                                max={remainingAmount}
                                                step="1"
                                                required
                                                value={amount}
                                                onChange={(event) =>
                                                    setAmount(event.target.value)
                                                }
                                                placeholder="Nhập số tiền thực tế đã chuyển"
                                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                            />
                                            {isInitialPayment && (
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Tối thiểu {formatCurrency(booking.depositAmount)}.
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                                Mã giao dịch ngân hàng
                                            </label>
                                            <input
                                                type="text"
                                                maxLength={100}
                                                value={transactionCode}
                                                onChange={(event) =>
                                                    setTransactionCode(event.target.value)
                                                }
                                                placeholder="Nhập mã giao dịch nếu có"
                                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                                Nội dung chuyển khoản
                                            </label>
                                            <input
                                                type="text"
                                                maxLength={255}
                                                value={transferContent}
                                                onChange={(event) =>
                                                    setTransferContent(event.target.value)
                                                }
                                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loadingPayment}
                                        className="mt-6 w-full rounded-xl bg-red-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                                    >
                                        {loadingPayment
                                            ? 'Đang gửi thông tin...'
                                            : 'Gửi thông tin chuyển khoản'}
                                    </button>
                                </form>
                            </section>
                        ) : (
                            <section className="rounded-2xl border border-gray-200 bg-white p-5">
                                <h2 className="font-bold text-gray-900">
                                    Booking chưa thể thanh toán
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-gray-600">
                                    Trạng thái hiện tại: {booking.status} / {booking.paymentStatus}.
                                    Vui lòng liên hệ nhân viên Hải Định để được hỗ trợ.
                                </p>
                            </section>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}
