
'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import { apiFetch } from '@/lib/api';

import type {
    SeatLayout,
    VehicleOption,
} from '../types';

// ==========================================
// PROPS
// ==========================================

type SeatLayoutFormProps = {
    layout?: SeatLayout | null;
    onSuccess: (message: string) => void;
    onClose: () => void;
};

// ==========================================
// FORM STATE
// ==========================================

type FormState = {
    name: string;
    description: string;
    isTemplate: boolean;
    vehicleId: string;
};

// Giá trị mặc định khi tạo sơ đồ mới.
const initialForm: FormState = {
    name: '',
    description: '',
    isTemplate: true,
    vehicleId: '',
};

// ==========================================
// HELPER
// ==========================================

// Đọc thông báo lỗi từ Backend.
function getErrorMessage(
    data: unknown,
    fallback: string,
): string {

    if (
        typeof data === 'object' &&
        data !== null &&
        'message' in data
    ) {

        const message = data.message;

        if (typeof message === 'string') {
            return message;
        }

        if (Array.isArray(message)) {
            return message.join(', ');
        }

    }

    return fallback;
}


// ==========================================
// COMPONENT
// ==========================================

export default function SeatLayoutForm({
    layout,
    onSuccess,
    onClose,
}: SeatLayoutFormProps) {

    // ==========================================
    // STATE
    // ==========================================

    const [form, setForm] = useState<FormState>(
        initialForm,
    );

    const [vehicles, setVehicles] = useState<VehicleOption[]>([]);

    const [isLoadingVehicles, setIsLoadingVehicles] =
        useState(false);

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [error, setError] = useState('');


    // ==========================================
    // INITIALIZE FORM
    // ==========================================

    // Khởi tạo dữ liệu form theo chế độ tạo mới hoặc chỉnh sửa.
    useEffect(() => {

        if (layout) {

            setForm({
                name: layout.name,
                description: layout.description ?? '',
                isTemplate: layout.isTemplate,
                vehicleId: layout.vehicleId ?? '',
            });

        } else {

            setForm(initialForm);

        }

        setError('');

    }, [layout]);


    // ==========================================
    // LOAD VEHICLES
    // ==========================================

    // Lấy danh sách xe để lựa chọn khi tạo sơ đồ gắn với xe.
    useEffect(() => {

        let cancelled = false;

        // Gọi API lấy danh sách phương tiện.
        async function loadVehicles() {

            setIsLoadingVehicles(true);

            try {

                const response = await apiFetch('/vehicles');

                if (!response.ok) {
                    throw new Error(
                        'Không thể tải danh sách xe.',
                    );
                }

                const data = await response.json();

                if (!cancelled) {
                    setVehicles(data);
                }

            } catch (error) {

                if (!cancelled) {

                    setError(
                        error instanceof Error
                            ? error.message
                            : 'Lỗi tải danh sách xe.',
                    );

                }

            } finally {

                if (!cancelled) {
                    setIsLoadingVehicles(false);
                }

            }

        }

        loadVehicles();

        return () => {
            cancelled = true;
        };

    }, []);


    // ==========================================
    // HANDLE FORM
    // ==========================================

    // Cập nhật một trường dữ liệu trong form.
    function updateField<K extends keyof FormState>(
        field: K,
        value: FormState[K],
    ) {

        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));

        setError('');

    }


    // ==========================================
    // SUBMIT
    // ==========================================

    // Gửi dữ liệu tạo mới hoặc cập nhật sơ đồ ghế lên Backend.
    async function handleSubmit(
        event: React.SubmitEvent<HTMLFormElement>,
    ) {

        event.preventDefault();

        setError('');


        // Kiểm tra tên sơ đồ.

        if (!form.name.trim()) {

            setError('Vui lòng nhập tên sơ đồ.');

            return;

        }


        // Kiểm tra xe khi tạo sơ đồ thực tế.

        if (!form.isTemplate && !form.vehicleId) {

            setError('Vui lòng chọn xe áp dụng.');

            return;

        }


        // Chuẩn bị dữ liệu gửi Backend.

        const body = {

            name: form.name.trim(),

            description:
                form.description.trim() || undefined,

            isTemplate: form.isTemplate,

            vehicleId: form.isTemplate
                ? undefined
                : form.vehicleId,

        };


        setIsSubmitting(true);

        try {

            const response = await apiFetch(

                layout
                    ? `/seat-layout/${layout.id}`
                    : '/seat-layout',

                {

                    method: layout ? 'PATCH' : 'POST',

                    body: JSON.stringify(body),

                },

            );


            // Kiểm tra kết quả Backend.

            if (!response.ok) {

                const data = await response
                    .json()
                    .catch(() => null);

                throw new Error(
                    getErrorMessage(
                        data,
                        'Không thể lưu sơ đồ ghế.',
                    ),
                );

            }


            // Thông báo cho page.tsx xử lý sau khi lưu.

            onSuccess(

                layout
                    ? 'Cập nhật sơ đồ thành công.'
                    : 'Tạo sơ đồ thành công.',

            );

        } catch (error) {

            setError(

                error instanceof Error
                    ? error.message
                    : 'Đã xảy ra lỗi.',

            );

        } finally {

            setIsSubmitting(false);

        }

    }


    // ==========================================
    // STYLE
    // ==========================================

    const inputClass =
        'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-slate-100';

    const labelClass =
        'mb-1.5 block text-sm font-medium text-slate-700';


    // ==========================================
    // RENDER
    // ==========================================

    return (

        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-3 sm:p-6">

            <form
                onSubmit={handleSubmit}
                className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            >

                {/* ==================================
                    HEADER
                ================================== */}

                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">

                    <div>

                        <h2 className="text-lg font-bold text-slate-900">

                            {layout
                                ? 'Chỉnh sửa sơ đồ'
                                : 'Tạo sơ đồ ghế'}

                        </h2>

                        <p className="mt-1 text-sm text-slate-500">

                            {layout
                                ? 'Cập nhật thông tin sơ đồ ghế.'
                                : 'Khai báo thông tin sơ đồ trước khi thiết kế ghế.'}

                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                        ×
                    </button>

                </div>


                {/* ==================================
                    FORM BODY
                ================================== */}

                <div className="max-h-[70vh] space-y-5 overflow-y-auto px-5 py-5 sm:px-6">

                    {/* NAME */}

                    <div>

                        <label className={labelClass}>
                            Tên sơ đồ *
                        </label>

                        <input
                            type="text"
                            value={form.name}
                            onChange={(event) =>
                                updateField(
                                    'name',
                                    event.target.value,
                                )
                            }
                            className={inputClass}
                            placeholder="Ví dụ: Sơ đồ xe giường nằm 44 chỗ"
                            maxLength={100}
                            required
                        />

                    </div>


                    {/* DESCRIPTION */}

                    <div>

                        <label className={labelClass}>
                            Mô tả
                        </label>

                        <textarea
                            value={form.description}
                            onChange={(event) =>
                                updateField(
                                    'description',
                                    event.target.value,
                                )
                            }
                            className={inputClass}
                            rows={3}
                            maxLength={500}
                            placeholder="Thông tin thêm về sơ đồ ghế..."
                        />

                    </div>


                    {/* TEMPLATE TYPE */}

                    <div className="rounded-xl border border-slate-200 p-4">

                        <label className="flex cursor-pointer items-start gap-3">

                            <input
                                type="checkbox"
                                checked={form.isTemplate}
                                disabled={!!layout?.vehicleId || isSubmitting}
                                onChange={(event) =>
                                    updateField(
                                        'isTemplate',
                                        event.target.checked,
                                    )
                                }
                                className="mt-1 h-4 w-4 accent-red-600"
                            />

                            <span>

                                <span className="block text-sm font-semibold text-slate-800">
                                    Sơ đồ mẫu
                                </span>

                                <span className="mt-1 block text-xs leading-5 text-slate-500">
                                    Sử dụng làm cấu hình chuẩn để sao chép cho nhiều xe có cùng loại ghế.
                                </span>

                            </span>

                        </label>

                    </div>


                    {/* VEHICLE */}

                    {!form.isTemplate && (

                        <div>

                            <label className={labelClass}>
                                Xe áp dụng *
                            </label>


                            <select
                                value={form.vehicleId}
                                onChange={(event) =>
                                    updateField(
                                        'vehicleId',
                                        event.target.value,
                                    )
                                }
                                disabled={
                                    isLoadingVehicles ||
                                    !!layout?.vehicleId ||
                                    isSubmitting
                                }
                                className={inputClass}
                                required
                            >

                                <option value="">
                                    Chọn xe
                                </option>

                                {vehicles.map((vehicle) => (

                                    <option
                                        key={vehicle.id}
                                        value={vehicle.id}
                                        disabled={vehicle.status !== 'ACTIVE'}
                                    >

                                        {vehicle.name}
                                        {' · '}
                                        {vehicle.licensePlate}
                                        {' · '}
                                        {vehicle.seatCount} chỗ

                                        {vehicle.status !== 'ACTIVE'
                                            ? ' (Không hoạt động)'
                                            : ''}

                                    </option>

                                ))}

                            </select>


                            {isLoadingVehicles && (

                                <p className="mt-1.5 text-xs text-slate-400">
                                    Đang tải danh sách xe...
                                </p>

                            )}


                            {layout?.vehicleId && (

                                <p className="mt-1.5 text-xs text-slate-500">
                                    Không thể thay đổi xe đã gắn với sơ đồ này.
                                </p>

                            )}

                            {!isLoadingVehicles && vehicles.length === 0 && (

                                <p className="mt-1.5 text-xs text-amber-600">
                                    Chưa có phương tiện để lựa chọn.
                                </p>

                            )}

                        </div>

                    )}


                    {/* ERROR */}

                    {error && (

                        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">

                            {error}

                        </div>

                    )}

                </div>


                {/* ==================================
                    FOOTER
                ================================== */}

                <div className="flex flex-col-reverse gap-2 border-t border-slate-200 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                        Hủy
                    </button>


                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >

                        {isSubmitting
                            ? 'Đang lưu...'
                            : layout
                                ? 'Lưu thay đổi'
                                : 'Tạo sơ đồ'}

                    </button>

                </div>

            </form>

        </div>

    );

}
