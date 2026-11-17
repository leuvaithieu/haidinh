
export type SeatType =
    | 'BERTH'
    | 'SEAT'
    | 'PRIVATE_ROOM'
    | 'OTHER';

export type SeatLayoutStatus =
    | 'DRAFT'
    | 'ACTIVE'
    | 'ARCHIVED';

// Thông tin xe được Backend trả về khi lấy danh sách sơ đồ.
export type VehicleOption = {
    id: string;
    name: string;
    licensePlate: string;
    seatCount: number;
    vehicleType: string;
    status: 'ACTIVE' | 'INACTIVE';
};

// Thông tin một ghế trong sơ đồ.
export type Seat = {
    id: string;
    layoutId: string;
    code: string;
    label: string | null;
    type: SeatType;
    level: number;
    row: number;
    column: number;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
};

// Thông tin sơ đồ ghế và các quan hệ liên quan.
export type SeatLayout = {
    id: string;
    name: string;
    description: string | null;
    status: SeatLayoutStatus;
    isTemplate: boolean;

    vehicleId: string | null;
    vehicle: VehicleOption | null;

    copiedFromId: string | null;
    copiedFrom?: {
        id: string;
        name: string;
    } | null;

    seats?: Seat[];

    _count?: {
        seats: number;
    };

    createdAt: string;
    updatedAt: string;
};

// Dữ liệu thông báo dùng chung trong module.
export type ToastData = {
    message: string;
    type: 'success' | 'error';
};
