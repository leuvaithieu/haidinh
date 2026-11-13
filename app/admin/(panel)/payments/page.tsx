
'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

import PaymentList from './components/PaymentList';
import PaymentDetailModal from './components/PaymentDetailModal';
import ConfirmPaymentModal from './components/ConfirmPaymentModal';
import RejectPaymentModal from './components/RejectPaymentModal';

import Toast from '../../components/Toast';

import type {
    PaymentListItem,
    PaymentListResponse,
    PaymentDetail,
    RejectPaymentPayload,
    PaymentToastType,
} from './components/payment-types';

type ToastState = {
    message: string;
    type: PaymentToastType;
} | null;

export default function PaymentsPage() {
    const [payments, setPayments] = useState<PaymentListItem[]>([]);
    const [currentUserRole, setCurrentUserRole] = useState('');

    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState<ToastState>(null);

    const [selectedPayment, setSelectedPayment] =
        useState<PaymentDetail | null>(null);

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    const [paymentToConfirm, setPaymentToConfirm] =
        useState<PaymentListItem | null>(null);

    const [paymentToReject, setPaymentToReject] =
        useState<PaymentListItem | null>(null);

    const [isConfirmSubmitting, setIsConfirmSubmitting] = useState(false);
    const [isRejectSubmitting, setIsRejectSubmitting] = useState(false);

    const isAuthorized =
        currentUserRole === 'ADMIN' || currentUserRole === 'STAFF';

    // Lấy thông tin tài khoản hiện tại để xác định quyền truy cập module.
    async function getCurrentUser() {
        try {
            const response = await apiFetch('/auth/me');

            if (!response.ok) {
                setCurrentUserRole('');
                return;
            }

            const data = await response.json();
            setCurrentUserRole(data.role ?? '');
        } catch {
            setCurrentUserRole('');
        }
    }

    // Lấy danh sách giao dịch đang chờ nhân viên xác nhận.
    async function getPayments() {
        setIsLoading(true);

        try {
            const response = await apiFetch('/payments/reported');

            if (!response.ok) {
                const data = await response.json().catch(() => null);

                throw new Error(
                    Array.isArray(data?.message)
                        ? data.message.join(', ')
                        : data?.message || 'Không thể tải danh sách thanh toán',
                );
            }

            const data: PaymentListResponse = await response.json();

            if (!Array.isArray(data)) {
                throw new Error('Dữ liệu thanh toán trả về không hợp lệ');
            }

            setPayments(data);
        } catch (error) {
            setPayments([]);

            setToast({
                message:
                    error instanceof Error
                        ? error.message
                        : 'Không thể kết nối đến máy chủ',
                type: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    }

    // Khởi tạo trang bằng cách tải quyền người dùng và danh sách giao dịch.
    async function initializePage() {
        await Promise.all([
            getCurrentUser(),
            getPayments(),
        ]);
    }

    useEffect(() => {
        void initializePage();
    }, []);

    // Mở modal chi tiết và lấy dữ liệu giao dịch từ backend.
    async function handleViewDetail(payment: PaymentListItem) {
        setIsDetailModalOpen(true);
        setIsDetailLoading(true);
        setSelectedPayment(null);

        try {
            const response = await apiFetch(`/payments/${payment.id}`);

            if (!response.ok) {
                const data = await response.json().catch(() => null);

                throw new Error(
                    Array.isArray(data?.message)
                        ? data.message.join(', ')
                        : data?.message || 'Không thể tải chi tiết thanh toán',
                );
            }

            const data: PaymentDetail = await response.json();

            setSelectedPayment(data);
        } catch (error) {
            setIsDetailModalOpen(false);

            setToast({
                message:
                    error instanceof Error
                        ? error.message
                        : 'Không thể kết nối đến máy chủ',
                type: 'error',
            });
        } finally {
            setIsDetailLoading(false);
        }
    }

    // Đóng modal chi tiết và xóa dữ liệu giao dịch đang xem.
    function handleCloseDetail() {
        setIsDetailModalOpen(false);
        setSelectedPayment(null);
    }

    // Mở modal xác nhận giao dịch thanh toán.
    function handleRequestConfirm(payment: PaymentListItem) {
        if (!isAuthorized) return;

        setPaymentToConfirm(payment);
    }

    // Gửi yêu cầu xác nhận đã nhận tiền đến backend.
    async function handleConfirmPayment() {
        if (!paymentToConfirm || !isAuthorized) return;

        setIsConfirmSubmitting(true);

        try {
            const response = await apiFetch(
                `/payments/${paymentToConfirm.id}/confirm`,
                {
                    method: 'PATCH',
                },
            );

            if (!response.ok) {
                const data = await response.json().catch(() => null);

                throw new Error(
                    Array.isArray(data?.message)
                        ? data.message.join(', ')
                        : data?.message || 'Xác nhận thanh toán thất bại',
                );
            }

            const confirmedPayment = paymentToConfirm;

            setPaymentToConfirm(null);

            await getPayments();

            setToast({
                message: `Đã xác nhận thanh toán cho booking ${confirmedPayment.booking.bookingCode}`,
                type: 'success',
            });
        } catch (error) {
            setToast({
                message:
                    error instanceof Error
                        ? error.message
                        : 'Không thể kết nối đến máy chủ',
                type: 'error',
            });
        } finally {
            setIsConfirmSubmitting(false);
        }
    }

    // Mở modal nhập lý do từ chối giao dịch thanh toán.
    function handleRequestReject(payment: PaymentListItem) {
        if (!isAuthorized) return;

        setPaymentToReject(payment);
    }

    // Gửi yêu cầu từ chối giao dịch kèm lý do đến backend.
    async function handleRejectPayment(payload: RejectPaymentPayload) {
        if (!paymentToReject || !isAuthorized) return;

        setIsRejectSubmitting(true);

        try {
            const response = await apiFetch(
                `/payments/${paymentToReject.id}/reject`,
                {
                    method: 'PATCH',
                    body: JSON.stringify(payload),
                },
            );

            if (!response.ok) {
                const data = await response.json().catch(() => null);

                throw new Error(
                    Array.isArray(data?.message)
                        ? data.message.join(', ')
                        : data?.message || 'Từ chối thanh toán thất bại',
                );
            }

            const rejectedPayment = paymentToReject;

            setPaymentToReject(null);

            await getPayments();

            setToast({
                message: `Đã từ chối giao dịch của booking ${rejectedPayment.booking.bookingCode}`,
                type: 'success',
            });
        } catch (error) {
            setToast({
                message:
                    error instanceof Error
                        ? error.message
                        : 'Không thể kết nối đến máy chủ',
                type: 'error',
            });
        } finally {
            setIsRejectSubmitting(false);
        }
    }

    return (
        <main className="space-y-6">
            {/* Tiêu đề trang và thống kê giao dịch */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Quản lý thanh toán
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Kiểm tra giao dịch chuyển khoản và xác nhận thanh toán
                        cho booking của khách hàng
                    </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <p className="text-xs text-slate-500">
                        Giao dịch chờ xác nhận
                    </p>

                    <p className="mt-1 text-xl font-bold text-slate-900">
                        {payments.length.toLocaleString('vi-VN')}
                    </p>
                </div>
            </div>

            {/* Cảnh báo quyền truy cập */}
            {!isLoading && !isAuthorized && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <p className="text-sm font-medium text-red-700">
                        Tài khoản của bạn không có quyền quản lý thanh toán.
                    </p>
                </div>
            )}

            {/* Danh sách giao dịch */}
            {isAuthorized && (
                <PaymentList
                    payments={payments}
                    loading={isLoading}
                    onView={handleViewDetail}
                    onConfirm={handleRequestConfirm}
                    onReject={handleRequestReject}
                />
            )}

            {/* Modal xem chi tiết giao dịch */}
            <PaymentDetailModal
                payment={selectedPayment}
                open={isDetailModalOpen}
                onClose={handleCloseDetail}
            />

            {/* Modal xác nhận đã nhận tiền */}
            <ConfirmPaymentModal
                payment={paymentToConfirm}
                open={paymentToConfirm !== null}
                loading={isConfirmSubmitting}
                onConfirm={handleConfirmPayment}
                onClose={() => {
                    if (!isConfirmSubmitting) {
                        setPaymentToConfirm(null);
                    }
                }}
            />

            {/* Modal từ chối giao dịch */}
            <RejectPaymentModal
                payment={paymentToReject}
                open={paymentToReject !== null}
                loading={isRejectSubmitting}
                onReject={handleRejectPayment}
                onClose={() => {
                    if (!isRejectSubmitting) {
                        setPaymentToReject(null);
                    }
                }}
            />

            {/* Thông báo kết quả thao tác */}
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
