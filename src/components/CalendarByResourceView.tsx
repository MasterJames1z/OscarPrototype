import { useState, useMemo } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    ButtonGroup,
    Tooltip,
    alpha,
    useTheme,
    Avatar,
    Stack
} from '@mui/material';
import {
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    Today as TodayIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import type { PriceCard } from '../types';
import { getToday } from '../utils/date';

interface CalendarByResourceViewProps {
    cards: PriceCard[];
    onEdit: (card: PriceCard) => void;
    onDuplicate: (id: string) => void;
    onDelete: (id: string) => void;
    allResources: string[];
}

type ViewMode = 'day' | 'week' | 'month' | 'year';

const RESOURCE_COL_WIDTH = 200;
const CARD_HEIGHT = 32;
const CARD_GAP = 6;

export default function CalendarByResourceView({
    cards,
    onEdit,
    allResources,
}: CalendarByResourceViewProps) {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const [viewMode, setViewMode] = useState<ViewMode>('month');
    const [currentDate, setCurrentDate] = useState(getToday());

    const COLORS = {
        bg: theme.palette.background.default,
        paper: theme.palette.background.paper,
        border: theme.palette.divider,
        text: theme.palette.text.primary,
        textSecondary: theme.palette.text.secondary,
        primary: theme.palette.primary.main,
        primaryLight: theme.palette.primary.light,
        headerBg: isDark ? alpha(theme.palette.background.default, 0.8) : '#f8fafc',
        rowHover: theme.palette.action.hover,
        cardBg: theme.palette.primary.main,
        cardBorder: theme.palette.primary.dark,
    };

    const timeRange = useMemo(() => {
        const start = currentDate.startOf(viewMode as dayjs.OpUnitType);
        const end = currentDate.endOf(viewMode as dayjs.OpUnitType);
        let cols: { date: dayjs.Dayjs; label: string; highlight: boolean }[] = [];

        if (viewMode === 'day') {
            cols = [{ date: start, label: start.format('dddd, D MMM YYYY'), highlight: true }];
        } else if (viewMode === 'week') {
            const weekStart = currentDate.startOf('week');
            for (let i = 0; i < 7; i++) {
                const d = weekStart.add(i, 'day');
                cols.push({ date: d, label: d.format('ddd D'), highlight: d.isSame(getToday(), 'day') });
            }
        } else if (viewMode === 'month') {
            const daysInMonth = currentDate.daysInMonth();
            const monthStart = currentDate.startOf('month');
            for (let i = 0; i < daysInMonth; i++) {
                const d = monthStart.add(i, 'day');
                cols.push({ date: d, label: d.format('D'), highlight: d.isSame(getToday(), 'day') });
            }
        } else if (viewMode === 'year') {
            const yearStart = currentDate.startOf('year');
            for (let i = 0; i < 12; i++) {
                const d = yearStart.add(i, 'month');
                cols.push({ date: d, label: d.format('MMM'), highlight: d.isSame(getToday(), 'month') });
            }
        }
        return { start, end, cols };
    }, [viewMode, currentDate]);

    const processedResources = useMemo(() => {
        return allResources.map(resource => {
            const resourceCards = cards.filter(c =>
                c.resourceName === resource &&
                (dayjs(c.startDate).isBefore(timeRange.end) && dayjs(c.endDate).isAfter(timeRange.start))
            );
            const tracks: PriceCard[][] = [];

            resourceCards.sort((a, b) => dayjs(a.startDate).diff(dayjs(b.startDate)));

            resourceCards.forEach(card => {
                let placed = false;
                for (let i = 0; i < tracks.length; i++) {
                    const lastCardTrack = tracks[i][tracks[i].length - 1];
                    if (dayjs(card.startDate).isAfter(dayjs(lastCardTrack.endDate))) {
                        tracks[i].push(card);
                        placed = true;
                        break;
                    }
                }
                if (!placed) tracks.push([card]);
            });
            return { resource, tracks };
        });
    }, [allResources, cards, timeRange]);

    const getCardStyle = (card: PriceCard) => {
        const diff = timeRange.end.diff(timeRange.start) || 1;
        const cardStart = dayjs(card.startDate).isBefore(timeRange.start) ? timeRange.start : dayjs(card.startDate);
        const cardEnd = dayjs(card.endDate).isAfter(timeRange.end) ? timeRange.end : dayjs(card.endDate);

        const left = (cardStart.diff(timeRange.start) / diff) * 100;
        const width = (cardEnd.diff(cardStart) / diff) * 100;

        let bgColor = COLORS.cardBg;
        let borderColor = COLORS.cardBorder;
        if (dayjs(card.endDate).isBefore(getToday(), 'day')) {
            bgColor = isDark ? '#334155' : '#94a3b8';
            borderColor = isDark ? '#475569' : '#cbd5e1';
        }

        return {
            left: `${left}%`,
            width: `${Math.max(width, 0.2)}%`,
            backgroundColor: bgColor,
            borderColor: borderColor
        };
    };

    return (
        <Paper elevation={0} sx={{ height: '100%', width: '100%', maxWidth: 'none', display: 'flex', flexDirection: 'column', bgcolor: COLORS.bg, color: COLORS.text, borderRadius: 2, overflow: 'hidden', border: `1px solid ${COLORS.border}` }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2, borderBottom: `1px solid ${COLORS.border}`, bgcolor: COLORS.paper }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="h6" fontWeight="bold" sx={{ minWidth: 150 }}>
                        {currentDate.format(viewMode === 'year' ? 'YYYY' : 'MMMM YYYY')}
                    </Typography>
                    <ButtonGroup size="small" variant="outlined">
                        <Button onClick={() => setCurrentDate(d => d.subtract(1, viewMode as dayjs.ManipulateType))}><ChevronLeftIcon /></Button>
                        <Button onClick={() => setCurrentDate(getToday())} startIcon={<TodayIcon />}>Today</Button>
                        <Button onClick={() => setCurrentDate(d => d.add(1, viewMode as dayjs.ManipulateType))}><ChevronRightIcon /></Button>
                    </ButtonGroup>
                </Stack>
                <ButtonGroup size="small" variant="contained">
                    {(['day', 'week', 'month', 'year'] as ViewMode[]).map((v) => (
                        <Button key={v} onClick={() => setViewMode(v)} sx={{ bgcolor: viewMode === v ? COLORS.primary : 'transparent', color: viewMode === v ? '#fff' : COLORS.textSecondary, borderColor: COLORS.border, '&:hover': { bgcolor: viewMode === v ? COLORS.primary : alpha(COLORS.primary, 0.05) } }}>
                            {v.charAt(0).toUpperCase() + v.slice(1)}
                        </Button>
                    ))}
                </ButtonGroup>
            </Stack>

            <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden', flexDirection: 'column', position: 'relative' }}>
                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', borderBottom: `1px solid ${COLORS.border}`, position: 'sticky', top: 0, zIndex: 100, bgcolor: COLORS.paper }}>
                        <Box sx={{ width: RESOURCE_COL_WIDTH, flexShrink: 0, borderRight: `1px solid ${COLORS.border}`, p: 2 }}>
                            <Typography variant="subtitle2" fontWeight={700} color={COLORS.textSecondary}>RESOURCE</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexGrow: 1 }}>
                            {timeRange.cols.map((col, i) => (
                                <Box key={i} sx={{ flex: 1, textAlign: 'center', py: 2, borderLeft: `1px solid ${COLORS.border}`, bgcolor: col.highlight ? alpha(COLORS.primary, 0.1) : 'transparent', color: col.highlight ? COLORS.primaryLight : COLORS.textSecondary, fontSize: viewMode === 'month' ? '0.65rem' : '0.75rem', fontWeight: col.highlight ? 700 : 400 }}>
                                    {col.label}
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                        {processedResources.map(({ resource, tracks }) => {
                            const rowHeight = (Math.max(tracks.length, 1) * (CARD_HEIGHT + CARD_GAP)) + 32;
                            return (
                                <Box key={resource} sx={{ display: 'flex', borderBottom: `1px solid ${COLORS.border}`, minHeight: rowHeight }}>
                                    <Box sx={{ width: RESOURCE_COL_WIDTH, flexShrink: 0, p: 2, borderRight: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', bgcolor: COLORS.paper }}>
                                        <Avatar sx={{ width: 28, height: 28, mr: 2, bgcolor: COLORS.primary }}>{resource.charAt(0)}</Avatar>
                                        <Typography variant="body2" fontWeight={600} noWrap>{resource}</Typography>
                                    </Box>
                                    <Box sx={{ flexGrow: 1, position: 'relative', height: rowHeight }}>
                                        <Box sx={{ position: 'absolute', inset: 0, display: 'flex' }}>
                                            {timeRange.cols.map((_, i) => (
                                                <Box key={i} sx={{ flex: 1, borderLeft: `1px solid ${alpha(COLORS.border, 0.3)}` }} />
                                            ))}
                                        </Box>
                                        {tracks.map((track, trackIndex) => track.map(card => {
                                            const style = getCardStyle(card);
                                            return (
                                                <Tooltip key={card.id} title={`${card.unitPrice.toLocaleString()} THB (${card.startDate} - ${card.endDate})`} arrow>
                                                    <Box onClick={() => onEdit(card)} sx={{ position: 'absolute', top: 16 + (trackIndex * (CARD_HEIGHT + CARD_GAP)), height: CARD_HEIGHT, borderRadius: 1.5, cursor: 'pointer', display: 'flex', alignItems: 'center', px: viewMode === 'month' ? 0.5 : 1.5, fontSize: viewMode === 'month' ? '0.7rem' : '0.8rem', color: '#fff', fontWeight: 700, borderLeft: '4px solid', ...style, zIndex: 10, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                                                        <Box component="span" sx={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>฿{card.unitPrice.toLocaleString()}</Box>
                                                    </Box>
                                                </Tooltip>
                                            );
                                        }))}
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            </Box>
        </Paper>
    );
}
