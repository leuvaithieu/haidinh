
/**
 * Các kiểu dữ liệu dùng chung cho module quản lý Booking.
 * Cấu trúc được đối chiếu với Prisma Schema và Booking DTO của BE.
 */

/**
 * Trạng thái xử lý booking.
 */
export type BookingStatus =
    | 'PENDING'
    | 'PAYMENT_REVIEW'
    | 'CONFIRMED'
    | 'CANCELLED'
    | 'EXPIRED';

/**
 * Trạng thái thanh toán của booking.
 */
export type PaymentStatus =
    | 'UNPAID'
    | 'PENDING'
    | 'REPORTED'
    | 'PARTIALLY_PAID'
    | 'PAID'
    | 'FAILED'
    | 'REJECTED'
    | 'REFUNDED';

/**
 * Chiều chạy của chuyến xe.
 */
export type TripDirection = 'OUTBOUND' | 'RETURN';

/**
 * Trạng thái chuyến xe.
 */
export type TripStatus =
    | 'SCHEDULED'
    | 'DEPARTED'
    | 'AT_DESTINATION'
    | 'RETURNING'
    | 'COMPLETED'
    | 'CANCELLED';

/**
 * Loại lịch trình của chuyến xe.
 */
export type RouteScheduleType = 'NORMAL' | 'TET';

/**
 * Trạng thái phân bổ ghế trên chuyến.
 */
export type SeatAllocationStatus =
    | 'HELD'
    | 'BOOKED'
    | 'RELEASED'
    | 'EXPIRED';

/**
 * Trạng thái ghế trên chuyến.
 */
export type TripSeatStatus = 'AVAILABLE' | 'HELD' | 'BOOKED';

/**
 * Loại ghế trong sơ đồ xe.
 */
export type SeatType = 'BERTH' | 'SEAT' | 'PRIVATE_ROOM' | 'OTHER';

/**
 * Thông tin tuyến xe được trả về cùng chuyến.
 */
export type BookingRoute = {
    id: string;
    name: string;
};

/**
 * Thông tin xe được trả về cùng chuyến.
 */
export type BookingVehicle = {
    id: string;
    name: string;
    licensePlate: string;
    seatCount: number;
    vehicleType: string;
};

/**
 * Thông tin chuyến xe trong booking.
 */
export type BookingTrip = {
    id: string;
    routeId: string;
    vehicleId: string;
    plannedDeparture: string;
    returnPlannedDeparture: string | null;
    plannedArrival: string | null;
    actualDeparture: string | null;
    actualArrival: string | null;
    ticketPrice: number;
    status: TripStatus;
    scheduleType: RouteScheduleType;
    createdAt: string;
    updatedAt: string;
    route: BookingRoute;
    vehicle: BookingVehicle;
};

/**
 * Thông tin ghế thuộc sơ đồ xe.
 */
export type BookingSeatInfo = {
    id: string;
    layoutId: string;
    code: string;
    label: string | null;
    type: SeatType;
    level: number;
    row: number;
    column: number;
    isActive: boolean;
};

/**
 * Thông tin ghế được gắn với chuyến xe.
 */
export type BookingTripSeat = {
    id: string;
    tripId: string;
    seatId: string;
    status: TripSeatStatus;
    holdExpiresAt: string | null;
    heldByBookingId: string | null;
    seat: BookingSeatInfo;
};

/**
 * Thông tin một lần phân bổ ghế trên một đoạn hành trình.
 */
export type BookingSeatAllocation = {
    id: string;
    tripSeatId: string;
    direction: TripDirection;
    pickupSequence: number;
    dropoffSequence: number;
    status: SeatAllocationStatus;
    holdExpiresAt: string | null;
    createdAt: string;
    updatedAt: string;
    tripSeat: BookingTripSeat;
};

/**
 * Thông tin điểm trên lịch trình thực tế của chuyến xe.
 */
