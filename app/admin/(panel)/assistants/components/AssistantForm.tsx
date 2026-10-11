'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

type Assistant = {
    id: string;
    name: string;
    phone: string;
    cccd: string;
    status: string;
};

type AssistantFormProps = {
    assistant?: Assistant | null;
    onSuccess: (message: string) => void;
    onClose: () => void;
};

export default function AssistantForm({
    assistant,
    onSuccess,
    onClose,
}: AssistantFormProps) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [cccd, setCccd] = useState('');
    const [status, setStatus] = useState('ACTIVE');

    const [error, setError] = useState('');

    useEffect(() => {
        if (assistant) {
            setName(assistant.name);
            setPhone(assistant.phone);
            setCccd(assistant.cccd);
            setStatus(assistant.status || 'ACTIVE');
        } else {
            setName('');
            setPhone('');
            setCccd('');
            setStatus('ACTIVE');
        }

        setError('');
    }, [assistant]);

    async function handleSubmit(
        event: React.SubmitEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setError('');

        const body = {
            name,
            phone,
            cccd,
            status,
        };

        const response = await apiFetch(
            assistant
                ? `/assistants/${assistant.id}`
                : '/assistants',
            {
                method: assistant ? 'PATCH' : 'POST',
                body: JSON.stringify(body),
            },
        );

        if (response.status === 409) {
            setError(
                'Số điện thoại hoặc CCCD đã tồn tại',
            );
            return;
        }

        if (!response.ok) {
            setError(
                assistant
                    ? 'Không thể cập nhật phụ xe'
                    : 'Không thể thêm phụ xe',
            );

            return;
        }

        onSuccess(
            assistant
                ? `Đã cập nhật phụ xe ${name}`
                : `Đã thêm phụ xe ${name}`,
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            {assistant
                                ? 'Sửa thông tin phụ xe'
                                : 'Thêm phụ xe'}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            {assistant
                                ? 'Cập nhật thông tin phụ xe'
                                : 'Nhập thông tin phụ xe mới'}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                        ×
                    </button>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 p-5 sm:p-6"
                >
                    {/* Họ tên */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Họ tên
                        </label>

                        <input
                            type="text"
                            value={name}
                            onChange={(e) =>
                                setName(e.target.value)
                            }
                            placeholder="Nguyễn Văn A"
                            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        />
                    </div>

                    {/* Số điện thoại */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Số điện thoại
                        </label>

                        <input
                            type="text"
                            value={phone}
                            onChange={(e) =>
                                setPhone(e.target.value)
                            }
                            placeholder="0982113878"
                            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        />
                    </div>

                    {/* CCCD */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Số CCCD
                        </label>

                        <input
                            type="text"
                            value={cccd}
                            onChange={(e) =>
                                setCccd(e.target.value)
                            }
                            placeholder="012345678901"
                            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        />
                    </div>

                    {/* Trạng thái */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Trạng thái
                        </label>

                        <select
                            value={status}
                            onChange={(e) =>
                                setStatus(e.target.value)
                            }
                            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        >
                            <option value="ACTIVE">
                                Đang hoạt động
                            </option>

                            <option value="INACTIVE">
                                Không hoạt động
                            </option>
                        </select>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            Hủy
                        </button>

                        <button
                            type="submit"
                            className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 active:bg-red-800"
                        >
                            {assistant
                                ? 'Lưu thay đổi'
                                : 'Thêm phụ xe'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}