
'use client';

import type {
    BookingFilters,
    BookingFiltersProps,
    BookingStatus,
    PaymentStatus,
} from './booking-types';

const BOOKING_STATUS_OPTIONS: {
    value: BookingStatus;
    label: string;
}[] = [
    { value: 'PENDING', label: 'Đang giữ chỗ' },
    { value: 'PAYMENT_REVIEW', label: 'Chờ kiểm tra thanh toán' },
    { value: 'CONFIRMED', label: 'Đã xác nhận' },
    { value: 'CANCELLED', label: 'Đã hủy' },
    { value: 'EXPIRED', label: 'Hết hạn' },
];

const PAYMENT_STATUS_OPTIONS: {
    value: PaymentStatus;
    label: string;
}[] = [
    { value: 'UNPAID', label: 'Chưa thanh toán' },
    { value: 'PENDING', label: 'Chờ thanh toán' },
    { value: 'REPORTED', label: 'Đã báo thanh toán' },
    { value: 'PARTIALLY_PAID', label: 'Thanh toán một phần' },
    { value: 'PAID', label: 'Đã thanh toán' },
    { value: 'FAILED', label: 'Thanh toán thất bại' },
    { value: 'REJECTED', label: 'Thanh toán bị từ chối' },
    { value: 'REFUNDED', label: 'Đã hoàn tiền' },
];

export default function BookingFiltersPanel({
    filters,
    onChange,
    onSearch,
    onReset,
}: BookingFiltersProps) {
    // Cập nhật một trường bộ lọc và giữ nguyên các điều kiện còn lại.
    function updateFilter<K extends keyof BookingFilters>(
        key: K,
        value: BookingFilters[K],
    ) {
        onChange({
            ...filters,
            [key]: value,
        });
    }

    // Xử lý gửi tìm kiếm khi người dùng nhấn Enter trong ô nhập liệu.
    function handleKeyDown(
        event: React.KeyboardEvent<HTMLInputElement>,
    ) {
        if (event.key === 'Enter') {
            event.preventDefault();
            onSearch();
        }
    }

    // Kiểm tra xem người dùng có đang sử dụng điều kiện lọc hay không.
    function hasActiveFilters() {
        return Boolean(
            filters.tripId ||
                filters.customerPhone ||
                filters.bookingCode ||
                filters.status ||
                filters.paymentStatus,
        );
    }

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-base font-semibold text-slate-900">
                        Tìm kiếm và bộ lọc
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Tìm booking theo thông tin khách hàng, chuyến xe và
                        trạng thái
                    </p>
                </div>

                {hasActiveFilters() && (
                    <span className="text-xs font-medium text-red-600">
                        Đang áp dụng bộ lọc
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {/* Mã booking */}
                <div>
                    <label
                        htmlFor="booking-code-filter"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Mã booking
                    </label>

                    <input
                        id="booking-code-filter"
                        type="text"
                        value={filters.bookingCode}
                        onChange={(event) =>
                            updateFilter('bookingCode', event.target.value)
                        }
                        onKeyDown={handleKeyDown}
                        placeholder="Nhập mã booking"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    />
                </div>

                {/* Số điện thoại khách hàng */}
                <div>
                    <label
                        htmlFor="customer-phone-filter"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Số điện thoại
                    </label>

                    <input
                        id="customer-phone-filter"
                        type="tel"
                        inputMode="tel"
                        value={filters.customerPhone}
                        onChange={(event) =>
                            updateFilter(
                                'customerPhone',
                                event.target.value,
                            )
                        }
                        onKeyDown={handleKeyDown}
                        placeholder="Nhập số điện thoại"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    />
                </div>

                {/* ID chuyến xe */}
                <div>
                    <label
                        htmlFor="trip-id-filter"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        ID chuyến xe
                    </label>

                    <input
                        id="trip-id-filter"
                        type="text"
                        value={filters.tripId}
                        onChange={(event) =>
                            updateFilter('tripId', event.target.value)
                        }
                        onKeyDown={handleKeyDown}
                        placeholder="Nhập ID chuyến xe"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    />
                </div>

                {/* Trạng thái booking */}
                <div>
                    <label
                        htmlFor="booking-status-filter"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Trạng thái booking
                    </label>

                    <select
                        id="booking-status-filter"
                        value={filters.status}
                        onChange={(event) =>
                            updateFilter(
                                'status',
                                event.target.value as BookingStatus | '',
                            )
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    >
                        <option value="">Tất cả trạng thái</option>

                        {BOOKING_STATUS_OPTIONS.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Trạng thái thanh toán */}
                <div>
                    <label
                        htmlFor="payment-status-filter"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Trạng thái thanh toán
                    </label>

                    <select
                        id="payment-status-filter"
                        value={filters.paymentStatus}
                        onChange={(event) =>
                            updateFilter(
                                'paymentStatus',
                                event.target.value as PaymentStatus | '',
                            )
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    >
                        <option value="">Tất cả trạng thái</option>

                        {PAYMENT_STATUS_OPTIONS.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Nút tìm kiếm và đặt lại bộ lọc */}
            <div className="mt-5 flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-end">
                <button
                    type="button"
                    onClick={onReset}
                    disabled={!hasActiveFilters()}
                    className="w-full rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                >
                    Đặt lại
                </button>

                <button
                    type="button"
                    onClick={onSearch}
                    className="w-full rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 active:bg-red-800 sm:w-auto"
                >
                    Tìm kiếm booking
                </button>
            </div>
        </section>
    );
}
