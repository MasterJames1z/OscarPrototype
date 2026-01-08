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
    const s1 = dayjs(start1);
    const e1 = dayjs(end1);
    const s2 = dayjs(start2);
    const e2 = dayjs(end2);

    return s1.isBefore(e2) && s2.isBefore(e1);
};

export const getCardStatus = (startDate: string, endDate: string): 'active' | 'upcoming' | 'expired' => {
    const today = dayjs().startOf('day');
    const start = dayjs(startDate).startOf('day');
    const end = dayjs(endDate).startOf('day');

    if (today.isBefore(start)) return 'upcoming';
    if (today.isAfter(end)) return 'expired';
    return 'active';
};
