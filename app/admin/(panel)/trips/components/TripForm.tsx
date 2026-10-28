
'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { apiFetch } from '@/lib/api';

type Option = {
    id: string;
    name: string;
    licensePlate?: string;
};

type Trip = {
    id: string;
    routeId: string;
    vehicleId: string;
    driver1Id: string;
    driver2Id: string;
    assistant1Id: string;
    assistant2Id?: string | null;
    plannedDeparture: string;
    returnPlannedDeparture?: string | null;
    scheduleType: 'NORMAL' | 'TET';
    status: string;
    route?: { id: string; name: string };
    vehicle?: { id: string; name: string; licensePlate?: string };
    driver1?: { id: string; name: string };
    driver2?: { id: string; name: string };
    assistant1?: { id: string; name: string };
    assistant2?: { id: string; name: string } | null;
};

type TripFormProps = {
    trip?: Trip | null;
    onSuccess: (message: string) => void;
    onClose: () => void;
};

type TripFormData = {
    routeId: string;
    vehicleId: string;
    driver1Id: string;
    driver2Id: string;
    assistant1Id: string;
    assistant2Id: string;
    scheduleType: 'NORMAL' | 'TET';
    plannedDeparture: string;
    returnPlannedDeparture: string;
};

const initialForm: TripFormData = {
    routeId: '',
    vehicleId: '',
    driver1Id: '',
    driver2Id: '',
    assistant1Id: '',
    assistant2Id: '',
    scheduleType: 'NORMAL',
    plannedDeparture: '',
    returnPlannedDeparture: '',
};

