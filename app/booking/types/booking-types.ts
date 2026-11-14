
export type TripDirection = 'OUTBOUND' | 'RETURN';

export type ServicePoint = {
    id: string;
    routePointId: string;
    name: string;
};

export type BookingRoutePoint = {
    id: string;
    routeId: string;
    name: string;
    sequence: number;
    defaultTime: string | null;
    travelDurationMinutes: number | null;
    servicePoints: ServicePoint[];
};

export type PublishedRoute = {
    id: string;
    routeId: string;
    title: string;
    slug: string;
    shortDescription: string | null;
    description: string | null;
    imageUrl: string | null;
    bannerUrl: string | null;
    isPublished: boolean;
    displayOrder: number;
    route: {
        id: string;
        name: string;
        routePoints: BookingRoutePoint[];
    };
};

export type PublicTripSearchParams = {
    fromRoutePointId: string;
    toRoutePointId: string;
    date: string;
    direction: TripDirection;
};

export type PublicTripSearchResult = {
    tripId: string;
    route: {
        id: string;
        name: string;
        title: string;
    };
    direction: TripDirection;
    pickup: {
        tripRoutePointId: string;
        routePointId: string;
        name: string;
        plannedTime: string;
    };
    dropoff: {
        tripRoutePointId: string;
        routePointId: string;
        name: string;
        plannedTime: string;
    };
    vehicle: {
        name: string;
        vehicleType: string;
        seatCount: number;
    };
};

export type PublicTripSeat = {
    id: string;
    code: string;
    label: string | null;
    type: 'BERTH' | 'SEAT' | 'PRIVATE_ROOM' | 'OTHER';
    level: number;
    row: number;
    column: number;
    isAvailable: boolean;
};

export type PublicTripSeatsResponse = {
    tripId: string;
    direction: TripDirection;
    pickup: {
        id: string;
        name: string;
        sequence: number;
        plannedTime: string;
    };
    dropoff: {
        id: string;
        name: string;
        sequence: number;
        plannedTime: string;
    };
    layout: {
        id: string;
        name: string;
    };
    totalSeats: number;
    availableSeats: number;
    seats: PublicTripSeat[];
};

export type PublicPriceQuoteResponse = {
    pricingMode: 'NORMAL' | 'TET';
    direction: TripDirection;
    policyId: string | null;
    policyVersion: number | null;
    currency: string;
    priceSource: string;
    basePrice: number | null;
    routeAdjustmentAmount: number;
    finalPrice: number | null;
    pickup: {
        tripRoutePointId: string;
        routePointId: string;
        pointName: string;
        servicePointId: string | null;
        servicePointName: string | null;
        sequence: number;
    };
    dropoff: {
        tripRoutePointId: string;
        routePointId: string;
        pointName: string;
        servicePointId: string | null;
        servicePointName: string | null;
        sequence: number;
    };
    calculatedAt: string;
};
