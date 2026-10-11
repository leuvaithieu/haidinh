'use client';

import { useState } from 'react';

import RoutePointEditForm from './RoutePointEditForm';
import ServicePointList from './ServicePointList';
import { formatPlaceName } from './route-types';

import type { RoutePoint, ServicePoint } from './route-types';

type RoutePointListProps = {
    routePoints: RoutePoint[];
    userRole: string;
    onRoutePointSuccess: (message: string) => Promise<void>;
    onDeleteRoutePoint?: (routePoint: RoutePoint) => void;
    onDeleteServicePoint?: (servicePoint: ServicePoint) => void;
};

export default function RoutePointList({
    routePoints,
    userRole,
    onRoutePointSuccess,
    onDeleteRoutePoint,
    onDeleteServicePoint,
}: RoutePointListProps) {
    const [editingRoutePoint, setEditingRoutePoint] =
        useState<RoutePoint | null>(null);

    const sortedRoutePoints = [...routePoints].sort(
        (a, b) => a.sequence - b.sequence,
    );

    return (
        <div className="space-y-4">
            {sortedRoutePoints.map((routePoint) => (
                <div
                    key={routePoint.id}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4"
                >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 items-start gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-700">
                                {routePoint.sequence}
                            </span>

                            <div className="min-w-0">
                                <h3 className="break-words font-semibold text-slate-800">
                                    {formatPlaceName(routePoint.name)}
                                </h3>

                                <p className="mt-1 text-xs text-slate-500">
                                    {routePoint.servicePoints.length} điểm phục vụ
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 sm:shrink-0">
                            <button
                                type="button"
                                onClick={() => setEditingRoutePoint(routePoint)}
                                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                            >
                                Sửa điểm tuyến
                            </button>

                            {userRole === 'ADMIN' && onDeleteRoutePoint && (
                                <button
                                    type="button"
                                    onClick={() => onDeleteRoutePoint(routePoint)}
                                    className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                                >
                                    Xóa
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 border-t border-slate-200 pt-3">
                        <ServicePointList
                            servicePoints={routePoint.servicePoints}
                            routePointId={routePoint.id}
                            userRole={userRole}
                            onDelete={onDeleteServicePoint}
                            onSuccess={onRoutePointSuccess}
                        />
                    </div>
                </div>
            ))}

            {sortedRoutePoints.length === 0 && (
                <p className="rounded-lg border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">
                    Tuyến này chưa có điểm tuyến.
                </p>
            )}

            {editingRoutePoint && (
                <RoutePointEditForm
                    routePoint={editingRoutePoint}
                    onSuccess={async (message) => {
                        setEditingRoutePoint(null);
                        await onRoutePointSuccess(message);
                    }}
                    onClose={() => setEditingRoutePoint(null)}
                />
            )}
        </div>
    );
}