function toDateTimeLocal(value?: string | Date | null): string {
    if (!value) return '';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return '';

    const pad = (number: number) => String(number).padStart(2, '0');

    return (
        `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
        `T${pad(date.getHours())}:${pad(date.getMinutes())}`
    );
}

function getErrorMessage(data: unknown, fallback: string): string {
    if (
        typeof data === 'object' &&
        data !== null &&
        'message' in data
    ) {
        const message = data.message;

        if (typeof message === 'string') return message;

        if (Array.isArray(message)) return message.join(', ');
    }

    return fallback;
}

export default function TripForm({
    trip,
    onSuccess,
    onClose,
}: TripFormProps) {
    const [form, setForm] = useState<TripFormData>(initialForm);

    const [routes, setRoutes] = useState<Option[]>([]);
    const [vehicles, setVehicles] = useState<Option[]>([]);
    const [drivers, setDrivers] = useState<Option[]>([]);
    const [assistants, setAssistants] = useState<Option[]>([]);

    const [error, setError] = useState('');
    const [isLoadingOptions, setIsLoadingOptions] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!trip) {
            setForm(initialForm);
            setError('');
            return;
        }

        setForm({
            routeId: trip.routeId,
            vehicleId: trip.vehicleId,
            driver1Id: trip.driver1Id,
            driver2Id: trip.driver2Id,
            assistant1Id: trip.assistant1Id,
            assistant2Id: trip.assistant2Id ?? '',
            scheduleType: trip.scheduleType,
            plannedDeparture: toDateTimeLocal(trip.plannedDeparture),
            returnPlannedDeparture: toDateTimeLocal(
                trip.returnPlannedDeparture,
            ),
        });

        setError('');
    }, [trip]);

    useEffect(() => {
        let cancelled = false;

        async function loadOptions() {
            setIsLoadingOptions(true);
            setError('');

            try {
                const [routeRes, vehicleRes, driverRes, assistantRes] =
                    await Promise.all([
                        apiFetch('/routes'),
                        apiFetch('/vehicles'),
                        apiFetch('/drivers'),
                        apiFetch('/assistants'),
                    ]);

                const responses = [
                    routeRes,
                    vehicleRes,
                    driverRes,
                    assistantRes,
                ];

                if (responses.some((response) => !response.ok)) {
                    throw new Error(
                        'Không thể tải danh sách tuyến, xe hoặc nhân sự.',
                    );
                }

                const [
                    routeData,
                    vehicleData,
                    driverData,
                    assistantData,
                ] = await Promise.all(
                    responses.map((response) => response.json()),
                );

                if (cancelled) return;

                setRoutes(routeData);
                setVehicles(vehicleData);
                setDrivers(driverData);
                setAssistants(assistantData);
            } catch (err) {
                if (cancelled) return;

                setError(
                    err instanceof Error
                        ? err.message
                        : 'Không thể tải dữ liệu. Vui lòng thử lại.',
                );
            } finally {
                if (!cancelled) setIsLoadingOptions(false);
            }
        }

        loadOptions();

        return () => {
            cancelled = true;
        };
    }, []);

    function updateField<K extends keyof TripFormData>(
        field: K,
        value: TripFormData[K],
    ) {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));

        setError('');
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError('');

        if (
            !form.routeId ||
            !form.vehicleId ||
            !form.driver1Id ||
            !form.driver2Id ||
            !form.assistant1Id ||
            !form.plannedDeparture
        ) {
            setError('Vui lòng điền đầy đủ các trường bắt buộc.');
            return;
        }

        if (form.driver1Id === form.driver2Id) {
            setError('Hai vị trí tài xế phải là hai người khác nhau.');
            return;
        }

        if (
            form.assistant2Id &&
            form.assistant1Id === form.assistant2Id
        ) {
            setError('Hai vị trí phụ xe phải là hai người khác nhau.');
            return;
        }

        const departureDate = new Date(form.plannedDeparture);

        if (Number.isNaN(departureDate.getTime())) {
            setError('Thời gian khởi hành không hợp lệ.');
            return;
        }

        let returnDeparture: Date | null = null;

        if (form.returnPlannedDeparture) {
            returnDeparture = new Date(form.returnPlannedDeparture);

            if (Number.isNaN(returnDeparture.getTime())) {
                setError('Thời gian quay đầu không hợp lệ.');
                return;
            }

            if (returnDeparture <= departureDate) {
                setError(
                    'Thời gian quay đầu phải sau thời gian khởi hành.',
                );
                return;
            }
        }

        const body = {
            routeId: form.routeId,
            vehicleId: form.vehicleId,
            driver1Id: form.driver1Id,
            driver2Id: form.driver2Id,
            assistant1Id: form.assistant1Id,
            assistant2Id: form.assistant2Id || undefined,
            scheduleType: form.scheduleType,
            plannedDeparture: departureDate.toISOString(),
            returnPlannedDeparture:
                returnDeparture?.toISOString() ?? null,
        };

        setIsSubmitting(true);

        try {
            const response = await apiFetch(
                trip ? `/trips/${trip.id}` : '/trips',
                {
                    method: trip ? 'PATCH' : 'POST',
                    body: JSON.stringify(body),
                },
            );

            if (!response.ok) {
                let message = trip
                    ? 'Không thể cập nhật chuyến xe.'
                    : 'Không thể tạo chuyến xe.';

                try {
                    const data: unknown = await response.json();
                    message = getErrorMessage(data, message);
                } catch {
                    // Giữ thông báo mặc định nếu response không có JSON.
                }

                setError(message);
                return;
            }

            onSuccess(
                trip
                    ? 'Cập nhật chuyến xe thành công!'
                    : 'Tạo chuyến xe thành công!',
            );
        } catch {
            setError('Không thể kết nối máy chủ. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    }

    const inputClass =
        'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-slate-100';

    const labelClass =
        'mb-1.5 block text-sm font-medium text-slate-700';

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 sm:p-6"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !isSubmitting) {
                    onClose();
                }
            }}
        >
            <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4 sm:px-7">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            {trip ? 'Cập nhật chuyến xe' : 'Tạo chuyến xe mới'}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Khai báo lịch chạy, phương tiện và nhân sự phụ trách.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        aria-label="Đóng biểu mẫu"
                        className="rounded-lg px-3 py-2 text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                    >
                        ×
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto px-5 py-5 sm:px-7">
                    {isLoadingOptions ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-16">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-red-600" />
                            <p className="text-sm text-slate-500">
                                Đang tải dữ liệu...
                            </p>
                        </div>
                    ) : (
                        <form
                            id="trip-form"
                            onSubmit={handleSubmit}
                            className="space-y-6"
                        >
                            {/* Lịch chạy */}
                            <section className="space-y-4">
                                <h3 className="border-l-4 border-red-600 pl-3 text-sm font-bold text-slate-800">
                                    Thông tin lịch chạy
                                </h3>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className={labelClass}>
                                            Tuyến xe{' '}
                                            <span className="text-red-600">*</span>
                                        </label>

                                        <select
                                            value={form.routeId}
                                            onChange={(event) =>
                                                updateField(
                                                    'routeId',
                                                    event.target.value,
                                                )
                                            }
                                            required
                                            className={inputClass}
                                        >
                                            <option value="">Chọn tuyến xe</option>
                                            {routes.map((route) => (
                                                <option
                                                    key={route.id}
                                                    value={route.id}
                                                >
                                                    {route.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className={labelClass}>
                                            Phương tiện{' '}
                                            <span className="text-red-600">*</span>
                                        </label>

                                        <select
                                            value={form.vehicleId}
                                            onChange={(event) =>
                                                updateField(
                                                    'vehicleId',
                                                    event.target.value,
                                                )
                                            }
                                            required
                                            className={inputClass}
                                        >
                                            <option value="">Chọn xe</option>
                                            {vehicles.map((vehicle) => (
                                                <option
                                                    key={vehicle.id}
                                                    value={vehicle.id}
                                                >
                                                    {vehicle.name}
                                                    {vehicle.licensePlate
                                                        ? ` — ${vehicle.licensePlate}`
                                                        : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className={labelClass}>
                                            Thời gian khởi hành{' '}
                                            <span className="text-red-600">*</span>
                                        </label>

                                        <input
                                            type="datetime-local"
                                            value={form.plannedDeparture}
                                            onChange={(event) =>
                                                updateField(
                                                    'plannedDeparture',
                                                    event.target.value,
                                                )
                                            }
                                            required
                                            className={inputClass}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>
                                            Thời gian quay đầu
                                        </label>

                                        <input
                                            type="datetime-local"
                                            value={form.returnPlannedDeparture}
                                            onChange={(event) =>
                                                updateField(
                                                    'returnPlannedDeparture',
                                                    event.target.value,
                                                )
                                            }
                                            className={inputClass}
                                        />

                                        <p className="mt-1.5 text-xs text-slate-500">
                                            Thời điểm xe dự kiến xuất phát chiều về.
                                        </p>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className={labelClass}>
                                            Loại lịch chạy
                                        </label>

                                        <select
                                            value={form.scheduleType}
                                            onChange={(event) =>
                                                updateField(
                                                    'scheduleType',
                                                    event.target.value as
                                                        | 'NORMAL'
                                                        | 'TET',
                                                )
                                            }
                                            disabled={Boolean(trip)}
                                            className={inputClass}
                                        >
                                            <option value="NORMAL">
                                                Lịch thông thường
                                            </option>
                                            <option value="TET">
                                                Lịch Tết
                                            </option>
                                        </select>

                                        {trip && (
                                            <p className="mt-1.5 text-xs text-slate-500">
                                                Loại lịch không thể thay đổi khi
                                                chỉnh sửa chuyến.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* Nhân sự */}
                            <section className="space-y-4">
                                <h3 className="border-l-4 border-red-600 pl-3 text-sm font-bold text-slate-800">
                                    Phân công nhân sự
                                </h3>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className={labelClass}>
                                            Tài xế 1{' '}
                                            <span className="text-red-600">*</span>
                                        </label>

                                        <select
                                            value={form.driver1Id}
                                            onChange={(event) =>
                                                updateField(
                                                    'driver1Id',
                                                    event.target.value,
                                                )
                                            }
                                            required
                                            className={inputClass}
                                        >
                                            <option value="">Chọn tài xế</option>
                                            {drivers.map((driver) => (
                                                <option
                                                    key={driver.id}
                                                    value={driver.id}
                                                >
                                                    {driver.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className={labelClass}>
                                            Tài xế 2{' '}
                                            <span className="text-red-600">*</span>
                                        </label>

                                        <select
                                            value={form.driver2Id}
                                            onChange={(event) =>
                                                updateField(
                                                    'driver2Id',
                                                    event.target.value,
                                                )
                                            }
                                            required
                                            className={inputClass}
                                        >
                                            <option value="">Chọn tài xế</option>
                                            {drivers.map((driver) => (
                                                <option
                                                    key={driver.id}
                                                    value={driver.id}
                                                >
                                                    {driver.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className={labelClass}>
                                            Phụ xe 1{' '}
                                            <span className="text-red-600">*</span>
                                        </label>

                                        <select
                                            value={form.assistant1Id}
                                            onChange={(event) =>
                                                updateField(
                                                    'assistant1Id',
                                                    event.target.value,
                                                )
                                            }
                                            required
                                            className={inputClass}
                                        >
                                            <option value="">Chọn phụ xe</option>
                                            {assistants.map((assistant) => (
                                                <option
                                                    key={assistant.id}
                                                    value={assistant.id}
                                                >
                                                    {assistant.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className={labelClass}>
                                            Phụ xe 2
                                        </label>

                                        <select
                                            value={form.assistant2Id}
                                            onChange={(event) =>
                                                updateField(
                                                    'assistant2Id',
                                                    event.target.value,
                                                )
                                            }
                                            className={inputClass}
                                        >
                                            <option value="">
                                                Không phân công
                                            </option>
                                            {assistants.map((assistant) => (
                                                <option
                                                    key={assistant.id}
                                                    value={assistant.id}
                                                >
                                                    {assistant.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </section>

                            {error && (
                                <div
                                    role="alert"
                                    className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                                >
                                    {error}
                                </div>
                            )}
                        </form>
                    )}
                </div>

                {/* Footer */}
                <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Hủy
                    </button>

                    <button
                        type="submit"
                        form="trip-form"
                        disabled={isLoadingOptions || isSubmitting}
                        className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting
                            ? 'Đang lưu...'
                            : trip
                              ? 'Lưu thay đổi'
                              : 'Tạo chuyến xe'}
                    </button>
                </div>
            </div>
        </div>
    );
}
