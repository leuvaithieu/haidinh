
'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

import { apiFetch } from '@/lib/api';

import {
    getPricingPolicy,
    updatePricingPolicy,
} from '../../lib/pricing-api';

import type {
    PricingPolicyDetail,
    PriceEntryType,
    PricePointType,
    RoutePointPrice,
    ServicePointPrice,
    RoutePriceOverride,
} from '../../components/pricing-types';

import type {
    RoutePointPricePayload,
    ServicePointPricePayload,
    RoutePriceOverridePayload,
} from '../../lib/pricing-api';

import Toast from '@/app/admin/components/Toast';

type RoutePointPriceForm = {
    routePointId: string;
    priceType: PriceEntryType;
    price: string;
};

type ServicePointPriceForm = {
    servicePointId: string;
    priceType: PriceEntryType;
    price: string;
};

type OverrideForm = {
    fromPointType: PricePointType;
    toPointType: PricePointType;
    fromPointKey: string;
    toPointKey: string;
    priceType: PriceEntryType;
    price: string;
};

export default function EditPricingPolicyPage() {
    const params = useParams();
    const router = useRouter();

    const policyId = params.id as string;

    const [policy, setPolicy] =
        useState<PricingPolicyDetail | null>(null);

    const [currentUserRole, setCurrentUserRole] = useState('');

    const [baseOriginRoutePointId, setBaseOriginRoutePointId] =
        useState('');

    const [vehicleType, setVehicleType] = useState('');
    const [version, setVersion] = useState('1');
    const [direction, setDirection] = useState<'OUTBOUND' | 'RETURN'>(
        'OUTBOUND',
    );

    const [effectiveFrom, setEffectiveFrom] = useState('');
    const [effectiveTo, setEffectiveTo] = useState('');

    const [fullRoutePrice, setFullRoutePrice] = useState('');
    const [routeAdjustmentAmount, setRouteAdjustmentAmount] =
        useState('0');

    const [routePointPrices, setRoutePointPrices] =
        useState<RoutePointPriceForm[]>([]);

    const [servicePointPrices, setServicePointPrices] =
        useState<ServicePointPriceForm[]>([]);

    const [priceOverrides, setPriceOverrides] =
        useState<OverrideForm[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Chuyển ngày ISO sang giá trị phù hợp với input datetime-local.
    function toLocalDateTime(value: string | null) {
        if (!value) return '';

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) return '';

        const offset = date.getTimezoneOffset() * 60000;

        return new Date(date.getTime() - offset)
            .toISOString()
            .slice(0, 16);
    }

    // Lấy dữ liệu chính sách và quyền người dùng hiện tại.
    async function loadData() {
        setIsLoading(true);
        setError('');

        try {
            const [policyData, userResponse] = await Promise.all([
                getPricingPolicy(policyId),
                apiFetch('/auth/me'),
            ]);

            if (!userResponse.ok) {
                throw new Error('Không thể xác định quyền người dùng');
            }

            const userData = await userResponse.json();

            setCurrentUserRole(userData.role);
            setPolicy(policyData);

            setBaseOriginRoutePointId(
                policyData.baseOriginRoutePointId || '',
            );

            setVehicleType(policyData.vehicleType || '');
            setVersion(String(policyData.version));
            setDirection(policyData.direction);

            setEffectiveFrom(
                toLocalDateTime(policyData.effectiveFrom),
            );

            setEffectiveTo(
                toLocalDateTime(policyData.effectiveTo),
            );

            setFullRoutePrice(
                policyData.fullRoutePrice != null
                    ? String(policyData.fullRoutePrice)
                    : '',
            );

            setRouteAdjustmentAmount(
                String(policyData.routeAdjustmentAmount ?? 0),
            );

            setRoutePointPrices(
                (policyData.routePointPrices || []).map(
                    (item: RoutePointPrice) => ({
                        routePointId: item.routePointId,
                        priceType: item.priceType,
                        price:
                            item.price != null
                                ? String(item.price)
                                : '',
                    }),
                ),
            );

            setServicePointPrices(
                (policyData.servicePointPrices || []).map(
                    (item: ServicePointPrice) => ({
                        servicePointId: item.servicePointId,
                        priceType: item.priceType,
                        price:
                            item.price != null
                                ? String(item.price)
                                : '',
                    }),
                ),
            );

            setPriceOverrides(
                (policyData.priceOverrides || []).map(
                    (item: RoutePriceOverride) => ({
                        fromPointType: item.fromPointType,
                        toPointType: item.toPointType,
                        fromPointKey: item.fromPointKey,
                        toPointKey: item.toPointKey,
                        priceType: item.priceType,
                        price:
                            item.price != null
                                ? String(item.price)
                                : '',
                    }),
                ),
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Không thể tải dữ liệu chính sách giá',
            );
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (policyId) {
            void loadData();
        }
    }, [policyId]);

    // Lấy tên hiển thị của một điểm tuyến hoặc điểm dịch vụ.
    function getPointName(pointKey: string) {
        if (!policy) return pointKey;

        const [type, id] = pointKey.split(':');

        if (type === 'RP') {
            const point = policy.route.routePoints.find(
                (item) => item.id === id,
            );

            return point
                ? `Điểm tuyến: ${point.name}`
                : pointKey;
        }

        if (type === 'SP') {
            for (const routePoint of policy.route.routePoints) {
                const servicePoint = routePoint.servicePoints.find(
                    (item) => item.id === id,
                );

                if (servicePoint) {
                    return `Điểm dịch vụ: ${servicePoint.name}`;
                }
            }
        }

        return pointKey;
    }

    // Thêm một dòng cấu hình giá RoutePoint.
    function handleAddRoutePointPrice() {
        if (!policy) return;

        const usedIds = routePointPrices.map(
            (item) => item.routePointId,
        );

        const availablePoint = policy.route.routePoints.find(
            (item) => !usedIds.includes(item.id),
        );

        if (!availablePoint) {
            setError('Tất cả RoutePoint đã được cấu hình giá');
            return;
        }

        setRoutePointPrices((current) => [
            ...current,
            {
                routePointId: availablePoint.id,
                priceType: 'CONTACT',
                price: '',
            },
        ]);

        setError('');
    }

    // Thêm một dòng cấu hình giá ServicePoint.
    function handleAddServicePointPrice() {
        if (!policy) return;

        const allServicePoints = policy.route.routePoints.flatMap(
            (point) => point.servicePoints,
        );

        const usedIds = servicePointPrices.map(
            (item) => item.servicePointId,
        );

        const availablePoint = allServicePoints.find(
            (item) => !usedIds.includes(item.id),
        );

        if (!availablePoint) {
            setError('Tất cả ServicePoint đã được cấu hình giá');
            return;
        }

        setServicePointPrices((current) => [
            ...current,
            {
                servicePointId: availablePoint.id,
                priceType: 'CONTACT',
                price: '',
            },
        ]);

        setError('');
    }

    // Thêm một dòng giá Override.
    function handleAddOverride() {
        setPriceOverrides((current) => [
            ...current,
            {
                fromPointType: 'ROUTE_POINT',
                toPointType: 'ROUTE_POINT',
                fromPointKey: '',
                toPointKey: '',
                priceType: 'CONTACT',
                price: '',
            },
        ]);

        setError('');
    }

    // Lấy danh sách điểm có thể dùng làm điểm đón hoặc điểm trả.
    function getPointOptions(pointType: PricePointType) {
        if (!policy) return [];

        if (pointType === 'ROUTE_POINT') {
            return policy.route.routePoints.map((point) => ({
                key: `RP:${point.id}`,
                name: point.name,
            }));
        }

        return policy.route.routePoints.flatMap((routePoint) =>
            routePoint.servicePoints.map((servicePoint) => ({
                key: `SP:${servicePoint.id}`,
                name: `${servicePoint.name} (${routePoint.name})`,
            })),
        );
    }

    // Kiểm tra giá FIXED và CONTACT trước khi gửi lên BE.
    function validatePrice(
        priceType: PriceEntryType,
        price: string,
        label: string,
    ) {
        if (priceType === 'FIXED') {
            const amount = Number(price);

            if (!Number.isInteger(amount) || amount <= 0) {
                throw new Error(
                    `${label}: giá FIXED phải là số nguyên lớn hơn 0`,
                );
            }
        }

        if (priceType === 'CONTACT' && price.trim() !== '') {
            throw new Error(
                `${label}: giá CONTACT không được nhập số tiền`,
            );
        }
    }

    // Kiểm tra dữ liệu và lưu toàn bộ cấu hình chính sách giá.
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError('');

        if (!policy || currentUserRole !== 'ADMIN') {
            setError('Bạn không có quyền chỉnh sửa chính sách giá');
            return;
        }

        if (policy.status !== 'DRAFT') {
            setError('Chỉ được chỉnh sửa chính sách DRAFT');
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

        if (
            policy.pricingMode === 'NORMAL' &&
            !baseOriginRoutePointId
        ) {
            setError('Vui lòng chọn điểm xuất phát gốc');
            return;
        }

        if (policy.pricingMode === 'TET') {
            const amount = Number(fullRoutePrice);

            if (!Number.isInteger(amount) || amount <= 0) {
                setError('Giá toàn tuyến Tết phải lớn hơn 0');
                return;
            }
        }

        try {
            routePointPrices.forEach((item, index) => {
                validatePrice(
                    item.priceType,
                    item.price,
                    `RoutePoint ${index + 1}`,
                );
            });

            servicePointPrices.forEach((item, index) => {
                validatePrice(
                    item.priceType,
                    item.price,
                    `ServicePoint ${index + 1}`,
                );
            });

            priceOverrides.forEach((item, index) => {
                validatePrice(
                    item.priceType,
                    item.price,
                    `Override ${index + 1}`,
                );

                if (!item.fromPointKey || !item.toPointKey) {
                    throw new Error(
                        `Override ${index + 1}: vui lòng chọn đủ điểm đón và điểm trả`,
                    );
                }

                if (item.fromPointKey === item.toPointKey) {
                    throw new Error(
                        `Override ${index + 1}: điểm đón và điểm trả không được trùng nhau`,
                    );
                }
            });

            const duplicateRoutePoints = new Set(
                routePointPrices.map((item) => item.routePointId),
            );

            if (duplicateRoutePoints.size !== routePointPrices.length) {
                throw new Error('Không được cấu hình trùng RoutePoint');
            }

            const duplicateServicePoints = new Set(
                servicePointPrices.map((item) => item.servicePointId),
            );

            if (
                duplicateServicePoints.size !==
                servicePointPrices.length
            ) {
                throw new Error('Không được cấu hình trùng ServicePoint');
            }

            const overrideKeys = priceOverrides.map(
                (item) =>
                    `${item.fromPointKey}->${item.toPointKey}`,
            );

            if (new Set(overrideKeys).size !== overrideKeys.length) {
                throw new Error('Không được cấu hình trùng cặp Override');
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Dữ liệu giá không hợp lệ',
            );
            return;
        }

        setIsSubmitting(true);

        try {
            const routePointPayload: RoutePointPricePayload[] =
                routePointPrices.map((item) => ({
                    routePointId: item.routePointId,
                    priceType: item.priceType,
                    price:
                        item.priceType === 'FIXED'
                            ? Number(item.price)
                            : null,
                }));

            const servicePointPayload: ServicePointPricePayload[] =
                servicePointPrices.map((item) => ({
                    servicePointId: item.servicePointId,
                    priceType: item.priceType,
                    price:
                        item.priceType === 'FIXED'
                            ? Number(item.price)
                            : null,
                }));

            const overridePayload: RoutePriceOverridePayload[] =
                priceOverrides.map((item) => {
                    const [fromPrefix, fromId] =
                        item.fromPointKey.split(':');

                    const [toPrefix, toId] =
                        item.toPointKey.split(':');

                    return {
                        fromPointType: item.fromPointType,
                        toPointType: item.toPointType,
                        fromPointKey: item.fromPointKey,
                        toPointKey: item.toPointKey,

                        ...(fromPrefix === 'RP'
                            ? { fromRoutePointId: fromId }
                            : { fromServicePointId: fromId }),

                        ...(toPrefix === 'RP'
                            ? { toRoutePointId: toId }
                            : { toServicePointId: toId }),

                        priceType: item.priceType,
                        price:
                            item.priceType === 'FIXED'
                                ? Number(item.price)
                                : null,
                    };
                });

            await updatePricingPolicy(policy.id, {
                direction,
                vehicleType: vehicleType || null,
                version: Number(version),
                baseOriginRoutePointId:
                    policy.pricingMode === 'NORMAL'
                        ? baseOriginRoutePointId
                        : null,
                effectiveFrom: new Date(effectiveFrom).toISOString(),
                effectiveTo: effectiveTo
                    ? new Date(effectiveTo).toISOString()
                    : null,

                fullRoutePrice:
                    policy.pricingMode === 'TET'
                        ? Number(fullRoutePrice)
                        : null,

                routeAdjustmentAmount:
                    policy.pricingMode === 'NORMAL'
                        ? Number(routeAdjustmentAmount)
                        : 0,

                routePointPrices:
                    policy.pricingMode === 'NORMAL'
                        ? routePointPayload
                        : [],

                servicePointPrices:
                    policy.pricingMode === 'NORMAL'
                        ? servicePointPayload
                        : [],

                priceOverrides:
                    policy.pricingMode === 'NORMAL'
                        ? overridePayload
                        : [],
            });

            router.push(`/admin/pricing/${policy.id}`);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Không thể cập nhật chính sách giá',
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
                Đang tải dữ liệu chính sách giá...
            </div>
        );
    }

    if (!policy) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
                <p className="font-semibold text-slate-800">
                    Không tìm thấy chính sách giá
                </p>

                <button
                    type="button"
                    onClick={() => router.push('/admin/pricing')}
                    className="mt-4 text-sm font-semibold text-red-600 hover:text-red-700"
                >
                    Quay lại danh sách
                </button>
            </div>
        );
    }

    if (currentUserRole !== 'ADMIN' || policy.status !== 'DRAFT') {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
                <p className="font-semibold text-slate-800">
                    Không thể chỉnh sửa chính sách này
                </p>

                <p className="mt-2 text-sm text-slate-500">
                    Chỉ ADMIN mới được chỉnh sửa chính sách đang ở trạng thái DRAFT.
                </p>

                <button
                    type="button"
                    onClick={() =>
                        router.push(`/admin/pricing/${policy.id}`)
                    }
                    className="mt-4 text-sm font-semibold text-red-600 hover:text-red-700"
                >
                    Quay lại chi tiết
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <button
                    type="button"
                    onClick={() =>
                        router.push(`/admin/pricing/${policy.id}`)
                    }
                    className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-red-600"
                >
                    <ArrowLeft size={16} />
                    Quay lại chi tiết chính sách
                </button>

                <h1 className="text-2xl font-bold text-slate-900">
                    Chỉnh sửa chính sách giá
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    {policy.route.name}
                    {' · '}
                    {policy.pricingMode}
                    {' · '}
                    Phiên bản v{policy.version}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="mb-4 font-semibold text-slate-900">
                        Thông tin chính sách
                    </h2>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Tuyến xe
                            </label>

                            <input
                                value={policy.route.name}
                                disabled
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Loại chính sách
                            </label>

                            <input
                                value={policy.pricingMode}
                                disabled
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Chiều chạy
                            </label>

                            <select
                                value={direction}
                                onChange={(event) =>
                                    setDirection(
                                        event.target.value as
                                            | 'OUTBOUND'
                                            | 'RETURN',
                                    )
                                }
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-red-500"
                            >
                                <option value="OUTBOUND">Chiều đi</option>
                                <option value="RETURN">Chiều về</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Loại xe
                            </label>

                            <input
                                value={vehicleType}
                                onChange={(event) =>
                                    setVehicleType(event.target.value)
                                }
                                placeholder="Để trống áp dụng tất cả"
                                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-red-500"
                            />
                        </div>

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
                                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-red-500"
                            />
                        </div>

                        {policy.pricingMode === 'NORMAL' && (
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
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-red-500"
                                >
                                    <option value="">Chọn điểm gốc</option>

                                    {policy.route.routePoints.map((point) => (
                                        <option
                                            key={point.id}
                                            value={point.id}
                                        >
                                            {point.sequence}. {point.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

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

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Kết thúc hiệu lực
                            </label>

                            <input
                                type="datetime-local"
                                value={effectiveTo}
                                onChange={(event) =>
                                    setEffectiveTo(event.target.value)
                                }
                                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-red-500"
                            />
                        </div>
                    </div>
                </section>

                {policy.pricingMode === 'TET' ? (
                    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="mb-4 font-semibold text-slate-900">
                            Giá vé Tết toàn tuyến
                        </h2>

                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Giá vé (VNĐ)
                        </label>

                        <input
                            type="number"
                            min="1"
                            step="1"
                            value={fullRoutePrice}
                            onChange={(event) =>
                                setFullRoutePrice(event.target.value)
                            }
                            required
                            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-red-500"
                        />

                        <p className="mt-2 text-xs text-slate-500">
                            Chính sách Tết không sử dụng giá từng điểm hoặc Override.
                        </p>
                    </section>
                ) : (
                    <>
                        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="font-semibold text-slate-900">
                                        Giá RoutePoint
                                    </h2>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Giá theo từng điểm trên tuyến.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleAddRoutePointPrice}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                                >
                                    <Plus size={15} />
                                    Thêm điểm
                                </button>
                            </div>

                            <div className="space-y-3">
                                {routePointPrices.map((item, index) => (
                                    <div
                                        key={`${item.routePointId}-${index}`}
                                        className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-[1fr_150px_1fr_auto]"
                                    >
                                        <select
                                            value={item.routePointId}
                                            onChange={(event) =>
                                                setRoutePointPrices((current) =>
                                                    current.map((row, i) =>
                                                        i === index
                                                            ? {
                                                                ...row,
                                                                routePointId: event.target.value,
                                                            }
                                                            : row,
                                                    ),
                                                )
                                            }
                                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                                        >
                                            {policy.route.routePoints.map(
                                                (point) => (
                                                    <option
                                                        key={point.id}
                                                        value={point.id}
                                                    >
                                                        {point.sequence}. {point.name}
                                                    </option>
                                                ),
                                            )}
                                        </select>

                                        <select
                                            value={item.priceType}
                                            onChange={(event) =>
                                                setRoutePointPrices((current) =>
                                                    current.map((row, i) =>
                                                        i === index
                                                            ? {
                                                                ...row,
                                                                priceType: event.target.value as PriceEntryType,
                                                                price: '',
                                                            }
                                                            : row,
                                                    ),
                                                )
                                            }
                                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                                        >
                                            <option value="FIXED">Giá cố định</option>
                                            <option value="CONTACT">Liên hệ</option>
                                        </select>

                                        {item.priceType === 'FIXED' ? (
                                            <input
                                                type="number"
                                                min="1"
                                                step="1"
                                                value={item.price}
                                                onChange={(event) =>
                                                    setRoutePointPrices((current) =>
                                                        current.map((row, i) =>
                                                            i === index
                                                                ? {
                                                                    ...row,
                                                                    price: event.target.value,
                                                                }
                                                                : row,
                                                        ),
                                                    )
                                                }
                                                placeholder="Giá vé (VNĐ)"
                                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                            />
                                        ) : (
                                            <div className="flex items-center text-sm text-slate-500">
                                                Khách liên hệ nhân viên
                                            </div>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setRoutePointPrices((current) =>
                                                    current.filter(
                                                        (_, i) => i !== index,
                                                    ),
                                                )
                                            }
                                            className="flex items-center justify-center rounded-lg p-2 text-red-600 hover:bg-red-50"
                                            aria-label="Xóa giá RoutePoint"
                                        >
                                            <Trash2 size={17} />
                                        </button>
                                    </div>
                                ))}

                                {routePointPrices.length === 0 && (
                                    <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                                        Chưa cấu hình giá RoutePoint.
                                    </p>
                                )}
                            </div>
                        </section>

                        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="font-semibold text-slate-900">
                                        Giá ServicePoint
                                    </h2>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Giá riêng tại các điểm dịch vụ.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleAddServicePointPrice}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                                >
                                    <Plus size={15} />
                                    Thêm điểm
                                </button>
                            </div>

                            <div className="space-y-3">
                                {servicePointPrices.map((item, index) => (
                                    <div
                                        key={`${item.servicePointId}-${index}`}
                                        className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-[1fr_150px_1fr_auto]"
                                    >
                                        <select
                                            value={item.servicePointId}
                                            onChange={(event) =>
                                                setServicePointPrices((current) =>
                                                    current.map((row, i) =>
                                                        i === index
                                                            ? {
                                                                ...row,
                                                                servicePointId: event.target.value,
                                                            }
                                                            : row,
                                                    ),
                                                )
                                            }
                                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                                        >
                                            {policy.route.routePoints.flatMap(
                                                (routePoint) =>
                                                    routePoint.servicePoints.map(
                                                        (point) => (
                                                            <option
                                                                key={point.id}
                                                                value={point.id}
                                                            >
                                                                {point.name} ({routePoint.name})
                                                            </option>
                                                        ),
                                                    ),
                                            )}
                                        </select>

                                        <select
                                            value={item.priceType}
                                            onChange={(event) =>
                                                setServicePointPrices((current) =>
                                                    current.map((row, i) =>
                                                        i === index
                                                            ? {
                                                                ...row,
                                                                priceType: event.target.value as PriceEntryType,
                                                                price: '',
                                                            }
                                                            : row,
                                                    ),
                                                )
                                            }
                                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                                        >
                                            <option value="FIXED">Giá cố định</option>
                                            <option value="CONTACT">Liên hệ</option>
                                        </select>

                                        {item.priceType === 'FIXED' ? (
                                            <input
                                                type="number"
                                                min="1"
                                                step="1"
                                                value={item.price}
                                                onChange={(event) =>
                                                    setServicePointPrices((current) =>
                                                        current.map((row, i) =>
                                                            i === index
                                                                ? {
                                                                    ...row,
                                                                    price: event.target.value,
                                                                }
                                                                : row,
                                                        ),
                                                    )
                                                }
                                                placeholder="Giá vé (VNĐ)"
                                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                            />
                                        ) : (
                                            <div className="flex items-center text-sm text-slate-500">
                                                Khách liên hệ nhân viên
                                            </div>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setServicePointPrices((current) =>
                                                    current.filter(
                                                        (_, i) => i !== index,
                                                    ),
                                                )
                                            }
                                            className="flex items-center justify-center rounded-lg p-2 text-red-600 hover:bg-red-50"
                                            aria-label="Xóa giá ServicePoint"
                                        >
                                            <Trash2 size={17} />
                                        </button>
                                    </div>
                                ))}

                                {servicePointPrices.length === 0 && (
                                    <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                                        Chưa cấu hình giá ServicePoint.
                                    </p>
                                )}
                            </div>
                        </section>

                        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="font-semibold text-slate-900">
                                        Giá Override
                                    </h2>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Giá riêng cho một cặp điểm đón và trả.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleAddOverride}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                                >
                                    <Plus size={15} />
                                    Thêm Override
                                </button>
                            </div>

                            <div className="space-y-4">
                                {priceOverrides.map((item, index) => (
                                    <div
                                        key={index}
                                        className="space-y-3 rounded-lg border border-slate-200 p-4"
                                    >
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-slate-600">
                                                    Loại điểm đón
                                                </label>

                                                <select
                                                    value={item.fromPointType}
                                                    onChange={(event) =>
                                                        setPriceOverrides((current) =>
                                                            current.map((row, i) =>
                                                                i === index
                                                                    ? {
                                                                        ...row,
                                                                        fromPointType: event.target.value as PricePointType,
                                                                        fromPointKey: '',
                                                                    }
                                                                    : row,
                                                            ),
                                                        )
                                                    }
                                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                                                >
                                                    <option value="ROUTE_POINT">
                                                        RoutePoint
                                                    </option>
                                                    <option value="SERVICE_POINT">
                                                        ServicePoint
                                                    </option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-slate-600">
                                                    Điểm đón
                                                </label>

                                                <select
                                                    value={item.fromPointKey}
                                                    onChange={(event) =>
                                                        setPriceOverrides((current) =>
                                                            current.map((row, i) =>
                                                                i === index
                                                                    ? {
                                                                        ...row,
                                                                        fromPointKey: event.target.value,
                                                                    }
                                                                    : row,
                                                            ),
                                                        )
                                                    }
                                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                                                >
                                                    <option value="">
                                                        Chọn điểm đón
                                                    </option>

                                                    {getPointOptions(
                                                        item.fromPointType,
                                                    ).map((point) => (
                                                        <option
                                                            key={point.key}
                                                            value={point.key}
                                                        >
                                                            {point.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-slate-600">
                                                    Loại điểm trả
                                                </label>

                                                <select
                                                    value={item.toPointType}
                                                    onChange={(event) =>
                                                        setPriceOverrides((current) =>
                                                            current.map((row, i) =>
                                                                i === index
                                                                    ? {
                                                                        ...row,
                                                                        toPointType: event.target.value as PricePointType,
                                                                        toPointKey: '',
                                                                    }
                                                                    : row,
                                                            ),
                                                        )
                                                    }
                                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                                                >
                                                    <option value="ROUTE_POINT">
                                                        RoutePoint
                                                    </option>
                                                    <option value="SERVICE_POINT">
                                                        ServicePoint
                                                    </option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-slate-600">
                                                    Điểm trả
                                                </label>

                                                <select
                                                    value={item.toPointKey}
                                                    onChange={(event) =>
                                                        setPriceOverrides((current) =>
                                                            current.map((row, i) =>
                                                                i === index
                                                                    ? {
                                                                        ...row,
                                                                        toPointKey: event.target.value,
                                                                    }
                                                                    : row,
                                                            ),
                                                        )
                                                    }
                                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                                                >
                                                    <option value="">
                                                        Chọn điểm trả
                                                    </option>

                                                    {getPointOptions(
                                                        item.toPointType,
                                                    ).map((point) => (
                                                        <option
                                                            key={point.key}
                                                            value={point.key}
                                                        >
                                                            {point.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-slate-600">
                                                    Loại giá
                                                </label>

                                                <select
                                                    value={item.priceType}
                                                    onChange={(event) =>
                                                        setPriceOverrides((current) =>
                                                            current.map((row, i) =>
                                                                i === index
                                                                    ? {
                                                                        ...row,
                                                                        priceType: event.target.value as PriceEntryType,
                                                                        price: '',
                                                                    }
                                                                    : row,
                                                            ),
                                                        )
                                                    }
                                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                                                >
                                                    <option value="FIXED">
                                                        Giá cố định
                                                    </option>
                                                    <option value="CONTACT">
                                                        Liên hệ
                                                    </option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-slate-600">
                                                    Giá vé (VNĐ)
                                                </label>

                                                {item.priceType === 'FIXED' ? (
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        step="1"
                                                        value={item.price}
                                                        onChange={(event) =>
                                                            setPriceOverrides((current) =>
                                                                current.map((row, i) =>
                                                                    i === index
                                                                        ? {
                                                                            ...row,
                                                                            price: event.target.value,
                                                                        }
                                                                        : row,
                                                                ),
                                                            )
                                                        }
                                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                                    />
                                                ) : (
                                                    <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500">
                                                        Liên hệ nhân viên
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setPriceOverrides((current) =>
                                                        current.filter(
                                                            (_, i) => i !== index,
                                                        ),
                                                    )
                                                }
                                                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 size={15} />
                                                Xóa Override
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {priceOverrides.length === 0 && (
                                    <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                                        Chưa cấu hình giá Override.
                                    </p>
                                )}
                            </div>
                        </section>

                        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h2 className="mb-3 font-semibold text-slate-900">
                                Điều chỉnh giá tuyến
                            </h2>

                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Số tiền điều chỉnh (VNĐ)
                            </label>

                            <input
                                type="number"
                                step="1"
                                value={routeAdjustmentAmount}
                                onChange={(event) =>
                                    setRouteAdjustmentAmount(event.target.value)
                                }
                                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-red-500"
                            />

                            <p className="mt-1 text-xs text-slate-500">
                                Có thể nhập số âm hoặc số dương. Mặc định là 0.
                            </p>
                        </section>
                    </>
                )}

                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={() =>
                            router.push(`/admin/pricing/${policy.id}`)
                        }
                        disabled={isSubmitting}
                        className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
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
                            : 'Lưu thay đổi'}
                    </button>
                </div>
            </form>
        </div>
    );
}
