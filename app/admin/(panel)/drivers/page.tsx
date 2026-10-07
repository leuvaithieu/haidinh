'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

import DriverList from './components/DriverList';
import DriverForm from './components/DriverForm';
import ConfirmModal from '../../components/ConfirmModal';
import Toast from '../../components/Toast';

type Driver = {
    id: string;
    name: string;
    phone: string;
    licenseNumber: string;
    licenseExpiry?: string;
    licenseClass?: string;
    status: string;
};

type ToastState = {
    message: string;
    type: 'success' | 'error';
} | null;

export default function DriverPage() {
    const [drivers, setDrivers] = useState<Driver[]>([]);

    const [isDriverFormOpen, setIsDriverFormOpen] =
        useState(false);

    const [editingDriver, setEditingDriver] =
        useState<Driver | null>(null);

    const [driverToDelete, setDriverToDelete] =
        useState<Driver | null>(null);

    const [currentUserRole, setCurrentUserRole] =
        useState('');

    const [toast, setToast] =
        useState<ToastState>(null);

    async function getDrivers() {
        const response = await apiFetch('/drivers');

        if (!response.ok) {
            return;
        }

        const data = await response.json();

        setDrivers(data);
    }

    async function getCurrentUser() {
        const response = await apiFetch('/auth/me');

        if (!response.ok) {
            return;
        }

        const data = await response.json();

        setCurrentUserRole(data.role);
    }

    useEffect(() => {
        getDrivers();
        getCurrentUser();
    }, []);

    function handleDriverAdd() {
        setEditingDriver(null);
        setIsDriverFormOpen(true);
    }

    function handleDriverEdit(driver: Driver) {
        setEditingDriver(driver);
        setIsDriverFormOpen(true);
    }

    function handleDriverDelete(driver: Driver) {
        setDriverToDelete(driver);
    }

    async function confirmDeleteDriver() {
        if (!driverToDelete) {
            return;
        }

        const driverName = driverToDelete.name;
        const driverId = driverToDelete.id;

        const response = await apiFetch(
            `/drivers/${driverId}`,
            {
                method: 'DELETE',
            },
        );

        if (!response.ok) {
            setToast({
                message: `Xóa tài xế ${driverName} thất bại`,
                type: 'error',
            });

            return;
        }

        setDriverToDelete(null);

        await getDrivers();

        setToast({
            message: `Đã xóa tài xế ${driverName}!`,
            type: 'success',
        });
    }

    return (
        <div className="space-y-6">

            {/* Page header */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Quản lý tài xế
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Quản lý thông tin và giấy phép lái xe
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleDriverAdd}
                    className="w-full rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 active:bg-red-800 sm:w-auto"
                >
                    + Thêm tài xế
                </button>

            </div>


            {/* Driver list */}

            <DriverList
                drivers={drivers}
                onEdit={handleDriverEdit}
                onDelete={handleDriverDelete}
                userRole={currentUserRole}
            />


            {/* Driver form */}

            {isDriverFormOpen && (
                <DriverForm
                    driver={editingDriver}

                    onSuccess={async (message) => {
                        setIsDriverFormOpen(false);
                        setEditingDriver(null);

                        await getDrivers();

                        setToast({
                            message,
                            type: 'success',
                        });
                    }}

                    onClose={() => {
                        setIsDriverFormOpen(false);
                        setEditingDriver(null);
                    }}
                />
            )}


            {/* Confirm delete */}

            {driverToDelete && (
                <ConfirmModal
                    isOpen={driverToDelete !== null}
                    title="Xóa tài xế"
                    message={`Bạn có chắc muốn xóa tài xế "${driverToDelete.name}" không?`}
                    onCancel={() => {
                        setDriverToDelete(null);
                    }}
                    onConfirm={confirmDeleteDriver}
                />
            )}


            {/* Toast */}

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