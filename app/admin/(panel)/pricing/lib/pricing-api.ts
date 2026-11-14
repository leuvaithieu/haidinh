
import { apiFetch } from '@/lib/api';

import type {
    PricingPolicy,
    PricingPolicyDetail,
    PricingMode,
    TripDirection,
    PriceEntryType,
    PricePointType,
} from '../components/pricing-types';

// Dữ liệu giá tại một RoutePoint gửi lên BE.
export type RoutePointPricePayload = {
    routePointId: string;
    priceType: PriceEntryType;
    price?: number | null;
};

// Dữ liệu giá tại một ServicePoint gửi lên BE.
export type ServicePointPricePayload = {
    servicePointId: string;
    priceType: PriceEntryType;
    price?: number | null;
};

// Dữ liệu giá Override cho một cặp điểm gửi lên BE.
export type RoutePriceOverridePayload = {
    fromPointType: PricePointType;
    toPointType: PricePointType;
    fromPointKey: string;
    toPointKey: string;
    fromRoutePointId?: string;
    fromServicePointId?: string;
    toRoutePointId?: string;
    toServicePointId?: string;
    priceType: PriceEntryType;
    price?: number | null;
};

// Dữ liệu tạo hoặc cập nhật chính sách giá.
export type PricingPolicyPayload = {
    routeId: string;
    pricingMode: PricingMode;
    baseOriginRoutePointId?: string | null;
    direction: TripDirection;
    vehicleType?: string | null;
    version: number;
    effectiveFrom: string;
    effectiveTo?: string | null;
    fullRoutePrice?: number | null;
    routeAdjustmentAmount?: number;
    routePointPrices?: RoutePointPricePayload[];
    servicePointPrices?: ServicePointPricePayload[];
    priceOverrides?: RoutePriceOverridePayload[];
};

// Xử lý response từ BE và trả về dữ liệu hoặc thông báo lỗi.
async function handlePricingResponse<T>(
    response: Response,
): Promise<T> {
    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const message = Array.isArray(data?.message)
            ? data.message.join(', ')
            : data?.message || 'Đã xảy ra lỗi khi xử lý chính sách giá';

        throw new Error(message);
    }

    return data as T;
}

// Lấy danh sách tất cả chính sách giá.
export async function getPricingPolicies(): Promise<PricingPolicy[]> {
    const response = await apiFetch('/pricing');

    return handlePricingResponse<PricingPolicy[]>(response);
}

// Lấy chi tiết một chính sách giá theo ID.
export async function getPricingPolicy(
    id: string,
): Promise<PricingPolicyDetail> {
    const response = await apiFetch(`/pricing/${id}`);

    return handlePricingResponse<PricingPolicyDetail>(response);
}

// Tạo chính sách giá mới ở trạng thái DRAFT.
export async function createPricingPolicy(
    payload: PricingPolicyPayload,
): Promise<PricingPolicy> {
    const response = await apiFetch('/pricing', {
        method: 'POST',
        body: JSON.stringify(payload),
    });

    return handlePricingResponse<PricingPolicy>(response);
}

// Cập nhật chính sách giá đang ở trạng thái DRAFT.
export async function updatePricingPolicy(
    id: string,
    payload: Partial<PricingPolicyPayload>,
): Promise<PricingPolicy> {
    const response = await apiFetch(`/pricing/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
    });

    return handlePricingResponse<PricingPolicy>(response);
}

// Kích hoạt một chính sách giá DRAFT.
export async function activatePricingPolicy(
    id: string,
): Promise<PricingPolicy> {
    const response = await apiFetch(`/pricing/${id}/activate`, {
        method: 'PATCH',
    });

    return handlePricingResponse<PricingPolicy>(response);
}

// Lưu trữ một chính sách giá.
export async function archivePricingPolicy(
    id: string,
): Promise<PricingPolicy> {
    const response = await apiFetch(`/pricing/${id}/archive`, {
        method: 'PATCH',
    });

    return handlePricingResponse<PricingPolicy>(response);
}
