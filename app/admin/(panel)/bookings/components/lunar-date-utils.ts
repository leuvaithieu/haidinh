
import { LichTa } from '@lichta/core';

export type LunarDateInfo = {
    day: number;
    month: number;
    year: number;
    isLeap: boolean;
    yearCanChi: string;
};

export type SolarDateInfo = {
    day: number;
    month: number;
    year: number;
};

/**
 * Chuyển ngày dương lịch YYYY-MM-DD sang thông tin âm lịch Việt Nam.
 */
export function convertSolarToLunar(
    solarDate: string,
): LunarDateInfo {
    const parts = solarDate.split('-').map(Number);

    if (parts.length !== 3 || parts.some((value) => !Number.isInteger(value))) {
        throw new Error('Ngày dương lịch không hợp lệ.');
    }

    const [year, month, day] = parts;

    const date = new Date(year, month - 1, day);

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        throw new Error('Ngày dương lịch không tồn tại.');
    }

    const lunar = LichTa.toLunar(day, month, year, 7);

    return {
        day: lunar.day,
        month: lunar.month,
        year: lunar.year,
        isLeap: lunar.isLeap,
        yearCanChi: lunar.yearCanChi ?? '',
    };
}

/**
 * Chuyển ngày âm lịch Việt Nam sang ngày dương lịch YYYY-MM-DD.
 */
export function convertLunarToSolar(
    day: number,
    month: number,
    year: number,
    isLeap: boolean,
): string {
    if (
        !Number.isInteger(day) ||
        !Number.isInteger(month) ||
        !Number.isInteger(year) ||
        day < 1 ||
        day > 30 ||
        month < 1 ||
        month > 12
    ) {
        throw new Error('Ngày âm lịch không hợp lệ.');
    }

    const solar = LichTa.toSolar(day, month, year, isLeap, 7);

    return [
        solar.year,
        String(solar.month).padStart(2, '0'),
        String(solar.day).padStart(2, '0'),
    ].join('-');
}

/**
 * Định dạng ngày dương lịch thành DD/MM/YYYY.
 */
export function formatSolarDate(solarDate: string): string {
    const [year, month, day] = solarDate.split('-');

    return `${day}/${month}/${year}`;
}

/**
 * Định dạng ngày âm lịch và đánh dấu tháng nhuận nếu có.
 */
export function formatLunarDate(lunar: LunarDateInfo): string {
    return `${String(lunar.day).padStart(2, '0')}/${String(lunar.month).padStart(2, '0')}/${lunar.year}${lunar.isLeap ? ' (nhuận)' : ''}`;
}
