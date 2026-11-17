import { apiFetch } from '@/lib/api';

export type BookingSettings = {
    onlineBookingEnabled: boolean;
    bookingHoldMinutes: number;
    minDepositAmount: number;
};

export type PaymentSettings = {
    transferEnabled: boolean;
    bankName: string;
    bankCode: string;
    bankShortName: string;
    bankAccountNumber: string;
    bankAccountName: string;
    transferContent: string;
    paymentReviewTimeoutMinutes: number;
};

// Đọc lỗi trả về từ API Settings.
async function getSettingsError(
    response: Response,
    fallback: string,
): Promise<string> {
    const data = await response.json().catch(() => null);

    return Array.isArray(data?.message)
        ? data.message.join(', ')
        : data?.message || fallback;
}

// Lấy cấu hình đặt vé từ backend.
export async function getBookingSettings(): Promise<BookingSettings> {
    const response = await apiFetch('/settings/booking');

    if (!response.ok) {
        throw new Error(
            await getSettingsError(
                response,
                'Không thể tải cài đặt đặt vé.',
            ),
        );
    }

    return response.json();
}

// Cập nhật toàn bộ cấu hình đặt vé lên backend.
export async function updateBookingSettings(
    data: BookingSettings,
): Promise<void> {
    const response = await apiFetch('/settings/booking', {
        method: 'PATCH',
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(
            await getSettingsError(
                response,
                'Không thể cập nhật cài đặt đặt vé.',
            ),
        );
    }
}

// Lấy cấu hình thanh toán từ backend.
export async function getPaymentSettings(): Promise<PaymentSettings> {
    const response = await apiFetch('/settings/payment');

    if (!response.ok) {
        throw new Error(
            await getSettingsError(
                response,
                'Không thể tải cài đặt thanh toán.',
            ),
        );
    }

    return response.json();
}

// Cập nhật toàn bộ cấu hình thanh toán lên backend.
export async function updatePaymentSettings(
    data: PaymentSettings,
): Promise<void> {
    const response = await apiFetch('/settings/payment', {
        method: 'PATCH',
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(
            await getSettingsError(
                response,
                'Không thể cập nhật cài đặt thanh toán.',
            ),
        );
    }
}