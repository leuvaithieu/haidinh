
'use client';

import type { ServicePoint } from '../types/booking-types';

type ServicePointSelectProps = {
    label: string;
    servicePoints: ServicePoint[];
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
};

// Hiển thị danh sách điểm dịch vụ phụ thuộc vào RoutePoint khách đã chọn.
export default function ServicePointSelect({
    label,
    servicePoints,
    value,
    onChange,
    disabled = false,
}: ServicePointSelectProps) {
    if (servicePoints.length === 0) {
        return null;
    }

    return (
        <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                {label}
            </label>

            <select
                value={value}
                disabled={disabled}
                onChange={(event) => onChange(event.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-gray-100"
            >
                <option value="">
                    Chọn điểm dịch vụ (không bắt buộc)
                </option>

                {servicePoints.map((point) => (
                    <option key={point.id} value={point.id}>
                        {point.name}
                    </option>
                ))}
            </select>

            <p className="mt-1 text-xs text-gray-500">
                Nếu không chọn, hệ thống sử dụng điểm đón/trả chính.
            </p>
        </div>
    );
}
