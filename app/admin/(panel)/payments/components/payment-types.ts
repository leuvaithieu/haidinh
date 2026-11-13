
/**
 * Các kiểu dữ liệu dùng chung cho module quản lý thanh toán.
 * Cấu trúc được xây dựng theo response thực tế của PaymentService.
 */

// Trạng thái giao dịch thanh toán.
export type PaymentStatus =
    | 'UNPAID'
    | 'PENDING'
    | 'REPORTED'
    | 'PARTIALLY_PAID'
    | 'PAID'
    | 'FAILED'
    | 'REJECTED'
    | 'REFUNDED';

// Phương thức thanh toán hiện được hỗ trợ.
export type PaymentMethod = 'BANK_TRANSFER';

// Trạng thái booking.
export type BookingStatus =
    | 'PENDING'
    | 'PAYMENT_REVIEW'
    | 'CONFIRMED'
    | 'CANCELLED'
    | 'EXPIRED';

// Chiều di chuyển của chuyến xe.
export type TripDirection = 'OUTBOUND' | 'RETURN';

// Thông tin tuyến đường.
export type PaymentRoute = {
    id: string;
    name: string;
};

// Thông tin xe.
export type PaymentVehicle = {
    id: string;
    name: string;
    licensePlate: string;
    seatCount: number;
    vehicleType: string;
};

// Thông tin ghế trên xe.
export type PaymentSeat = {
    id: string;
    code: string;
    label: string | null;
    type: string;
    level: number;
};

// Thông tin ghế được phân bổ trên chuyến.
export type PaymentTripSeat = {
    id: string;
    tripId: string;
    seatId: string;
    seat?: PaymentSeat;
};

// Thông tin phân bổ ghế theo từng đoạn đường.
export type PaymentSeatAllocation = {
    id: string;
    tripSeatId: string;
    direction: TripDirection;
    pickupSequence: number;
    dropoffSequence: number;
    status: 'HELD' | 'BOOKED' | 'RELEASED' | 'EXPIRED';
    holdExpiresAt: string | null;
    tripSeat?: PaymentTripSeat;
};

// Thông tin điểm trên lịch trình chuyến.
export type PaymentTripRoutePoint = {
    id: string;
    tripId: string;
    routePointId: string | null;
    pointName: string;
    direction: TripDirection;
    sequence: number;
    plannedTime: string | null;
    actualTime: string | null;
};

// Thông tin ghế trong booking.
export type PaymentBookingSeat = {
    id: string;
    bookingId: string;
    seatAllocationId: string;
    price: number;
    pickupRoutePointId: string | null;
    dropoffRoutePointId: string | null;
    pickupServicePointId: string | null;
    dropoffServicePointId: string | null;
    pickupTripRoutePointId: string | null;
    dropoffTripRoutePointId: string | null;
    pricePolicyId: string | null;
    priceSnapshot: Record<string, unknown> | null;
    passengerName: string | null;
    passengerPhone: string | null;
    createdAt: string;

    seatAllocation?: PaymentSeatAllocation;
    pickupTripRoutePoint?: PaymentTripRoutePoint | null;
    dropoffTripRoutePoint?: PaymentTripRoutePoint | null;
};

// Thông tin chuyến xe trong booking.
export type PaymentTrip = {
    id: string;
    routeId: string;
    vehicleId: string;
    plannedDeparture: string;
    plannedArrival: string;
    actualDeparture?: string | null;
    actualArrival?: string | null;
    status: string;
    scheduleType: string;
    route?: PaymentRoute;
    vehicle?: PaymentVehicle;
};

// Thông tin booking gắn với giao dịch.
export type PaymentBooking = {
    id: string;
    bookingCode: string;
    customerId: string | null;
    tripId: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string | null;
    status: BookingStatus;
    paymentStatus: PaymentStatus;
    direction: TripDirection;
    totalAmount: number;
    depositAmount: number;
    paidAmount: number;
    holdExpiresAt: string | null;
    createdAt: string;
    updatedAt: string;

    trip: PaymentTrip;
    seats: PaymentBookingSeat[];
};

// Thông tin cơ bản của một giao dịch.
export type PaymentBase = {
    id: string;
    bookingId: string;
    amount: number;
    method: PaymentMethod;
    status: PaymentStatus;
    transactionCode: string | null;
    transferContent: string | null;
    reportedAt: string | null;
    confirmedAt: string | null;
    confirmedById: string | null;
    rejectionReason: string | null;
    createdAt: string;
    updatedAt: string;
    booking: PaymentBooking;
};

// Giao dịch trong danh sách chờ xác nhận.
export type PaymentListItem = PaymentBase & {
    isOverdue: boolean;
    elapsedMinutes: number | null;
    reviewTimeoutMinutes: number;
};

// Response API GET /payments/reported.
export type PaymentListResponse = PaymentListItem[];

// Giao dịch trong màn hình xem chi tiết.
export type PaymentDetail = PaymentBase;

// Payload xác nhận thanh toán.
export type ConfirmPaymentResponse = {
    message: string;
    paymentId: string;
    bookingId: string;
    paidAmount: number;
    remainingAmount: number;
    paymentStatus: PaymentStatus;
    bookingStatus: BookingStatus;
};

// Payload từ chối thanh toán.
export type RejectPaymentPayload = {
    rejectionReason: string;
};

// Response API từ chối thanh toán.
export type RejectPaymentResponse = {
    message: string;
    paymentId: string;
    bookingId: string;
    paymentStatus: PaymentStatus;
    bookingStatus: BookingStatus;
    bookingPaymentStatus: PaymentStatus;
    rejectionReason: string;
    holdExpiresAt: string | null;
};

// Props hiển thị trạng thái thanh toán.
export type PaymentStatusBadgeProps = {
    status: PaymentStatus;
};

// Props của danh sách giao dịch.
export type PaymentListProps = {
    payments: PaymentListItem[];
    loading: boolean;
    onView: (payment: PaymentListItem) => void;
    onConfirm: (payment: PaymentListItem) => void;
    onReject: (payment: PaymentListItem) => void;
};

// Props của modal chi tiết giao dịch.
export type PaymentDetailModalProps = {
    payment: PaymentDetail | null;
    open: boolean;
    onClose: () => void;
};

// Props của modal xác nhận thanh toán.
export type ConfirmPaymentModalProps = {
    payment: PaymentListItem | null;
    open: boolean;
    loading: boolean;
    onConfirm: () => void;
    onClose: () => void;
};

// Props của modal từ chối thanh toán.
export type RejectPaymentModalProps = {
    payment: PaymentListItem | null;
    open: boolean;
    loading: boolean;
    onReject: (payload: RejectPaymentPayload) => void;
    onClose: () => void;
};

// Kiểu dữ liệu Toast dùng trong module thanh toán.
export type PaymentToastType = 'success' | 'error';
