import { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    IconButton,
    Chip,
    Stack,
    TextField,
    InputAdornment,
    alpha,
    Tabs,
    Tab,
    useTheme,
} from '@mui/material';
import {
    DeleteOutline as DeleteIcon,
    EditOutlined as EditIcon,
    ContentCopyOutlined as ContentCopyIcon,
    Search as SearchIcon,
    Warning as WarningIcon,
    TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import type { PriceCard, CardStatus } from '../types';
import { doRangesOverlap, getCardStatus, calculateDays } from '../utils/date.ts';
import { useApp } from '../context/useApp';

interface CardsViewProps {
    cards: PriceCard[];
    onEdit: (card: PriceCard) => void;
    onDuplicate: (id: string) => void;
    onDelete: (id: string) => void;
}

export default function CardsView({ cards, onEdit, onDuplicate, onDelete }: CardsViewProps) {
    const { t } = useApp();
    const theme = useTheme();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<CardStatus | 'all'>('all');

    const filteredCards = cards.filter(c => {
        const matchesSearch = c.resourceName.toLowerCase().includes(search.toLowerCase());
        const currentStatus = getCardStatus(c.startDate, c.endDate);
        const matchesStatus = statusFilter === 'all' || currentStatus === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const checkOverlap = (card: PriceCard) => {
        return cards.some(other =>
            other.id !== card.id &&
            other.resourceName === card.resourceName &&
            doRangesOverlap(card.startDate, card.endDate, other.startDate, other.endDate)
        );
    };

    return (
        <Box sx={{ p: 1 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 4 }} alignItems={{ md: 'center' }}>
                <TextField
                    placeholder={t('search.placeholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{
                        flexGrow: 1,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            bgcolor: 'background.paper',
                            '& fieldset': { borderColor: alpha(theme.palette.primary.main, 0.1) },
                        }
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: 'primary.main' }} />
                            </InputAdornment>
                        ),
                    }}
                />

                <Tabs
                    value={statusFilter}
                    onChange={(_e, newValue) => setStatusFilter(newValue)}
                    sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.03),
                        borderRadius: 3,
                        p: 0.5,
                        minHeight: 48,
                        '& .MuiTabs-indicator': {
                            height: '100%',
                            borderRadius: 2.5,
                            bgcolor: 'primary.main',
                            zIndex: 0
                        },
                        '& .MuiTab-root': {
                            zIndex: 1,
                            minHeight: 38,
                            borderRadius: 2.5,
                            textTransform: 'none',
                            fontWeight: 600,
                            color: 'text.secondary',
                            transition: 'color 0.2s',
                            '&.Mui-selected': {
                                color: '#fff'
                            }
                        }
                    }}
                >
                    <Tab label={t('status.all')} value="all" />
                    <Tab label={t('status.active')} value="active" />
                    <Tab label={t('status.upcoming')} value="upcoming" />
                    <Tab label={t('status.expired')} value="expired" />
                </Tabs>
            </Stack>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 3 }}>
                {filteredCards.map(card => {
                    const hasOverlap = checkOverlap(card);
                    const currentStatus = getCardStatus(card.startDate, card.endDate);

                    let statusColor = '#2e7d32'; // Green for Active
                    if (currentStatus === 'expired') statusColor = '#d32f2f'; // Red for Expired
                    if (currentStatus === 'upcoming') statusColor = '#ed6c02'; // Yellow/Orange for Upcoming

                    return (
                        <Card
                            key={card.id}
                            elevation={0}
                            sx={{
                                position: 'relative',
                                border: '1px solid',
                                borderColor: alpha(theme.palette.primary.main, 0.1),
                                borderRadius: 4,
                                transition: 'all 0.2s',
                                bgcolor: 'background.paper',
                                '&:hover': {
                                    borderColor: 'primary.main',
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 12px 24px -10px rgba(0, 0, 0, 0.1)',
                                }
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 2 }}>
                                    <Box sx={{
                                        p: 1.5,
                                        borderRadius: 3,
                                        bgcolor: alpha(statusColor, 0.05),
                                        color: statusColor,
                                        display: 'flex'
                                    }}>
                                        <TrendingUpIcon />
                                    </Box>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="subtitle1" sx={{ color: 'primary.main', mb: 0.5 }}>
                                            {card.resourceName}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Chip
                                                label={t(`status.${currentStatus}`)}
                                                size="small"
                                                sx={{
                                                    height: 20,
                                                    fontSize: '0.65rem',
                                                    fontWeight: 700,
                                                    bgcolor: alpha(statusColor, 0.1),
                                                    color: statusColor,
                                                    border: 'none'
                                                }}
                                            />
                                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                {t('card.valid')}: {card.startDate} ➔ {card.endDate}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Stack>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 3 }}>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{t('card.unitPrice')}</Typography>
                                        <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 800 }}>
                                            ฿{card.unitPrice.toLocaleString()}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ textAlign: 'right' }}>
                                        {currentStatus === 'active' && (
                                            <Typography variant="caption" sx={{ display: 'block', color: 'success.main', fontWeight: 700, mb: 0.5 }}>
                                                {calculateDays(new Date().toISOString(), card.endDate)} {t('card.daysLeft') || 'days left'}
                                            </Typography>
                                        )}
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                                            by {card.createdBy}
                                        </Typography>
                                    </Box>

                                    <Stack direction="row" spacing={0.5}>
                                        <IconButton size="small" onClick={() => onEdit(card)} sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.05) } }}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => onDuplicate(card.id)} sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: alpha('#1a337e', 0.05) } }}>
                                            <ContentCopyIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => onDelete(card.id)} sx={{ color: 'error.light', '&:hover': { color: 'error.main', bgcolor: alpha('#ef4444', 0.05) } }}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Stack>
                                </Box>

                                {hasOverlap && (
                                    <Chip
                                        icon={<WarningIcon sx={{ fontSize: '14px !important' }} />}
                                        label={t('card.scheduleOverlap')}
                                        size="small"
                                        color="warning"
                                        variant="filled"
                                        sx={{
                                            position: 'absolute',
                                            top: 12,
                                            right: 12,
                                            height: 20,
                                            fontSize: '0.65rem',
                                            fontWeight: 700,
                                            bgcolor: alpha('#ed6c02', 0.1),
                                            color: '#ed6c02',
                                            border: 'none',
                                            '&:hover': { bgcolor: alpha('#ed6c02', 0.2) }
                                        }}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </Box>
        </Box>
    );
}
