
'use client';

import { useState } from 'react';
import type { PublicTripSeat } from '../types/booking-types';

export type PassengerInfo = {
    seatId: string;
    passengerName: string;
    passengerPhone: string;
};

export type CreateBookingFormData = {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    passengers: PassengerInfo[];
};

type PassengerFormProps = {
    selectedSeats: PublicTripSeat[];
    loading?: boolean;
    onSubmit: (data: CreateBookingFormData) => void;
};

// Hiển thị form nhập thông tin người đặt và hành khách theo từng ghế.
export default function PassengerForm({
    selectedSeats,
    loading = false,
    onSubmit,
}: PassengerFormProps) {
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');

    const [passengers, setPassengers] = useState<
        Record<string, { name: string; phone: string }>
    >({});

    // Cập nhật thông tin hành khách tương ứng với một ghế.
    function handlePassengerChange(
        seatId: string,
        field: 'name' | 'phone',
        value: string,
    ) {
        setPassengers((current) => ({
            ...current,
            [seatId]: {
                name: current[seatId]?.name || '',
                phone: current[seatId]?.phone || '',
                [field]: value,
            },
        }));
    }

    // Kiểm tra dữ liệu và gửi thông tin đặt vé lên trang cha.
    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!customerName.trim() || !customerPhone.trim()) {
            return;
        }

        const passengerData = selectedSeats.map((seat) => ({
            seatId: seat.id,
            passengerName: passengers[seat.id]?.name.trim() || '',
            passengerPhone: passengers[seat.id]?.phone.trim() || '',
        }));

        onSubmit({
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
            customerEmail: customerEmail.trim(),
            passengers: passengerData,
        });
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
        >
            <div>
                <h2 className="text-lg font-bold text-gray-900">
                    Thông tin đặt vé
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                    Nhập thông tin người đặt để Hải Định liên hệ xác nhận vé.
                </p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Họ và tên người đặt <span className="text-red-600">*</span>
                    </label>
                    <input
                        type="text"
                        required
                        maxLength={100}
                        value={customerName}
                        onChange={(event) =>
                            setCustomerName(event.target.value)
                        }
                        placeholder="Nhập họ và tên"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    />
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Số điện thoại <span className="text-red-600">*</span>
                    </label>
                    <input
                        type="tel"
                        required
                        maxLength={20}
                        value={customerPhone}
                        onChange={(event) =>
                            setCustomerPhone(event.target.value)
                        }
                        placeholder="Nhập số điện thoại liên hệ"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    />
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <input
                        type="email"
                        value={customerEmail}
                        onChange={(event) =>
                            setCustomerEmail(event.target.value)
                        }
                        placeholder="Nhập email (không bắt buộc)"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    />
                </div>
            </div>

            {selectedSeats.length > 0 && (
                <div className="border-t border-gray-100 pt-5">
                    <h3 className="mb-1 font-semibold text-gray-900">
                        Thông tin hành khách
                    </h3>
                    <p className="mb-4 text-sm text-gray-500">
                        Nếu người đi khác người đặt, hãy nhập thông tin hành
                        khách tương ứng với từng ghế.
                    </p>

                    <div className="space-y-4">
                        {selectedSeats.map((seat) => (
                            <div
                                key={seat.id}
                                className="rounded-xl border border-gray-200 p-4"
                            >
                                <div className="mb-3 flex items-center justify-between">
                                    <span className="text-sm font-semibold text-gray-800">
                                        Ghế {seat.label || seat.code}
                                    </span>
                                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                                        Đã chọn
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        maxLength={100}
                                        value={
                                            passengers[seat.id]?.name || ''
                                        }
                                        onChange={(event) =>
                                            handlePassengerChange(
                                                seat.id,
                                                'name',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Tên hành khách (không bắt buộc)"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                    />

                                    <input
                                        type="tel"
                                        maxLength={20}
                                        value={
                                            passengers[seat.id]?.phone || ''
                                        }
                                        onChange={(event) =>
                                            handlePassengerChange(
                                                seat.id,
                                                'phone',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Số điện thoại hành khách (không bắt buộc)"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <button
                type="submit"
                disabled={loading || selectedSeats.length === 0}
                className="w-full rounded-xl bg-red-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
                {loading ? 'Đang xử lý...' : 'Tiếp tục đặt vé'}
            </button>
        </form>
    );
}
