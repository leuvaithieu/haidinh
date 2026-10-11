'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

import AssistantList from './components/AssistantList';
import AssistantForm from './components/AssistantForm';

import ConfirmModal from '../../components/ConfirmModal';
import Toast from '../../components/Toast';

type Assistant = {
    id: string;
    name: string;
    phone: string;
    cccd: string;
    status: string;
};

type ToastState = {
    message: string;
    type: 'success' | 'error';
} | null;

export default function AssistantPage() {
    const [assistants, setAssistants] = useState<Assistant[]>([]);

    const [isFormOpen, setIsFormOpen] = useState(false);

    const [editingAssistant, setEditingAssistant] =
        useState<Assistant | null>(null);

    const [assistantToDelete, setAssistantToDelete] =
        useState<Assistant | null>(null);

    const [currentUserRole, setCurrentUserRole] = useState('');

    const [toast, setToast] = useState<ToastState>(null);

    const [search, setSearch] = useState('');

    async function getAssistants() {
        const response = await apiFetch('/assistants');

        if (!response.ok) {
            setToast({
                message: 'Không thể tải danh sách phụ xe',
                type: 'error',
            });
            return;
        }

        const data = await response.json();

        setAssistants(data);
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
        getAssistants();
        getCurrentUser();
    }, []);

    function handleAddAssistant() {
        setEditingAssistant(null);
        setIsFormOpen(true);
    }

    function handleEditAssistant(assistant: Assistant) {
        setEditingAssistant(assistant);
        setIsFormOpen(true);
    }

    function handleDeleteAssistant(assistant: Assistant) {
        setAssistantToDelete(assistant);
    }

    async function handleSuccess(message: string) {
        setIsFormOpen(false);
        setEditingAssistant(null);

        await getAssistants();

        setToast({
            message,
            type: 'success',
        });
    }

    function handleCloseForm() {
        setIsFormOpen(false);
        setEditingAssistant(null);
    }

    async function confirmDeleteAssistant() {
        if (!assistantToDelete) return;

        const assistantId = assistantToDelete.id;
        const assistantName = assistantToDelete.name;

        const response = await apiFetch(
            `/assistants/${assistantId}`,
            {
                method: 'DELETE',
            },
        );

        if (!response.ok) {
            setToast({
                message: `Xóa phụ xe ${assistantName} thất bại!`,
                type: 'error',
            });
            return;
        }

        setAssistantToDelete(null);

        await getAssistants();

        setToast({
            message: `Đã xóa phụ xe ${assistantName}`,
            type: 'success',
        });
    }

    const filteredAssistants = assistants.filter((assistant) =>
        assistant.name
            .toLowerCase()
            .includes(search.toLowerCase().trim()),
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Quản lý phụ xe
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Quản lý danh sách và thông tin phụ xe
                    </p>
                </div>

                <button
                    onClick={handleAddAssistant}
                    className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 sm:w-auto"
                >
                    + Thêm phụ xe
                </button>
            </div>

            {/* Search */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="relative w-full sm:max-w-md">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm theo tên phụ xe..."
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    />

                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
                        >
                            ×
                        </button>
                    )}
                </div>

                <div className="mt-3 flex flex-col gap-1 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
                    <span>
                        {search
                            ? `Đang tìm: "${search}"`
                            : 'Tìm kiếm theo tên phụ xe'}
                    </span>

                    <span>
                        {filteredAssistants.length} / {assistants.length} phụ xe
                    </span>
                </div>
            </div>

            {/* Form */}
            {isFormOpen && (
                <AssistantForm
                    assistant={editingAssistant}
                    onSuccess={handleSuccess}
                    onClose={handleCloseForm}
                />
            )}

            {/* List */}
            <AssistantList
                assistants={filteredAssistants}
                onEdit={handleEditAssistant}
                onDelete={
                    currentUserRole === 'ADMIN'
                        ? handleDeleteAssistant
                        : undefined
                }
                userRole={currentUserRole}
            />

            {/* Confirm delete */}
            {assistantToDelete && (
                <ConfirmModal
                    isOpen={assistantToDelete !== null}
                    title="Xóa phụ xe"
                    message={`Bạn có chắc muốn xóa phụ xe ${assistantToDelete.name}?`}
                    onConfirm={confirmDeleteAssistant}
                    onCancel={() => setAssistantToDelete(null)}
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