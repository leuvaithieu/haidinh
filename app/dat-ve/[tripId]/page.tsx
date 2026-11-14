
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

import BookingSteps from '@/app/booking/components/BookingSteps';
import SeatMap from '@/app/booking/components/SeatMap';
import PassengerForm, {
    type CreateBookingFormData,
} from '@/app/booking/components/PassengerForm';
import BookingSummary from '@/app/booking/components/BookingSummary';

import {
    createPublicBooking,
    getPublicPriceQuote,
    getPublicTripSeats,
    getPublishedRoutes
} from '@/app/booking/lib/booking-api';

import type {
    PublicPriceQuoteResponse,
    PublicTripSeat,
    PublicTripSeatsResponse,
    PublishedRoute,
    TripDirection,
    ServicePoint,
} from '@/app/booking/types/booking-types';

import ServicePointSelect from '@/app/booking/components/ServicePointSelect';

// Trang chi tiết chuyến xe, cho phép khách chọn ghế và gửi yêu cầu đặt vé.
export default function PublicTripDetailPage() {
    const params = useParams<{ tripId: string }>();
    const searchParams = useSearchParams();
    const router = useRouter();

    const tripId = params.tripId;

    const directionValue = searchParams.get('direction');
    const direction: TripDirection =
        directionValue === 'RETURN' ? 'RETURN' : 'OUTBOUND';

    const pickupId = searchParams.get('pickup') || '';
    const dropoffId = searchParams.get('dropoff') || '';

    const pickupRoutePointId =
    searchParams.get('pickupRoutePointId') || '';

    const dropoffRoutePointId =
        searchParams.get('dropoffRoutePointId') || '';

    const routeName = searchParams.get('routeName') || 'Chuyến xe Hải Định';
    const pickupName = searchParams.get('pickupName') || 'Điểm đón đã chọn';
    const dropoffName = searchParams.get('dropoffName') || 'Điểm trả đã chọn';
    const departureTime = searchParams.get('departureTime') || '';

    const [seatData, setSeatData] =
        useState<PublicTripSeatsResponse | null>(null);

    const [priceQuote, setPriceQuote] =
        useState<PublicPriceQuoteResponse | null>(null);

    const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [pickupServicePoints, setPickupServicePoints] =
    useState<ServicePoint[]>([]);

    const [dropoffServicePoints, setDropoffServicePoints] =
        useState<ServicePoint[]>([]);

    const [pickupServicePointId, setPickupServicePointId] =
        useState('');

    const [dropoffServicePointId, setDropoffServicePointId] =
        useState('');

    // Tải sơ đồ ghế và báo giá theo hành trình khách đã chọn.
    const loadTripData = useCallback(async () => {
        if(
            !tripId ||
            !pickupId ||
            !dropoffId ||
            !pickupRoutePointId ||
            !dropoffRoutePointId
        ) {
            setError('Thiếu thông tin chuyến xe hoặc điểm đón, điểm trả.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');
        setPriceQuote(null);    

        try {
            const [seatsResult, routesResult] = await Promise.all([
                getPublicTripSeats(tripId, {
                    direction,
                    pickupTripRoutePointId: pickupId,
                    dropoffTripRoutePointId: dropoffId,
                }),
                getPublishedRoutes(),
            ]);

            const allRoutePoints = routesResult.flatMap(
                (route: PublishedRoute) => route.route.routePoints,
            );

            const pickupPoint = allRoutePoints.find(
                (point) => point.id === pickupRoutePointId,
            );

            const dropoffPoint = allRoutePoints.find(
                (point) => point.id === dropoffRoutePointId,
            );

            if (!pickupPoint || !dropoffPoint) {
                throw new Error(
                    'Không tìm thấy thông tin điểm đón hoặc điểm trả của tuyến.',
                );
            }

            setSeatData(seatsResult);
            setPickupServicePoints(pickupPoint.servicePoints || []);
            setDropoffServicePoints(dropoffPoint.servicePoints || []);

            setPickupServicePointId('');
            setDropoffServicePointId('');
            setSelectedSeatIds([]);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Không thể tải thông tin chuyến xe.',
            );
        } finally {
            setLoading(false);
        }
    }, [
        tripId,
        direction,
        pickupId,
        dropoffId,
        pickupRoutePointId,
        dropoffRoutePointId,
    ]);

    useEffect(() => {
        loadTripData();
    }, [loadTripData]);

    // Tính lại giá vé khi khách thay đổi điểm đón hoặc điểm trả phụ.
    useEffect(() => {
        let cancelled = false;

        // Gọi API báo giá theo lựa chọn ServicePoint hiện tại.
        async function loadPriceQuote() {
            if  (!seatData || !tripId || !pickupId || !dropoffId) {
                return;
            }

            setPriceQuote(null);

            try {
                const quote = await getPublicPriceQuote({
                    tripId,
                    direction,
                    pickupTripRoutePointId: pickupId,
                    dropoffTripRoutePointId: dropoffId,
                    ...(pickupServicePointId
                        ? { pickupServicePointId }
                        : {}),
                    ...(dropoffServicePointId
                        ? { dropoffServicePointId }
                        : {}),
                });

                if (!cancelled) {
                    setPriceQuote(quote);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : 'Không thể tính giá vé.',
                    );
                }
            }
        }

        loadPriceQuote();

        return () => {
            cancelled = true;
        };
    }, [
        seatData,
        tripId,
        direction,
        pickupId,
        dropoffId,
        pickupServicePointId,
        dropoffServicePointId,
    ]);

    // Chọn hoặc bỏ chọn một ghế còn trống.
    function handleToggleSeat(seatId: string) {
        setSelectedSeatIds((current) =>
            current.includes(seatId)
                ? current.filter((id) => id !== seatId)
                : [...current, seatId],
        );
    }

    // Tạo booking và chuyển khách đến trang hướng dẫn thanh toán.
    async function handleCreateBooking(data: CreateBookingFormData) {
        if (!seatData || !priceQuote || submitting) {
            return;
        }

        if (priceQuote.priceSource === 'CONTACT' || priceQuote.finalPrice === null) {
            setError(
                'Hành trình này cần nhân viên xác nhận giá. Vui lòng liên hệ Hải Định.',
            );
            return;
        }

        if (selectedSeatIds.length === 0) {
            setError('Vui lòng chọn ít nhất một ghế.');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const result = await createPublicBooking({
                tripId,
                direction,
                customerName: data.customerName,
                customerPhone: data.customerPhone,
                ...(data.customerEmail
                    ? { customerEmail: data.customerEmail }
                    : {}),
                seats: data.passengers.map((passenger) => ({
                    seatId: passenger.seatId,
                    pickupTripRoutePointId: pickupId,
                    dropoffTripRoutePointId: dropoffId,
                    ...(passenger.passengerName
                        ? { passengerName: passenger.passengerName }
                        : {}),
                    ...(passenger.passengerPhone
                        ? { passengerPhone: passenger.passengerPhone }
                        : {}),
                    ...(pickupServicePointId
                        ? { pickupServicePointId }
                        : {}),
                    ...(dropoffServicePointId
                        ? { dropoffServicePointId }
                        : {}),
                })),
            });

            const paymentParams = new URLSearchParams({
                bookingId: result.booking.id,
                totalAmount: String(result.booking.totalAmount),
                depositAmount: String(result.booking.depositAmount),
                holdExpiresAt: result.booking.holdExpiresAt,
            });

            router.push(
                `/dat-ve/thanh-toan/${encodeURIComponent(result.booking.bookingCode)}?${paymentParams.toString()}`,
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Không thể tạo yêu cầu đặt vé. Vui lòng thử lại.',
            );

            // Tải lại tình trạng ghế sau khi booking thất bại.
            await loadTripData();
        } finally {
            setSubmitting(false);
        }
    }

    const selectedSeats: PublicTripSeat[] =
        seatData?.seats.filter((seat) =>
            selectedSeatIds.includes(seat.id),
        ) ?? [];

    const canContinue =
        selectedSeats.length > 0 &&
        priceQuote !== null &&
        priceQuote.priceSource !== 'CONTACT' &&
        priceQuote.finalPrice !== null;

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="mb-5 text-sm font-medium text-gray-500 transition hover:text-red-600"
                    >
                        ← Quay lại danh sách chuyến
                    </button>

                    <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                        Đặt vé xe Hải Định
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Chọn vị trí ghế và nhập thông tin để giữ chỗ.
                    </p>
                </div>

                <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
                    <BookingSteps currentStep={2} />
                </div>

                {error && (
                    <div
                        role="alert"
                        className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="rounded-2xl border border-gray-200 bg-white px-4 py-16 text-center">
                        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-red-600" />
                        <p className="text-sm text-gray-500">
                            Đang tải sơ đồ ghế và giá vé...
                        </p>
                    </div>
                ) : !seatData ? (
                    <div className="rounded-2xl border border-gray-200 bg-white px-4 py-12 text-center">
                        <p className="font-medium text-gray-800">
                            Không thể tải thông tin chuyến xe.
                        </p>
                        <button
                            type="button"
                            onClick={loadTripData}
                            className="mt-4 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
                        >
                            Thử tải lại
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
                        <div className="space-y-6 lg:col-span-2">
                            <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 sm:grid-cols-2 sm:p-6">
                                <ServicePointSelect
                                    label="Điểm đón chi tiết"
                                    servicePoints={pickupServicePoints}
                                    value={pickupServicePointId}
                                    onChange={setPickupServicePointId}
                                />

                                <ServicePointSelect
                                    label="Điểm trả chi tiết"
                                    servicePoints={dropoffServicePoints}
                                    value={dropoffServicePointId}
                                    onChange={setDropoffServicePointId}
                                />
                            </div>

                            <SeatMap
                                seats={seatData.seats}
                                selectedSeatIds={selectedSeatIds}
                                onToggleSeat={handleToggleSeat}
                            />

                            {canContinue ? (
                                <PassengerForm
                                    selectedSeats={selectedSeats}
                                    loading={submitting}
                                    onSubmit={handleCreateBooking}
                                />
                            ) : (
                                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                                    {priceQuote?.priceSource === 'CONTACT' ? (
                                        <p className="text-sm leading-6 text-amber-700">
                                            Giá vé của hành trình này cần nhân viên Hải Định xác nhận.
                                            Vui lòng liên hệ nhân viên để được hỗ trợ.
                                        </p>
                                    ) : selectedSeats.length === 0 ? (
                                        <p className="text-sm text-gray-500">
                                            Vui lòng chọn ghế trước khi nhập thông tin hành khách.
                                        </p>
                                    ) : (
                                        <p className="text-sm text-gray-500">
                                            Đang tính giá vé theo hành trình đã chọn...
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="space-y-4 lg:sticky lg:top-6">
                            <BookingSummary
                                routeName={routeName}
                                direction={direction}
                                departureTime={
                                    departureTime ||
                                    seatData.pickup.plannedTime
                                }
                                pickupName={
                                    pickupServicePoints.find(
                                        (point) => point.id === pickupServicePointId,
                                    )?.name || (
                                        pickupName !== 'Điểm đón đã chọn'
                                            ? pickupName
                                            : seatData.pickup.name
                                    )
                                }
                                dropoffName={
                                    dropoffServicePoints.find(
                                        (point) => point.id === dropoffServicePointId,
                                    )?.name || (
                                        dropoffName !== 'Điểm trả đã chọn'
                                            ? dropoffName
                                            : seatData.dropoff.name
                                    )
                                }
                                selectedSeats={selectedSeats}
                                priceQuote={priceQuote}
                            />

                            {!canContinue && priceQuote?.priceSource !== 'CONTACT' && (
                                <p className="rounded-xl bg-gray-100 p-3 text-xs leading-5 text-gray-600">
                                    Chọn ít nhất một ghế và chờ hệ thống xác
                                    nhận giá vé để tiếp tục.
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
