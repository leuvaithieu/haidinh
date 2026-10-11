'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

import RouteList from './components/RouteList';
import RouteForm from './components/RouteForm';

import ConfirmModal from '../../components/ConfirmModal';
import Toast from '../../components/Toast';

import type {
    Route,
    RoutePoint,
    ServicePoint,
    ToastState,
} from './components/route-types';

export default function RoutePage() {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [search, setSearch] = useState('');
    const [currentUserRole, setCurrentUserRole] = useState('');

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRoute, setEditingRoute] = useState<Route | null>(null);

    const [routeToDelete, setRouteToDelete] = useState<Route | null>(null);
    const [routePointToDelete, setRoutePointToDelete] =
        useState<RoutePoint | null>(null);
    const [servicePointToDelete, setServicePointToDelete] =
        useState<ServicePoint | null>(null);

    const [toast, setToast] = useState<ToastState>(null);
    const [isLoading, setIsLoading] = useState(true);

    async function getRoutes() {
        try {
            const response = await apiFetch('/routes');

            if (!response.ok) {
                setToast({
                    message: 'Không thể tải danh sách tuyến xe',
                    type: 'error',
                });
                return;
            }

            const data = await response.json();
            setRoutes(data);
        } catch {
            setToast({
                message: 'Không thể kết nối đến máy chủ',
                type: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    }

    async function getCurrentUser() {
        try {
            const response = await apiFetch('/auth/me');

            if (!response.ok) return;

            const data = await response.json();
            setCurrentUserRole(data.role);
        } catch {
            setCurrentUserRole('');
        }
    }

    useEffect(() => {
        void getRoutes();
        void getCurrentUser();
    }, []);

    function handleAddRoute() {
        setEditingRoute(null);
        setIsFormOpen(true);
    }

    function handleEditRoute(route: Route) {
        setEditingRoute(route);
        setIsFormOpen(true);
    }

    function handleDeleteRoute(route: Route) {
        setRouteToDelete(route);
    }

    function handleCloseForm() {
        setIsFormOpen(false);
        setEditingRoute(null);
    }

    async function handleSuccess(message: string) {
        setIsFormOpen(false);
        setEditingRoute(null);

        await getRoutes();

        setToast({
            message,
            type: 'success',
        });
    }

    async function handleNestedSuccess(message: string) {
        await getRoutes();

        setToast({
            message,
            type: 'success',
        });
    }

    async function confirmDeleteRoute() {
        if (!routeToDelete) return;

        try {
            const response = await apiFetch(
                `/routes/${routeToDelete.id}`,
                { method: 'DELETE' },
            );

            if (!response.ok) {
                const data = await response.json().catch(() => null);

                setToast({
                    message: Array.isArray(data?.message)
                        ? data.message.join(', ')
                        : data?.message || 'Xóa tuyến thất bại',
                    type: 'error',
                });
                return;
            }

            const name = routeToDelete.name;
            setRouteToDelete(null);

            await getRoutes();

            setToast({
                message: `Đã xóa tuyến ${name}`,
                type: 'success',
            });
        } catch {
            setToast({
                message: 'Không thể kết nối đến máy chủ',
                type: 'error',
            });
        }
    }

    async function confirmDeleteRoutePoint() {
        if (!routePointToDelete) return;

        try {
            const response = await apiFetch(
                `/route-points/${routePointToDelete.id}`,
                { method: 'DELETE' },
            );

            if (!response.ok) {
                const data = await response.json().catch(() => null);

                setToast({
                    message: Array.isArray(data?.message)
                        ? data.message.join(', ')
                        : data?.message || 'Xóa điểm tuyến thất bại',
                    type: 'error',
                });
                return;
            }

            const name = routePointToDelete.name;
            setRoutePointToDelete(null);

            await getRoutes();

            setToast({
                message: `Đã xóa điểm tuyến ${name}`,
                type: 'success',
            });
        } catch {
            setToast({
                message: 'Không thể kết nối đến máy chủ',
                type: 'error',
            });
        }
    }

    async function confirmDeleteServicePoint() {
        if (!servicePointToDelete) return;

        try {
            const response = await apiFetch(
                `/service-points/${servicePointToDelete.id}`,
                { method: 'DELETE' },
            );

            if (!response.ok) {
                const data = await response.json().catch(() => null);

                setToast({
                    message: Array.isArray(data?.message)
                        ? data.message.join(', ')
                        : data?.message || 'Xóa điểm phục vụ thất bại',
                    type: 'error',
                });
                return;
            }

            const name = servicePointToDelete.name;
            setServicePointToDelete(null);

            await getRoutes();

            setToast({
                message: `Đã xóa điểm phục vụ ${name}`,
                type: 'success',
            });
        } catch {
            setToast({
                message: 'Không thể kết nối đến máy chủ',
                type: 'error',
            });
        }
    }

    const normalizedSearch = search.trim().toLocaleLowerCase('vi');

    const filteredRoutes = routes.filter((route) =>
        route.name.toLocaleLowerCase('vi').includes(normalizedSearch),
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Quản lý tuyến xe
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Quản lý tuyến, điểm tuyến và điểm phục vụ
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleAddRoute}
                    className="w-full rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 active:bg-red-800 sm:w-auto"
                >
                    + Thêm tuyến
                </button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm theo tên tuyến xe..."
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 sm:max-w-md"
                    />

                    <span className="text-sm text-slate-500">
                        {filteredRoutes.length} / {routes.length} tuyến
                    </span>
                </div>
            </div>

            {isLoading ? (
                <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                    Đang tải danh sách tuyến...
                </div>
            ) : (
                <RouteList
                    routes={filteredRoutes}
                    userRole={currentUserRole}
                    onEdit={handleEditRoute}
                    onDelete={
                        currentUserRole === 'ADMIN'
                            ? handleDeleteRoute
                            : undefined
                    }
                    onDeleteRoutePoint={
                        currentUserRole === 'ADMIN'
                            ? setRoutePointToDelete
                            : undefined
                    }
                    onDeleteServicePoint={
                        currentUserRole === 'ADMIN'
                            ? setServicePointToDelete
                            : undefined
                    }
                    onRoutePointSuccess={handleNestedSuccess}
                />
            )}

            {isFormOpen && (
                <RouteForm
                    route={editingRoute}
                    onSuccess={handleSuccess}
                    onClose={handleCloseForm}
                />
            )}

            {routeToDelete && (
                <ConfirmModal
                    isOpen={true}
                    title="Xóa tuyến xe"
                    message={`Bạn có chắc muốn xóa tuyến "${routeToDelete.name}" không?`}
                    onCancel={() => setRouteToDelete(null)}
                    onConfirm={confirmDeleteRoute}
                />
            )}

            {routePointToDelete && (
                <ConfirmModal
                    isOpen={true}
                    title="Xóa điểm tuyến"
                    message={`Bạn có chắc muốn xóa điểm "${routePointToDelete.name}" không?`}
                    onCancel={() => setRoutePointToDelete(null)}
                    onConfirm={confirmDeleteRoutePoint}
                />
            )}

            {servicePointToDelete && (
                <ConfirmModal
                    isOpen={true}
                    title="Xóa điểm phục vụ"
                    message={`Bạn có chắc muốn xóa điểm phục vụ "${servicePointToDelete.name}" không?`}
                    onCancel={() => setServicePointToDelete(null)}
                    onConfirm={confirmDeleteServicePoint}
                />
            )}

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