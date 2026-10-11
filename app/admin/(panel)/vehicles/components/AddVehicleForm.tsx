'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

import ConfirmModal from '../../../components/ConfirmModal';

type Vehicle = {
    id: string;
    name: string;
    licensePlate: string;
    seatCount: number;
    vehicleType: string;
    status?: string;
    inspectionDate?: string;
    inspectionExpiry?: string;
};

type AddVehicleFormProps = {
    onSuccess: (message: string) => void;
    vehicle?: Vehicle;
};

type FormErrors = {
    licensePlate?: string;
    name?: string;
    seatCount?: string;
    vehicleType?: string;
    inspectionDate?: string;
    inspectionExpiry?: string;
    general?: string;
};

export default function AddVehicleForm({
    onSuccess,
    vehicle,
}: AddVehicleFormProps) {
    const [licensePlate, setLicensePlate] = useState('');
    const [name, setName] = useState('');
    const [seatCount, setSeatCount] = useState('');
    const [vehicleType, setVehicleType] = useState('');
    const [status, setStatus] = useState('ACTIVE');

    const [inspectionDate, setInspectionDate] = useState('');
    const [inspectionExpiry, setInspectionExpiry] = useState('');

    const [availableVehicleNames, setAvailableVehicleNames] =
        useState<string[]>([]);

    const [errors, setErrors] = useState<FormErrors>({});

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const isEditMode = !!vehicle;

    useEffect(() => {
        if (!vehicle) {
            setLicensePlate('');
            setName('');
            setSeatCount('');
            setVehicleType('');
            setStatus('ACTIVE');
            setInspectionDate('');
            setInspectionExpiry('');
            setErrors({});

            return;
        }

        setLicensePlate(vehicle.licensePlate);
        setName(vehicle.name);
        setSeatCount(String(vehicle.seatCount));
        setVehicleType(vehicle.vehicleType);
        setStatus(vehicle.status ?? 'ACTIVE');

        setInspectionDate(
            vehicle.inspectionDate
                ? vehicle.inspectionDate.slice(0, 10)
                : '',
        );

        setInspectionExpiry(
            vehicle.inspectionExpiry
                ? vehicle.inspectionExpiry.slice(0, 10)
                : '',
        );

        setErrors({});
    }, [vehicle]);

    useEffect(() => {
        async function getVehicles() {
            const response = await apiFetch('/vehicles');

            if (!response.ok) {
                return;
            }

            const vehicles: Vehicle[] = await response.json();

            const usedNames = vehicles
                .filter((item) => item.id !== vehicle?.id)
                .map((item) => item.name);

            const allNames = Array.from(
                { length: 40 },
                (_, index) =>
                    `HD-${String(index + 1).padStart(2, '0')}`,
            );

            const availableNames = allNames.filter(
                (vehicleName) =>
                    !usedNames.includes(vehicleName),
            );

            setAvailableVehicleNames(availableNames);
        }

        getVehicles();
    }, [vehicle]);

    async function validateForm() {
        const newErrors: FormErrors = {};

        if (!licensePlate.trim()) {
            newErrors.licensePlate =
                'Vui lòng nhập biển số xe';
        }

        if (!name) {
            newErrors.name =
                'Vui lòng nhập mã định danh xe';
        }

        if (!seatCount) {
            newErrors.seatCount =
                'Vui lòng nhập số chỗ ngồi của xe';
        }

        if (!vehicleType) {
            newErrors.vehicleType =
                'Vui lòng nhập hãng xe';
        }

        if (
            inspectionDate &&
            inspectionExpiry &&
            inspectionExpiry < inspectionDate
        ) {
            newErrors.inspectionExpiry =
                'Hạn đăng kiểm không được trước ngày đăng kiểm';
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    }

    async function saveVehicle() {
        const endpoint = isEditMode
            ? `/vehicles/${vehicle.id}`
            : '/vehicles';

        const method = isEditMode
            ? 'PATCH'
            : 'POST';

        const response = await apiFetch(endpoint, {
            method,
            body: JSON.stringify({
                licensePlate,
                name,
                seatCount: Number(seatCount),
                vehicleType,
                inspectionDate: inspectionDate
                    ? new Date(inspectionDate).toISOString()
                    : undefined,

                inspectionExpiry: inspectionExpiry
                    ? new Date(inspectionExpiry).toISOString()
                    : undefined,
            }),
        });

        if (!response.ok) {
            const data = await response.json();

            if (response.status === 409) {
                setErrors({
                    general:
                        data.message ||
                        'Biển số này đã tồn tại !',
                });

                return;
            }

            setErrors({
                general:
                    'Có lỗi xảy ra! Vui lòng thử lại !',
            });

            return;
        }

        if (isEditMode) {
            onSuccess(
                `Cập nhật thông tin xe ${vehicle.licensePlate} thành công !`,
            );
        } else {
            onSuccess('Thêm xe thành công !');
        }
    }

    async function handleSubmit(
        event: React.SubmitEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        const isValid = await validateForm();

        if (!isValid) {
            return;
        }

        setIsConfirmOpen(true);
    }

    return (
        <>
            <form
                onSubmit={handleSubmit}
                className="space-y-4"
            >

                {/* Biển số xe */}

                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                        Biển số xe
                    </label>

                    <input
                        type="text"
                        value={licensePlate}
                        onChange={(event) => {
                            setLicensePlate(
                                event.target.value,
                            );

                            setErrors((prev) => ({
                                ...prev,
                                licensePlate:
                                    undefined,
                            }));
                        }}
                        placeholder="VD: 36B-01459"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    />

                    {errors.licensePlate && (
                        <p className="mt-1 text-xs text-red-600">
                            {errors.licensePlate}
                        </p>
                    )}
                </div>


                {/* Mã xe */}

                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                        Mã xe
                    </label>

                    <select
                        value={name}
                        onChange={(event) => {
                            setName(
                                event.target.value,
                            );

                            setErrors((prev) => ({
                                ...prev,
                                name: undefined,
                            }));
                        }}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    >
                        <option value="">
                            Chọn mã xe
                        </option>

                        {availableVehicleNames.map(
                            (vehicleName) => (
                                <option
                                    key={vehicleName}
                                    value={vehicleName}
                                >
                                    {vehicleName}
                                </option>
                            ),
                        )}
                    </select>

                    {errors.name && (
                        <p className="mt-1 text-xs text-red-600">
                            {errors.name}
                        </p>
                    )}
                </div>


                {/* Số chỗ */}

                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                        Số chỗ
                    </label>

                    <select
                        value={seatCount}
                        onChange={(event) => {
                            setSeatCount(
                                event.target.value,
                            );

                            setErrors((prev) => ({
                                ...prev,
                                seatCount: undefined,
                            }));
                        }}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    >
                        <option value="">
                            Chọn số chỗ
                        </option>

                        <option value="24">
                            24 chỗ
                        </option>

                        <option value="38">
                            38 chỗ
                        </option>

                        <option value="44">
                            44 chỗ
                        </option>
                    </select>

                    {errors.seatCount && (
                        <p className="mt-1 text-xs text-red-600">
                            {errors.seatCount}
                        </p>
                    )}
                </div>


                {/* Hãng xe */}

                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                        Hãng xe
                    </label>

                    <select
                        value={vehicleType}
                        onChange={(event) => {
                            setVehicleType(
                                event.target.value,
                            );

                            setErrors((prev) => ({
                                ...prev,
                                vehicleType:
                                    undefined,
                            }));
                        }}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    >
                        <option value="">
                            Chọn hãng xe
                        </option>

                        <option value="Thaco">
                            Thaco
                        </option>

                        <option value="Hyundai">
                            Hyundai
                        </option>

                        <option value="Samco">
                            Tracomeco
                        </option>
                    </select>

                    {errors.vehicleType && (
                        <p className="mt-1 text-xs text-red-600">
                            {errors.vehicleType}
                        </p>
                    )}
                </div>


                {/* Ngày đăng kiểm */}

                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                        Ngày đăng kiểm
                    </label>

                    <input
                        type="date"
                        value={inspectionDate}
                        onChange={(event) => {
                            setInspectionDate(
                                event.target.value,
                            );

                            setErrors((prev) => ({
                                ...prev,
                                inspectionDate:
                                    undefined,
                                inspectionExpiry:
                                    undefined,
                            }));
                        }}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    />

                    {errors.inspectionDate && (
                        <p className="mt-1 text-xs text-red-600">
                            {errors.inspectionDate}
                        </p>
                    )}
                </div>


                {/* Hạn đăng kiểm */}

                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                        Hạn đăng kiểm
                    </label>

                    <input
                        type="date"
                        value={inspectionExpiry}
                        min={inspectionDate || undefined}
                        onChange={(event) => {
                            setInspectionExpiry(
                                event.target.value,
                            );

                            setErrors((prev) => ({
                                ...prev,
                                inspectionExpiry:
                                    undefined,
                            }));
                        }}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    />

                    {errors.inspectionExpiry && (
                        <p className="mt-1 text-xs text-red-600">
                            {errors.inspectionExpiry}
                        </p>
                    )}
                </div>


                {/* Trạng thái */}

                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                        Trạng thái
                    </label>

                    <select
                        value={status}
                        onChange={(event) => {
                            setStatus(
                                event.target.value,
                            );
                        }}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    >
                        <option value="ACTIVE">
                            ACTIVE
                        </option>

                        <option value="INACTIVE">
                            INACTIVE
                        </option>
                    </select>
                </div>


                {/* Submit */}

                <button
                    type="submit"
                    className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                    {isEditMode
                        ? 'Lưu thay đổi'
                        : 'Thêm xe'}
                </button>

                {errors.general && (
                    <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                        {errors.general}
                    </div>
                )}

            </form>


            {/* Confirm Modal */}

            <ConfirmModal
                isOpen={isConfirmOpen}
                title={
                    isEditMode
                        ? 'Xác nhận chỉnh sửa'
                        : 'Xác nhận thêm xe'
                }
                message={
                    isEditMode
                        ? `Bạn có chắc muốn lưu thay đổi cho xe ${name} - ${licensePlate}?`
                        : `Bạn có chắc muốn thêm xe ${name} - ${licensePlate}?`
                }
                confirmText={
                    isEditMode
                        ? 'Lưu thay đổi'
                        : 'Thêm xe'
                }
                cancelText="Hủy"
                onConfirm={async () => {
                    setIsConfirmOpen(false);

                    await saveVehicle();
                }}
                onCancel={() =>
                    setIsConfirmOpen(false)
                }
            />

        </>
    );
}