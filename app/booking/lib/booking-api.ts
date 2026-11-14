
import { apiFetch } from '@/lib/api';

import type {
    PublishedRoute,
    PublicTripSearchParams,
    PublicTripSearchResult,
    PublicTripSeatsResponse,
    PublicPriceQuoteResponse,
} from '../types/booking-types';


// Đọc thông báo lỗi từ API và trả về nội dung phù hợp để hiển thị.
async function getApiErrorMessage(
    response: Response,
    fallbackMessage: string,
): Promise<string> {
    const data = await response.json().catch(() => null);

    if (Array.isArray(data?.message)) {
        return data.message.join(', ');
    }

    return data?.message || fallbackMessage;
}

// Lấy danh sách tuyến đường đã được công khai trên website.
export async function getPublishedRoutes(): Promise<PublishedRoute[]> {
    const response = await apiFetch('/routes/website/published');

    if (!response.ok) {
        throw new Error(
            await getApiErrorMessage(
                response,
                'Không thể tải danh sách tuyến đường',
            ),
        );
    }

    const data: PublishedRoute[] = await response.json();

    if (!Array.isArray(data)) {
        throw new Error('Dữ liệu tuyến đường trả về không hợp lệ');
    }

    return data;
}

// Tìm các chuyến xe theo điểm đón, điểm trả, ngày đi và chiều di chuyển.
export async function searchPublicTrips(
    params: PublicTripSearchParams,
): Promise<PublicTripSearchResult[]> {
    const query = new URLSearchParams({
        fromRoutePointId: params.fromRoutePointId,
        toRoutePointId: params.toRoutePointId,
        date: params.date,
        direction: params.direction,
    });

    const response = await apiFetch(
        `/trips/public/search?${query.toString()}`,
    );

    if (!response.ok) {
        throw new Error(
            await getApiErrorMessage(
                response,
                'Không thể tìm chuyến xe',
            ),
        );
    }

    const data: PublicTripSearchResult[] = await response.json();

    if (!Array.isArray(data)) {
        throw new Error('Dữ liệu chuyến xe trả về không hợp lệ');
    }

    return data;
}

type PublicTripSeatsParams = {
    direction: 'OUTBOUND' | 'RETURN';
    pickupTripRoutePointId: string;
    dropoffTripRoutePointId: string;
};

type PublicPriceQuoteParams = PublicTripSeatsParams & {
    tripId: string;
    pickupServicePointId?: string;
    dropoffServicePointId?: string;
};

// Lấy sơ đồ ghế và trạng thái ghế theo đoạn đường khách lựa chọn.
export async function getPublicTripSeats(
    tripId: string,
    params: PublicTripSeatsParams,
): Promise<PublicTripSeatsResponse> {
    const query = new URLSearchParams({
        direction: params.direction,
        pickupTripRoutePointId: params.pickupTripRoutePointId,
        dropoffTripRoutePointId: params.dropoffTripRoutePointId,
    });

    const response = await apiFetch(
        `/trips/public/${encodeURIComponent(tripId)}/seats?${query.toString()}`,
    );

    if (!response.ok) {
        throw new Error(
            await getApiErrorMessage(
                response,
                'Không thể tải sơ đồ ghế',
            ),
        );
    }

    const data: PublicTripSeatsResponse = await response.json();

    if (!Array.isArray(data.seats) || !data.layout) {
        throw new Error('Dữ liệu sơ đồ ghế trả về không hợp lệ');
    }

    return data;
}

// Tính giá vé theo chuyến xe, chiều đi và các điểm đón trả đã chọn.
export async function getPublicPriceQuote(
    params: PublicPriceQuoteParams,
): Promise<PublicPriceQuoteResponse> {
    const query = new URLSearchParams({
        tripId: params.tripId,
        direction: params.direction,
        pickupTripRoutePointId: params.pickupTripRoutePointId,
        dropoffTripRoutePointId: params.dropoffTripRoutePointId,
    });

    if (params.pickupServicePointId) {
        query.set('pickupServicePointId', params.pickupServicePointId);
    }

    if (params.dropoffServicePointId) {
        query.set('dropoffServicePointId', params.dropoffServicePointId);
    }

    const response = await apiFetch(
        `/pricing/public/quote?${query.toString()}`,
    );

    if (!response.ok) {
        throw new Error(
            await getApiErrorMessage(
                response,
                'Không thể tính giá vé',
            ),
        );
    }

    const data: PublicPriceQuoteResponse = await response.json();

    if (
        data.priceSource !== 'CONTACT' &&
        typeof data.finalPrice !== 'number'
    ) {
        throw new Error('Dữ liệu giá vé trả về không hợp lệ');
    }

    return data;
}

