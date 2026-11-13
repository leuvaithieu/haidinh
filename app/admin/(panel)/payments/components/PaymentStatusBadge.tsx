
import {
    PaymentStatusBadgeProps,
    PaymentStatus,
} from './payment-types';

// Ánh xạ trạng thái thanh toán sang nhãn tiếng Việt và màu hiển thị.
const PAYMENT_STATUS_CONFIG: Record<
    PaymentStatus,
    { label: string; className: string }
> = {
    UNPAID: {
        label: 'Chưa thanh toán',
        className: 'bg-gray-100 text-gray-700',
    },
    PENDING: {
        label: 'Chờ thanh toán',
        className: 'bg-yellow-100 text-yellow-800',
    },
    REPORTED: {
        label: 'Chờ xác nhận',
        className: 'bg-blue-100 text-blue-800',
    },
    PARTIALLY_PAID: {
        label: 'Thanh toán một phần',
        className: 'bg-orange-100 text-orange-800',
    },
    PAID: {
        label: 'Đã thanh toán',
        className: 'bg-green-100 text-green-800',
    },
    FAILED: {
        label: 'Thanh toán thất bại',
        className: 'bg-red-100 text-red-800',
    },
    REJECTED: {
        label: 'Đã từ chối',
        className: 'bg-red-100 text-red-800',
    },
    REFUNDED: {
        label: 'Đã hoàn tiền',
        className: 'bg-purple-100 text-purple-800',
    },
};

// Hiển thị badge trạng thái thanh toán theo cấu hình tương ứng.
export default function PaymentStatusBadge({
    status,
}: PaymentStatusBadgeProps) {
    const config = PAYMENT_STATUS_CONFIG[status];

    return (
        <span
            className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}
        >
            {config.label}
        </span>
    );
}