export type BookingTripRoutePoint = {
    id: string;
    tripId: string;
    routePointId: string | null;
    pointName: string;
    direction: TripDirection;
    sequence: number;
    plannedTime: string;
    actualTime: string | null;
};

/**
 * Thông tin một ghế được đặt trong booking.
 */
export type BookingSeat = {
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
    priceSnapshot: unknown;
    passengerName: string | null;
    passengerPhone: string | null;
    createdAt: string;
    seatAllocation: BookingSeatAllocation;
};

/**
 * Thông tin một ghế trong API chi tiết booking.
 */
export type BookingSeatDetail = BookingSeat & {
    pickupTripRoutePoint: BookingTripRoutePoint | null;
    dropoffTripRoutePoint: BookingTripRoutePoint | null;
};

/**
 * Thông tin cơ bản của một booking.
 */
export type BookingBase = {
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
};

/**
 * Một dòng booking trong API danh sách.
 */
export type BookingListItem = BookingBase & {
    trip: BookingTrip;
    seats: BookingSeat[];
};

/**
 * Chi tiết booking trong API lấy theo ID.
 */
export type BookingDetail = BookingBase & {
    trip: BookingTrip;
    seats: BookingSeatDetail[];
};

/**
 * Tham số lọc danh sách booking theo QueryBookingDto của BE.
 */
export type BookingFilters = {
    page: number;
    limit: number;
    tripId: string;
    customerPhone: string;
    bookingCode: string;
    status: BookingStatus | '';
    paymentStatus: PaymentStatus | '';
};

/**
 * Cấu trúc phân trang do BookingService trả về.
 */
export type BookingPagination = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

/**
 * Response API danh sách booking.
 */
export type BookingListResponse = {
    data: BookingListItem[];
    pagination: BookingPagination;
};

/**
 * Dữ liệu một ghế khi tạo booking.
 */
export type CreateBookingSeatPayload = {
    seatId: string;
    pickupTripRoutePointId: string;
    dropoffTripRoutePointId: string;
    pickupServicePointId?: string;
    dropoffServicePointId?: string;
    passengerName?: string;
    passengerPhone?: string;
};

/**
 * Payload tạo booking theo CreateBookingDto của BE.
 */
export type CreateBookingPayload = {
    tripId: string;
    direction: TripDirection;
    customerId?: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    seats: CreateBookingSeatPayload[];
};

/**
 * Kết quả API hủy booking.
 */
export type CancelBookingResponse = {
    message: string;
    bookingId: string;
    status: 'CANCELLED';
};

/**
 * Kiểu dữ liệu thông báo trên giao diện Booking.
 */
export type BookingToast = {
    message: string;
    type: 'success' | 'error';
} | null;

/**
 * Props của component bộ lọc booking.
 */
export type BookingFiltersProps = {
    filters: BookingFilters;
    onChange: (filters: BookingFilters) => void;
    onSearch: () => void;
    onReset: () => void;
};

/**
 * Props của component danh sách booking.
 */
export type BookingListProps = {
    bookings: BookingListItem[];
    loading: boolean;
    pagination: BookingPagination;
    onView: (booking: BookingListItem) => void;
    onCancel: (booking: BookingListItem) => void;
    canCancelBooking: (booking: BookingListItem) => boolean;
    onPageChange: (page: number) => void;
};

/**
 * Props của component hiển thị trạng thái booking và thanh toán.
 */
export type BookingStatusBadgeProps = {
    status: BookingStatus | PaymentStatus;
    type: 'booking' | 'payment';
};

/**
 * Props của modal chi tiết booking.
 */
export type BookingDetailModalProps = {
    booking: BookingDetail | null;
    open: boolean;
    onClose: () => void;
};

/**
 * Props của hộp thoại xác nhận hủy booking.
 */
export type CancelBookingDialogProps = {
    booking: BookingListItem | null;
    isOpen: boolean;
    isSubmitting: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};
