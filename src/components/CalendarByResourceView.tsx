import { useState, useMemo, useRef, useEffect } from 'react';
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
    Stack,
    useMediaQuery
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
    onUpdate: (id: string, data: Partial<PriceCard>) => void;
    allResources: string[];
}

type ViewMode = 'day' | 'week' | 'month' | 'year';

const RESOURCE_COL_WIDTH = 200;
const CARD_HEIGHT = 32;
const CARD_GAP = 6;

interface Interaction {
    type: 'drag' | 'resize-start' | 'resize-end';
    card: PriceCard;
    initialMouseX: number;
    initialStart: dayjs.Dayjs;
    initialEnd: dayjs.Dayjs;
}

export default function CalendarByResourceView({
    cards,
    onEdit,
    onUpdate,
    allResources,
}: CalendarByResourceViewProps) {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const [viewMode, setViewMode] = useState<ViewMode>('month');
    const [currentDate, setCurrentDate] = useState(getToday());
    const [interaction, setInteraction] = useState<Interaction | null>(null);
    const [previewSnapDays, setPreviewSnapDays] = useState(0);
    const gridRef = useRef<HTMLDivElement>(null);

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

    const getTodayMemo = useMemo(() => getToday(), []);

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
                cols.push({ date: d, label: d.format('ddd D'), highlight: d.isSame(getTodayMemo, 'day') });
            }
        } else if (viewMode === 'month') {
            const daysInMonth = currentDate.daysInMonth();
            const monthStart = currentDate.startOf('month');
            for (let i = 0; i < daysInMonth; i++) {
                const d = monthStart.add(i, 'day');
                cols.push({ date: d, label: d.format('D'), highlight: d.isSame(getTodayMemo, 'day') });
            }
        } else if (viewMode === 'year') {
            const yearStart = currentDate.startOf('year');
            for (let i = 0; i < 12; i++) {
                const d = yearStart.add(i, 'month');
                cols.push({ date: d, label: d.format('MMM'), highlight: d.isSame(getTodayMemo, 'month') });
            }
        }
        return { start, end, cols };
    }, [viewMode, currentDate, getTodayMemo]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!interaction || !gridRef.current) return;

            const rect = gridRef.current.getBoundingClientRect();
            const gridWidth = rect.width - RESOURCE_COL_WIDTH;
            const deltaX = e.clientX - interaction.initialMouseX;

            const viewStart = timeRange.start.startOf('day');
            const viewEnd = timeRange.end.endOf('day');
            const totalDiff = viewEnd.clone().add(1, 'millisecond').diff(viewStart);

            const msPerPixel = totalDiff / gridWidth;
            const deltaMs = deltaX * msPerPixel;
            const deltaDays = Math.round(deltaMs / (24 * 60 * 60 * 1000));

            setPreviewSnapDays(deltaDays);
        };

        const handleMouseUp = (e: MouseEvent) => {
            if (!interaction || !gridRef.current) return;

            const rect = gridRef.current.getBoundingClientRect();
            const gridWidth = rect.width - RESOURCE_COL_WIDTH;
            const deltaX = e.clientX - interaction.initialMouseX;

            const viewStart = timeRange.start.startOf('day');
            const viewEnd = timeRange.end.endOf('day');
            const totalDiff = viewEnd.clone().add(1, 'millisecond').diff(viewStart);

            const msPerPixel = totalDiff / gridWidth;
            const deltaMs = deltaX * msPerPixel;
            const deltaDays = Math.round(deltaMs / (24 * 60 * 60 * 1000));

            if (deltaDays !== 0) {
                let newStart = interaction.initialStart;
                let newEnd = interaction.initialEnd;

                if (interaction.type === 'drag') {
                    newStart = interaction.initialStart.add(deltaDays, 'day');
                    newEnd = interaction.initialEnd.add(deltaDays, 'day');
                } else if (interaction.type === 'resize-start') {
                    newStart = interaction.initialStart.add(deltaDays, 'day');
                    if (newStart.isAfter(newEnd)) newStart = newEnd;
                } else if (interaction.type === 'resize-end') {
                    newEnd = interaction.initialEnd.add(deltaDays, 'day');
                    if (newEnd.isBefore(newStart)) newEnd = newStart;
                }

                onUpdate(interaction.card.PriceID.toString(), {
                    EffectiveDate: newStart.format('YYYY-MM-DD'),
                    ToDate: newEnd.format('YYYY-MM-DD'),
                });
            }

            setInteraction(null);
            setPreviewSnapDays(0);
        };

        if (interaction) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [interaction, timeRange, onUpdate]);

    const handleInteractionStart = (e: React.MouseEvent, type: Interaction['type'], card: PriceCard) => {
        e.stopPropagation();
        setInteraction({
            type,
            card,
            initialMouseX: e.clientX,
            initialStart: dayjs(card.EffectiveDate).startOf('day'),
            initialEnd: dayjs(card.ToDate || card.EffectiveDate).startOf('day'),
        });
    };

    const processedResources = useMemo(() => {
        return allResources.map(resource => {
            const resourceCards = cards.filter(c =>
                c.ProductName === resource &&
                (dayjs(c.EffectiveDate).isBefore(timeRange.end) && dayjs(c.ToDate || c.EffectiveDate).isAfter(timeRange.start))
            );
            const tracks: PriceCard[][] = [];

            resourceCards.sort((a, b) => dayjs(a.EffectiveDate).diff(dayjs(b.EffectiveDate)));

            resourceCards.forEach(card => {
                let placed = false;
                for (let i = 0; i < tracks.length; i++) {
                    const lastCardTrack = tracks[i][tracks[i].length - 1];
                    if (dayjs(card.EffectiveDate).isAfter(dayjs(lastCardTrack.ToDate || lastCardTrack.EffectiveDate))) {
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
        const viewStart = timeRange.start.startOf('day');
        const viewEnd = timeRange.end.endOf('day');
        const totalDiff = viewEnd.clone().add(1, 'millisecond').diff(viewStart);

        let cardStart = dayjs(card.EffectiveDate).startOf('day');
        let cardEnd = dayjs(card.ToDate || card.EffectiveDate).endOf('day');

        // Apply preview if this is the interaction target
        if (interaction?.card.PriceID === card.PriceID && previewSnapDays !== 0) {
            if (interaction.type === 'drag') {
                cardStart = cardStart.add(previewSnapDays, 'day');
                cardEnd = cardEnd.add(previewSnapDays, 'day');
            } else if (interaction.type === 'resize-start') {
                cardStart = cardStart.add(previewSnapDays, 'day');
                if (cardStart.isAfter(cardEnd)) cardStart = cardEnd;
            } else if (interaction.type === 'resize-end') {
                cardEnd = cardEnd.add(previewSnapDays, 'day');
                if (cardEnd.isBefore(cardStart)) cardEnd = cardStart;
            }
        }

        const effectiveStart = cardStart.isBefore(viewStart) ? viewStart : cardStart;
        const effectiveEnd = cardEnd.isAfter(viewEnd) ? viewEnd : cardEnd;

        const left = (effectiveStart.diff(viewStart) / totalDiff) * 100;
        const width = (effectiveEnd.clone().add(1, 'millisecond').diff(effectiveStart) / totalDiff) * 100;

        let bgColor = COLORS.cardBg;
        let borderColor = COLORS.cardBorder;
        if (dayjs(card.ToDate || card.EffectiveDate).isBefore(getToday(), 'day')) {
            bgColor = isDark ? '#334155' : '#94a3b8';
            borderColor = isDark ? '#475569' : '#cbd5e1';
        }

        return {
            left: `${left}%`,
            width: `${Math.max(width, 0.1)}%`,
            backgroundColor: bgColor,
            borderColor: borderColor
        };
    };

    const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
    const dynamicResourceWidth = isSmall ? 100 : RESOURCE_COL_WIDTH;

    return (
        <Paper elevation={0} sx={{ height: '100%', width: '100%', maxWidth: 'none', display: 'flex', flexDirection: 'column', bgcolor: COLORS.bg, color: COLORS.text, borderRadius: 2, overflow: 'hidden', border: `1px solid ${COLORS.border}` }}>
            <Stack direction={isSmall ? "column" : "row"} justifyContent="space-between" alignItems={isSmall ? "flex-start" : "center"} sx={{ p: 2, gap: 2, borderBottom: `1px solid ${COLORS.border}`, bgcolor: COLORS.paper }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ width: isSmall ? '100%' : 'auto', justifyContent: 'space-between' }}>
                    <Typography variant={isSmall ? "subtitle1" : "h6"} fontWeight="bold" sx={{ minWidth: isSmall ? 'auto' : 150 }}>
                        {currentDate.format(viewMode === 'year' ? 'YYYY' : 'MMMM YYYY')}
                    </Typography>
                    <ButtonGroup size="small" variant="outlined">
                        <Button onClick={() => setCurrentDate(d => d.subtract(1, viewMode as dayjs.ManipulateType))}><ChevronLeftIcon /></Button>
                        <Button onClick={() => setCurrentDate(getToday())} sx={{ display: { xs: 'none', sm: 'inline-flex' } }} startIcon={<TodayIcon />}>Today</Button>
                        <Button onClick={() => setCurrentDate(d => d.add(1, viewMode as dayjs.ManipulateType))}><ChevronRightIcon /></Button>
                    </ButtonGroup>
                </Stack>
                <ButtonGroup size="small" variant="contained" fullWidth={isSmall}>
                    {(['day', 'week', 'month', 'year'] as ViewMode[]).map((v) => (
                        <Button key={v} onClick={() => setViewMode(v)} sx={{ flex: 1, bgcolor: viewMode === v ? COLORS.primary : 'transparent', color: viewMode === v ? '#fff' : COLORS.textSecondary, borderColor: COLORS.border, '&:hover': { bgcolor: viewMode === v ? COLORS.primary : alpha(COLORS.primary, 0.05) } }}>
                            {v.charAt(0).toUpperCase() + v.slice(1)}
                        </Button>
                    ))}
                </ButtonGroup>
            </Stack>

            <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'auto', flexDirection: 'column', position: 'relative' }}>
                <Box sx={{
                    minWidth: isSmall
                        ? (viewMode === 'day' ? '100%' : 800)
                        : '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1
                }}>
                    <Box sx={{ display: 'flex', borderBottom: `1px solid ${COLORS.border}`, position: 'sticky', top: 0, zIndex: 100, bgcolor: COLORS.paper }}>
                        <Box sx={{ width: dynamicResourceWidth, flexShrink: 0, borderRight: `1px solid ${COLORS.border}`, p: 2 }}>
                            <Typography variant="caption" fontWeight={700} color={COLORS.textSecondary}>RESOURCE</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexGrow: 1 }}>
                            {timeRange.cols.map((col, i) => (
                                <Box key={i} sx={{ flex: 1, textAlign: 'center', py: 2, borderLeft: `1px solid ${COLORS.border}`, bgcolor: col.highlight ? alpha(COLORS.primary, 0.1) : 'transparent', color: col.highlight ? COLORS.primaryLight : COLORS.textSecondary, fontSize: viewMode === 'month' ? '0.65rem' : '0.75rem', fontWeight: col.highlight ? 700 : 400 }}>
                                    {col.label}
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    <Box ref={gridRef} sx={{ flexGrow: 1, overflowY: 'auto' }}>
                        {processedResources.map(({ resource, tracks }) => {
                            const rowHeight = (Math.max(tracks.length, 1) * (CARD_HEIGHT + CARD_GAP)) + 32;
                            return (
                                <Box key={resource} sx={{ display: 'flex', borderBottom: `1px solid ${COLORS.border}`, minHeight: rowHeight }}>
                                    <Box sx={{ width: dynamicResourceWidth, flexShrink: 0, p: 2, borderRight: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', bgcolor: COLORS.paper }}>
                                        <Avatar sx={{ width: isSmall ? 20 : 28, height: isSmall ? 20 : 28, mr: isSmall ? 1 : 2, bgcolor: COLORS.primary, fontSize: isSmall ? 10 : 14 }}>{resource.charAt(0)}</Avatar>
                                        <Typography variant="caption" sx={{ fontSize: isSmall ? '0.7rem' : '0.875rem' }} fontWeight={600} noWrap>{resource}</Typography>
                                    </Box>
                                    <Box sx={{ flexGrow: 1, position: 'relative', height: rowHeight }}>
                                        <Box sx={{ position: 'absolute', inset: 0, display: 'flex' }}>
                                            {timeRange.cols.map((_, i) => (
                                                <Box key={i} sx={{ flex: 1, borderLeft: `1px solid ${alpha(COLORS.border, 0.3)}` }} />
                                            ))}
                                        </Box>
                                        {tracks.map((track, trackIndex) => track.map(card => {
                                            const style = getCardStyle(card);
                                            const isInteractionTarget = interaction?.card.PriceID === card.PriceID;

                                            return (
                                                <Tooltip key={card.PriceID} title={`${card.UnitPrice.toLocaleString()} THB (${dayjs(card.EffectiveDate).format('YYYY-MM-DD')} - ${card.ToDate ? dayjs(card.ToDate).format('YYYY-MM-DD') : dayjs(card.EffectiveDate).format('YYYY-MM-DD')})`} arrow>
                                                    <Box
                                                        onMouseDown={(e) => handleInteractionStart(e, 'drag', card)}
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 16 + (trackIndex * (CARD_HEIGHT + CARD_GAP)),
                                                            height: CARD_HEIGHT,
                                                            borderRadius: 1.5,
                                                            cursor: 'move',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            px: viewMode === 'month' ? 0.5 : 1.5,
                                                            fontSize: viewMode === 'month' ? '0.7rem' : '0.8rem',
                                                            color: '#fff',
                                                            fontWeight: 700,
                                                            borderLeft: '4px solid',
                                                            ...style,
                                                            zIndex: isInteractionTarget ? 20 : 10,
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            transition: interaction ? 'none' : 'all 0.2s',
                                                            opacity: interaction && !isInteractionTarget ? 0.6 : 1,
                                                            boxShadow: isInteractionTarget ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
                                                            '&:hover': {
                                                                filter: 'brightness(1.1)',
                                                            }
                                                        }}
                                                    >
                                                        {/* Resize handles */}
                                                        <Box
                                                            onMouseDown={(e) => handleInteractionStart(e, 'resize-start', card)}
                                                            sx={{
                                                                position: 'absolute',
                                                                left: 0,
                                                                top: 0,
                                                                width: 10,
                                                                height: '100%',
                                                                cursor: 'ew-resize',
                                                                zIndex: 11,
                                                                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                                                            }}
                                                        />
                                                        <Box
                                                            onMouseDown={(e) => handleInteractionStart(e, 'resize-end', card)}
                                                            sx={{
                                                                position: 'absolute',
                                                                right: 0,
                                                                top: 0,
                                                                width: 10,
                                                                height: '100%',
                                                                cursor: 'ew-resize',
                                                                zIndex: 11,
                                                                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                                                            }}
                                                        />

                                                        <Box
                                                            component="span"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onEdit(card);
                                                            }}
                                                            sx={{
                                                                textOverflow: 'ellipsis',
                                                                overflow: 'hidden',
                                                                width: '100%',
                                                                height: '100%',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                pointerEvents: 'auto'
                                                            }}
                                                        >
                                                            ฿{card.UnitPrice.toLocaleString()}
                                                        </Box>
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

