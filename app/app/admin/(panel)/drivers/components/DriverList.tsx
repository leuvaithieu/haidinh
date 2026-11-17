'use client';

type Driver = {
    id: string;
    name: string;
    phone: string;
    licenseNumber: string;
    licenseClass?: string;
    licenseExpiry?: string;
    status: string;
};

type DriverListProps = {
    drivers: Driver[];
    onEdit: (driver: Driver) => void;
    onDelete: (driver: Driver) => void;
    userRole: string;
};

export default function DriverList({
    drivers,
    onEdit,
    onDelete,
    userRole,
}: DriverListProps) {
    return (
        <div className="mt-6">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                    Danh sách tài xế
                </h2>

                <span className="text-sm text-slate-500">
                    {drivers.length} tài xế
                </span>
            </div>

            {drivers.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
                    <p className="text-sm text-slate-500">
                        Chưa có tài xế
                    </p>
                </div>
            ) : (
                <>
                    {/* Desktop */}
                    <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-slate-200 bg-slate-50">
                                    <tr>
                                        <th className="px-5 py-4 font-semibold text-slate-700">
                                            Họ tên
                                        </th>

                                        <th className="px-5 py-4 font-semibold text-slate-700">
                                            Số điện thoại
                                        </th>

                                        <th className="px-5 py-4 font-semibold text-slate-700">
                                            GPLX
                                        </th>

                                        <th className="px-5 py-4 font-semibold text-slate-700">
                                            Hạng
                                        </th>

                                        <th className="px-5 py-4 font-semibold text-slate-700">
                                            Hạn GPLX
                                        </th>

                                        <th className="px-5 py-4 font-semibold text-slate-700">
                                            Trạng thái
                                        </th>

                                        <th className="px-5 py-4 text-right font-semibold text-slate-700">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {drivers.map((driver) => (
                                        <tr
                                            key={driver.id}
                                            className="transition hover:bg-slate-50"
                                        >
                                            <td className="px-5 py-4 font-medium text-slate-900">
                                                {driver.name}
                                            </td>

                                            <td className="px-5 py-4">
                                                <a
                                                    href={`tel:${driver.phone}`}
                                                    className="text-slate-600 hover:text-red-600"
                                                >
                                                    {driver.phone}
                                                </a>
                                            </td>

                                            <td className="px-5 py-4 text-slate-600">
                                                {driver.licenseNumber}
                                            </td>

                                            <td className="px-5 py-4 text-slate-600">
                                                {driver.licenseClass || '—'}
                                            </td>

                                            <td className="px-5 py-4 text-slate-600">
                                                {driver.licenseExpiry || '—'}
                                            </td>

                                            <td className="px-5 py-4">
                                                {driver.status === 'ACTIVE' ? (
                                                    <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                                                        Đang hoạt động
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                                        Không hoạt động
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            onEdit(driver)
                                                        }
                                                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600"
                                                    >
                                                        Sửa
                                                    </button>

                                                    {userRole === 'ADMIN' && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                onDelete(driver)
                                                            }
                                                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
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
                        {drivers.map((driver) => (
                            <div
                                key={driver.id}
                                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="font-semibold text-slate-900">
                                            {driver.name}
                                        </h3>

                                        <a
                                            href={`tel:${driver.phone}`}
                                            className="mt-1 block text-sm text-slate-500"
                                        >
                                            {driver.phone}
                                        </a>
                                    </div>

                                    {driver.status === 'ACTIVE' ? (
                                        <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                                            Đang hoạt động
                                        </span>
                                    ) : (
                                        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                            Không hoạt động
                                        </span>
                                    )}
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                                    <div>
                                        <p className="text-xs text-slate-400">
                                            Số GPLX
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-slate-700">
                                            {driver.licenseNumber}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-400">
                                            Hạng bằng
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-slate-700">
                                            {driver.licenseClass || '—'}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-400">
                                            Hạn GPLX
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-slate-700">
                                            {driver.licenseExpiry || '—'}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onEdit(driver)
                                        }
                                        className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                    >
                                        Sửa
                                    </button>

                                    {userRole === 'ADMIN' && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                onDelete(driver)
                                            }
                                            className="flex-1 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                                        >
                                            Xóa
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}