import {
    Box,
    Card,
    CardContent,
    Typography,
    IconButton,
    Chip,
    Stack,
    alpha,
    useTheme,
} from '@mui/material';
import dayjs from 'dayjs';
import {
    DeleteOutline as DeleteIcon,
    EditOutlined as EditIcon,
    ContentCopyOutlined as ContentCopyIcon,
    Warning as WarningIcon,
    TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import type { PriceCard } from '../types';
import { doRangesOverlap, getCardStatus, calculateDays } from '../utils/date.ts';
import { useApp } from '../context/useApp';

interface CardsViewProps {
    cards: PriceCard[];
    onEdit: (card: PriceCard) => void;
    onDuplicate: (id: string) => void;
    onDelete: (id: string) => void;
}

// Filtering is now handled at the parent level (PostingPriceListPage)
export default function CardsView({ cards, onEdit, onDuplicate, onDelete }: CardsViewProps) {
    const { t } = useApp();
    const theme = useTheme();

    const checkOverlap = (card: PriceCard) => {
        return cards.some(other =>
            other.PriceID !== card.PriceID &&
            other.ProductID === card.ProductID &&
            doRangesOverlap(card.EffectiveDate, card.ToDate || card.EffectiveDate, other.EffectiveDate, other.ToDate || other.EffectiveDate)
        );
    };

    return (
        <Box sx={{ p: { xs: 2, md: 1 }, height: '100%', overflowY: 'auto' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 3, mt: 2 }}>

                {cards.map((card: PriceCard) => {
                    const hasOverlap = checkOverlap(card);
                    const currentStatus = getCardStatus(card.EffectiveDate, card.ToDate);

                    let statusColor = '#2e7d32'; // Green for Active
                    if (currentStatus === 'expired') statusColor = '#d32f2f'; // Red for Expired
                    if (currentStatus === 'upcoming') statusColor = '#ed6c02'; // Yellow/Orange for Upcoming

                    return (
                        <Card
                            key={card.PriceID}
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
                                            {card.ProductName}
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
                                                {t('card.valid')}: {dayjs(card.EffectiveDate).format('YYYY-MM-DD')} ➔ {card.ToDate ? dayjs(card.ToDate).format('YYYY-MM-DD') : dayjs(card.EffectiveDate).format('YYYY-MM-DD')}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Stack>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 3 }}>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{t('card.unitPrice')}</Typography>
                                        <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 800 }}>
                                            ฿{card.UnitPrice.toLocaleString()}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ textAlign: 'right' }}>
                                        {currentStatus === 'active' && card.ToDate && (
                                            <Typography variant="caption" sx={{ display: 'block', color: 'success.main', fontWeight: 700, mb: 0.5 }}>
                                                {calculateDays(new Date().toISOString(), card.ToDate)} {t('card.daysLeft') || 'days left'}
                                            </Typography>
                                        )}
                                    </Box>

                                    <Stack direction="row" spacing={0.5}>
                                        <IconButton size="small" onClick={() => onEdit(card)} sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.05) } }}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => onDuplicate(card.PriceID.toString())} sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: alpha('#1a337e', 0.05) } }}>
                                            <ContentCopyIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => onDelete(card.PriceID.toString())} sx={{ color: 'error.light', '&:hover': { color: 'error.main', bgcolor: alpha('#ef4444', 0.05) } }}>
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
