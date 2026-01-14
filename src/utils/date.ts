import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(isBetween);
dayjs.extend(customParseFormat);

export const getToday = () => dayjs();

export const formatDate = (date: string | dayjs.Dayjs) => dayjs(date).format('YYYY-MM-DD');

export const isWithinRange = (date: string, start: string, end: string) => {
    const d = dayjs(date);
    return (d.isSame(start) || d.isAfter(start)) && (d.isSame(end) || d.isBefore(end));
};

export const doRangesOverlap = (start1: string, end1: string, start2: string, end2: string) => {
    const s1 = dayjs(start1).startOf('day');
    const e1 = dayjs(end1).endOf('day');
    const s2 = dayjs(start2).startOf('day');
    const e2 = dayjs(end2).endOf('day');

    return s1.isBefore(e2) && s2.isBefore(e1);
};

export const calculateDays = (startDate: string, endDate: string) => {
    const start = dayjs(startDate).startOf('day');
    const end = dayjs(endDate).startOf('day');
    return end.diff(start, 'day') + 1;
};

export const getCardStatus = (startDate: string, endDate?: string | null): 'active' | 'upcoming' | 'expired' => {
    const today = dayjs().startOf('day');
    const start = dayjs(startDate).startOf('day');
    const end = endDate ? dayjs(endDate).startOf('day') : start;

    if (today.isBefore(start)) return 'upcoming';
    if (today.isAfter(end)) return 'expired';
    return 'active';
};
