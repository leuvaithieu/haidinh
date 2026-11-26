
'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { apiFetch } from '@/lib/api';

import { createPricingPolicy } from '../lib/pricing-api';

import type {
    PricingMode,
    TripDirection,
    TetDailyPriceInput,
} from './pricing-types';

import type { Route } from '../../routes/components/route-types';

type PricingPolicyFormProps = {
    onSuccess: (message: string) => void | Promise<void>;
    onClose: () => void;
};

export default function PricingPolicyForm({
    onSuccess,
    onClose,
}: PricingPolicyFormProps) {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [vehicleTypes, setVehicleTypes] = useState<string[]>([]);

    const [routeId, setRouteId] = useState('');
    const [pricingMode, setPricingMode] =
        useState<PricingMode>('NORMAL');
    const [direction, setDirection] =
        useState<TripDirection>('OUTBOUND');

    const [baseOriginRoutePointId, setBaseOriginRoutePointId] =
        useState('');
    const [vehicleType, setVehicleType] = useState('');

    const [version, setVersion] = useState('1');
    const [effectiveFrom, setEffectiveFrom] = useState('');
    const [effectiveTo, setEffectiveTo] = useState('');

    const [routeAdjustmentAmount, setRouteAdjustmentAmount] =
        useState('0');

    const [tetDailyPrices, setTetDailyPrices] = useState<
        TetDailyPriceInput[]
    >([{ departureDate: '', price: '' }]);

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const selectedRoute = routes.find(
        (route) => route.id === routeId,
    );

    const routePoints = selectedRoute?.routePoints ?? [];

    // Lấy danh sách tuyến và các loại xe hiện có để tạo chính sách.
    async function loadFormData() {
        setIsLoading(true);
        setError('');

        try {
            const [routeResponse, vehicleResponse] = await Promise.all([
                apiFetch('/routes'),
                apiFetch('/vehicles'),
            ]);

            if (!routeResponse.ok) {
                throw new Error('Không thể tải danh sách tuyến xe');
            }

            if (!vehicleResponse.ok) {
                throw new Error('Không thể tải danh sách xe');
            }

            const [routeData, vehicleData] = await Promise.all([
                routeResponse.json(),
                vehicleResponse.json(),
            ]);

            setRoutes(routeData);

            const types = Array.from(
                new Set(
                    vehicleData
                        .map((vehicle: { vehicleType?: string | null }) =>
                            vehicle.vehicleType?.trim(),
                        )
                        .filter(
                            (value: string | undefined): value is string =>
                                Boolean(value),
                        ),
                ),
            ) as string[];

            setVehicleTypes(types);

            if (routeData.length > 0) {
                setRouteId(routeData[0].id);
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Không thể tải dữ liệu khởi tạo',
            );
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        void loadFormData();
    }, []);

    // Xử lý thay đổi tuyến và đặt lại điểm xuất phát gốc.
    function handleRouteChange(value: string) {
        setRouteId(value);
        setBaseOriginRoutePointId('');
    }

    // Thêm một dòng cấu hình giá Tết theo ngày khởi hành.
    function handleAddTetDailyPrice() {
        setTetDailyPrices((current) => [
            ...current,
            { departureDate: '', price: '' },
        ]);
    }

    // Cập nhật ngày hoặc giá của một dòng cấu hình Tết.
    function handleTetDailyPriceChange(
        index: number,
        field: keyof TetDailyPriceInput,
        value: string,
    ) {
        setTetDailyPrices((current) =>
            current.map((item, itemIndex) =>
                itemIndex === index
                    ? { ...item, [field]: value }
                    : item,
            ),
        );
    }

    // Xóa một dòng cấu hình giá Tết.
    function handleRemoveTetDailyPrice(index: number) {
        setTetDailyPrices((current) =>
            current.filter((_, itemIndex) => itemIndex !== index),
        );
    }

    // Kiểm tra dữ liệu và gửi yêu cầu tạo chính sách giá.
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError('');

        if (!routeId) {
            setError('Vui lòng chọn tuyến xe');
            return;
        }

        if (
            !version ||
            !Number.isInteger(Number(version)) ||
            Number(version) < 1
        ) {
            setError('Phiên bản phải là số nguyên lớn hơn hoặc bằng 1');
            return;
        }

        if (!effectiveFrom) {
            setError('Vui lòng chọn thời gian bắt đầu hiệu lực');
            return;
        }

        if (
            effectiveTo &&
            new Date(effectiveTo).getTime() <=
                new Date(effectiveFrom).getTime()
        ) {
            setError('Thời gian kết thúc phải sau thời gian bắt đầu');
            return;
        }

        if (pricingMode === 'NORMAL' && !baseOriginRoutePointId) {
            setError(
                'Chính sách NORMAL bắt buộc phải chọn điểm xuất phát gốc',
            );
            return;
        }

        if (pricingMode === 'TET') {
            if (!vehicleType) {
                setError('Chính sách Tết bắt buộc phải chọn loại xe');
                return;
            }

            if (tetDailyPrices.length === 0) {
                setError('Vui lòng thêm ít nhất một ngày có giá Tết');
                return;
            }

            const usedDates = new Set<string>();

            for (let index = 0; index < tetDailyPrices.length; index++) {
                const item = tetDailyPrices[index];
                const price = Number(item.price);

                if (!item.departureDate) {
                    setError(
                        `Vui lòng chọn ngày khởi hành ở dòng ${index + 1}`,
                    );
                    return;
                }

                if (!Number.isInteger(price) || price <= 0) {
                    setError(
                        `Giá vé ở dòng ${index + 1} phải là số nguyên lớn hơn 0`,
                    );
                    return;
                }

                if (usedDates.has(item.departureDate)) {
                    setError(
                        `Ngày ${item.departureDate} đang bị trùng`,
                    );
                    return;
                }

                usedDates.add(item.departureDate);
            }
        }

        const adjustment = Number(routeAdjustmentAmount);

        if (
            pricingMode === 'NORMAL' &&
            !Number.isInteger(adjustment)
        ) {
            setError('Giá điều chỉnh tuyến phải là số nguyên');
            return;
        }

        setIsSubmitting(true);

        try {
            await createPricingPolicy({
                routeId,
                pricingMode,
                baseOriginRoutePointId:
                    pricingMode === 'NORMAL'
                        ? baseOriginRoutePointId
                        : null,
                direction,
                vehicleType: vehicleType || null,
                version: Number(version),
                effectiveFrom: new Date(effectiveFrom).toISOString(),
                effectiveTo: effectiveTo
                    ? new Date(effectiveTo).toISOString()
                    : null,
                routeAdjustmentAmount:
                    pricingMode === 'NORMAL'
                        ? adjustment
                        : 0,
                ...(pricingMode === 'TET'
                    ? {
                          tetDailyPrices: tetDailyPrices.map((item) => ({
                              departureDate: item.departureDate,
                              price: Number(item.price),
                          })),
                      }
                    : {}),
            });

            await onSuccess('Tạo bản nháp chính sách giá thành công!');
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Tạo chính sách giá thất bại',
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            Tạo chính sách giá
                        </h2>
                        <p className="mt-1 text-xs text-slate-500">
                            Chính sách mới sẽ được tạo ở trạng thái bản nháp
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        aria-label="Đóng"
                        className="rounded-lg px-2 py-1 text-2xl leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                        ×
                    </button>
                </div>

                {isLoading ? (
                    <div className="p-10 text-center text-sm text-slate-500">
                        Đang tải dữ liệu...
                    </div>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6 p-5 sm:p-6"
                    >
                        <section className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-900">
                                1. Phạm vi chính sách
                            </h3>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Tuyến xe
                                </label>

                                <select
                                    value={routeId}
                                    onChange={(event) =>
                                        handleRouteChange(event.target.value)
                                    }
                                    required
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                >
                                    <option value="">Chọn tuyến xe</option>
                                    {routes.map((route) => (
                                        <option key={route.id} value={route.id}>
                                            {route.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Loại chính sách
                                    </label>

                                    <select
                                        value={pricingMode}
                                        onChange={(event) => {
                                            setPricingMode(
                                                event.target.value as PricingMode,
                                            );
                                            setBaseOriginRoutePointId('');
                                            setRouteAdjustmentAmount('0');
                                            setError('');
                                        }}
                                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-red-500"
                                    >
                                        <option value="NORMAL">
                                            Thông thường (NORMAL)
                                        </option>
                                        <option value="TET">
                                            Tết (TET)
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Chiều chạy
                                    </label>

                                    <select
                                        value={direction}
                                        onChange={(event) =>
                                            setDirection(
                                                event.target.value as TripDirection,
                                            )
                                        }
                                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-red-500"
                                    >
                                        <option value="OUTBOUND">
                                            Chiều đi
                                        </option>
                                        <option value="RETURN">
                                            Chiều về
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Phạm vi loại xe
                                    {pricingMode === 'TET' && (
                                        <span className="ml-1 text-red-600">*</span>
                                    )}
                                </label>

                                <select
                                    value={vehicleType}
                                    onChange={(event) =>
                                        setVehicleType(event.target.value)
                                    }
                                    required={pricingMode === 'TET'}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-red-500"
                                >
                                    <option value="">
                                        {pricingMode === 'TET'
                                            ? 'Chọn loại xe'
                                            : 'Áp dụng cho tất cả loại xe'}
                                    </option>
                                    {vehicleTypes.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>

                                <p className="mt-1 text-xs text-slate-500">
                                    {pricingMode === 'TET'
                                        ? 'Mỗi chính sách Tết áp dụng cho một loại xe cụ thể.'
                                        : 'Để trống nếu chính sách NORMAL áp dụng chung cho mọi loại xe.'}
                                </p>
                            </div>
                        </section>

                        <div className="border-t border-slate-100" />

                        <section className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-900">
                                2. Cấu hình giá
                            </h3>

                            {pricingMode === 'NORMAL' ? (
                                <>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                            Điểm xuất phát gốc
                                        </label>

                                        <select
                                            value={baseOriginRoutePointId}
                                            onChange={(event) =>
                                                setBaseOriginRoutePointId(
                                                    event.target.value,
                                                )
                                            }
                                            required
                                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-red-500"
                                        >
                                            <option value="">
                                                Chọn điểm xuất phát gốc
                                            </option>

                                            {routePoints.map((point) => (
                                                <option
                                                    key={point.id}
                                                    value={point.id}
                                                >
                                                    {point.sequence}. {point.name}
                                                </option>
                                            ))}
                                        </select>

                                        <p className="mt-1 text-xs text-slate-500">
                                            Đây là mốc gốc để BE xác định giá theo chính sách NORMAL.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                            Giá điều chỉnh tuyến (VNĐ)
                                        </label>

                                        <input
                                            type="number"
                                            step="1"
                                            value={routeAdjustmentAmount}
                                            onChange={(event) =>
                                                setRouteAdjustmentAmount(
                                                    event.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-red-500"
                                        />

                                        <p className="mt-1 text-xs text-slate-500">
                                            Có thể nhập số âm hoặc dương. Mặc định là 0.
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
                                        Giá RoutePoint, ServicePoint và giá Override
                                        sẽ được cấu hình trong màn hình chi tiết
                                        chính sách sau khi tạo bản nháp.
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-4">
                                    <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                                        <p className="text-sm font-semibold text-red-800">
                                            Bảng giá Tết theo ngày khởi hành
                                        </p>
                                        <p className="mt-1 text-xs leading-5 text-red-700">
                                            Nhập giá toàn tuyến cho từng ngày.
                                            Mỗi ngày chỉ được khai báo một mức giá
                                            trong chính sách này.
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        {tetDailyPrices.map((item, index) => (
                                            <div
                                                key={index}
                                                className="grid grid-cols-1 items-end gap-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-[1fr_1fr_auto]"
                                            >
                                                <div>
                                                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                                                        Ngày khởi hành
                                                    </label>

                                                    <input
                                                        type="date"
                                                        value={item.departureDate}
                                                        onChange={(event) =>
                                                            handleTetDailyPriceChange(
                                                                index,
                                                                'departureDate',
                                                                event.target.value,
                                                            )
                                                        }
                                                        required
                                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                                                        Giá vé (VNĐ)
                                                    </label>

                                                    <input
                                                        type="number"
                                                        min="1"
                                                        step="1"
                                                        value={item.price}
                                                        onChange={(event) =>
                                                            handleTetDailyPriceChange(
                                                                index,
                                                                'price',
                                                                event.target.value,
                                                            )
                                                        }
                                                        required
                                                        placeholder="Ví dụ: 2200000"
                                                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                                    />
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveTetDailyPrice(index)
                                                    }
                                                    disabled={tetDailyPrices.length === 1}
                                                    title="Xóa ngày giá này"
                                                    className="h-10 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                                                >
                                                    Xóa
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleAddTetDailyPrice}
                                        className="inline-flex items-center gap-2 rounded-lg border border-dashed border-red-300 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                                    >
                                        <span className="text-lg leading-none">+</span>
                                        Thêm ngày giá
                                    </button>

                                    <p className="text-xs leading-5 text-slate-500">
                                        Giá được áp dụng theo ngày khởi hành và
                                        loại xe đã chọn. Nếu ngày khởi hành không
                                        có giá được khai báo, hệ thống sẽ yêu cầu
                                        khách liên hệ nhân viên.
                                    </p>
                                </div>
                            )}
                        </section>

                        <div className="border-t border-slate-100" />

                        <section className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-900">
                                3. Phiên bản và thời gian hiệu lực
                            </h3>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Phiên bản
                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={version}
                                        onChange={(event) =>
                                            setVersion(event.target.value)
                                        }
                                        required
                                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-red-500"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Bắt đầu hiệu lực
                                    </label>

                                    <input
                                        type="datetime-local"
                                        value={effectiveFrom}
                                        onChange={(event) =>
                                            setEffectiveFrom(event.target.value)
                                        }
                                        required
                                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-red-500"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Kết thúc hiệu lực
                                    </label>

                                    <input
                                        type="datetime-local"
                                        value={effectiveTo}
                                        onChange={(event) =>
                                            setEffectiveTo(event.target.value)
                                        }
                                        min={effectiveFrom || undefined}
                                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-red-500"
                                    />

                                    <p className="mt-1 text-xs text-slate-500">
                                        Để trống nếu không đặt thời điểm kết thúc.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {error && (
                            <p className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
                                {error}
                            </p>
                        )}

                        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="w-full rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:w-auto"
                            >
                                Hủy
                            </button>

                            <button
                                type="submit"
                                disabled={
                                    isSubmitting ||
                                    isLoading ||
                                    routes.length === 0
                                }
                                className="w-full rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                            >
                                {isSubmitting
                                    ? 'Đang tạo...'
                                    : 'Tạo bản nháp'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
