
import type {
    BookingListItem,
    BookingTrip,
    TripDirection,
} from './booking-types';

/**
 * Một nhóm booking thuộc một chuyến và một chiều khởi hành trong ngày.
 */
export type BookingByDateGroup = {
    tripId: string;
    direction: TripDirection;
    plannedDeparture: string;
    trip: BookingTrip;
    bookingCount: number;
    bookings: BookingListItem[];
};

/**
 * Response API GET /bookings/by-date.
 */
export type BookingByDateResponse = {
    date: string;
    totalTrips: number;
    data: BookingByDateGroup[];
};