export type CreatePublicBookingParams = {
    tripId: string;
    direction: 'OUTBOUND' | 'RETURN';
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    seats: {
        seatId: string;
        pickupTripRoutePointId: string;
        dropoffTripRoutePointId: string;
        pickupServicePointId?: string;
        dropoffServicePointId?: string;
        passengerName?: string;
        passengerPhone?: string;
    }[];
};

export type CreatePublicBookingResponse = {
    message: string;
    booking: {
        id: string;
        bookingCode: string;
        tripId: string;
        direction: 'OUTBOUND' | 'RETURN';
        customerName: string;
        customerPhone: string;
        seats: {
            bookingSeatId: string;
            seatId: string;
            pickupSequence: number;
            dropoffSequence: number;
            price: number;
        }[];
        totalAmount: number;
        depositAmount: number;
        status: string;
        paymentStatus: string;
        holdExpiresAt: string;
    };
};

// Tạo booking công khai và giữ các ghế khách đã chọn.
export async function createPublicBooking(
    params: CreatePublicBookingParams,
): Promise<CreatePublicBookingResponse> {
    const response = await apiFetch('/bookings', {
        method: 'POST',
        body: JSON.stringify(params),
    });

    if (!response.ok) {
        throw new Error(
            await getApiErrorMessage(
                response,
                'Không thể tạo yêu cầu đặt vé',
            ),
        );
    }

    const data: CreatePublicBookingResponse = await response.json();

    if (!data.booking?.id || !data.booking?.bookingCode) {
        throw new Error('Dữ liệu booking trả về không hợp lệ');
    }

    return data;
}

export type ReportBookingPaymentParams = {
    amount: number;
    transactionCode?: string;
    transferContent?: string;
};

export type ReportBookingPaymentResponse = {
    message: string;
    payment: {
        id: string;
        bookingId: string;
        amount: number;
        method: string;
        status: string;
        transactionCode: string | null;
        transferContent: string | null;
        reportedAt: string | null;
    };
};

// Gửi thông tin khách đã chuyển khoản để nhân viên kiểm tra và xác nhận.
export async function reportBookingPayment(
    bookingId: string,
    params: ReportBookingPaymentParams,
): Promise<ReportBookingPaymentResponse> {
    if (!Number.isInteger(params.amount) || params.amount <= 0) {
        throw new Error('Số tiền chuyển khoản phải là số nguyên lớn hơn 0.');
    }

    const response = await apiFetch(
        `/payments/bookings/${encodeURIComponent(bookingId)}/report`,
        {
            method: 'POST',
            body: JSON.stringify(params),
        },
    );

    if (!response.ok) {
        throw new Error(
            await getApiErrorMessage(
                response,
                'Không thể gửi thông tin chuyển khoản.',
            ),
        );
    }

    const data: ReportBookingPaymentResponse = await response.json();

    if (!data.payment?.id) {
        throw new Error('Dữ liệu giao dịch trả về không hợp lệ.');
    }

    return data;
}

export type PublicBookingLookupResponse = {
    id: string;
    bookingCode: string;
    customerName: string;
    customerPhone: string;
    totalAmount: number;
    depositAmount: number;
    paidAmount: number;
    status: string;
    paymentStatus: string;
    holdExpiresAt: string | null;
};

// Tra cứu booking công khai bằng mã đặt vé và số điện thoại người đặt.
export async function lookupPublicBooking(
    bookingCode: string,
    customerPhone: string,
): Promise<PublicBookingLookupResponse> {
    const query = new URLSearchParams({
        bookingCode,
        customerPhone,
    });

    const response = await apiFetch(
        `/bookings/public/lookup?${query.toString()}`,
    );

    if (!response.ok) {
        throw new Error(
            await getApiErrorMessage(
                response,
                'Không tìm thấy thông tin đặt vé.',
            ),
        );
    }

    const data: PublicBookingLookupResponse = await response.json();

    if (!data.id || !data.bookingCode) {
        throw new Error('Thông tin booking trả về không hợp lệ.');
    }

    return data;
}

export type PublicBankInfo = {
    bankName: string;
    bankCode: string;
    accountNumber: string;
    accountName: string;
};

// Lấy thông tin tài khoản ngân hàng công khai để khách chuyển khoản.
export async function getPublicBankInfo(): Promise<PublicBankInfo> {
    const response = await apiFetch('/payments/bank-info');

    if (!response.ok) {
        throw new Error(
            await getApiErrorMessage(
                response,
                'Không thể tải thông tin tài khoản ngân hàng.',
            ),
        );
    }

    const data: PublicBankInfo = await response.json();

    if (!data.bankCode || !data.accountNumber || !data.accountName) {
        throw new Error(
            'Thông tin tài khoản ngân hàng chưa được cấu hình đầy đủ.',
        );
    }

    return data;
}
