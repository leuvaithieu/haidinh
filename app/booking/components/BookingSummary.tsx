
'use client';

import type {
    PublicPriceQuoteResponse,
    PublicTripSeat,
    TripDirection,
} from '../types/booking-types';

type BookingSummaryProps = {
    routeName: string;
    direction: TripDirection;
    departureTime: string;
    pickupName: string;
    dropoffName: string;
    selectedSeats: PublicTripSeat[];
    priceQuote: PublicPriceQuoteResponse | null;
};

// Định dạng số tiền theo đơn vị tiền tệ Việt Nam.
function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
}

// Hiển thị tổng hợp thông tin chuyến xe, ghế và giá vé trước khi đặt.
export default function BookingSummary({
    routeName,
    direction,
    departureTime,
    pickupName,
    dropoffName,
    selectedSeats,
    priceQuote,
}: BookingSummaryProps) {
    const isContactPrice = priceQuote?.priceSource === 'CONTACT';
    const unitPrice = priceQuote?.finalPrice ?? null;
    const totalPrice =
        unitPrice !== null ? unitPrice * selectedSeats.length : null;

    return (
        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-gray-900">
                Thông tin đặt vé
            </h2>

            <div className="mt-5 space-y-4">
                <div>
                    <p className="text-xs text-gray-500">Tuyến xe</p>
                    <p className="mt-1 font-semibold text-gray-900">
                        {routeName}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-gray-500">Chiều đi</p>
                        <p className="mt-1 text-sm font-medium text-gray-800">
                            {direction === 'OUTBOUND' ? 'Lượt đi' : 'Lượt về'}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500">Thời gian khởi hành</p>
                        <p className="mt-1 text-sm font-medium text-gray-800">
                            {departureTime
                                ? new Date(departureTime).toLocaleString(
                                      'vi-VN',
                                      {
                                          dateStyle: 'short',
                                          timeStyle: 'short',
                                      },
                                  )
                                : 'Chưa xác định'}
                        </p>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                    <div className="flex gap-3">
                        <div className="flex flex-col items-center pt-1">
                            <span className="h-2.5 w-2.5 rounded-full bg-green-600" />
                            <span className="my-1 h-8 border-l border-dashed border-gray-300" />
                            <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
                        </div>

                        <div className="flex-1 space-y-4">
                            <div>
                                <p className="text-xs text-gray-500">
                                    Điểm đón
                                </p>
                                <p className="text-sm font-semibold text-gray-900">
                                    {pickupName}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500">
                                    Điểm trả
                                </p>
                                <p className="text-sm font-semibold text-gray-900">
                                    {dropoffName}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                    <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-800">
                            Ghế đã chọn
                        </p>
                        <span className="text-sm font-semibold text-red-600">
                            {selectedSeats.length} ghế
                        </span>
                    </div>

                    {selectedSeats.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {selectedSeats.map((seat) => (
                                <span
                                    key={seat.id}
                                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-700"
                                >
                                    {seat.label || seat.code}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400">
                            Chưa chọn ghế
                        </p>
                    )}
                </div>

                <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Giá một vé</span>
                        <span className="font-medium text-gray-900">
                            {isContactPrice
                                ? 'Liên hệ'
                                : unitPrice !== null
                                  ? formatCurrency(unitPrice)
                                  : 'Chưa có giá'}
                        </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                        <span className="font-semibold text-gray-900">
                            Tổng tiền
                        </span>
                        <span className="text-xl font-bold text-red-600">
                            {isContactPrice
                                ? 'Liên hệ'
                                : totalPrice !== null
                                  ? formatCurrency(totalPrice)
                                  : 'Chưa có giá'}
                        </span>
                    </div>

                    {isContactPrice && (
                        <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                            Tuyến đường này cần nhân viên xác nhận giá vé.
                            Vui lòng liên hệ Hải Định trước khi hoàn tất đặt vé.
                        </p>
                    )}

                    {!priceQuote && (
                        <p className="mt-3 text-xs text-gray-500">
                            Đang chờ dữ liệu giá vé từ hệ thống.
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}
