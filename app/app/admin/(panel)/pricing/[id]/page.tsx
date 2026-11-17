
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CalendarDays, Tag } from 'lucide-react';

import {
    getPricingPolicy,
    activatePricingPolicy,
    archivePricingPolicy,
} from '../lib/pricing-api';

import { apiFetch } from '@/lib/api';

import type {
    PricingPolicyDetail,
    PriceEntryType,
    PricingToastState,
} from '../components/pricing-types';

import Toast from '../../../components/Toast';
import ConfirmModal from '../../../components/ConfirmModal';

export default function PricingPolicyDetailPage() {
    const params = useParams();
    const router = useRouter();

    const policyId = params.id as string;

    const [policy, setPolicy] = useState<PricingPolicyDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState<PricingToastState>(null);

    const [currentUserRole, setCurrentUserRole] = useState('');
    const [pendingAction, setPendingAction] = useState<
        'ACTIVATE' | 'ARCHIVE' | null
    >(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Lấy chi tiết chính sách giá từ BE.
    async function loadPolicy() {
        setIsLoading(true);

        try {
            const data = await getPricingPolicy(policyId);
            setPolicy(data);
        } catch (error) {
            setToast({
                message:
                    error instanceof Error
                        ? error.message
                        : 'Không thể tải chi tiết chính sách giá',
                type: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    }

    // Lấy vai trò tài khoản hiện tại để giới hạn thao tác quản trị.
    async function loadCurrentUser() {
        try {
            const response = await apiFetch('/auth/me');

            if (!response.ok) return;

            const data = await response.json();
            setCurrentUserRole(data.role);
        } catch {
            setCurrentUserRole('');
        }
    }

    // Thực hiện kích hoạt hoặc lưu trữ chính sách giá sau khi người dùng xác nhận.
    async function handlePolicyAction() {
        if (!policy || !pendingAction || currentUserRole !== 'ADMIN') {
            return;
        }

        setIsSubmitting(true);

        try {
            if (pendingAction === 'ACTIVATE') {
                await activatePricingPolicy(policy.id);

                setToast({
                    message: 'Kích hoạt chính sách giá thành công',
                    type: 'success',
                });
            } else {
                await archivePricingPolicy(policy.id);

                setToast({
                    message: 'Lưu trữ chính sách giá thành công',
                    type: 'success',
                });
            }

            setPendingAction(null);
            await loadPolicy();
        } catch (error) {
            setToast({
                message:
                    error instanceof Error
                        ? error.message
                        : 'Không thể thực hiện thao tác',
                type: 'error',
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    useEffect(() => {
        if (policyId) {
            void loadPolicy();
            void loadCurrentUser();
        }
    }, [policyId]);

    // Hiển thị tên trạng thái chính sách bằng tiếng Việt.
    function getStatusLabel(status: string) {
        const labels: Record<string, string> = {
            DRAFT: 'Bản nháp',
            ACTIVE: 'Đang áp dụng',
            ARCHIVED: 'Đã lưu trữ',
        };

        return labels[status] ?? status;
    }

    // Chọn màu trạng thái chính sách.
    function getStatusClass(status: string) {
        const classes: Record<string, string> = {
            DRAFT: 'bg-amber-50 text-amber-700 ring-amber-200',
            ACTIVE: 'bg-green-50 text-green-700 ring-green-200',
            ARCHIVED: 'bg-slate-100 text-slate-600 ring-slate-200',
        };

        return classes[status] ?? 'bg-slate-100 text-slate-600';
    }

    // Định dạng giá tiền Việt Nam.
    function formatPrice(price: number | null, priceType: PriceEntryType) {
        if (priceType === 'CONTACT') return 'Liên hệ';

        if (price == null) return '—';

        return `${price.toLocaleString('vi-VN')} đ`;
    }

    // Định dạng ngày giờ theo múi giờ Việt Nam.
    function formatDate(value: string | null) {
        if (!value) return 'Không giới hạn';

        return new Date(value).toLocaleString('vi-VN');
    }

    // Chuyển khóa điểm Override thành nhãn dễ đọc.
    function formatPointKey(key: string) {
        if (key.startsWith('RP:')) {
            return `RoutePoint · ${key.slice(3)}`;
        }

        if (key.startsWith('SP:')) {
            return `ServicePoint · ${key.slice(3)}`;
        }

        return key;
    }

    if (isLoading) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
                Đang tải chi tiết chính sách giá...
            </div>
        );
    }

    if (!policy) {
        return (
            <div className="space-y-4">
                <button
                    type="button"
                    onClick={() => router.push('/admin/pricing')}
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-red-600"
                >
                    <ArrowLeft size={16} />
                    Quay lại danh sách
                </button>

                <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
                    <p className="font-semibold text-slate-800">
                        Không tìm thấy chính sách giá
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                        Kiểm tra lại chính sách hoặc tải lại trang.
                    </p>
                </div>

                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <button
                    type="button"
                    onClick={() => router.push('/admin/pricing')}
                    className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-red-600"
                >
                    <ArrowLeft size={16} />
                    Quay lại danh sách chính sách
                </button>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <Tag size={22} className="text-red-600" />

                            <h1 className="text-2xl font-bold text-slate-900">
                                Chi tiết chính sách giá
                            </h1>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                            {policy.route?.name || 'Chưa xác định tuyến'}
                            {' · '}
                            Phiên bản v{policy.version}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <span
                            className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${getStatusClass(policy.status)}`}
                        >
                            {getStatusLabel(policy.status)}
                        </span>

                        {currentUserRole === 'ADMIN' && (
                            <>
                                {policy.status === 'DRAFT' && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                router.push(
                                                    `/admin/pricing/${policy.id}/edit`,
                                                )
                                            }
                                            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                        >
                                            Chỉnh sửa
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPendingAction('ACTIVATE')
                                            }
                                            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
                                        >
                                            Kích hoạt
                                        </button>
                                    </>
                                )}

                                {policy.status !== 'ARCHIVED' && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setPendingAction('ARCHIVE')
                                        }
                                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                                    >
                                        Lưu trữ
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 font-semibold text-slate-900">
                    Thông tin chính sách
                </h2>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    <div>
                        <p className="text-xs text-slate-500">Tuyến xe</p>
                        <p className="mt-1 font-semibold text-slate-900">
                            {policy.route?.name || '—'}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-slate-500">
                            Loại chính sách
                        </p>
                        <p className="mt-1 font-semibold text-slate-900">
                            {policy.pricingMode === 'NORMAL'
                                ? 'Thông thường (NORMAL)'
                                : 'Tết (TET)'}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-slate-500">Chiều chạy</p>
                        <p className="mt-1 font-semibold text-slate-900">
                            {policy.direction === 'OUTBOUND'
                                ? 'Chiều đi'
                                : 'Chiều về'}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-slate-500">Loại xe</p>
                        <p className="mt-1 font-semibold text-slate-900">
                            {policy.vehicleType || 'Tất cả loại xe'}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-slate-500">Phiên bản</p>
                        <p className="mt-1 font-semibold text-slate-900">
                            v{policy.version}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-slate-500">
                            Điểm xuất phát gốc
                        </p>
                        <p className="mt-1 font-semibold text-slate-900">
                            {policy.pricingMode === 'NORMAL'
                                ? policy.baseOriginRoutePoint?.name || '—'
                                : 'Không áp dụng'}
                        </p>
                    </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
                    <div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <CalendarDays size={14} />
                            Bắt đầu hiệu lực
                        </div>

                        <p className="mt-1 font-medium text-slate-800">
                            {formatDate(policy.effectiveFrom)}
                        </p>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <CalendarDays size={14} />
                            Kết thúc hiệu lực
                        </div>

                        <p className="mt-1 font-medium text-slate-800">
                            {formatDate(policy.effectiveTo)}
                        </p>
                    </div>
                </div>
            </section>

            {policy.pricingMode === 'TET' ? (
                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="font-semibold text-slate-900">
                        Giá vé Tết toàn tuyến
                    </h2>

                    <p className="mt-4 text-3xl font-bold text-red-600">
                        {policy.fullRoutePrice != null
                            ? `${policy.fullRoutePrice.toLocaleString('vi-VN')} đ`
                            : 'Chưa cấu hình'}
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                        Chính sách Tết sử dụng giá toàn tuyến, không cấu hình
                        giá RoutePoint, ServicePoint hoặc Override.
                    </p>
                </section>
            ) : (
                <>
                    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <h2 className="font-semibold text-slate-900">
                                Giá theo điểm tuyến (RoutePoint)
                            </h2>

                            <span className="text-xs text-slate-500">
                                {policy.routePointPrices?.length ?? 0} điểm
                            </span>
                        </div>

                        {policy.routePointPrices?.length ? (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[550px] text-left text-sm">
                                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                        <tr>
                                            <th className="px-4 py-3">
                                                Điểm tuyến
                                            </th>
                                            <th className="px-4 py-3">
                                                Loại giá
                                            </th>
                                            <th className="px-4 py-3 text-right">
                                                Giá vé
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {policy.routePointPrices.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-3 font-medium text-slate-800">
                                                    {item.routePoint?.name ||
                                                        item.routePointId}
                                                </td>

                                                <td className="px-4 py-3 text-slate-600">
                                                    {item.priceType}
                                                </td>

                                                <td className="px-4 py-3 text-right font-semibold text-slate-900">
                                                    {formatPrice(
                                                        item.price,
                                                        item.priceType,
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                                Chưa cấu hình giá tại RoutePoint.
                            </p>
                        )}
                    </section>

                    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <h2 className="font-semibold text-slate-900">
                                Giá theo điểm dịch vụ (ServicePoint)
                            </h2>

                            <span className="text-xs text-slate-500">
                                {policy.servicePointPrices?.length ?? 0} điểm
                            </span>
                        </div>

                        {policy.servicePointPrices?.length ? (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[550px] text-left text-sm">
                                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                        <tr>
                                            <th className="px-4 py-3">
                                                Điểm dịch vụ
                                            </th>
                                            <th className="px-4 py-3">
                                                Loại giá
                                            </th>
                                            <th className="px-4 py-3 text-right">
                                                Giá vé
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {policy.servicePointPrices.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-3 font-medium text-slate-800">
                                                    {item.servicePoint?.name ||
                                                        item.servicePointId}
                                                </td>

                                                <td className="px-4 py-3 text-slate-600">
                                                    {item.priceType}
                                                </td>

                                                <td className="px-4 py-3 text-right font-semibold text-slate-900">
                                                    {formatPrice(
                                                        item.price,
                                                        item.priceType,
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                                Chưa cấu hình giá tại ServicePoint.
                            </p>
                        )}
                    </section>

                    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <h2 className="font-semibold text-slate-900">
                                Giá Override theo cặp điểm
                            </h2>

                            <span className="text-xs text-slate-500">
                                {policy.priceOverrides?.length ?? 0} cặp điểm
                            </span>
                        </div>

                        {policy.priceOverrides?.length ? (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[700px] text-left text-sm">
                                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                        <tr>
                                            <th className="px-4 py-3">
                                                Điểm đón
                                            </th>
                                            <th className="px-4 py-3">
                                                Điểm trả
                                            </th>
                                            <th className="px-4 py-3">
                                                Loại giá
                                            </th>
                                            <th className="px-4 py-3 text-right">
                                                Giá vé
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {policy.priceOverrides.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-3 text-slate-700">
                                                    {formatPointKey(
                                                        item.fromPointKey,
                                                    )}
                                                </td>

                                                <td className="px-4 py-3 text-slate-700">
                                                    {formatPointKey(
                                                        item.toPointKey,
                                                    )}
                                                </td>

                                                <td className="px-4 py-3 text-slate-600">
                                                    {item.priceType}
                                                </td>

                                                <td className="px-4 py-3 text-right font-semibold text-slate-900">
                                                    {formatPrice(
                                                        item.price,
                                                        item.priceType,
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                                Chưa cấu hình giá Override.
                            </p>
                        )}
                    </section>

                    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="font-semibold text-slate-900">
                            Điều chỉnh giá tuyến
                        </h2>

                        <p className="mt-2 text-2xl font-bold text-slate-900">
                            {(policy.routeAdjustmentAmount ?? 0).toLocaleString(
                                'vi-VN',
                            )}{' '}
                            đ
                        </p>
                    </section>
                </>
            )}

            <ConfirmModal
                isOpen={pendingAction !== null}
                title={
                    pendingAction === 'ACTIVATE'
                        ? 'Kích hoạt chính sách giá'
                        : 'Lưu trữ chính sách giá'
                }
                message={
                    pendingAction === 'ACTIVATE'
                        ? 'Bạn có chắc chắn muốn kích hoạt chính sách này? Hệ thống sẽ kiểm tra dữ liệu và thời gian hiệu lực trước khi áp dụng.'
                        : 'Bạn có chắc chắn muốn lưu trữ chính sách này? Chính sách sẽ không tiếp tục được sử dụng.'
                }
                confirmText={
                    isSubmitting
                        ? 'Đang xử lý...'
                        : pendingAction === 'ACTIVATE'
                            ? 'Kích hoạt'
                            : 'Lưu trữ'
                }
                cancelText="Hủy"
                onConfirm={handlePolicyAction}
                onCancel={() => {
                    if (!isSubmitting) {
                        setPendingAction(null);
                    }
                }}
            />

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
