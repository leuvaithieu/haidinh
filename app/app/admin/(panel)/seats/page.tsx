
'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';

import { apiFetch } from '@/lib/api';

import PageHeader from '../../components/PageHeader';
import Toast from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';

import SeatLayoutForm from './components/SeatLayoutForm';
import SeatLayoutList from './components/SeatLayoutList';
import SeatLayoutEditor from './components/SeatLayoutEditor';

import type {
    SeatLayout,
    ToastData,
    VehicleOption,
} from './types';

// Dữ liệu biểu mẫu sao chép sơ đồ.
type CopyFormState = {
    vehicleId: string;
    name: string;
};

// Chuẩn hóa lỗi API thành thông báo dễ hiểu.
function getApiError(
    data: unknown,
    fallback: string,
): string {
    if (
        typeof data === 'object' &&
        data !== null &&
        'message' in data
    ) {
        const message = data.message;

        if (typeof message === 'string') {
            return message;
        }

        if (Array.isArray(message)) {
            return message.join(', ');
        }
    }

    return fallback;
}

export default function SeatsPage() {

    // ==========================================
    // STATE
    // ==========================================

    const [layouts, setLayouts] = useState<SeatLayout[]>([]);

    const [vehicles, setVehicles] = useState<VehicleOption[]>([]);

    const [isLoading, setIsLoading] = useState(true);

    const [pageError, setPageError] = useState('');

    const [isFormOpen, setIsFormOpen] = useState(false);

    const [editingLayout, setEditingLayout] =
        useState<SeatLayout | null>(null);

    const [openingLayout, setOpeningLayout] =
        useState<SeatLayout | null>(null);

    const [deletingLayout, setDeletingLayout] =
        useState<SeatLayout | null>(null);

    const [copyingLayout, setCopyingLayout] =
        useState<SeatLayout | null>(null);

    const [copyForm, setCopyForm] =
        useState<CopyFormState>({
            vehicleId: '',
            name: '',
        });

    const [isCopying, setIsCopying] = useState(false);

    const [toast, setToast] =
        useState<ToastData | null>(null);

    const [search, setSearch] = useState('');

    const [filter, setFilter] = useState<
        'ALL' | 'TEMPLATE' | 'VEHICLE'
    >('ALL');


    // ==========================================
    // API
    // ==========================================

    // Lấy danh sách sơ đồ ghế và phương tiện từ Backend.
    async function loadData() {

        setIsLoading(true);
        setPageError('');

        try {

            const [
                layoutResponse,
                vehicleResponse,
            ] = await Promise.all([
                apiFetch('/seat-layout'),
                apiFetch('/vehicles'),
            ]);

            if (!layoutResponse.ok) {
                throw new Error(
                    'Không thể tải danh sách sơ đồ ghế.',
                );
            }

            if (!vehicleResponse.ok) {
                throw new Error(
                    'Không thể tải danh sách xe.',
                );
            }

            const [
                layoutData,
                vehicleData,
            ] = await Promise.all([
                layoutResponse.json(),
                vehicleResponse.json(),
            ]);

            setLayouts(layoutData);
            setVehicles(vehicleData);

        } catch (error) {

            setPageError(
                error instanceof Error
                    ? error.message
                    : 'Không thể tải dữ liệu.',
            );

        } finally {

            setIsLoading(false);

        }
    }


    // Tự động tải dữ liệu khi người dùng mở trang.
    useEffect(() => {
        loadData();
    }, []);


    // ==========================================
    // SEARCH & FILTER
    // ==========================================

    // Lọc sơ đồ theo từ khóa và loại sơ đồ.
    const filteredLayouts = useMemo(() => {

        const keyword = search
            .trim()
            .toLocaleLowerCase('vi');

        return layouts.filter((layout) => {

            const matchesKeyword =
                !keyword ||
                [
                    layout.name,
                    layout.description ?? '',
                    layout.vehicle?.name ?? '',
                    layout.vehicle?.licensePlate ?? '',
                ].some((value) =>
                    value.toLocaleLowerCase('vi')
                        .includes(keyword),
                );

            const matchesFilter =
                filter === 'ALL' ||
                (
                    filter === 'TEMPLATE' &&
                    layout.isTemplate
                ) ||
                (
                    filter === 'VEHICLE' &&
                    !layout.isTemplate
                );

            return matchesKeyword && matchesFilter;

        });

    }, [layouts, search, filter]);


    // ==========================================
    // CREATE & UPDATE
    // ==========================================

    // Mở biểu mẫu tạo sơ đồ mới.
    function handleCreate() {

        setEditingLayout(null);
        setIsFormOpen(true);

    }


    // Mở biểu mẫu chỉnh sửa sơ đồ.
    function handleEdit(layout: SeatLayout) {

        setEditingLayout(layout);
        setIsFormOpen(true);

    }


    // Đóng biểu mẫu và xóa dữ liệu đang chỉnh sửa.
    function handleCloseForm() {

        setIsFormOpen(false);
        setEditingLayout(null);

    }


    // Tải lại dữ liệu sau khi tạo hoặc cập nhật thành công.
    async function handleFormSuccess(message: string) {

        handleCloseForm();

        await loadData();

        setToast({
            message,
            type: 'success',
        });

    }


    // ==========================================
    // DELETE
    // ==========================================

    // Xóa sơ đồ ghế sau khi người quản trị xác nhận.
    async function handleDelete() {

        if (!deletingLayout) {
            return;
        }

        try {

            const response = await apiFetch(
                `/seat-layout/${deletingLayout.id}`,
                {
                    method: 'DELETE',
                },
            );

            if (!response.ok) {

                const data = await response
                    .json()
                    .catch(() => null);

                throw new Error(
                    getApiError(
                        data,
                        'Không thể xóa sơ đồ.',
                    ),
                );
            }

            const deletedName = deletingLayout.name;

            setDeletingLayout(null);

            await loadData();

            setToast({
                message: `Đã xóa sơ đồ ${deletedName}.`,
                type: 'success',
            });

        } catch (error) {

            setToast({
                message:
                    error instanceof Error
                        ? error.message
                        : 'Xóa sơ đồ thất bại.',
                type: 'error',
            });

        }

    }


    // ==========================================
    // COPY TEMPLATE
    // ==========================================

    // Sao chép sơ đồ mẫu và các ghế sang một xe khác.
    async function handleCopy(
        event: FormEvent<HTMLFormElement>,
    ) {

        event.preventDefault();

        if (
            !copyingLayout ||
            !copyForm.vehicleId
        ) {
            return;
        }

        setIsCopying(true);

        try {

            const response = await apiFetch(
                `/seat-layout/${copyingLayout.id}/copy`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        vehicleId: copyForm.vehicleId,
                        name:
                            copyForm.name.trim() ||
                            undefined,
                    }),
                },
            );

            if (!response.ok) {

                const data = await response
                    .json()
                    .catch(() => null);

                throw new Error(
                    getApiError(
                        data,
                        'Không thể sao chép sơ đồ.',
                    ),
                );
            }

            setCopyingLayout(null);

            setCopyForm({
                vehicleId: '',
                name: '',
            });

            await loadData();

            setToast({
                message: 'Sao chép sơ đồ cho xe thành công.',
                type: 'success',
            });

        } catch (error) {

            setToast({
                message:
                    error instanceof Error
                        ? error.message
                        : 'Sao chép sơ đồ thất bại.',
                type: 'error',
            });

        } finally {

            setIsCopying(false);

        }

    }


    // ==========================================
    // STATISTICS
    // ==========================================

    const templateCount = layouts.filter(
        (layout) => layout.isTemplate,
    ).length;

    const vehicleLayoutCount = layouts.filter(
        (layout) => !layout.isTemplate,
    ).length;

    const activeCount = layouts.filter(
        (layout) => layout.status === 'ACTIVE',
    ).length;

    const availableVehicles = vehicles.filter(
        (vehicle) => vehicle.status === 'ACTIVE',
    );


    // ==========================================
    // RENDER
    // ==========================================

    return (

        <main className="space-y-6">

            {/* PAGE HEADER */}

            <PageHeader
                title="Quản lý sơ đồ ghế"
                description="Thiết kế sơ đồ, quản lý vị trí ghế và áp dụng cấu hình cho từng phương tiện."
                action={{
                    label: 'Tạo sơ đồ mới',
                    onClick: handleCreate,
                }}
            />


            {/* STATISTICS */}

            <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">

                {[
                    {
                        label: 'Tổng sơ đồ',
                        value: layouts.length,
                    },
                    {
                        label: 'Sơ đồ mẫu',
                        value: templateCount,
                    },
                    {
                        label: 'Sơ đồ xe',
                        value: vehicleLayoutCount,
                    },
                    {
                        label: 'Đang kích hoạt',
                        value: activeCount,
                    },
                ].map((item) => (

                    <div
                        key={item.label}
                        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                    >

                        <p className="text-xs font-medium text-slate-500 sm:text-sm">
                            {item.label}
                        </p>

                        <p className="mt-2 text-2xl font-bold text-slate-900">
                            {item.value}
                        </p>

                    </div>

                ))}

            </section>


            {/* LAYOUT LIST */}

            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

                {/* SEARCH AND FILTER */}

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

                    <div>

                        <h2 className="font-semibold text-slate-900">
                            Danh sách sơ đồ
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Chọn thiết kế để quản lý bố cục và từng ghế.
                        </p>

                    </div>


                    <div className="flex flex-col gap-2 sm:flex-row">

                        <input
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Tìm tên sơ đồ, xe, biển số..."
                            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 sm:w-72"
                        />


                        <select
                            value={filter}
                            onChange={(event) =>
                                setFilter(
                                    event.target.value as typeof filter,
                                )
                            }
                            className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-red-500"
                        >

                            <option value="ALL">
                                Tất cả sơ đồ
                            </option>

                            <option value="TEMPLATE">
                                Sơ đồ mẫu
                            </option>

                            <option value="VEHICLE">
                                Sơ đồ xe
                            </option>

                        </select>


                        <button
                            type="button"
                            onClick={loadData}
                            disabled={isLoading}
                            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                            Tải lại
                        </button>

                    </div>

                </div>


                {/* ERROR */}

                {pageError && (

                    <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                        {pageError}
                    </div>

                )}


                {/* CONTENT */}

                {isLoading ? (

                    <div className="py-16 text-center text-sm text-slate-500">
                        Đang tải danh sách sơ đồ...
                    </div>

                ) : (

                    <div className="mt-5">

                        <SeatLayoutList
                            layouts={filteredLayouts}
                            onEdit={handleEdit}
                            onOpen={setOpeningLayout}
                            onDelete={setDeletingLayout}
                            onCopy={(layout) => {

                                setCopyingLayout(layout);

                                setCopyForm({
                                    vehicleId: '',
                                    name: `${layout.name} - `,
                                });

                            }}
                        />

                        {filteredLayouts.length > 0 && (

                            <p className="mt-4 text-xs text-slate-400">
                                Hiển thị {filteredLayouts.length}/{layouts.length} sơ đồ.
                            </p>

                        )}

                    </div>

                )}

            </section>


            {/* CREATE / UPDATE FORM */}

            {isFormOpen && (

                <SeatLayoutForm
                    layout={editingLayout}
                    onClose={handleCloseForm}
                    onSuccess={handleFormSuccess}
                />

            )}


            {/* SEAT LAYOUT EDITOR */}

            {openingLayout && (

                <SeatLayoutEditor
                    layout={openingLayout}
                    onClose={() => setOpeningLayout(null)}
                    onSuccess={(message) => {
                        setToast({
                            message,
                            type: 'success',
                        });
                        loadData();
                    }}
                />
            )}


            {/* DELETE CONFIRMATION */}

            <ConfirmModal
                isOpen={!!deletingLayout}
                title="Xóa sơ đồ ghế"
                message={
                    deletingLayout
                        ? `Bạn có chắc muốn xóa sơ đồ "${deletingLayout.name}"?`
                        : ''
                }
                confirmText="Xóa sơ đồ"
                cancelText="Giữ lại"
                onConfirm={handleDelete}
                onCancel={() =>
                    setDeletingLayout(null)
                }
            />


            {/* COPY TEMPLATE MODAL */}

            {copyingLayout && (

                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-3">

                    <form
                        onSubmit={handleCopy}
                        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
                    >

                        {/* MODAL HEADER */}

                        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

                            <div>

                                <h2 className="font-bold text-slate-900">
                                    Sao chép sơ đồ mẫu
                                </h2>

                                <p className="mt-1 text-xs text-slate-500">
                                    {copyingLayout.name}
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setCopyingLayout(null)
                                }
                                className="px-3 py-2 text-xl text-slate-400 hover:text-slate-700"
                            >
                                ×
                            </button>

                        </div>


                        {/* MODAL BODY */}

                        <div className="space-y-4 px-5 py-5">

                            <div>

                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Xe nhận sơ đồ *
                                </label>

                                <select
                                    required
                                    value={copyForm.vehicleId}
                                    onChange={(event) =>
                                        setCopyForm((previous) => ({
                                            ...previous,
                                            vehicleId: event.target.value,
                                        }))
                                    }
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm"
                                >

                                    <option value="">
                                        Chọn xe
                                    </option>

                                    {availableVehicles.map((vehicle) => (

                                        <option
                                            key={vehicle.id}
                                            value={vehicle.id}
                                        >
                                            {vehicle.name} · {vehicle.licensePlate} · {vehicle.seatCount} chỗ
                                        </option>

                                    ))}

                                </select>

                                <p className="mt-1 text-xs text-slate-500">
                                    Số ghế của sơ đồ mẫu phải bằng số chỗ khai báo của xe.
                                </p>

                            </div>


                            <div>

                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Tên sơ đồ mới
                                </label>

                                <input
                                    value={copyForm.name}
                                    onChange={(event) =>
                                        setCopyForm((previous) => ({
                                            ...previous,
                                            name: event.target.value,
                                        }))
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                    maxLength={100}
                                />

                            </div>

                        </div>


                        {/* MODAL FOOTER */}

                        <div className="flex justify-end gap-3 border-t border-slate-200 px-5 py-4">

                            <button
                                type="button"
                                onClick={() =>
                                    setCopyingLayout(null)
                                }
                                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                            >
                                Hủy
                            </button>

                            <button
                                type="submit"
                                disabled={
                                    isCopying ||
                                    !copyForm.vehicleId
                                }
                                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                            >
                                {isCopying
                                    ? 'Đang sao chép...'
                                    : 'Sao chép sơ đồ'}
                            </button>

                        </div>

                    </form>

                </div>

            )}


            {/* TOAST */}

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
