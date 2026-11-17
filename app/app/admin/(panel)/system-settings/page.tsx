
'use client';

import { useEffect, useState } from 'react';
import { Settings, Ticket, Wallet, Save, RefreshCw } from 'lucide-react';
import { apiFetch } from '@/lib/api';

import {
    getBookingSettings,
    getPaymentSettings,
    updateBookingSettings,
    updatePaymentSettings,
    type BookingSettings,
    type PaymentSettings,
} from './lib/system-settings-api';

type SettingsTab = 'booking' | 'payment';

// Cấu trúc thông tin ngân hàng trả về từ API VietQR.
type VietQrBank = {
    id: number;
    name: string;
    code: string;
    bin: string;
    shortName: string;
    logo: string;
    transferSupported: number;
    lookupSupported: number;
};

type Notice = {
    type: 'success' | 'error';
    message: string;
} | null;

const DEFAULT_BOOKING_SETTINGS: BookingSettings = {
    onlineBookingEnabled: true,
    bookingHoldMinutes: 20,
    minDepositAmount: 300000,
};

const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
    transferEnabled: false,
    bankName: '',
    bankCode: '',
    bankShortName: '',
    bankAccountNumber: '',
    bankAccountName: '',
    transferContent: 'HD',
    paymentReviewTimeoutMinutes: 30,
};

