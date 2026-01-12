import {
    Card,
    CardContent,
    Typography,
    Stack,
    Box,
    alpha,
    Chip,
    IconButton,
} from '@mui/material';
import {
    LocalShipping as ShippingIcon,
    CheckCircleOutline as ApprovedIcon,
    PendingActions as PendingIcon,
    EditOutlined as EditIcon,
    DeleteOutline as DeleteIcon,
} from '@mui/icons-material';
import { useApp } from '../context/useApp';
import type { Ticket } from '../types';

interface TicketCardProps {
    ticket: Ticket;
    onEdit: (ticket: Ticket) => void;
    onDelete: (id: string) => void;
}

export default function TicketCard({ ticket, onEdit, onDelete }: TicketCardProps) {
    const { t } = useApp();

    const getStatusConfig = (status: Ticket['status']) => {
        switch (status) {
            case 'approved':
                return { color: '#2e7d32', icon: <ApprovedIcon />, label: t('ticket.status.approved') };
            case 'pending':
                return { color: '#ed6c02', icon: <PendingIcon />, label: t('ticket.status.pending') };
            default:
                return { color: '#94a3b8', icon: <PendingIcon />, label: t('ticket.status.draft') };
        }
    };

    const config = getStatusConfig(ticket.status);

    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: 4,
                border: '1px solid',
                borderColor: alpha('#1a337e', 0.1),
                transition: 'all 0.2s',
                '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.05)'
                }
            }}
        >
            <CardContent>
                <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 2 }}>
                    <Box sx={{
                        p: 1.5,
                        borderRadius: 3,
                        bgcolor: alpha(ticket.type === 'auto' ? '#1a337e' : '#ed6c02', 0.05),
                        color: ticket.type === 'auto' ? 'primary.main' : '#ed6c02'
                    }}>
                        <ShippingIcon />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>
                                {ticket.ticketNumber}
                            </Typography>
                            <Chip
                                label={ticket.paymentType?.toUpperCase()}
                                size="small"
                                color={ticket.paymentType === 'cash' ? 'success' : 'warning'}
                                variant="outlined"
                                sx={{ height: 16, fontSize: '0.6rem', fontWeight: 900, borderRadius: 1 }}
                            />
                            <Chip
                                label={ticket.type === 'auto' ? 'AUTO' : 'MANUAL'}
                                size="small"
                                sx={{
                                    height: 16,
                                    fontSize: '0.6rem',
                                    fontWeight: 900,
                                    borderRadius: 1,
                                    bgcolor: ticket.type === 'auto' ? alpha('#1a337e', 0.1) : alpha('#94a3b8', 0.1),
                                    color: ticket.type === 'auto' ? '#1a337e' : '#64748b'
                                }}
                            />
                        </Stack>
                        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 800, lineHeight: 1.2 }}>
                            {ticket.resourceName}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem', mt: 0.5 }}>
                            {ticket.sellerName || 'N/A'} • {ticket.licensePlate || 'N/A'}
                        </Typography>
                        {ticket.poNumber && (
                            <Typography variant="caption" sx={{ color: '#ed6c02', fontWeight: 700, display: 'block', mt: 0.5 }}>
                                PO: {ticket.poNumber}
                            </Typography>
                        )}
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Chip
                            icon={config.icon}
                            label={config.label}
                            size="small"
                            sx={{
                                bgcolor: alpha(config.color, 0.1),
                                color: config.color,
                                fontWeight: 700,
                                border: 'none',
                                mb: 0.5
                            }}
                        />
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.65rem' }}>
                            {new Date(ticket.createdAt).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.65rem' }}>
                            {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                    </Box>
                </Stack>

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 3, p: 1.5, bgcolor: alpha('#f0f4f8', 0.5), borderRadius: 2 }}>
                    <Box>
                        <Typography variant="caption" color="text.secondary" display="block">น้ำหนักสุทธิ</Typography>
                        <Typography variant="body2" fontWeight={700}>{(ticket.netWeight || 0).toLocaleString()} kg</Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary" display="block">ราคาต่อหน่วย</Typography>
                        <Typography variant="body2" fontWeight={700} color="primary.main">฿{(ticket.unitPrice || 0).toLocaleString()}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" color="text.secondary" display="block">จำนวนเงินรวม</Typography>
                        <Typography variant="body2" fontWeight={800} color="success.main">
                            ฿{(ticket.totalPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                    </Box>
                </Box>

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={0.5}>
                        {ticket.status !== 'approved' && (
                            <IconButton size="small" onClick={() => onEdit(ticket)} sx={{ color: 'text.secondary', bgcolor: alpha('#94a3b8', 0.1), '&:hover': { bgcolor: alpha('#94a3b8', 0.2) } }}>
                                <EditIcon fontSize="small" />
                            </IconButton>
                        )}
                        {ticket.type !== 'auto' && ticket.status !== 'approved' && (
                            <IconButton size="small" onClick={() => onDelete(ticket.id)} sx={{ color: 'error.light', bgcolor: alpha('#ef4444', 0.1), '&:hover': { bgcolor: alpha('#ef4444', 0.2) } }}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        )}
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}
