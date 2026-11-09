
'use client';

import { useEffect, useState, type FormEvent } from 'react';

import { apiFetch } from '@/lib/api';

import type { Seat, SeatType } from '../types';

// ==========================================
// PROPS
// ==========================================

type SeatFormProps = {
    layoutId: string;
    seat?: Seat | null;
    onSuccess: (message: string) => void;
    onClose: () => void;
};

// ==========================================
// FORM DATA
// ==========================================

type SeatFormData = {
    code: string;
    label: string;
    type: SeatType;
    level: number;
    row: number;
    column: number;
    isActive: boolean;
};

// ==========================================
// INITIAL FORM
// ==========================================

const initialForm: SeatFormData = {
    code: '',
    label: '',
    type: 'BERTH',
    level: 1,
    row: 1,
    column: 1,
    isActive: true,
};

// ==========================================
// COMPONENT
// ==========================================

export default function SeatForm({
    layoutId,
    seat,
    onSuccess,
    onClose,
}: SeatFormProps) {

    // ==========================================
    // STATE
    // ==========================================

    const [form, setForm] = useState<SeatFormData>(initialForm);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [error, setError] = useState('');


    // ==========================================
    // INITIALIZE FORM
    // ==========================================

    useEffect(() => {

        if (seat) {

            setForm({
                code: seat.code,
                label: seat.label ?? '',
                type: seat.type,
                level: seat.level,
                row: seat.row,
                column: seat.column,
                isActive: seat.isActive,
            });

        } else {

            setForm(initialForm);

        }

        setError('');

    }, [seat]);


    // ==========================================
    // HANDLE CHANGE
    // ==========================================

    // Cập nhật giá trị của một trường trong form.
    function updateField<K extends keyof SeatFormData>(
        field: K,
        value: SeatFormData[K],
    ) {

        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));

    }


    // ==========================================
    // HANDLE SUBMIT
    // ==========================================

    // Kiểm tra dữ liệu và gửi yêu cầu tạo mới hoặc cập nhật ghế.
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {

        event.preventDefault();

        setError('');

        if (!form.code.trim()) {
            setError('Vui lòng nhập mã ghế.');
            return;
        }

        if (form.code.trim().length > 20) {
            setError('Mã ghế không được vượt quá 20 ký tự.');
            return;
        }

        if (form.label.length > 50) {
            setError('Tên hiển thị không được vượt quá 50 ký tự.');
            return;
        }

        if (
            !Number.isInteger(form.level) ||
            !Number.isInteger(form.row) ||
            !Number.isInteger(form.column) ||
            form.level < 1 ||
            form.row < 1 ||
            form.column < 1
        ) {
            setError('Tầng, hàng và cột phải là số nguyên lớn hơn 0.');
            return;
        }

        setIsSubmitting(true);

        try {

            const payload = {
                code: form.code.trim(),
                label: form.label.trim() || undefined,
                type: form.type,
                level: form.level,
                row: form.row,
                column: form.column,
                isActive: form.isActive,
            };

            const response = await apiFetch(
                seat
                    ? `/seat-layout/${layoutId}/seats/${seat.id}`
                    : `/seat-layout/${layoutId}/seats`,
                {
                    method: seat ? 'PATCH' : 'POST',
                    body: JSON.stringify(payload),
                },
            );

            if (!response.ok) {

                const data = await response
                    .json()
                    .catch(() => null);

                const message =
                    data &&
                    typeof data === 'object' &&
                    'message' in data
                        ? Array.isArray(data.message)
                            ? data.message.join(', ')
                            : String(data.message)
                        : 'Không thể lưu thông tin ghế.';

                throw new Error(message);

            }

            onSuccess(
                seat
                    ? 'Cập nhật ghế thành công.'
                    : 'Thêm ghế thành công.',
            );

        } catch (error) {

            setError(
                error instanceof Error
                    ? error.message
                    : 'Đã xảy ra lỗi khi lưu ghế.',
            );

        } finally {

            setIsSubmitting(false);

        }

    }


    // ==========================================
    // RENDER
    // ==========================================

    return (

        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 p-3 sm:p-5">

            <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

                {/* HEADER */}

                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">

                    <div>

                        <h2 className="text-lg font-bold text-slate-900">
                            {seat ? 'Chỉnh sửa ghế' : 'Thêm ghế mới'}
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Cấu hình thông tin và vị trí ghế.
                        </p>

                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
                    >
                        ×
                    </button>

                </div>


                {/* FORM */}

                <form
                    onSubmit={handleSubmit}
                    className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6"
                >

                    {/* ERROR */}

                    {error && (

                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>

                    )}


                    {/* SEAT CODE */}

                    <div>

                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Mã ghế <span className="text-red-500">*</span>
                        </label>

                        <input
                            type="text"
                            value={form.code}
                            onChange={(event) =>
                                updateField('code', event.target.value)
                            }
                            maxLength={20}
                            placeholder="Ví dụ: A01, B02..."
                            disabled={isSubmitting}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:bg-slate-100"
                        />

                    </div>


                    {/* SEAT LABEL */}

                    <div>

                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Tên hiển thị
                        </label>

                        <input
                            type="text"
                            value={form.label}
                            onChange={(event) =>
                                updateField('label', event.target.value)
                            }
                            maxLength={50}
                            placeholder="Ví dụ: Giường tầng dưới..."
                            disabled={isSubmitting}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:bg-slate-100"
                        />

                    </div>


                    {/* SEAT TYPE */}

                    <div>

                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Loại ghế
                        </label>

                        <select
                            value={form.type}
                            onChange={(event) =>
                                updateField(
                                    'type',
                                    event.target.value as SeatType,
                                )
                            }
                            disabled={isSubmitting}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:bg-slate-100"
                        >

                            <option value="BERTH">
                                Giường nằm
                            </option>

                            <option value="SEAT">
                                Ghế ngồi
                            </option>

                            <option value="PRIVATE_ROOM">
                                Phòng riêng
                            </option>

                            <option value="OTHER">
                                Khác
                            </option>

                        </select>

                    </div>


                    {/* POSITION */}

                    <div>

                        <h3 className="mb-3 text-sm font-semibold text-slate-700">
                            Vị trí trên sơ đồ
                        </h3>

                        <div className="grid grid-cols-3 gap-3">

                            {/* LEVEL */}

                            <div>

                                <label className="mb-2 block text-xs text-slate-500">
                                    Tầng
                                </label>

                                <input
                                    type="number"
                                    min={1}
                                    step={1}
                                    value={form.level}
                                    onChange={(event) =>
                                        updateField(
                                            'level',
                                            Number(event.target.value),
                                        )
                                    }
                                    disabled={isSubmitting}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                />

                            </div>


                            {/* ROW */}

                            <div>

                                <label className="mb-2 block text-xs text-slate-500">
                                    Hàng
                                </label>

                                <input
                                    type="number"
                                    min={1}
                                    step={1}
                                    value={form.row}
                                    onChange={(event) =>
                                        updateField(
                                            'row',
                                            Number(event.target.value),
                                        )
                                    }
                                    disabled={isSubmitting}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                />

                            </div>


                            {/* COLUMN */}

                            <div>

                                <label className="mb-2 block text-xs text-slate-500">
                                    Cột
                                </label>

                                <input
                                    type="number"
                                    min={1}
                                    step={1}
                                    value={form.column}
                                    onChange={(event) =>
                                        updateField(
                                            'column',
                                            Number(event.target.value),
                                        )
                                    }
                                    disabled={isSubmitting}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                />

                            </div>

                        </div>

                        <p className="mt-2 text-xs text-slate-400">
                            Ví dụ: Tầng 1, hàng 2, cột 3.
                        </p>

                    </div>


                    {/* ACTIVE STATUS */}

                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4">

                        <input
                            type="checkbox"
                            checked={form.isActive}
                            onChange={(event) =>
                                updateField('isActive', event.target.checked)
                            }
                            disabled={isSubmitting}
                            className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                        />

                        <div>

                            <span className="block text-sm font-semibold text-slate-800">
                                Ghế đang hoạt động
                            </span>

                            <span className="mt-1 block text-xs text-slate-500">
                                Ghế ngừng hoạt động sẽ không được sử dụng khi đặt vé.
                            </span>

                        </div>

                    </label>


                    {/* ACTIONS */}

                    <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                            Hủy
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isSubmitting
                                ? 'Đang lưu...'
                                : seat
                                    ? 'Lưu thay đổi'
                                    : 'Thêm ghế'}
                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}
