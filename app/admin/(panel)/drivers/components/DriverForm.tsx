'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

type Driver = {
    id: string;
    name: string;
    phone: string;
    licenseNumber: string;
    licenseClass?: string;
    licenseExpiry?: string;
    status: string;
};

type DriverFormProps = {
    driver?: Driver | null;
    onSuccess: (message:string) => void;
    onClose: () => void;
};

export default function DriverForm({
    driver,
    onSuccess,
    onClose,
}: DriverFormProps) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [licenseNumber, setLicenseNumber] = useState('');
    const [licenseClass, setLicenseClass] = useState('');
    const [licenseExpiry, setLicenseExpiry] = useState('');
    const [status, setStatus] = useState('ACTIVE');

    const [error, setError] = useState('');

    useEffect(() => {
        if (driver) {
            setName(driver.name);
            setPhone(driver.phone);
            setLicenseNumber(driver.licenseNumber);
            setLicenseClass(driver.licenseClass || '');
            setLicenseExpiry(driver.licenseExpiry || '');
            setStatus(driver.status || 'ACTIVE');
        } else {
            setName('');
            setPhone('');
            setLicenseNumber('');
            setLicenseClass('');
            setLicenseExpiry('');
            setStatus('ACTIVE');
        }

        setError('');
    }, [driver]);

    async function handleSubmit(
        event: React.SubmitEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setError('');

        const body = {
            name,
            phone,
            licenseNumber,
            licenseClass: licenseClass || undefined,
            licenseExpiry: licenseExpiry || undefined,
            status,
        };

        const response = await apiFetch(
            driver
                ? `/drivers/${driver.id}`
                : '/drivers',
            {
                method: driver ? 'PATCH' : 'POST',
                body: JSON.stringify(body),
            },
        );

        if (response.status === 409) {
            setError(
                'Số điện thoại hoặc GPLX đã tồn tại',
            );
            return;
        }

        if (!response.ok) {
            setError(
                driver
                    ? 'Không thể cập nhật tài xế'
                    : 'Không thể thêm tài xế',
            );

            return;
        }

        onSuccess(
            driver
                ? `Đã cập nhật tài xế ${name}`
                : `Đã thêm tài xế ${name}`,
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            {driver
                                ? 'Sửa thông tin tài xế'
                                : 'Thêm tài xế'}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            {driver
                                ? 'Cập nhật thông tin tài xế'
                                : 'Nhập thông tin tài xế mới'}
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

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 p-5 sm:p-6"
                >
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

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Số GPLX
                        </label>

                        <input
                            type="text"
                            value={licenseNumber}
                            onChange={(e) =>
                                setLicenseNumber(e.target.value)
                            }
                            placeholder="785444656232"
                            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Hạng bằng
                            </label>

                            <select
                                value={licenseClass}
                                onChange={(e) =>
                                    setLicenseClass(
                                        e.target.value,
                                    )
                                }
                                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                            >
                                <option value="">
                                    Chọn hạng bằng
                                </option>

                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                                <option value="E">E</option>
                                <option value="FC">FC</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Hạn GPLX
                            </label>

                            <input
                                type="date"
                                value={licenseExpiry}
                                onChange={(e) =>
                                    setLicenseExpiry(
                                        e.target.value,
                                    )
                                }
                                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                            />
                        </div>
                    </div>

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

                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

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
                            {driver
                                ? 'Lưu thay đổi'
                                : 'Thêm tài xế'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}