export default function SystemSettingsPage() {
    const [activeTab, setActiveTab] = useState<SettingsTab>('booking');

    const [bookingSettings, setBookingSettings] =
        useState<BookingSettings>(DEFAULT_BOOKING_SETTINGS);

    const [paymentSettings, setPaymentSettings] =
        useState<PaymentSettings>(DEFAULT_PAYMENT_SETTINGS);

    const [banks, setBanks] = useState<VietQrBank[]>([]);
    const [isLoadingBanks, setIsLoadingBanks] = useState(false);
    const [bankLoadError, setBankLoadError] = useState('');

    // Tạo mã QR VietQR xem trước từ thông tin ngân hàng đang nhập.
    // Chỉ tạo mã QR khi đã có đủ năm trường thông tin ngân hàng.
    const hasCompleteBankInfo = Boolean(
        paymentSettings.bankCode.trim() &&
        paymentSettings.bankName.trim() &&
        paymentSettings.bankShortName.trim() &&
        paymentSettings.bankAccountNumber.trim() &&
        paymentSettings.bankAccountName.trim(),
    );

    // Tạo mã QR VietQR xem trước từ thông tin ngân hàng đã cấu hình.
    const bankQrImageUrl = hasCompleteBankInfo
        ? `https://img.vietqr.io/image/${encodeURIComponent(
            paymentSettings.bankShortName.trim(),
        )}-${encodeURIComponent(
            paymentSettings.bankAccountNumber.trim(),
        )}-qr_only.png?${new URLSearchParams({
            accountName: paymentSettings.bankAccountName.trim(),
        }).toString()}`
        : '';

    const [currentUserRole, setCurrentUserRole] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [notice, setNotice] = useState<Notice>(null);

    const isAdmin = currentUserRole === 'ADMIN';
    const isStaff = currentUserRole === 'STAFF';

    // Tải thông tin người dùng và hai nhóm cấu hình từ backend.
    async function initializePage() {
        setIsLoading(true);
        setNotice(null);

        try {
            const userResponse = await apiFetch('/auth/me');

            if (!userResponse.ok) {
                throw new Error('Không thể xác định tài khoản hiện tại.');
            }

            const userData = await userResponse.json();
            const role = userData.role ?? '';

            setCurrentUserRole(role);

            if (role !== 'ADMIN' && role !== 'STAFF') {
                throw new Error(
                    'Tài khoản của bạn không có quyền truy cập cài đặt hệ thống.',
                );
            }

            const [bookingData, paymentData] = await Promise.all([
                getBookingSettings(),
                getPaymentSettings(),
            ]);

            setBookingSettings(bookingData);
            setPaymentSettings(paymentData);
        } catch (error) {
            setNotice({
                type: 'error',
                message:
                    error instanceof Error
                        ? error.message
                        : 'Không thể tải cài đặt hệ thống.',
            });
        } finally {
            setIsLoading(false);
        }
    }

    // Tải danh sách ngân hàng hỗ trợ chuyển khoản VietQR.
    async function loadVietQrBanks() {
        setIsLoadingBanks(true);
        setBankLoadError('');

        try {
            const response = await fetch('https://api.vietqr.io/v2/banks');

            if (!response.ok) {
                throw new Error('Không thể kết nối đến dịch vụ VietQR.');
            }

            const result: {
                code: string;
                desc: string;
                data: VietQrBank[];
            } = await response.json();

            if (result.code !== '00' || !Array.isArray(result.data)) {
                throw new Error('Dữ liệu ngân hàng VietQR không hợp lệ.');
            }

            const supportedBanks = result.data
                .filter((bank) => bank.transferSupported === 1)
                .sort((a, b) => a.shortName.localeCompare(b.shortName, 'vi'));

            setBanks(supportedBanks);
        } catch (error) {
            setBankLoadError(
                error instanceof Error
                    ? error.message
                    : 'Không thể tải danh sách ngân hàng.',
            );
        } finally {
            setIsLoadingBanks(false);
        }
    }

    useEffect(() => {
        void initializePage();
        void loadVietQrBanks();
    }, []);

    // Cập nhật một trường trong nhóm cài đặt đặt vé.
    function handleBookingChange<K extends keyof BookingSettings>(
        key: K,
        value: BookingSettings[K],
    ) {
        setBookingSettings((current) => ({
            ...current,
            [key]: value,
        }));
    }

    // Cập nhật một trường trong nhóm cài đặt thanh toán.
    function handlePaymentChange<K extends keyof PaymentSettings>(
        key: K,
        value: PaymentSettings[K],
    ) {
        setPaymentSettings((current) => ({
            ...current,
            [key]: value,
        }));
    }

    // Tự động cập nhật ba trường thông tin khi ADMIN chọn ngân hàng VietQR.
    function handleSelectBank(bankId: string) {
        const selectedBank = banks.find(
            (bank) => String(bank.id) === bankId,
        );

        if (!selectedBank) {
            handlePaymentChange('bankCode', '');
            handlePaymentChange('bankName', '');
            handlePaymentChange('bankShortName', '');
            return;
        }

        handlePaymentChange('bankCode', selectedBank.code);
        handlePaymentChange('bankName', selectedBank.name);
        handlePaymentChange('bankShortName', selectedBank.shortName);
    }

    // Lưu nhóm cài đặt đặt vé và tải lại dữ liệu từ backend.
    async function handleSaveBooking(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!isAdmin || isSaving) return;

        setIsSaving(true);
        setNotice(null);

        try {
            await updateBookingSettings(bookingSettings);

            const latestSettings = await getBookingSettings();
            setBookingSettings(latestSettings);

            setNotice({
                type: 'success',
                message: 'Đã lưu cài đặt đặt vé thành công.',
            });
        } catch (error) {
            setNotice({
                type: 'error',
                message:
                    error instanceof Error
                        ? error.message
                        : 'Không thể lưu cài đặt đặt vé.',
            });
        } finally {
            setIsSaving(false);
        }
    }

    // Lưu nhóm cài đặt thanh toán và tải lại dữ liệu từ backend.
    async function handleSavePayment(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!isAdmin || isSaving) return;

        setIsSaving(true);
        setNotice(null);

        try {
            await updatePaymentSettings(paymentSettings);

            const latestSettings = await getPaymentSettings();
            setPaymentSettings(latestSettings);

            setNotice({
                type: 'success',
                message: 'Đã lưu cài đặt thanh toán thành công.',
            });
        } catch (error) {
            setNotice({
                type: 'error',
                message:
                    error instanceof Error
                        ? error.message
                        : 'Không thể lưu cài đặt thanh toán.',
            });
        } finally {
            setIsSaving(false);
        }
    }

    // Chuyển đổi giữa hai nhóm cài đặt.
    function handleChangeTab(tab: SettingsTab) {
        setActiveTab(tab);
        setNotice(null);
    }

    if (isLoading) {
        return (
            <div className="flex min-h-64 items-center justify-center">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                    <RefreshCw size={18} className="animate-spin" />
                    Đang tải cài đặt hệ thống...
                </div>
            </div>
        );
    }

    if (!isAdmin && !isStaff) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                <h2 className="font-semibold text-red-800">
                    Không có quyền truy cập
                </h2>
                <p className="mt-2 text-sm text-red-700">
                    {notice?.message ||
                        'Tài khoản của bạn không được phép truy cập trang này.'}
                </p>
            </div>
        );
    }

    return (
        <main className="space-y-6">
            <div>
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                        <Settings size={23} />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Cài đặt hệ thống
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Quản lý các thiết lập đặt vé và thanh toán của Hải Định.
                        </p>
                    </div>
                </div>
            </div>

            {isStaff && (
                <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                    Bạn đang ở chế độ chỉ xem. Chỉ ADMIN mới có quyền thay đổi cài đặt.
                </div>
            )}

            {notice && (
                <div
                    role="alert"
                    className={`rounded-xl border px-4 py-3 text-sm ${
                        notice.type === 'success'
                            ? 'border-green-200 bg-green-50 text-green-800'
                            : 'border-red-200 bg-red-50 text-red-700'
                    }`}
                >
                    {notice.message}
                </div>
            )}

            <div className="flex flex-wrap gap-2 border-b border-slate-200">
                <button
                    type="button"
                    onClick={() => handleChangeTab('booking')}
                    className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                        activeTab === 'booking'
                            ? 'border-red-600 text-red-600'
                            : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                >
                    <Ticket size={18} />
                    Cài đặt đặt vé
                </button>

                <button
                    type="button"
                    onClick={() => handleChangeTab('payment')}
                    className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                        activeTab === 'payment'
                            ? 'border-red-600 text-red-600'
                            : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                >
                    <Wallet size={18} />
                    Cài đặt thanh toán
                </button>
            </div>

            {activeTab === 'booking' && (
                <form
                    onSubmit={handleSaveBooking}
                    className="space-y-6"
                >
                    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 p-5">
                            <h2 className="font-bold text-slate-900">
                                Quy định đặt vé trực tuyến
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Kiểm soát khả năng đặt vé và thời gian giữ ghế của khách hàng.
                            </p>
                        </div>

                        <div className="space-y-6 p-5">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">
                                        Cho phép đặt vé trực tuyến
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Khi tắt, khách hàng không thể tạo booking mới trên website.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={bookingSettings.onlineBookingEnabled}
                                    disabled={!isAdmin}
                                    onClick={() =>
                                        handleBookingChange(
                                            'onlineBookingEnabled',
                                            !bookingSettings.onlineBookingEnabled,
                                        )
                                    }
                                    className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                        bookingSettings.onlineBookingEnabled
                                            ? 'bg-green-600'
                                            : 'bg-slate-300'
                                    }`}
                                >
                                    <span
                                        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                                            bookingSettings.onlineBookingEnabled
                                                ? 'left-6'
                                                : 'left-1'
                                        }`}
                                    />
                                </button>
                            </div>

                            <div className="border-t border-slate-100" />

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="bookingHoldMinutes"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Thời gian giữ ghế (phút)
                                    </label>

                                    <input
                                        id="bookingHoldMinutes"
                                        type="number"
                                        min={1}
                                        max={1440}
                                        step={1}
                                        required
                                        disabled={!isAdmin}
                                        value={bookingSettings.bookingHoldMinutes}
                                        onChange={(event) =>
                                            handleBookingChange(
                                                'bookingHoldMinutes',
                                                Number(event.target.value),
                                            )
                                        }
                                        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:bg-slate-100"
                                    />

                                    <p className="mt-1.5 text-xs text-slate-500">
                                        Thời gian ghế được giữ sau khi khách tạo booking.
                                    </p>
                                </div>

                                <div>
                                    <label
                                        htmlFor="minDepositAmount"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Tiền đặt cọc tối thiểu (VND)
                                    </label>

                                    <input
                                        id="minDepositAmount"
                                        type="number"
                                        min={1}
                                        step={1000}
                                        required
                                        disabled={!isAdmin}
                                        value={bookingSettings.minDepositAmount}
                                        onChange={(event) =>
                                            handleBookingChange(
                                                'minDepositAmount',
                                                Number(event.target.value),
                                            )
                                        }
                                        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:bg-slate-100"
                                    />

                                    <p className="mt-1.5 text-xs text-slate-500">
                                        Số tiền đặt cọc tối thiểu khách phải thanh toán.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {isAdmin && (
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                            >
                                <Save size={17} />
                                {isSaving ? 'Đang lưu...' : 'Lưu cài đặt đặt vé'}
                            </button>
                        </div>
                    )}
                </form>
            )}

            {activeTab === 'payment' && (
                <form
                    onSubmit={handleSavePayment}
                    className="space-y-6"
                >
                    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 p-5">
                            <h2 className="font-bold text-slate-900">
                                Phương thức thanh toán
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Quản lý phương thức chuyển khoản ngân hàng dành cho khách đặt vé.
                            </p>
                        </div>

                        <div className="p-5">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">
                                        Cho phép thanh toán chuyển khoản
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Khi tắt, khách không thể lấy thông tin ngân hàng hoặc báo chuyển khoản.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={paymentSettings.transferEnabled}
                                    disabled={!isAdmin}
                                    onClick={() =>
                                        handlePaymentChange(
                                            'transferEnabled',
                                            !paymentSettings.transferEnabled,
                                        )
                                    }
                                    className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                        paymentSettings.transferEnabled
                                            ? 'bg-green-600'
                                            : 'bg-slate-300'
                                    }`}
                                >
                                    <span
                                        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                                            paymentSettings.transferEnabled
                                                ? 'left-6'
                                                : 'left-1'
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 p-5">
                            <h2 className="font-bold text-slate-900">
                                Tài khoản ngân hàng nhận tiền
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Thông tin này được sử dụng để tạo mã QR VietQR cho khách hàng.
                            </p>
                        </div>

                        <div className="grid gap-5 p-5 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label
                                    htmlFor="bankSelect"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Ngân hàng nhận tiền
                                </label>

                                <select
                                    id="bankSelect"
                                    required
                                    disabled={!isAdmin || isLoadingBanks}
                                    value={
                                        banks.find(
                                            (bank) =>
                                                bank.code === paymentSettings.bankCode &&
                                                bank.shortName === paymentSettings.bankShortName,
                                        )?.id.toString() ?? ''
                                    }
                                    onChange={(event) => handleSelectBank(event.target.value)}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:bg-slate-100"
                                >
                                    <option value="">
                                        {isLoadingBanks
                                            ? 'Đang tải danh sách ngân hàng...'
                                            : 'Chọn ngân hàng'}
                                    </option>

                                    {banks.map((bank) => (
                                        <option key={bank.id} value={String(bank.id)}>
                                            {bank.shortName} - {bank.name}
                                        </option>
                                    ))}
                                </select>

                                {bankLoadError && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {bankLoadError}
                                    </p>
                                )}

                                {paymentSettings.bankCode && (
                                    <p className="mt-2 text-xs text-slate-500">
                                        Mã ngân hàng: {paymentSettings.bankCode}
                                        {' · '}
                                        Tên viết tắt: {paymentSettings.bankShortName}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="bankAccountNumber"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Số tài khoản
                                </label>
                                <input
                                    id="bankAccountNumber"
                                    type="text"
                                    inputMode="numeric"
                                    required
                                    maxLength={30}
                                    disabled={!isAdmin}
                                    value={paymentSettings.bankAccountNumber}
                                    onChange={(event) =>
                                        handlePaymentChange(
                                            'bankAccountNumber',
                                            event.target.value.replace(/\D/g, ''),
                                        )
                                    }
                                    placeholder="Nhập số tài khoản ngân hàng"
                                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:bg-slate-100"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="bankAccountName"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Chủ tài khoản
                                </label>
                                <input
                                    id="bankAccountName"
                                    type="text"
                                    required
                                    maxLength={100}
                                    disabled={!isAdmin}
                                    value={paymentSettings.bankAccountName}
                                    onChange={(event) =>
                                        handlePaymentChange(
                                            'bankAccountName',
                                            event.target.value.toUpperCase(),
                                        )
                                    }
                                    placeholder="Tên chủ tài khoản không dấu"
                                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm uppercase outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:bg-slate-100"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label
                                    htmlFor="transferContent"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Nội dung chuyển khoản mặc định
                                </label>
                                <input
                                    id="transferContent"
                                    type="text"
                                    required
                                    maxLength={100}
                                    disabled={!isAdmin}
                                    value={paymentSettings.transferContent}
                                    onChange={(event) =>
                                        handlePaymentChange(
                                            'transferContent',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Ví dụ: HD"
                                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:bg-slate-100"
                                />
                                <p className="mt-1.5 text-xs text-slate-500">
                                    Tiền tố mặc định. Mã booking sẽ được sử dụng để tạo nội dung chuyển khoản riêng cho từng khách.
                                </p>
                            </div>
                        </div>
                    </section>

                    <div className="border-t border-slate-100 pt-5">
                        <div className="mb-4">
                            <h3 className="font-semibold text-slate-900">
                                Mã QR nhận thanh toán
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                                Mã QR được tự động tạo từ ngân hàng và số tài khoản đang cấu hình.
                            </p>
                        </div>

                        <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-slate-50 p-5">
                            {bankQrImageUrl ? (
                                <>
                                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                                        <img
                                            src={bankQrImageUrl}
                                            alt="QR nhận thanh toán Hải Định"
                                            className="h-64 w-64 max-w-full object-contain"
                                        />
                                    </div>

                                    <p className="mt-3 text-sm font-semibold text-slate-800">
                                        {paymentSettings.bankName || 'Ngân hàng chưa nhập'}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        {paymentSettings.bankAccountNumber}
                                    </p>

                                    <a
                                        href={bankQrImageUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-4 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                                    >
                                        Mở ảnh QR
                                    </a>
                                </>
                            ) : (
                                <div className="py-12 text-center">
                                    <Wallet
                                        size={40}
                                        className="mx-auto text-slate-300"
                                    />
                                    <p className="mt-3 text-sm font-medium text-slate-600">
                                        Chưa đủ thông tin tạo mã QR
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Cần chọn ngân hàng và nhập đầy đủ mã ngân hàng, tên ngân hàng, tên viết tắt, số tài khoản và chủ tài khoản.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 p-5">
                            <h2 className="font-bold text-slate-900">
                                Xử lý giao dịch
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Quy định thời gian xử lý thông tin chuyển khoản do khách gửi.
                            </p>
                        </div>

                        <div className="p-5">
                            <div className="max-w-md">
                                <label
                                    htmlFor="paymentReviewTimeoutMinutes"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Thời hạn xử lý giao dịch (phút)
                                </label>

                                <input
                                    id="paymentReviewTimeoutMinutes"
                                    type="number"
                                    min={1}
                                    max={10080}
                                    step={1}
                                    required
                                    disabled={!isAdmin}
                                    value={paymentSettings.paymentReviewTimeoutMinutes}
                                    onChange={(event) =>
                                        handlePaymentChange(
                                            'paymentReviewTimeoutMinutes',
                                            Number(event.target.value),
                                        )
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:bg-slate-100"
                                />

                                <p className="mt-1.5 text-xs text-slate-500">
                                    Thời gian tối đa hệ thống chờ nhân viên xử lý giao dịch.
                                </p>
                            </div>
                        </div>
                    </section>

                    {isAdmin && (
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                            >
                                <Save size={17} />
                                {isSaving ? 'Đang lưu...' : 'Lưu cài đặt thanh toán'}
                            </button>
                        </div>
                    )}
                </form>
            )}
        </main>
    );
}
