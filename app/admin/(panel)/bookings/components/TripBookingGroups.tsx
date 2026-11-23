
'use client';

import { CalendarDays, Route } from 'lucide-react';

import TripBookingGroup from './TripBookingGroup';

import type { BookingByDateGroup } from './booking-by-date-types';

type TripBookingGroupsProps = {
    groups: BookingByDateGroup[];
    onView: (bookingId: string) => void;
    onCancel: (bookingId: string) => void;
    canCancel: (bookingId: string) => boolean;
};

export default function TripBookingGroups({
    groups,
    onView,
    onCancel,
    canCancel,
}: TripBookingGroupsProps) {
    if (groups.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-12 text-center">
                <CalendarDays className="mx-auto h-10 w-10 text-slate-300" />

                <h3 className="mt-3 text-sm font-semibold text-slate-700">
                    Không có chuyến khởi hành
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                    Không tìm thấy chuyến xe nào trong ngày được chọn.
                </p>
            </div>
        );
    }

    return (
        <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <Route className="h-5 w-5 text-red-600" />

                    <h2 className="text-base font-bold text-slate-900">
                        Danh sách chuyến
                    </h2>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {groups.length} lượt khởi hành
                </span>
            </div>

            <div className="space-y-4">
                {groups.map((group, index) => (
                    <TripBookingGroup
                        key={`${group.tripId}-${group.direction}-${index}`}
                        group={group}
                        onView={onView}
                        onCancel={onCancel}
                        canCancelBooking={canCancel}
                    />
                ))}
            </div>
        </section>
    );
}
