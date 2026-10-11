
'use client';

import { useState } from 'react';
import ServicePointForm from './ServicePointForm';
import type { ServicePoint } from './route-types';
import { formatPlaceName } from './route-types';

type ServicePointListProps = {
  servicePoints: ServicePoint[];
  routePointId: string;
  userRole: string;
  onDelete?: (servicePoint: ServicePoint) => void;
  onSuccess: (message: string) => void | Promise<void>;
};

export default function ServicePointList({
  servicePoints,
  routePointId,
  userRole,
  onDelete,
  onSuccess,
}: ServicePointListProps) {
  const [isAdding, setIsAdding] = useState(false);

  const canDelete = userRole === 'ADMIN' && Boolean(onDelete);

  return (
    <div className="mt-3">
      {/* Danh sách các điểm phục vụ */}
      <div className="flex flex-wrap items-start gap-2">
        {servicePoints.map((point) => (
          <div
            key={point.id}
            className="relative inline-flex max-w-full items-center rounded-lg border border-gray-200 bg-white px-3 py-2 pr-8 text-sm text-gray-700 shadow-sm transition hover:border-gray-400"
          >
            {/* Tên điểm phục vụ tự quyết định độ rộng box */}
            <span className="break-words [overflow-wrap:anywhere]">
              {formatPlaceName(point.name)}
            </span>

            {/* Nút xóa nằm ở góc trên bên phải */}
            {canDelete && (
              <button
                type="button"
                onClick={() => onDelete?.(point)}
                aria-label={`Xóa điểm phục vụ ${formatPlaceName(point.name)}`}
                title={`Xóa ${formatPlaceName(point.name)}`}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full text-base leading-none text-gray-400 transition hover:bg-red-100 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
              >
                ×
              </button>
            )}
          </div>
        ))}

        {/* Nút thêm điểm phục vụ */}
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="inline-flex min-h-9 items-center justify-center gap-1 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500 transition hover:border-red-400 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-200"
        >
          <span className="text-base leading-none">+</span>
          <span>Thêm điểm</span>
        </button>
      </div>

      {/* Trạng thái chưa có điểm phục vụ */}
      {servicePoints.length === 0 && (
        <p className="mt-2 text-xs text-gray-400">
          Chưa có điểm phục vụ.
        </p>
      )}

      {/* Form thêm điểm phục vụ */}
      {isAdding && (
        <ServicePointForm
          routePointId={routePointId}
          onClose={() => setIsAdding(false)}
          onSuccess={async (message) => {
            setIsAdding(false);
            await onSuccess(message);
          }}
        />
      )}
    </div>
  );
}
