import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    Typography,
    alpha,
    useTheme,
    Stack,
    Box,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    List,
    ListItem,
    ListItemText,
} from '@mui/material';
import { useState } from 'react';
import dayjs from 'dayjs';
import {
    DeleteOutline as DeleteIcon,
    EditOutlined as EditIcon,
    ContentCopyOutlined as ContentCopyIcon,
    TrendingUp as TrendingUpIcon,
    History as HistoryIcon,
} from '@mui/icons-material';
import type { PriceCard } from '../types';
import { getCardStatus } from '../utils/date.ts';
import { useApp } from '../context/useApp';
import { usePriceHistory } from '../hooks/usePriceHistory';

interface PriceListViewProps {
    cards: PriceCard[];
    onEdit: (card: PriceCard) => void;
    onDuplicate: (id: string) => void;
    onDelete: (id: string) => void;
}

export default function PriceListView({ cards, onEdit, onDuplicate, onDelete }: PriceListViewProps) {
    const { t } = useApp();
    const theme = useTheme();
    const [historyOpen, setHistoryOpen] = useState(false);
    const [selectedPriceId, setSelectedPriceId] = useState<number | null>(null);
    const { history, loading } = usePriceHistory(selectedPriceId || undefined);

    const handleOpenHistory = (id: number) => {
        setSelectedPriceId(id);
        setHistoryOpen(true);
    };

    return (
        <>
            <TableContainer sx={{ height: '100%', overflow: 'auto' }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper', pl: 3 }}>Resource</TableCell>
                            <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Effective Date</TableCell>
                            <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>To Date</TableCell>
                            <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Unit Price</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, bgcolor: 'background.paper', pr: 3 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {cards.map((card) => {
                            const currentStatus = getCardStatus(card.EffectiveDate, card.ToDate);
                            let statusColor = '#2e7d32';
                            if (currentStatus === 'expired') statusColor = '#d32f2f';
                            if (currentStatus === 'upcoming') statusColor = '#ed6c02';

                            return (
                                <TableRow key={card.PriceID} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell sx={{ pl: 3 }}>
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <Box sx={{
                                                p: 0.5,
                                                borderRadius: 1,
                                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                                                color: 'primary.main',
                                                display: 'flex'
                                            }}>
                                                <TrendingUpIcon fontSize="small" />
                                            </Box>
                                            <Typography variant="body2" fontWeight={600}>
                                                {card.ProductName}
                                            </Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
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
                                    </TableCell>
                                    <TableCell>{dayjs(card.EffectiveDate).format('YYYY-MM-DD')}</TableCell>
                                    <TableCell>{card.ToDate ? dayjs(card.ToDate).format('YYYY-MM-DD') : '-'}</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>
                                        ฿{card.UnitPrice.toLocaleString()}
                                    </TableCell>
                                    <TableCell align="right" sx={{ pr: 3 }}>
                                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                            <Tooltip title="View History">
                                                <IconButton size="small" onClick={() => handleOpenHistory(card.PriceID)} sx={{ color: 'primary.main' }}>
                                                    <HistoryIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Edit">
                                                <IconButton size="small" onClick={() => onEdit(card)} sx={{ color: 'text.secondary' }}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Duplicate">
                                                <IconButton size="small" onClick={() => onDuplicate(card.PriceID.toString())} sx={{ color: 'text.secondary' }}>
                                                    <ContentCopyIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton size="small" onClick={() => onDelete(card.PriceID.toString())} sx={{ color: 'error.light' }}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Quick History Dialog */}
            <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 800 }}>Price ID: #{selectedPriceId} History Logs</DialogTitle>
                <DialogContent dividers>
                    {loading ? (
                        <Typography variant="body2" sx={{ p: 2 }}>Loading history...</Typography>
                    ) : history.length > 0 ? (
                        <List dense>
                            {history.map((h) => (
                                <ListItem key={h.HistoryID} sx={{ px: 0, py: 1, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="caption" fontWeight={700} color="primary">
                                                    {h.ActionType} by {h.ChangedBy}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {dayjs(h.ChangedAt).format('DD/MM/YYYY HH:mm:ss')}
                                                </Typography>
                                            </Box>
                                        }
                                        secondary={
                                            <Box sx={{ mt: 1 }}>
                                                <Typography variant="caption" component="div">
                                                    <strong>Price:</strong> {
                                                        (h.NewUnitPrice === null || h.NewUnitPrice === undefined)
                                                            ? h.OldUnitPrice
                                                            : (h.OldUnitPrice === h.NewUnitPrice ? h.NewUnitPrice : `${h.OldUnitPrice} → ${h.NewUnitPrice}`)
                                                    }
                                                </Typography>
                                                <Typography variant="caption" component="div">
                                                    <strong>Date:</strong> {
                                                        ((h.NewEffectiveDate === null || h.NewEffectiveDate === undefined) && (h.NewToDate === null || h.NewToDate === undefined))
                                                            ? `(${dayjs(h.OldEffectiveDate).format('DD/MM')} - ${h.OldToDate ? dayjs(h.OldToDate).format('DD/MM') : dayjs(h.OldEffectiveDate).format('DD/MM')})`
                                                            : (h.OldEffectiveDate === h.NewEffectiveDate && h.OldToDate === h.NewToDate)
                                                                ? `(${dayjs(h.NewEffectiveDate).format('DD/MM')} - ${h.NewToDate ? dayjs(h.NewToDate).format('DD/MM') : dayjs(h.NewEffectiveDate).format('DD/MM')})`
                                                                : `(${dayjs(h.OldEffectiveDate).format('DD/MM')} - ${h.OldToDate ? dayjs(h.OldToDate).format('DD/MM') : dayjs(h.OldEffectiveDate).format('DD/MM')}) → 
                                                           (${dayjs(h.NewEffectiveDate).format('DD/MM')} - ${h.NewToDate ? dayjs(h.NewToDate).format('DD/MM') : dayjs(h.NewEffectiveDate).format('DD/MM')})`
                                                    }
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Typography variant="body2" sx={{ p: 2, color: 'text.secondary' }}>No history records found for this card.</Typography>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
