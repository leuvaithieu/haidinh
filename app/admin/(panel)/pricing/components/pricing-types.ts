
export type PricingMode = 'NORMAL' | 'TET';

export type TripDirection = 'OUTBOUND' | 'RETURN';

export type PricePolicyStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export type PriceEntryType = 'FIXED' | 'CONTACT';

export type PricePointType = 'ROUTE_POINT' | 'SERVICE_POINT';

// Thông tin tuyến được trả về trong danh sách chính sách giá.
export type PricingRoute = {
    id: string;
    name: string;
};

// Thông tin điểm tuyến.
export type PricingRoutePoint = {
    id: string;
    routeId: string;
    name: string;
    sequence: number;
    defaultTime?: string | null;
    travelDurationMinutes?: number | null;
};

// Thông tin điểm dịch vụ.
export type PricingServicePoint = {
    id: string;
    routePointId: string;
    name: string;
};

// Giá được cấu hình tại một RoutePoint.
export type RoutePointPrice = {
    id: string;
    policyId: string;
    routePointId: string;
    priceType: PriceEntryType;
    price: number | null;
    routePoint?: PricingRoutePoint;
};

// Giá được cấu hình tại một ServicePoint.
export type ServicePointPrice = {
    id: string;
    policyId: string;
    servicePointId: string;
    priceType: PriceEntryType;
    price: number | null;
    servicePoint?: PricingServicePoint;
};

// Giá Override cho một cặp điểm đón và trả.
export type RoutePriceOverride = {
    id: string;
    policyId: string;
    fromPointType: PricePointType;
    toPointType: PricePointType;
    fromPointKey: string;
    toPointKey: string;
    fromRoutePointId: string | null;
    fromServicePointId: string | null;
    toRoutePointId: string | null;
    toServicePointId: string | null;
    priceType: PriceEntryType;
    price: number | null;
};

// Một chính sách giá trong danh sách quản trị.
export type PricingPolicy = {
    id: string;
    routeId: string;
    route: PricingRoute;
    pricingMode: PricingMode;
    baseOriginRoutePointId: string | null;
    baseOriginRoutePoint?: PricingRoutePoint | null;
    direction: TripDirection;
    vehicleType: string | null;
    version: number;
    status: PricePolicyStatus;
    effectiveFrom: string;
    effectiveTo: string | null;
    fullRoutePrice: number | null;
    routeAdjustmentAmount: number;
    createdAt: string;
    updatedAt: string;
};

// Chi tiết chính sách giá, bao gồm các bảng giá thành phần.
export type PricingPolicyDetail = PricingPolicy & {
    route: PricingRoute & {
        routePoints: (PricingRoutePoint & {
            servicePoints: PricingServicePoint[];
        })[];
    };
    routePointPrices: RoutePointPrice[];
    servicePointPrices: ServicePointPrice[];
    priceOverrides: RoutePriceOverride[];
};

// Dữ liệu thông báo dùng chung trong module Pricing.
export type PricingToastState = {
    message: string;
    type: 'success' | 'error';
} | null;
