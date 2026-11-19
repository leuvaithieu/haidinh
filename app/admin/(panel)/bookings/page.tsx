
'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

import BookingFiltersPanel from './components/BookingFilters';
import BookingList from './components/BookingList';
import BookingDetailModal from './components/BookingDetailModal';

import ConfirmModal from '../../components/ConfirmModal';
import Toast from '../../components/Toast';

import type {
    BookingFilters,
    BookingListItem,
    BookingListResponse,
    BookingDetail,
    BookingPagination,
    PaymentStatus,
    BookingToast,
} from './components/booking-types';

const DEFAULT_FILTERS: BookingFilters = {
    page: 1,
    limit: 20,
    tripId: '',
    customerPhone: '',
    bookingCode: '',
    status: '',
    paymentStatus: '',
};

export default function BookingsPage() {
    const [bookings, setBookings] = useState<BookingListItem[]>([]);

    const [filters, setFilters] = useState<BookingFilters>({
        ...DEFAULT_FILTERS,
    });

    const [pagination, setPagination] = useState<BookingPagination>({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    });

    const [currentUserRole, setCurrentUserRole] = useState('');

    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState<BookingToast>(null);

    const [selectedBooking, setSelectedBooking] = useState<BookingDetail | null>(null);

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [cancellationReason, setCancellationReason] = useState('');

    const [bookingToCancel, setBookingToCancel] =
        useState<BookingListItem | null>(null);

    const [isCancelSubmitting, setIsCancelSubmitting] = useState(false);

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

    // Tạo query string theo đúng các trường lọc mà QueryBookingDto hỗ trợ.
    function buildBookingQuery(currentFilters: BookingFilters) {
        const params = new URLSearchParams();

        params.set('page', String(currentFilters.page));
        params.set('limit', String(currentFilters.limit));

        if (currentFilters.tripId.trim()) {
            params.set('tripId', currentFilters.tripId.trim());
        }

        if (currentFilters.customerPhone.trim()) {
            params.set(
                'customerPhone',
                currentFilters.customerPhone.trim(),
            );
        }

        if (currentFilters.bookingCode.trim()) {
            params.set('bookingCode', currentFilters.bookingCode.trim());
        }

        if (currentFilters.status) {
            params.set('status', currentFilters.status);
        }

        if (currentFilters.paymentStatus) {
            params.set('paymentStatus', currentFilters.paymentStatus);
        }

        return params.toString();
    }

    // Lấy danh sách booking và thông tin phân trang từ BE.
    async function getBookings(currentFilters: BookingFilters) {
        setIsLoading(true);

        try {
            const query = buildBookingQuery(currentFilters);

            const response = await apiFetch(`/bookings?${query}`);

            if (!response.ok) {
                const data = await response.json().catch(() => null);

                throw new Error(
                    Array.isArray(data?.message)
                        ? data.message.join(', ')
                        : data?.message || 'Không thể tải danh sách booking',
                );
            }

            const data: BookingListResponse = await response.json();

            if (!Array.isArray(data.data) || !data.pagination) {
                throw new Error('Dữ liệu booking trả về không hợp lệ');
            }

            setBookings(data.data);
            setPagination(data.pagination);
        } catch (error) {
            setBookings([]);

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

    // Khởi tạo trang bằng cách tải quyền người dùng và danh sách booking.
    async function initializePage() {
        await Promise.all([
            getCurrentUser(),
            getBookings(DEFAULT_FILTERS),
        ]);
    }

    useEffect(() => {
        void initializePage();
    }, []);

    // Cập nhật các điều kiện lọc do component BookingFilters gửi lên.
    function handleFilterChange(nextFilters: BookingFilters) {
        setFilters(nextFilters);
    }

    // Thực hiện tìm kiếm booking và quay về trang đầu tiên.
    async function handleSearch() {
        const nextFilters = {
            ...filters,
            page: 1,
        };

        setFilters(nextFilters);
        await getBookings(nextFilters);
    }

    // Xóa toàn bộ điều kiện lọc và tải lại danh sách booking ban đầu.
    async function handleResetFilters() {
        const nextFilters = {
            ...DEFAULT_FILTERS,
        };

        setFilters(nextFilters);
        await getBookings(nextFilters);
    }

    // Chuyển trang danh sách booking theo kết quả phân trang của BE.
    async function handleChangePage(page: number) {
        if (
            page < 1 ||
            page > pagination.totalPages ||
            page === pagination.page
        ) {
            return;
        }

        const nextFilters = {
            ...filters,
            page,
        };

        setFilters(nextFilters);
        await getBookings(nextFilters);
    }

    // Lấy thông tin chi tiết booking theo ID và mở modal chi tiết.
    async function handleViewDetail(booking: BookingListItem) {
        setIsDetailModalOpen(true);
        setSelectedBooking(null);

        try {
            const response = await apiFetch(`/bookings/${booking.id}`);

            if (!response.ok) {
                const data = await response.json().catch(() => null);

                throw new Error(
                    data?.message || 'Không thể tải chi tiết booking',
                );
            }

            const data: BookingDetail = await response.json();

            setSelectedBooking(data);
        } catch (error) {
            setIsDetailModalOpen(false);

            setToast({
                message:
                    error instanceof Error
                        ? error.message
                        : 'Không thể kết nối đến máy chủ',
                type: 'error',
            });
        }
    }

    // Đóng modal chi tiết booking và xóa dữ liệu đang xem.
    function handleCloseDetail() {
        setIsDetailModalOpen(false);
        setSelectedBooking(null);
    }

    // Kiểm tra booking có đủ điều kiện hiển thị thao tác hủy theo nghiệp vụ BE hay không.
    function canCancelBooking(booking: BookingListItem) {
        if (booking.status === 'CONFIRMED') {
            return true;
        }

        const allowedPaymentStatuses: PaymentStatus[] = [
            'UNPAID',
            'FAILED',
            'REJECTED',
        ];

        return (
            booking.status === 'PENDING' &&
            allowedPaymentStatuses.includes(booking.paymentStatus)
        );
    }

    // Mở hộp thoại xác nhận hủy booking nếu người dùng có quyền.
    function handleRequestCancel(booking: BookingListItem) {
        if (!isAuthorized) return;

        if (!canCancelBooking(booking)) {
            setToast({
                message: 'Booking này không đủ điều kiện hủy.',
                type: 'error',
            });

            return;
        }

        setCancellationReason('');
        setBookingToCancel(booking);
    }

    // Gửi yêu cầu hủy booking đến BE theo trạng thái hiện tại.
    async function confirmCancelBooking() {
        if (!bookingToCancel || !isAuthorized) return;

        if (!canCancelBooking(bookingToCancel)) {
            setBookingToCancel(null);

            setToast({
                message: 'Booking đã thay đổi trạng thái và không còn đủ điều kiện hủy.',
                type: 'error',
            });

            await getBookings(filters);
            return;
        }

        setIsCancelSubmitting(true);

        try {
            const isConfirmedBooking =
                bookingToCancel.status === 'CONFIRMED';

            const endpoint = isConfirmedBooking
                ? `/bookings/${bookingToCancel.id}/cancel-confirmed`
                : `/bookings/${bookingToCancel.id}/cancel`;

            const response = await apiFetch(endpoint, {
                method: isConfirmedBooking ? 'POST' : 'PATCH',
                ...(isConfirmedBooking && {
                    body: JSON.stringify(
                        cancellationReason.trim()
                            ? { reason: cancellationReason.trim() }
                            : {},
                    ),
                }),
            });

            const result = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    Array.isArray(result?.message)
                        ? result.message.join(', ')
                        : result?.message || 'Hủy booking thất bại',
                );
            }

            const cancelledBooking = bookingToCancel;

            setBookingToCancel(null);
            setCancellationReason('');

            // Đóng modal chi tiết nếu booking vừa hủy đang được mở.
            if (selectedBooking?.id === cancelledBooking.id) {
                handleCloseDetail();
            }

            await getBookings(filters);

            setToast({
                message: isConfirmedBooking
                    ? `Đã hủy booking ${cancelledBooking.bookingCode}. Đã hủy ${result?.cancelledTicketCount ?? 0} vé và giải phóng ${result?.releasedSeatCount ?? 0} ghế.`
                    : `Đã hủy booking ${cancelledBooking.bookingCode} thành công.`,
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
            setIsCancelSubmitting(false);
        }
    }

    return (
        <main className="space-y-6">
            {/* Tiêu đề trang và tổng số booking */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Quản lý đặt vé
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Theo dõi booking, tình trạng giữ ghế và thanh toán
                        của khách hàng
                    </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <p className="text-xs text-slate-500">
                        Tổng số booking
                    </p>

                    <p className="mt-1 text-xl font-bold text-slate-900">
                        {pagination.total.toLocaleString('vi-VN')}
                    </p>
                </div>
            </div>

            {/* Bộ lọc và tìm kiếm booking */}
            <BookingFiltersPanel
                filters={filters}
                onChange={handleFilterChange}
                onSearch={handleSearch}
                onReset={handleResetFilters}
            />

            {/* Danh sách booking và phân trang */}
            <BookingList
                bookings={bookings}
                loading={isLoading}
                pagination={pagination}
                onView={handleViewDetail}
                onCancel={handleRequestCancel}
                canCancelBooking={(booking) =>
                    isAuthorized && canCancelBooking(booking)
                }
                onPageChange={handleChangePage}
            />

            {/* Modal xem chi tiết booking */}
            <BookingDetailModal
                booking={selectedBooking}
                open={isDetailModalOpen}
                onClose={handleCloseDetail}
                onCancel={handleRequestCancel}
            />

            {/* Xác nhận hủy booking PENDING */}
            <ConfirmModal
                isOpen={bookingToCancel?.status === 'PENDING'}
                title="Xác nhận hủy booking"
                message={
                    bookingToCancel
                        ? `Bạn có chắc chắn muốn hủy booking ${bookingToCancel.bookingCode} của khách ${bookingToCancel.customerName} - ${bookingToCancel.customerPhone}?`
                        : ''
                }
                confirmText={
                    isCancelSubmitting ? 'Đang xử lý...' : 'Xác nhận hủy'
                }
                cancelText="Quay lại"
                onConfirm={confirmCancelBooking}
                onCancel={() => {
                    if (!isCancelSubmitting) {
                        setBookingToCancel(null);
                    }
                }}
            />

            {/* Xác nhận hủy booking CONFIRMED */}
            {bookingToCancel?.status === 'CONFIRMED' && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-2xl sm:p-6">
                        <h2 className="text-lg font-bold text-slate-900">
                            Xác nhận hủy booking đã xác nhận
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            Bạn đang hủy booking{' '}
                            <strong>{bookingToCancel.bookingCode}</strong> của khách{' '}
                            <strong>{bookingToCancel.customerName}</strong>.
                        </p>

                        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                            <p className="text-sm leading-6 text-amber-800">
                                Chỉ thực hiện sau khi đã được quản lý phê duyệt.
                                Việc hoàn tiền hoặc khấu trừ tiền được xử lý bên ngoài hệ thống.
                            </p>
                        </div>

                        <div className="mt-4">
                            <label
                                htmlFor="cancellation-reason"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Lý do hủy
                                <span className="ml-1 font-normal text-slate-400">
                                    (Không bắt buộc)
                                </span>
                            </label>

                            <textarea
                                id="cancellation-reason"
                                value={cancellationReason}
                                onChange={(event) =>
                                    setCancellationReason(event.target.value)
                                }
                                maxLength={500}
                                rows={3}
                                disabled={isCancelSubmitting}
                                placeholder="Nhập lý do hủy booking nếu có..."
                                className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:bg-slate-50"
                            />

                            <p className="mt-1 text-right text-xs text-slate-400">
                                {cancellationReason.length}/500
                            </p>
                        </div>

                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                disabled={isCancelSubmitting}
                                onClick={() => {
                                    setBookingToCancel(null);
                                    setCancellationReason('');
                                }}
                                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                            >
                                Quay lại
                            </button>

                            <button
                                type="button"
                                disabled={isCancelSubmitting}
                                onClick={confirmCancelBooking}
                                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isCancelSubmitting
                                    ? 'Đang xử lý...'
                                    : 'Xác nhận hủy booking'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
