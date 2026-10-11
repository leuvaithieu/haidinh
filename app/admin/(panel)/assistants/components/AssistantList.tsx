'use client';

type Assistant = {
    id: string;
    name: string;
    phone: string;
    cccd: string;
    status: string;
};

type AssistantListProps = {
    assistants: Assistant[];
    onEdit: (assistant: Assistant) => void;
    onDelete?: (assistant: Assistant) => void;
    userRole: string;
};

export default function AssistantList({
    assistants,
    onEdit,
    onDelete,
    userRole,
}: AssistantListProps) {
    const isAdmin = userRole === 'ADMIN';

    if (assistants.length === 0) {
        return (
            <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center shadow-sm">
                <div className="text-4xl">👤</div>

                <h3 className="mt-3 text-base font-semibold text-gray-900">
                    Không tìm thấy phụ xe
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                    Thử thay đổi từ khóa tìm kiếm.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[750px]">
                    <thead className="bg-gray-50">
                        <tr className="border-b border-gray-200 text-left">
                            <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                                Họ tên
                            </th>

                            <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                                Số điện thoại
                            </th>

                            <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                                CCCD
                            </th>

                            <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                                Trạng thái
                            </th>

                            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                                Thao tác
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {assistants.map((assistant) => (
                            <tr
                                key={assistant.id}
                                className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                            >
                                <td className="px-6 py-4">
                                    <span className="font-medium text-gray-900">
                                        {assistant.name}
                                    </span>
                                </td>

                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {assistant.phone}
                                </td>

                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {assistant.cccd}
                                </td>

                                <td className="px-6 py-4">
                                    {assistant.status === 'ACTIVE' ? (
                                        <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                            Đang hoạt động
                                        </span>
                                    ) : (
                                        <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                                            Không hoạt động
                                        </span>
                                    )}
                                </td>

                                <td className="px-6 py-4">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => onEdit(assistant)}
                                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                                        >
                                            Sửa
                                        </button>

                                        {isAdmin && onDelete && (
                                            <button
                                                onClick={() =>
                                                    onDelete(assistant)
                                                }
                                                className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-700"
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

            {/* Mobile */}
            <div className="divide-y divide-gray-100 md:hidden">
                {assistants.map((assistant) => (
                    <div
                        key={assistant.id}
                        className="p-4"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <h3 className="truncate font-semibold text-gray-900">
                                    {assistant.name}
                                </h3>

                                <p className="mt-1 text-sm text-gray-600">
                                    {assistant.phone}
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                    CCCD: {assistant.cccd}
                                </p>
                            </div>

                            {assistant.status === 'ACTIVE' ? (
                                <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                                    Hoạt động
                                </span>
                            ) : (
                                <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                                    Không hoạt động
                                </span>
                            )}
                        </div>

                        <div className="mt-4 flex gap-2">
                            <button
                                onClick={() => onEdit(assistant)}
                                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                            >
                                Sửa
                            </button>

                            {isAdmin && onDelete && (
                                <button
                                    onClick={() => onDelete(assistant)}
                                    className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700"
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