
'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

import RouteSegmentList from './components/RouteSegmentList';
import RouteSegmentForm from './components/RouteSegmentForm';

import type {
    Route,
    RouteSegment,
    RouteSegmentScheduleFilter,
    RouteSegmentToast,
} from './components/route-segment-types';

import ConfirmModal from '../../components/ConfirmModal';
import Toast from '../../components/Toast';

export default function RouteSegmentsPage() {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [segments, setSegments] = useState<RouteSegment[]>([]);

    const [selectedRouteId, setSelectedRouteId] = useState('');
    const [selectedScheduleType, setSelectedScheduleType] =
        useState<RouteSegmentScheduleFilter>('ALL');

    const [currentUserRole, setCurrentUserRole] = useState('');

    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const [editingSegment, setEditingSegment] =
        useState<RouteSegment | null>(null);

    const [segmentToDelete, setSegmentToDelete] =
        useState<RouteSegment | null>(null);

    const [toast, setToast] = useState<RouteSegmentToast>(null);

    const selectedRoute =
        routes.find((route) => route.id === selectedRouteId) ?? null;

    const isAdmin = currentUserRole === 'ADMIN';

    // Lấy thông tin người dùng hiện tại để xác định quyền thao tác.
    async function getCurrentUser() {
        try {
            const response = await apiFetch('/auth/me');

            if (!response.ok) {
                setCurrentUserRole('');
                return;
            }

            const data = await response.json();
            setCurrentUserRole(data.role ?? '');
        } catch {
            setCurrentUserRole('');
        }
    }

    // Lấy danh sách tuyến và các điểm tuyến phục vụ việc cấu hình chặng.
    async function getRoutes(): Promise<Route[]> {
        try {
            const response = await apiFetch('/routes');

            if (!response.ok) {
                const data = await response.json().catch(() => null);

                throw new Error(
                    data?.message || 'Không thể tải danh sách tuyến xe',
                );
            }

            const data: Route[] = await response.json();

            const sortedRoutes = data.map((route) => ({
                ...route,
                routePoints: [...(route.routePoints ?? [])].sort(
                    (a, b) => a.sequence - b.sequence,
                ),
            }));

            setRoutes(sortedRoutes);

            return sortedRoutes;
        } catch (error) {
            setToast({
                message:
                    error instanceof Error
                        ? error.message
                        : 'Không thể kết nối đến máy chủ',
                type: 'error',
            });

            return [];
        }
    }

    // Lấy danh sách chặng theo tuyến đang được chọn.
    async function getRouteSegments(routeId: string) {
        if (!routeId) {
            setSegments([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        try {
            const response = await apiFetch(
                `/route-segments?routeId=${encodeURIComponent(routeId)}`,
            );

            if (!response.ok) {
                const data = await response.json().catch(() => null);

                throw new Error(
                    data?.message || 'Không thể tải danh sách chặng tuyến',
                );
            }

            const data: RouteSegment[] = await response.json();

            setSegments(data);
        } catch (error) {
            setSegments([]);

            setToast({
                message:
                    error instanceof Error
                        ? error.message
                        : 'Không thể kết nối đến máy chủ',
                type: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    }

    // Khởi tạo trang bằng cách tải thông tin người dùng và danh sách tuyến.
    async function initializePage() {
        setIsLoading(true);

        const [routeData] = await Promise.all([
            getRoutes(),
            getCurrentUser(),
        ]);

        if (routeData.length > 0) {
            const firstRouteId = routeData[0].id;

            setSelectedRouteId(firstRouteId);
            await getRouteSegments(firstRouteId);
        } else {
            setSegments([]);
            setIsLoading(false);
        }
    }

    useEffect(() => {
        void initializePage();
    }, []);

    // Thay đổi tuyến đang quản lý và tải lại danh sách chặng tương ứng.
    async function handleChangeRoute(routeId: string) {
        setSelectedRouteId(routeId);
        setSelectedScheduleType('ALL');

        await getRouteSegments(routeId);
    }

    // Mở biểu mẫu tạo chặng mới cho tuyến đang chọn.
    function handleAddSegment() {
        if (!selectedRoute || !isAdmin) return;

        setEditingSegment(null);
        setIsFormOpen(true);
    }

    // Mở biểu mẫu chỉnh sửa thông tin chặng được chọn.
    function handleEditSegment(segment: RouteSegment) {
        if (!isAdmin) return;

        setEditingSegment(segment);
        setIsFormOpen(true);
    }

    // Đóng biểu mẫu và xóa dữ liệu chặng đang chỉnh sửa.
    function handleCloseForm() {
        setIsFormOpen(false);
        setEditingSegment(null);
    }

    // Tải lại danh sách chặng sau khi thêm hoặc cập nhật thành công.
    async function handleSuccess(message: string) {
        setIsFormOpen(false);
        setEditingSegment(null);

        await getRouteSegments(selectedRouteId);

        setToast({
            message,
            type: 'success',
        });
    }

    // Mở hộp thoại xác nhận xóa chặng.
    function handleDeleteSegment(segment: RouteSegment) {
        if (!isAdmin) return;

        setSegmentToDelete(segment);
    }

    // Gửi yêu cầu xóa chặng đến BE sau khi người dùng xác nhận.
    async function confirmDeleteSegment() {
        if (!segmentToDelete || !isAdmin) return;

        try {
            const response = await apiFetch(
                `/route-segments/${segmentToDelete.id}`,
                {
                    method: 'DELETE',
                },
            );

            if (!response.ok) {
                const data = await response.json().catch(() => null);

                throw new Error(
                    Array.isArray(data?.message)
                        ? data.message.join(', ')
                        : data?.message || 'Xóa chặng tuyến thất bại',
                );
            }

            setSegmentToDelete(null);

            await getRouteSegments(selectedRouteId);

            setToast({
                message: 'Đã xóa chặng tuyến thành công',
                type: 'success',
            });
        } catch (error) {
            setToast({
                message:
                    error instanceof Error
                        ? error.message
                        : 'Không thể kết nối đến máy chủ',
                type: 'error',
            });
        }
    }

    const filteredSegments = segments.filter((segment) => {
        if (selectedScheduleType === 'ALL') return true;

        return segment.scheduleType === selectedScheduleType;
    });

    return (
        <main className="space-y-6">
            {/* Tiêu đề trang và thao tác tạo chặng */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Quản lý chặng tuyến
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Cấu hình thời gian di chuyển giữa các điểm trên tuyến
                        xe
                    </p>
                </div>

                {isAdmin && (
                    <button
                        type="button"
                        onClick={handleAddSegment}
                        disabled={
                            !selectedRoute ||
                            selectedRoute.routePoints.length < 2
                        }
                        className="w-full rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 active:bg-red-800 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
                    >
                        + Thêm chặng
                    </button>
                )}
            </div>

            {/* Bộ lọc tuyến và loại lịch trình */}
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label
                            htmlFor="route-filter"
                            className="mb-2 block text-sm font-medium text-slate-700"
                        >
                            Tuyến xe
                        </label>

                        <select
                            id="route-filter"
                            value={selectedRouteId}
                            onChange={(event) =>
                                void handleChangeRoute(event.target.value)
                            }
                            disabled={routes.length === 0}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:bg-slate-100"
                        >
                            {routes.length === 0 && (
                                <option value="">Chưa có tuyến xe</option>
                            )}

                            {routes.map((route) => (
                                <option key={route.id} value={route.id}>
                                    {route.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="schedule-filter"
                            className="mb-2 block text-sm font-medium text-slate-700"
                        >
                            Loại lịch trình
                        </label>

                        <select
                            id="schedule-filter"
                            value={selectedScheduleType}
                            onChange={(event) =>
                                setSelectedScheduleType(
                                    event.target.value as RouteSegmentScheduleFilter,
                                )
                            }
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        >
                            <option value="ALL">Tất cả lịch trình</option>
                            <option value="NORMAL">Lịch trình thường</option>
                            <option value="TET">Lịch trình Tết</option>
                        </select>
                    </div>
                </div>

                {selectedRoute && (
                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 text-sm">
                        <span className="text-slate-500">
                            Số điểm trên tuyến:
                        </span>

                        <span className="font-semibold text-slate-800">
                            {selectedRoute.routePoints.length}
                        </span>

                        <span className="mx-1 text-slate-300">|</span>

                        <span className="text-slate-500">
                            Số chặng đã cấu hình:
                        </span>

                        <span className="font-semibold text-slate-800">
                            {segments.length}
                        </span>
                    </div>
                )}
            </section>

            {/* Hướng dẫn khi tuyến chưa có đủ điểm để cấu hình chặng */}
            {selectedRoute && selectedRoute.routePoints.length < 2 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-medium text-amber-800">
                        Tuyến này cần ít nhất hai điểm tuyến trước khi cấu
                        hình thời gian di chuyển.
                    </p>
                </div>
            )}

            {/* Danh sách chặng của tuyến đang chọn */}
            <RouteSegmentList
                segments={filteredSegments}
                isLoading={isLoading}
                userRole={currentUserRole}
                onEdit={handleEditSegment}
                onDelete={handleDeleteSegment}
            />

            {/* Biểu mẫu thêm mới hoặc chỉnh sửa chặng */}
            {isFormOpen && selectedRoute && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-5 shadow-xl sm:p-6">
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    {editingSegment
                                        ? 'Chỉnh sửa chặng tuyến'
                                        : 'Thêm chặng tuyến'}
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    {selectedRoute.name}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleCloseForm}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                aria-label="Đóng biểu mẫu"
                            >
                                ×
                            </button>
                        </div>

                        <RouteSegmentForm
                            route={selectedRoute}
                            segment={editingSegment ?? undefined}
                            onSuccess={handleSuccess}
                            onCancel={handleCloseForm}
                        />
                    </div>
                </div>
            )}

            {/* Xác nhận trước khi xóa chặng */}
            <ConfirmModal
                isOpen={segmentToDelete !== null}
                title="Xóa chặng tuyến"
                message={
                    segmentToDelete
                        ? `Bạn có chắc chắn muốn xóa chặng ${segmentToDelete.fromRoutePoint.name} → ${segmentToDelete.toRoutePoint.name}?`
                        : ''
                }
                confirmText="Xóa chặng"
                cancelText="Hủy"
                onConfirm={confirmDeleteSegment}
                onCancel={() => setSegmentToDelete(null)}
            />

            {/* Thông báo kết quả thao tác */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </main>
    );
}
