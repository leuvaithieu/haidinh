
'use client';

import { useState } from 'react';

import RoutePointList from './RoutePointList';
import RoutePointForm from './RoutePointForm';

import type {
    Route,
    RoutePoint,
    ServicePoint,
} from './route-types';

type RouteListProps = {
    routes: Route[];
    userRole: string;
    onEdit: (route: Route) => void;
    onDelete?: (route: Route) => void;
    onDeleteRoutePoint?: (routePoint: RoutePoint) => void;
    onDeleteServicePoint?: (servicePoint: ServicePoint) => void;
    onRoutePointSuccess: (message: string) => Promise<void>;
};

export default function RouteList({
    routes,
    userRole,
    onEdit,
    onDelete,
    onDeleteRoutePoint,
    onDeleteServicePoint,
    onRoutePointSuccess,
}: RouteListProps) {
    const [expandedRouteId, setExpandedRouteId] =
        useState<string | null>(null);

    const [selectedRouteId, setSelectedRouteId] =
        useState<string | null>(null);

    const selectedRoute = routes.find(
        (route) => route.id === selectedRouteId,
    );

    function toggleRoute(routeId: string) {
        setExpandedRouteId((currentId) =>
            currentId === routeId ? null : routeId,
        );
    }

    return (
        <div className="space-y-3">
            {routes.map((route, index) => {
                const isExpanded = expandedRouteId === route.id;

                return (
                    <section
                        key={route.id}
                        className={`overflow-hidden rounded-xl border bg-white transition ${
                            isExpanded
                                ? 'border-red-200 shadow-md'
                                : 'border-slate-200 shadow-sm hover:border-slate-300'
                        }`}
                    >
                        {/* Thanh tiêu đề tuyến */}
                        <div className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
                            {/* Số thứ tự tuyến */}
                            <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold sm:h-12 sm:w-12 sm:text-base ${
                                    isExpanded
                                        ? 'bg-red-600 text-white'
                                        : 'bg-slate-100 text-slate-700'
                                }`}
                            >
                                {String(index + 1).padStart(2, '0')}
                            </div>

                            {/* Tên tuyến: click để mở hoặc đóng */}
                            <button
                                type="button"
                                onClick={() => toggleRoute(route.id)}
                                aria-expanded={isExpanded}
                                aria-label={`${
                                    isExpanded ? 'Thu gọn' : 'Mở'
                                } tuyến ${route.name}`}
                                className="flex min-w-0 flex-1 items-center gap-2 text-left sm:gap-3"
                            >
                                <div className="min-w-0 flex-1">
                                    <h2 className="break-words text-sm font-bold text-slate-900 sm:text-base">
                                        {route.name}
                                    </h2>

                                    <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                                        {route.routePoints.length} điểm tuyến
                                    </p>
                                </div>

                                <svg
                                    className={`h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200 ${
                                        isExpanded ? 'rotate-180' : ''
                                    }`}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    aria-hidden="true"
                                >
                                    <path
                                        d="m6 9 6 6 6-6"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>

                            {/* Nút sửa và xóa tuyến */}
                            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                                <button
                                    type="button"
                                    onClick={() => onEdit(route)}
                                    title="Sửa tuyến"
                                    aria-label={`Sửa tuyến ${route.name}`}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 sm:h-10 sm:w-10"
                                >
                                    <svg
                                        className="h-4 w-4"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={1.8}
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="m16 4 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </button>

                                {userRole === 'ADMIN' && onDelete && (
                                    <button
                                        type="button"
                                        onClick={() => onDelete(route)}
                                        title="Xóa tuyến"
                                        aria-label={`Xóa tuyến ${route.name}`}
                                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50 sm:h-10 sm:w-10"
                                    >
                                        <svg
                                            className="h-4 w-4"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={1.8}
                                            aria-hidden="true"
                                        >
                                            <path
                                                d="M4 7h16M10 11v6m4-6v6M5 7l1 14h12l1-14M9 7V4h6v3"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Nội dung tuyến chỉ hiện khi mở */}
                        {isExpanded && (
                            <div className="border-t border-slate-100 bg-slate-50/70 p-3 sm:p-5">
                                <RoutePointList
                                    routePoints={route.routePoints}
                                    userRole={userRole}
                                    onRoutePointSuccess={onRoutePointSuccess}
                                    onDeleteRoutePoint={onDeleteRoutePoint}
                                    onDeleteServicePoint={onDeleteServicePoint}
                                />

                                {/* Nút thêm điểm tuyến ở cuối danh sách */}
                                <div className="mt-4 border-t border-dashed border-slate-200 pt-4">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSelectedRouteId(route.id)
                                        }
                                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-red-300 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:border-red-500 hover:bg-red-50 sm:w-auto"
                                    >
                                        <span className="text-lg leading-none">
                                            +
                                        </span>
                                        Thêm điểm tuyến
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>
                );
            })}

            {/* Không có tuyến */}
            {routes.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-12 text-center">
                    <p className="font-semibold text-slate-700">
                        Không tìm thấy tuyến xe
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                        Thử từ khóa khác hoặc thêm tuyến mới.
                    </p>
                </div>
            )}

            {/* Form thêm điểm tuyến */}
            {selectedRoute && (
                <RoutePointForm
                    routeId={selectedRoute.id}
                    onSuccess={async (message) => {
                        setSelectedRouteId(null);
                        await onRoutePointSuccess(message);
                    }}
                    onClose={() => setSelectedRouteId(null)}
                />
            )}
        </div>
    );
}
