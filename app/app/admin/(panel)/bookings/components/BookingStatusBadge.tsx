
'use client';

import type {
    BookingStatus,
    PaymentStatus,
    BookingStatusBadgeProps,
} from './booking-types';

type BadgeConfig = {
    label: string;
    className: string;
};

const BOOKING_STATUS_CONFIG: Record<BookingStatus, BadgeConfig> = {
    PENDING: {
        label: 'Đang giữ chỗ',
        className: 'bg-amber-100 text-amber-700 ring-amber-200',
    },
    PAYMENT_REVIEW: {
        label: 'Chờ kiểm tra thanh toán',
        className: 'bg-blue-100 text-blue-700 ring-blue-200',
    },
    CONFIRMED: {
        label: 'Đã xác nhận',
        className: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
    },
    CANCELLED: {
        label: 'Đã hủy',
        className: 'bg-red-100 text-red-700 ring-red-200',
    },
    EXPIRED: {
        label: 'Hết hạn',
        className: 'bg-slate-100 text-slate-600 ring-slate-200',
    },
};

const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, BadgeConfig> = {
    UNPAID: {
        label: 'Chưa thanh toán',
        className: 'bg-slate-100 text-slate-700 ring-slate-200',
    },
    PENDING: {
        label: 'Chờ thanh toán',
        className: 'bg-amber-100 text-amber-700 ring-amber-200',
    },
    REPORTED: {
        label: 'Đã báo thanh toán',
        className: 'bg-blue-100 text-blue-700 ring-blue-200',
    },
    PARTIALLY_PAID: {
        label: 'Thanh toán một phần',
        className: 'bg-orange-100 text-orange-700 ring-orange-200',
    },
    PAID: {
        label: 'Đã thanh toán',
        className: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
    },
    FAILED: {
        label: 'Thanh toán thất bại',
        className: 'bg-red-100 text-red-700 ring-red-200',
    },
    REJECTED: {
        label: 'Bị từ chối',
        className: 'bg-rose-100 text-rose-700 ring-rose-200',
    },
    REFUNDED: {
        label: 'Đã hoàn tiền',
        className: 'bg-purple-100 text-purple-700 ring-purple-200',
    },
};

export default function BookingStatusBadge({
    status,
    type,
}: BookingStatusBadgeProps) {
    // Lấy cấu hình hiển thị tương ứng với loại và trạng thái được truyền vào.
    function getBadgeConfig(): BadgeConfig {
        if (type === 'booking') {
            return BOOKING_STATUS_CONFIG[status as BookingStatus] ?? {
                label: status,
                className: 'bg-slate-100 text-slate-600 ring-slate-200',
            };
        }

        return PAYMENT_STATUS_CONFIG[status as PaymentStatus] ?? {
            label: status,
            className: 'bg-slate-100 text-slate-600 ring-slate-200',
        };
    }

    const config = getBadgeConfig();

    return (
        <span
            className={`inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${config.className}`}
            title={config.label}
        >
            <span className="truncate">{config.label}</span>
        </span>
    );
}
