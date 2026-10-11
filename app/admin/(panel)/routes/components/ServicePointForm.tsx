'use client';

import { useState, type FormEvent } from 'react';
import { apiFetch } from '@/lib/api';

type ServicePointFormProps = {
    routePointId: string;
    onSuccess: (message: string) => void | Promise<void>;
    onClose: () => void;
};

export default function ServicePointForm({
    routePointId,
    onSuccess,
    onClose,
}: ServicePointFormProps) {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Vui lòng nhập tên điểm phục vụ');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await apiFetch('/service-points', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    routePointId,
                    name: name.trim(),
                }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => null);

                setError(
                    Array.isArray(data?.message)
                        ? data.message.join(', ')
                        : data?.message || 'Thêm điểm phục vụ thất bại',
                );
                return;
            }

            await onSuccess('Thêm điểm phục vụ thành công!');
        } catch {
            setError('Không thể kết nối đến máy chủ');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
                    <h2 className="text-lg font-bold text-slate-900">
                        Thêm điểm phục vụ
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        aria-label="Đóng"
                        className="rounded-lg px-2 py-1 text-2xl leading-none text-slate-400 hover:bg-slate-100"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Tên điểm phục vụ
                        </label>

                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ví dụ: Bến xe, văn phòng, điểm đón..."
                            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        />
                    </div>

                    {error && (
                        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                            {error}
                        </p>
                    )}

                    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="w-full rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:w-auto"
                        >
                            Hủy
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 sm:w-auto"
                        >
                            {isSubmitting ? 'Đang lưu...' : 'Thêm điểm phục vụ'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}