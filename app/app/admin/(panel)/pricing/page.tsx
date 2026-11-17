
'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, RefreshCw, Tag } from 'lucide-react';

import { useRouter } from 'next/navigation';

import {
    getPricingPolicies,
} from './lib/pricing-api';

import type {
    PricingPolicy,
    PricingToastState,
    PricingMode,
    PricePolicyStatus,
    TripDirection,
} from './components/pricing-types';
import PricingPolicyForm from './components/PricingPolicyForm';

import Toast from '../../components/Toast';

type FilterStatus = PricePolicyStatus | 'ALL';
type FilterMode = PricingMode | 'ALL';
type FilterDirection = TripDirection | 'ALL';

export default function PricingPage() {
    const router = useRouter();
    const [policies, setPolicies] = useState<PricingPolicy[]>([]);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');
    const [filterMode, setFilterMode] = useState<FilterMode>('ALL');
    const [filterDirection, setFilterDirection] =
        useState<FilterDirection>('ALL');

    const [currentUserRole, setCurrentUserRole] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState<PricingToastState>(null);

    const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

    // Lấy danh sách chính sách giá từ BE.
    async function loadPolicies() {
        setIsLoading(true);

        try {
            const data = await getPricingPolicies();
            setPolicies(data);
        } catch (error) {
            setToast({
                message:
                    error instanceof Error
                        ? error.message
                        : 'Không thể tải danh sách chính sách giá',
                type: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    }

    // Lấy vai trò người dùng hiện tại để kiểm soát quyền thao tác.
    async function loadCurrentUser() {
        try {
            const response = await fetch('/api/auth/me');

            if (!response.ok) return;

            const data = await response.json();
            setCurrentUserRole(data.role);
        } catch {
            setCurrentUserRole('');
        }
    }

    useEffect(() => {
        void loadPolicies();

        // Vai trò người dùng được lấy qua API backend.
        void (async () => {
            try {
                const response = await import('@/lib/api').then(
                    ({ apiFetch }) => apiFetch('/auth/me'),
                );

                if (!response.ok) return;

                const data = await response.json();
                setCurrentUserRole(data.role);
            } catch {
                setCurrentUserRole('');
            }
        })();
    }, []);

    // Chuyển trạng thái chính sách thành nhãn tiếng Việt.
    function getStatusLabel(status: PricePolicyStatus) {
        const labels: Record<PricePolicyStatus, string> = {
            DRAFT: 'Bản nháp',
            ACTIVE: 'Đang áp dụng',
            ARCHIVED: 'Đã lưu trữ',
        };

        return labels[status];
    }

    // Chuyển trạng thái chính sách thành màu hiển thị.
    function getStatusClass(status: PricePolicyStatus) {
        const classes: Record<PricePolicyStatus, string> = {
            DRAFT: 'bg-amber-50 text-amber-700 ring-amber-200',
            ACTIVE: 'bg-green-50 text-green-700 ring-green-200',
            ARCHIVED: 'bg-slate-100 text-slate-600 ring-slate-200',
        };

        return classes[status];
    }

    // Chuyển loại chính sách thành nhãn tiếng Việt.
    function getModeLabel(mode: PricingMode) {
        return mode === 'NORMAL' ? 'Thông thường' : 'Tết';
    }

    // Chuyển chiều chạy thành nhãn tiếng Việt.
    function getDirectionLabel(direction: TripDirection) {
        return direction === 'OUTBOUND' ? 'Chiều đi' : 'Chiều về';
    }

    // Định dạng ngày hiển thị theo múi giờ Việt Nam.
    function formatDate(value: string | null) {
        if (!value) return 'Không giới hạn';

        return new Date(value).toLocaleDateString('vi-VN');
    }

    const filteredPolicies = useMemo(() => {
        const keyword = search.trim().toLocaleLowerCase('vi');

        return policies.filter((policy) => {
            const matchesSearch =
                !keyword ||
                policy.route?.name
                    ?.toLocaleLowerCase('vi')
                    .includes(keyword) ||
                policy.vehicleType
                    ?.toLocaleLowerCase('vi')
                    .includes(keyword) ||
                String(policy.version).includes(keyword);

            const matchesStatus =
                filterStatus === 'ALL' ||
                policy.status === filterStatus;

            const matchesMode =
                filterMode === 'ALL' ||
                policy.pricingMode === filterMode;

            const matchesDirection =
                filterDirection === 'ALL' ||
                policy.direction === filterDirection;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesMode &&
                matchesDirection
            );
        });
    }, [
        policies,
        search,
        filterStatus,
        filterMode,
        filterDirection,
    ]);

    const canManage = currentUserRole === 'ADMIN';

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Quản lý chính sách giá
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Quản lý giá vé theo tuyến, chiều chạy và thời gian áp dụng
                    </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                        type="button"
                        onClick={loadPolicies}
                        disabled={isLoading}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                        <RefreshCw
                            size={16}
                            className={isLoading ? 'animate-spin' : ''}
                        />
                        Làm mới
                    </button>

                    {canManage && (
                        <button
                            type="button"
                            onClick={() => setIsCreateFormOpen(true)}
                            className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                        >
                            + Thêm chính sách
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-sm text-slate-500">
                        Tổng chính sách
                    </p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">
                        {policies.length}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-sm text-slate-500">
                        Đang áp dụng
                    </p>
                    <p className="mt-2 text-2xl font-bold text-green-600">
                        {policies.filter(
                            (policy) => policy.status === 'ACTIVE',
                        ).length}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-sm text-slate-500">
                        Bản nháp
                    </p>
                    <p className="mt-2 text-2xl font-bold text-amber-600">
                        {policies.filter(
                            (policy) => policy.status === 'DRAFT',
                        ).length}
                    </p>
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                    <Search size={18} className="text-slate-400" />
                    <h2 className="text-sm font-semibold text-slate-800">
                        Bộ lọc chính sách
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <input
                        type="text"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Tìm theo tuyến, loại xe, phiên bản..."
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    />

                    <select
                        value={filterStatus}
                        onChange={(event) =>
                            setFilterStatus(event.target.value as FilterStatus)
                        }
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-500"
                    >
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="DRAFT">Bản nháp</option>
                        <option value="ACTIVE">Đang áp dụng</option>
                        <option value="ARCHIVED">Đã lưu trữ</option>
                    </select>

                    <select
                        value={filterMode}
                        onChange={(event) =>
                            setFilterMode(event.target.value as FilterMode)
                        }
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-500"
                    >
                        <option value="ALL">Tất cả loại chính sách</option>
                        <option value="NORMAL">Thông thường</option>
                        <option value="TET">Tết</option>
                    </select>

                    <select
                        value={filterDirection}
                        onChange={(event) =>
                            setFilterDirection(
                                event.target.value as FilterDirection,
                            )
                        }
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-500"
                    >
                        <option value="ALL">Tất cả chiều chạy</option>
                        <option value="OUTBOUND">Chiều đi</option>
                        <option value="RETURN">Chiều về</option>
                    </select>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <Tag size={18} className="text-red-600" />
                        <h2 className="font-semibold text-slate-900">
                            Danh sách chính sách giá
                        </h2>
                    </div>

                    <span className="text-sm text-slate-500">
                        {filteredPolicies.length} / {policies.length} chính sách
                    </span>
                </div>

                {isLoading ? (
                    <div className="p-10 text-center text-sm text-slate-500">
                        Đang tải danh sách chính sách giá...
                    </div>
                ) : filteredPolicies.length === 0 ? (
                    <div className="p-10 text-center">
                        <Tag
                            size={32}
                            className="mx-auto mb-3 text-slate-300"
                        />
                        <p className="font-medium text-slate-700">
                            Không tìm thấy chính sách giá
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                            Thử thay đổi điều kiện tìm kiếm hoặc bộ lọc
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1050px] text-left text-sm">
                                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                    <tr>
                                        <th className="px-5 py-3 font-semibold">
                                            Tuyến
                                        </th>
                                        <th className="px-5 py-3 font-semibold">
                                            Loại giá
                                        </th>
                                        <th className="px-5 py-3 font-semibold">
                                            Chiều chạy
                                        </th>
                                        <th className="px-5 py-3 font-semibold">
                                            Loại xe
                                        </th>
                                        <th className="px-5 py-3 font-semibold">
                                            Phiên bản
                                        </th>
                                        <th className="px-5 py-3 font-semibold">
                                            Hiệu lực từ
                                        </th>
                                        <th className="px-5 py-3 font-semibold">
                                            Hiệu lực đến
                                        </th>
                                        <th className="px-5 py-3 font-semibold">
                                            Trạng thái
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {filteredPolicies.map((policy) => (
                                        <tr
                                            key={policy.id}
                                            onClick={() => router.push(`/admin/pricing/${policy.id}`)}
                                            title="Xem chi tiết chính sách giá"
                                            className="cursor-pointer transition hover:bg-red-50/50"
                                        >
                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-slate-900">
                                                    {policy.route?.name || '—'}
                                                </p>

                                                {policy.pricingMode === 'NORMAL' && (
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        Điểm gốc:{' '}
                                                        {policy.baseOriginRoutePoint?.name || '—'}
                                                    </p>
                                                )}

                                                {policy.pricingMode === 'TET' && (
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        Giá toàn tuyến:{' '}
                                                        {policy.fullRoutePrice != null
                                                            ? `${policy.fullRoutePrice.toLocaleString('vi-VN')} đ`
                                                            : '—'}
                                                    </p>
                                                )}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                                                    {getModeLabel(policy.pricingMode)}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-slate-700">
                                                {getDirectionLabel(policy.direction)}
                                            </td>

                                            <td className="px-5 py-4 text-slate-700">
                                                {policy.vehicleType || 'Tất cả'}
                                            </td>

                                            <td className="px-5 py-4 font-medium text-slate-700">
                                                v{policy.version}
                                            </td>

                                            <td className="px-5 py-4 text-slate-600">
                                                {formatDate(policy.effectiveFrom)}
                                            </td>

                                            <td className="px-5 py-4 text-slate-600">
                                                {formatDate(policy.effectiveTo)}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusClass(policy.status)}`}
                                                >
                                                    {getStatusLabel(policy.status)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
                            Chọn chính sách để xem và quản lý chi tiết sẽ được bổ sung ở bước tiếp theo.
                        </div>
                    </>
                )}
            </div>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            {isCreateFormOpen && (
                <PricingPolicyForm
                    onClose={() => setIsCreateFormOpen(false)}
                    onSuccess={async (message) => {
                        setIsCreateFormOpen(false);

                        await loadPolicies();

                        setToast({
                            message,
                            type: 'success',
                        });
                    }}
                />
            )}
        </div>
    );
}
