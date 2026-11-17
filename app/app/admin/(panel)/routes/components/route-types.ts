export type ServicePoint = {
    id: string;
    routePointId: string;
    name: string;
};

export type RoutePoint = {
    id: string;
    routeId: string;
    name: string;
    sequence: number;
    servicePoints: ServicePoint[];
};

export type Route = {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    routePoints: RoutePoint[];
};

export type ToastState = {
    message: string;
    type: 'success' | 'error';
} | null;

export function formatPlaceName(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase('vi-VN')
    .replace(
      /(^|[\s-])(\p{L})/gu,
      (_, separator, letter) =>
        separator + letter.toLocaleUpperCase('vi-VN'),
    );
}