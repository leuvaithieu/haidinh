
/**
 * Các kiểu dữ liệu dùng chung cho module quản lý chặng tuyến.
 */

/**
 * Loại lịch trình áp dụng cho chặng tuyến.
 */
export type RouteSegmentScheduleType = 'NORMAL' | 'TET';

/**
 * Lựa chọn bộ lọc loại lịch trình trên giao diện.
 */
export type RouteSegmentScheduleFilter =
    | 'ALL'
    | RouteSegmentScheduleType;

/**
 * Thông tin một điểm thuộc tuyến xe.
 */
export type RoutePoint = {
    id: string;
    routeId: string;
    name: string;
    sequence: number;
};

/**
 * Thông tin tuyến xe và danh sách các điểm theo thứ tự.
 */
export type Route = {
    id: string;
    name: string;
    routePoints: RoutePoint[];
};

/**
 * Thông tin một chặng di chuyển giữa hai điểm trên tuyến.
 */
export type RouteSegment = {
    id: string;
    routeId: string;
    fromRoutePointId: string;
    toRoutePointId: string;
    travelDurationMinutes: number;
    scheduleType: RouteSegmentScheduleType;
    fromRoutePoint: RoutePoint;
    toRoutePoint: RoutePoint;
};

/**
 * Dữ liệu gửi lên BE khi tạo hoặc cập nhật chặng tuyến.
 */
export type RouteSegmentPayload = {
    routeId: string;
    fromRoutePointId: string;
    toRoutePointId: string;
    travelDurationMinutes: number;
    scheduleType: RouteSegmentScheduleType;
};

/**
 * Thông tin thông báo kết quả thao tác trên giao diện.
 */
export type RouteSegmentToast = {
    message: string;
    type: 'success' | 'error';
} | null;

/**
 * Props của component danh sách chặng tuyến.
 */
export type RouteSegmentListProps = {
    segments: RouteSegment[];
    isLoading: boolean;
    userRole: string;
    onEdit: (segment: RouteSegment) => void;
    onDelete: (segment: RouteSegment) => void;
};

/**
 * Props của component biểu mẫu thêm và chỉnh sửa chặng tuyến.
 */
export type RouteSegmentFormProps = {
    route: Route;
    segment?: RouteSegment;
    onSuccess: (message: string) => void | Promise<void>;
    onCancel: () => void;
};
