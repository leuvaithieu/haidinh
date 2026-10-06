'use client';

import Link from 'next/link';

type Customer = {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  note?: string;
  isVip?: boolean;
  bookingCount?: number;
};

type CustomerListProps = {
  customers: Customer[];
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  userRole: string;
};

export default function CustomerList({
  customers,
  onView,
  onEdit,
  onDelete,
  userRole,
}: CustomerListProps) {
  if (customers.length === 0) {
    return (
      <div className="mt-6 rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
        <p className="text-sm text-slate-500">
          Chưa có khách hàng nào.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {/* Desktop */}
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-4 text-sm font-semibold text-slate-600">
                  STT
                </th>

                <th className="px-4 py-4 text-sm font-semibold text-slate-600">
                  Khách hàng
                </th>

                <th className="px-4 py-4 text-sm font-semibold text-slate-600">
                  Số điện thoại
                </th>

                <th className="px-4 py-4 text-sm font-semibold text-slate-600">
                  Địa chỉ
                </th>

                <th className="px-4 py-4 text-sm font-semibold text-slate-600">
                  Email
                </th>

                <th className="px-4 py-4 text-sm font-semibold text-slate-600">
                  Zalo
                </th>

                <th className="px-4 py-4 text-sm font-semibold text-slate-600">
                  Booking
                </th>

                <th className="px-4 py-4 text-sm font-semibold text-slate-600">
                  VIP
                </th>

                <th className="px-4 py-4 text-right text-sm font-semibold text-slate-600">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {customers.map((customer, index) => (
                <tr
                  key={customer.id}
                  className="transition hover:bg-slate-50"
                >
                  <td className="px-4 py-4 text-sm text-slate-500">
                    {index + 1}
                  </td>

                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">
                        {customer.fullName}
                      </p>

                      {customer.note && (
                        <p className="mt-1 max-w-xs truncate text-xs text-slate-400">
                          {customer.note}
                        </p>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <Link
                      href={`tel:${customer.phone}`}
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      {customer.phone}
                    </Link>
                  </td>

                  <td className="max-w-xs px-4 py-4 text-sm text-slate-600">
                    <span className="line-clamp-2">
                      {customer.address || '—'}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    {customer.email ? (
                      <Link
                        href={`mailto:${customer.email}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {customer.email}
                      </Link>
                    ) : (
                      <span className="text-sm text-slate-400">
                        —
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-4">
                    {customer.phone ? (
                      <Link
                        href={`https://zalo.me/${customer.phone}`}
                        target="_blank"
                        className="text-sm font-medium text-blue-600 hover:underline"
                      >
                        Zalo
                      </Link>
                    ) : (
                      <span className="text-sm text-slate-400">
                        —
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-4">
                    <span className="text-sm font-medium text-slate-700">
                      {customer.bookingCount ?? 0}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    {customer.isVip ? (
                      <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                        VIP
                      </span>
                    ) : (
                      <span className="text-sm text-slate-400">
                        —
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onView(customer)}
                        className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                      >
                        Xem
                      </button>

                      <button
                        type="button"
                        onClick={() => onEdit(customer)}
                        className="rounded-lg px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                      >
                        Sửa
                      </button>

                      {userRole === 'ADMIN' && (
                        <button
                          type="button"
                          onClick={() => onDelete(customer)}
                          className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile */}
      <div className="space-y-3 md:hidden">
        {customers.map((customer, index) => (
          <div
            key={customer.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-500">
                  {index + 1}
                </span>

                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-900">
                    {customer.fullName}
                  </h3>

                  <Link
                    href={`tel:${customer.phone}`}
                    className="mt-1 block text-sm font-medium text-blue-600"
                  >
                    {customer.phone}
                  </Link>
                </div>
              </div>

              {customer.isVip && (
                <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  VIP
                </span>
              )}
            </div>

            <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
              <div className="flex gap-4">
                <span className="w-20 shrink-0 text-sm text-slate-400">
                  Email
                </span>

                <div className="min-w-0">
                  {customer.email ? (
                    <Link
                      href={`mailto:${customer.email}`}
                      className="break-all text-sm text-blue-600"
                    >
                      {customer.email}
                    </Link>
                  ) : (
                    <span className="text-sm text-slate-400">
                      —
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <span className="w-20 shrink-0 text-sm text-slate-400">
                  Địa chỉ
                </span>

                <span className="text-sm text-slate-600">
                  {customer.address || '—'}
                </span>
              </div>

              <div className="flex gap-4">
                <span className="w-20 shrink-0 text-sm text-slate-400">
                  Booking
                </span>

                <span className="text-sm font-medium text-slate-700">
                  {customer.bookingCount ?? 0}
                </span>
              </div>

              <div className="flex gap-4">
                <span className="w-20 shrink-0 text-sm text-slate-400">
                  Zalo
                </span>

                <Link
                  href={`https://zalo.me/${customer.phone}`}
                  target="_blank"
                  className="text-sm font-medium text-blue-600"
                >
                  Mở Zalo
                </Link>
              </div>
            </div>

            {customer.note && (
              <div className="mt-4 rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-400">
                  Ghi chú
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  {customer.note}
                </p>
              </div>
            )}

            <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => onView(customer)}
                className="flex-1 rounded-lg bg-slate-100 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
              >
                Xem
              </button>

              <button
                type="button"
                onClick={() => onEdit(customer)}
                className="flex-1 rounded-lg bg-blue-50 px-3 py-2.5 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
              >
                Sửa
              </button>

              {userRole === 'ADMIN' && (
                <button
                  type="button"
                  onClick={() => onDelete(customer)}
                  className="flex-1 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100"
                >
                  Xóa
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}